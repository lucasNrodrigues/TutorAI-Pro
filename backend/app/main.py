from typing import List
from typing import Optional

from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified
from .database import engine, Base, get_db, SessionLocal
from . import models, schemas
from fastapi.staticfiles import StaticFiles
import json
import os
from .llm import gerar_resposta_pedagogica_stream, avaliar_progresso_silencioso, client
from pydantic import BaseModel
from passlib.context import CryptContext
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
# Cria as tabelas no banco de dados se elas não existirem
Base.metadata.create_all(bind=engine)

app = FastAPI()

app = FastAPI(title="Tutor IA - API Pedagógica")

CONTEUDO_MATERIAIS = []

# Configuração de CORS para permitir que o Frontend (React/Vue) acesse o backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Em produção, substitua pelo domínio do seu frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("materiais", exist_ok=True)
os.makedirs("fotos_perfil", exist_ok=True)

app.mount("/fotos", StaticFiles(directory="fotos_perfil"), name="fotos")

@app.get("/")
def read_root():
    return {"status": "API online e integrada ao banco de dados"}

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verificar_senha(senha_pura, senha_hash):
    return pwd_context.verify(senha_pura, senha_hash)

def obter_hash_senha(senha):
    return pwd_context.hash(senha)

# Schemas para recebimento de dados
class CadastroRequest(BaseModel):
    nome: str
    email: str
    senha: str

class LoginRequest(BaseModel):
    email: str
    senha: str

class AlunoUpdate(BaseModel):
    nome: str
    bio: str
    foto_url: str

@app.post("/cadastro/")
def cadastrar_aluno(req: CadastroRequest, db: Session = Depends(get_db)):
    aluno_existente = db.query(models.Aluno).filter(models.Aluno.email == req.email).first()
    if aluno_existente:
        raise HTTPException(status_code=400, detail="E-mail já está em uso.")
    
    # Criptografa a senha antes de salvar
    senha_criptografada = obter_hash_senha(req.senha)
    
    novo_aluno = models.Aluno(
        nome=req.nome,
        email=req.email,
        senha_hash=senha_criptografada,
        cargo="professor" if req.email.endswith("@prof.com") else "aluno" 
    )
    db.add(novo_aluno)
    db.commit()
    db.refresh(novo_aluno)
    
    # Cria uma conversa inicial para o novo aluno
    conversa = models.Conversa(aluno_id=novo_aluno.id, contexto_disciplina="Lógica de Programação")
    db.add(conversa)
    db.commit()
    
    return {"mensagem": "Cadastro realizado com sucesso!"}

@app.post("/login/")
def login_seguro(req: LoginRequest, db: Session = Depends(get_db)):
    aluno = db.query(models.Aluno).filter(models.Aluno.email == req.email).first()
    
    # Verifica se o aluno existe E se o hash da senha bate
    if not aluno or not verificar_senha(req.senha, aluno.senha_hash):
        raise HTTPException(status_code=401, detail="E-mail ou senha incorretos.")
    
    conversa = db.query(models.Conversa).filter(models.Conversa.aluno_id == aluno.id).order_by(models.Conversa.id.desc()).first()
    
    return {
        "aluno_id": aluno.id,
        "conversa_id": conversa.id,
        "nome": aluno.nome,
        "email": aluno.email,
        "cargo": aluno.cargo,
        "xp": aluno.xp,
        "nivel": aluno.nivel,
        "disciplina": "Lógica de Programação",
        "foto_url": aluno.foto_url,
        "bio": aluno.bio # <--- ADICIONE ESTA LINHA AQUI
    }

# Rota simples para testar a inserção de uma nova mensagem enviada pelo aluno
@app.post("/mensagens/", response_model=schemas.MensagemResponse)
def criar_mensagem(mensagem: schemas.MensagemCreate, db: Session = Depends(get_db)):
    # Verifica se a conversa existe antes de salvar a mensagem
    conversa = db.query(models.Conversa).filter(models.Conversa.id == mensagem.conversa_id).first()
    if not conversa:
        raise HTTPException(status_code=404, detail="Conversa não encontrada")
    
    db_mensagem = models.Mensagem(**mensagem.model_dump())
    db.add(db_mensagem)
    db.commit()
    db.refresh(db_mensagem)
    return db_mensagem

