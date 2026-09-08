import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

# Verifica se a chave da Groq existe
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise RuntimeError("GROQ_API_KEY não configurada.")

# Inicializa o cliente da Groq
client = Groq(api_key=GROQ_API_KEY)

# Modelo atual da Groq
MODELO = "openai/gpt-oss-120b"


def gerar_resposta_pedagogica_stream(
    contexto_disciplina: str,
    historico_mensagens: list,
    nova_mensagem: str,
    modo_estudo: str = "tutor"
):
    """
    Gera a resposta do tutor utilizando streaming.

    Modos disponíveis:
    - tutor
    - exercicios
    - revisao
    """

    base_prompt = (
        f"Você é um tutor acadêmico universitário especializado "
        f"em {contexto_disciplina}.\n"
    )

    if modo_estudo == "exercicios":
        instrucoes_modo = """
MODO DE OPERAÇÃO: EXERCÍCIOS PRÁTICOS.

Sua missão é testar o aluno.

Quando o aluno pedir um tema, gere UM desafio prático de lógica,
programação, matemática ou código relacionado à disciplina.

REGRAS:
1. Forneça um enunciado claro com os requisitos.
2. NÃO forneça a resposta pronta.
3. NÃO forneça o código completo da solução.
4. Aguarde o aluno enviar sua tentativa.
5. Quando o aluno enviar uma tentativa, analise o que ele fez.
6. Aponte os acertos e erros.
7. Dê dicas para que o próprio aluno encontre a solução.
"""

    elif modo_estudo == "revisao":
        instrucoes_modo = """
MODO DE OPERAÇÃO: REVISÃO RÁPIDA.

Sua missão é fornecer resumos diretos e estruturados
para ajudar o aluno a memorizar o conteúdo antes de provas.

REGRAS:
1. Seja conciso.
2. Use tópicos curtos.
3. Use formato semelhante a flashcards ou mapa mental.
4. Destaque conceitos, regras, fórmulas e sintaxe importantes.
5. Dê exemplos pequenos quando forem úteis.
6. Evite explicações desnecessariamente longas.
7. Ao final, pergunte se o aluno quer ir para o Modo Exercícios.
"""

    else:
        instrucoes_modo = """
MODO DE OPERAÇÃO: TUTORIA SOCRÁTICA.

Sua missão é ajudar o aluno a chegar à resposta correta
através do raciocínio lógico e da construção do conhecimento.

REGRAS ABSOLUTAS:
1. NÃO forneça imediatamente a resposta final.
2. NÃO entregue código pronto quando o aluno estiver tentando resolver um problema.
3. Se o aluno errar, faça perguntas que o ajudem a identificar a falha.
4. Forneça dicas incrementais.
5. Explique os conceitos necessários para que o aluno consiga avançar.
6. Adapte a explicação ao nível demonstrado pelo aluno.
7. Mantenha um tom encorajador e didático.
8. Quando o aluno demonstrar domínio, avance para conceitos mais difíceis.
"""

    system_prompt = base_prompt + instrucoes_modo

    mensagens_api = [
        {
            "role": "system",
            "content": system_prompt
        }
    ]

    for msg in historico_mensagens:
        mensagens_api.append(
            {
                "role": msg.role,
                "content": msg.conteudo
            }
        )

    mensagens_api.append(
        {
            "role": "user",
            "content": nova_mensagem
        }
    )

    # Chamada à Groq com streaming
    response = client.chat.completions.create(
        model=MODELO,
        messages=mensagens_api,
        temperature=0.4,
        max_completion_tokens=2048,
        stream=True
    )

    # Envia cada pedaço da resposta conforme chega
    for chunk in response:
        if not chunk.choices:
            continue

        pedaco = chunk.choices[0].delta.content

        if pedaco:
            yield pedaco


def avaliar_progresso_silencioso(
    contexto_disciplina: str,
    mensagem_aluno: str,
    resposta_tutor: str
) -> dict:
    """
    Analisa silenciosamente a interação do aluno
    e retorna métricas estruturadas em JSON.
    """

    system_prompt = f"""
Você é um sistema de avaliação educacional.

Você está avaliando um aluno da disciplina:
{contexto_disciplina}

Analise a última mensagem do aluno e a resposta fornecida
pelo tutor.

Sua única tarefa é retornar um objeto JSON válido.

O JSON deve possuir exatamente os seguintes campos:

- "demonstrou_entendimento":
  booleano.
  true se o aluno demonstrou entendimento ou fez progresso.
  false se o aluno errou, demonstrou dúvida ou não conseguiu avançar.

- "nivel_dominio":
  inteiro entre 0 e 100.
  Estime o domínio atual do aluno sobre o tópico discutido.

- "topico_especifico":
  string curta identificando o assunto discutido.
  Exemplos:
  "Derivadas"
  "Laços de Repetição"
  "Matrizes"
  "Portas Lógicas"

- "falha_conceitual":
  string muito curta descrevendo o erro conceitual do aluno.
  Se não houver erro, utilize null.

NÃO escreva nenhuma explicação fora do JSON.
"""

    mensagens_api = [
        {
            "role": "system",
            "content": system_prompt
        },
        {
            "role": "user",
            "content": (
                f"Mensagem do aluno: {mensagem_aluno}\n\n"
                f"Resposta do tutor: {resposta_tutor}"
            )
        }
    ]

    response = client.chat.completions.create(
        model=MODELO,
        messages=mensagens_api,
        temperature=0.1,
        max_completion_tokens=512,
        response_format={
            "type": "json_object"
        }
    )

    conteudo = response.choices[0].message.content

    resultado_json = json.loads(conteudo)

    # Normaliza os dados recebidos
    resultado = {
        "demonstrou_entendimento": bool(
            resultado_json.get("demonstrou_entendimento", False)
        ),
        "nivel_dominio": int(
            resultado_json.get("nivel_dominio", 0)
        ),
        "topico_especifico": str(
            resultado_json.get("topico_especifico", "Geral")
        ),
        "falha_conceitual": resultado_json.get(
            "falha_conceitual"
        )
    }

    # Garante que o domínio fique entre 0 e 100
    resultado["nivel_dominio"] = max(
        0,
        min(
            100,
            resultado["nivel_dominio"]
        )
    )

    return resultado