@app.get("/admin/alunos")
def listar_todos_alunos(email: str, db: Session = Depends(get_db)):
    # Simulação básica de segurança: verifica quem está pedindo
    usuario = db.query(models.Aluno).filter(models.Aluno.email == email).first()
    if not usuario or usuario.cargo != "professor":
        raise HTTPException(status_code=403, detail="Acesso negado. Apenas professores.")
    
    alunos = db.query(models.Aluno).filter(models.Aluno.cargo == "aluno").all()
    return alunos

@app.post("/alunos/", response_model=schemas.AlunoResponse)
def criar_aluno(aluno: schemas.AlunoCreate, db: Session = Depends(get_db)):
    # Evita duplicidade verificando se o email já está no banco
    db_aluno = db.query(models.Aluno).filter(models.Aluno.email == aluno.email).first()
    if db_aluno:
        raise HTTPException(status_code=400, detail="Email já cadastrado no sistema")
    
    novo_aluno = models.Aluno(nome=aluno.nome, email=aluno.email)
    db.add(novo_aluno)
    db.commit()
    db.refresh(novo_aluno)
    return novo_aluno

@app.post("/admin/upload/")
async def upload_material_aula(file: UploadFile = File(...)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Apenas ficheiros PDF são permitidos.")
    
    caminho_arquivo = f"materiais/{file.filename}"
    
    # Salva o ficheiro fisicamente na pasta
    with open(caminho_arquivo, "wb") as buffer:
        conteudo = await file.read()
        buffer.write(conteudo)
    
    # --- MOTOR DE PROCESSAMENTO RAG ---
    try:
        # 1. Carrega o PDF e extrai as páginas
        loader = PyPDFLoader(caminho_arquivo)
        paginas = loader.load()
        
        # 2. Divide o texto em pequenos pedaços (chunks) para caber no prompt da IA
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=600, chunk_overlap=100)
        fragmentos = text_splitter.split_documents(paginas)
        
        # 3. Alimenta a base de dados em memória
        global CONTEUDO_MATERIAIS
        for frag in fragmentos:
            CONTEUDO_MATERIAIS.append(frag.page_content)
            
        return {
            "mensagem": f"Ficheiro {file.filename} processado com sucesso!",
            "fragmentos_gerados": len(fragmentos)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao processar o PDF: {str(e)}")
    
@app.put("/alunos/{aluno_id}/perfil")
def editar_perfil(aluno_id: int, req: AlunoUpdate, db: Session = Depends(get_db)):
    aluno = db.query(models.Aluno).filter(models.Aluno.id == aluno_id).first()
    aluno.nome = req.nome
    aluno.bio = req.bio
    aluno.foto_url = req.foto_url
    db.commit()
    return {"nome": aluno.nome, "bio": aluno.bio, "foto_url": aluno.foto_url}

@app.post("/conversas/", response_model=schemas.ConversaResponse)
def criar_conversa(conversa: schemas.ConversaCreate, db: Session = Depends(get_db)):
    # Confirma se o ID do aluno realmente existe antes de criar a conversa
    aluno_existe = db.query(models.Aluno).filter(models.Aluno.id == conversa.aluno_id).first()
    if not aluno_existe:
        raise HTTPException(status_code=404, detail="Aluno não encontrado")
    
    nova_conversa = models.Conversa(
        aluno_id=conversa.aluno_id, 
        contexto_disciplina=conversa.contexto_disciplina
    )
    db.add(nova_conversa)
    db.commit()
    db.refresh(nova_conversa)
    return nova_conversa

@app.post("/chat/")
def enviar_mensagem_chat(
    mensagem: schemas.MensagemCreate, 
    db: Session = Depends(get_db)
):
    conversa = db.query(models.Conversa).filter(models.Conversa.id == mensagem.conversa_id).first()
    if not conversa:
        raise HTTPException(status_code=404, detail="Conversa não encontrada")
    
    # ==========================================
    # FASE 3: INJEÇÃO DO CONTEXTO DO PDF (RAG)
    # ==========================================
    # 1. Busca os fragmentos do PDF que têm a ver com a dúvida do aluno
    contexto_pdf = buscar_contexto_material(mensagem.conteudo)
    
    # 2. Cria uma variável temporária para carregar a disciplina + o PDF
    contexto_enriquecido = conversa.contexto_disciplina

    if contexto_pdf:
        # Se achou algo no PDF, "engana" a IA colocando a matéria oficial como regra do sistema
        contexto_enriquecido += f"\n\n[MATERIAL DE APOIO OFICIAL DA AULA]:\nBaseie sua explicação estritamente nos seguintes trechos do material oficial, mas mantenha a postura socrática (não dê a resposta direta):\n{contexto_pdf}"
        
    # SÓ AGORA geramos o prompt final, garantindo que o PDF vá junto para a IA!
    prompt_final = gerar_prompt_tutor(contexto_enriquecido)
    
    # Salva a mensagem do Aluno
    msg_aluno = models.Mensagem(conversa_id=mensagem.conversa_id, role="user", conteudo=mensagem.conteudo)
    db.add(msg_aluno)
    db.commit()

    historico = db.query(models.Mensagem).filter(models.Mensagem.conversa_id == mensagem.conversa_id).order_by(models.Mensagem.id.asc()).all()
    historico_sem_a_atual = historico[:-1]

    # Função geradora que envia o texto em tempo real para o frontend
    def gerador_streaming():
        texto_completo = ""
        try:
            # Consome o stream da IA passando o nosso NOVO CONTEXTO ENRIQUECIDO
            for pedaco in gerar_resposta_pedagogica_stream(
            prompt_final, historico_sem_a_atual, mensagem.conteudo
        ):
                texto_completo += pedaco
                yield pedaco
        finally:
            # Quando o texto termina de ser digitado, salvamos no banco silenciosamente
            db_bg = SessionLocal()
            try:
                # Salva a resposta no histórico
                msg_tutor = models.Mensagem(conversa_id=mensagem.conversa_id, role="assistant", conteudo=texto_completo)
                db_bg.add(msg_tutor)
                db_bg.commit()

                # Roda a métrica de avaliação (Note que aqui mantemos o contexto original para não sujar os dados de avaliação)
                processar_avaliacao_background(
                    aluno_id=conversa.aluno_id,
                    contexto_disciplina=conversa.contexto_disciplina,
                    mensagem_aluno=mensagem.conteudo,
                    resposta_tutor=texto_completo,
                    db=db_bg
                )
            finally:
                db_bg.close()

    # Retorna o texto puro, pedaço por pedaço
    return StreamingResponse(gerador_streaming(), media_type="text/plain")

def processar_avaliacao_background(aluno_id: int, contexto_disciplina: str, mensagem_aluno: str, resposta_tutor: str, db: Session):
    """
    Roda invisível após o chat para extrair métricas e atualizar o banco.
    """
    try:
        # 1. Pede para a IA avaliar
        avaliacao = avaliar_progresso_silencioso(contexto_disciplina, mensagem_aluno, resposta_tutor)
        topico = avaliacao.get("topico_especifico", contexto_disciplina)
        
        # 2. Busca se já existe uma métrica para esse aluno neste tópico
        metrica = db.query(models.MetricaProgresso).filter(
            models.MetricaProgresso.aluno_id == aluno_id,
            models.MetricaProgresso.topico == topico
        ).first()

        # 3. Lógica de atualização da Métrica
        if not metrica:
            metrica = models.MetricaProgresso(
                aluno_id=aluno_id,
                topico=topico,
                nivel_dominio=avaliacao.get("nivel_dominio", 0),
                erros_consecutivos=1 if not avaliacao.get("demonstrou_entendimento") else 0,
                historico_desempenho=[avaliacao]
            )
            db.add(metrica)
        else:
            metrica.nivel_dominio = (metrica.nivel_dominio + avaliacao.get("nivel_dominio", metrica.nivel_dominio)) // 2
            
            if not avaliacao.get("demonstrou_entendimento"):
                metrica.erros_consecutivos += 1
            else:
                metrica.erros_consecutivos = 0 
                
            historico = metrica.historico_desempenho or []
            historico.append(avaliacao)
            metrica.historico_desempenho = historico
            
            # --- A MÁGICA ACONTECE AQUI ---
            # Avisa o banco de dados que a coluna JSON foi alterada e precisa ser salva!
            flag_modified(metrica, "historico_desempenho")

        # 4. === NOVA LÓGICA DE GAMIFICAÇÃO ===
        if avaliacao.get("demonstrou_entendimento"):
            aluno = db.query(models.Aluno).filter(models.Aluno.id == aluno_id).first()
            if aluno:
                aluno.xp += 15
                
                xp_necessario = aluno.nivel * 100
                if aluno.xp >= xp_necessario:
                    aluno.nivel += 1
                    aluno.xp = aluno.xp - xp_necessario 
                    print(f"🎉 LEVEL UP: Aluno(a) subiu para o nível {aluno.nivel}!")

        db.commit()
    
    except Exception as e:
        db.rollback()
        print(f"Erro na avaliação silenciosa: {e}")

def buscar_contexto_material(pergunta_aluno: str) -> str:
    palavras_chave = [p.lower() for p in pergunta_aluno.split() if len(p) > 3]
    fragmentos_relevantes = []
    
    global CONTEUDO_MATERIAIS
    for bloco in CONTEUDO_MATERIAIS:
        # Se o bloco de texto do PDF contiver as palavras da dúvida do aluno, guarda-o
        if any(palavra in bloco.lower() for palavra in palavras_chave):
            fragmentos_relevantes.append(bloco)
            # Limitamos a 3 fragmentos para não sobrecarregar o tamanho do prompt
            if len(fragmentos_relevantes) >= 3:
                break
                
    print(f"--- RAG DEBUG ---")
    print(f"Pergunta do aluno: {pergunta_aluno}")
    print(f"Fragmentos encontrados: {len(fragmentos_relevantes)}")
    print(f"Conteúdo injetado: {fragmentos_relevantes}")
    print(f"-----------------")
    
    return "\n\n".join(fragmentos_relevantes)


@app.get("/alunos/{aluno_id}/metricas", response_model=List[schemas.MetricaProgressoResponse])
def obter_metricas_aluno(aluno_id: int, db: Session = Depends(get_db)):
    """
    Retorna todas as métricas de progresso de um aluno específico.
    Ideal para alimentar os gráficos do Dashboard no Frontend.
    """
    # Verifica se o aluno existe
    aluno_existe = db.query(models.Aluno).filter(models.Aluno.id == aluno_id).first()
    if not aluno_existe:
        raise HTTPException(status_code=404, detail="Aluno não encontrado")
    
    # Busca todas as métricas atreladas a esse aluno
    metricas = db.query(models.MetricaProgresso)\
        .filter(models.MetricaProgresso.aluno_id == aluno_id)\
        .all()
    
    return metricas

@app.get("/chat/{conversa_id}/historico")
def obter_historico(conversa_id: int, db: Session = Depends(get_db)):
    mensagens = db.query(models.Mensagem)\
        .filter(models.Mensagem.conversa_id == conversa_id)\
        .order_by(models.Mensagem.id.asc())\
        .all()
    return mensagens

@app.post("/alunos/{aluno_id}/foto")
async def upload_foto_perfil(aluno_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    aluno = db.query(models.Aluno).filter(models.Aluno.id == aluno_id).first()
    
    # Pega a extensão da imagem (ex: jpg, png)
    extensao = file.filename.split(".")[-1]
    nome_arquivo = f"avatar_{aluno_id}.{extensao}"
    caminho = f"fotos_perfil/{nome_arquivo}"
    
    # Salva o arquivo fisicamente
    with open(caminho, "wb") as buffer:
        conteudo = await file.read()
        buffer.write(conteudo)
        
    # Gera a URL pública e salva no banco
    url_publica = f"http://localhost:8000/fotos/{nome_arquivo}"
    aluno.foto_url = url_publica
    db.commit()
    
    return {"url": url_publica}


def gerar_prompt_tutor(contexto_enriquecido: str):
    return f"""
    Você é o TutorAI Pro, um mentor pedagógico focado em Lógica de Programação na UFERSA.
    
    DIRETRIZES DE COMPORTAMENTO:
    1. POSTURA SOCRÁTICA: Nunca forneça a resposta final ou o código pronto. Faça perguntas que guiem o aluno ao raciocínio lógico.
    2. ESTILO: Seja encorajador, didático e objetivo. Use uma linguagem simples mas tecnicamente correta.
    3. FONTE DA VERDADE: Use o [MATERIAL DE APOIO OFICIAL DA AULA] abaixo como sua única fonte de verdade para conceitos, definições e sintaxes.
    4. ALUCINAÇÃO ZERO: Se a resposta não estiver no material fornecido, não invente. Diga: "Essa informação não está presente no material oficial da nossa aula, mas podemos analisar o problema por outro ângulo."
    5. FEEDBACK DE LÓGICA: Se o aluno propuser uma solução, analise a lógica dele antes de apontar erros.
    
    [MATERIAL DE APOIO OFICIAL DA AULA]:
    {contexto_enriquecido}
    """

# 1. Rota para listar todas as conversas do aluno no menu lateral
@app.get("/alunos/{aluno_id}/conversas")
def listar_conversas_do_aluno(aluno_id: int, db: Session = Depends(get_db)):
    conversas = db.query(models.Conversa).filter(
        models.Conversa.aluno_id == aluno_id
    ).order_by(models.Conversa.id.desc()).all()
    return conversas

# 2. Rota para carregar as mensagens antigas quando ele clicar em um chat do menu
@app.get("/conversas/{conversa_id}/mensagens")
def buscar_historico_chat(conversa_id: int, db: Session = Depends(get_db)):
    mensagens = db.query(models.Mensagem).filter(
        models.Mensagem.conversa_id == conversa_id
    ).order_by(models.Mensagem.id.asc()).all()
    return [{"role": m.role, "conteudo": m.conteudo} for m in mensagens]

@app.put("/conversas/{conversa_id}/gerar-titulo")
def gerar_titulo_inteligente(conversa_id: int, db: Session = Depends(get_db)):
    # 1. Busca a primeira mensagem do usuário neste chat específico
    primeira_msg = db.query(models.Mensagem).filter(
        models.Mensagem.conversa_id == conversa_id,
        models.Mensagem.role == "user"
    ).order_by(models.Mensagem.id.asc()).first()
    
    if not primeira_msg:
        return {"erro": "Sem mensagens para resumir"}
        
    conversa = db.query(models.Conversa).filter(models.Conversa.id == conversa_id).first()
    
    # 2. Pede para a IA criar o título
    prompt = f"Crie um título direto e muito curto (máximo de 4 palavras) para resumir esta dúvida do aluno: '{primeira_msg.conteudo}'. Responda APENAS com o título, sem aspas e sem ponto final."
    
    try:
        # Usa o 'client' global da Groq que já está instanciado no seu arquivo
        completion = client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            temperature=0.3,
            max_tokens=25,
        )
        
        titulo_novo = completion.choices[0].message.content
        
        # 3. Limpamos as aspas e espaços extras, e guardamos no banco de dados
        conversa.contexto_disciplina = titulo_novo.replace('"', '').strip()
        db.commit()
        
        return {"titulo_gerado": titulo_novo}
        
    except Exception as e:
        print(f"Erro ao gerar título na IA via Groq: {e}")
        return {"erro": "Falha ao gerar título. Tente novamente mais tarde."}