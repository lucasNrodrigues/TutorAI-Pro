import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

# Inicializa o cliente da Groq
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def gerar_resposta_pedagogica_stream(contexto_disciplina: str, historico_mensagens: list, nova_mensagem: str, modo_estudo: str = "tutor"):
    """
    Versão em streaming que adapta a instrução da IA com base no modo de estudo selecionado.
    """
    
    # 1. Base do prompt que serve para todos os modos
    base_prompt = f"Você é um tutor acadêmico universitário especializado em {contexto_disciplina}.\n"

    # 2. Lógica condicional para mudar a personalidade da IA
    if modo_estudo == "exercicios":
        instrucoes_modo = """
        MODO DE OPERAÇÃO: EXERCÍCIOS PRÁTICOS.
        Sua missão é testar o aluno. Quando ele pedir um tema, gere UM desafio prático de lógica ou código.
        REGRAS:
        1. Forneça um enunciado claro com os requisitos.
        2. NÃO forneça a resposta sob nenhuma circunstância.
        3. Aguarde o aluno enviar a tentativa de resolução e, em seguida, avalie o código dele apontando falhas e acertos.
        """
    elif modo_estudo == "revisao":
        instrucoes_modo = """
        MODO DE OPERAÇÃO: REVISÃO RÁPIDA.
        Sua missão é fornecer resumos diretos e estruturados para ajudar na memorização antes de provas.
        REGRAS:
        1. Seja extremamente conciso. Use tópicos curtos (estilo flashcard ou mapa mental).
        2. Destaque a sintaxe, regras matemáticas ou conceitos principais do tema solicitado.
        3. Ao final da explicação, pergunte se o aluno quer ir para o Modo Exercícios para testar o que revisou.
        """
    else: # Padrão: "tutor"
        instrucoes_modo = """
        MODO DE OPERAÇÃO: TUTORIA SOCRÁTICA.
        Sua missão é ajudar o aluno a chegar na resposta correta através do raciocínio lógico e da construção do conhecimento.
        REGRAS ABSOLUTAS:
        1. NUNCA forneça a resposta final, o código pronto ou o cálculo resolvido logo de cara.
        2. Se o aluno errar, faça perguntas que o ajudem a identificar a falha lógica.
        3. Forneça dicas incrementais.
        4. Mantenha um tom encorajador e instigante.
        """

    # Junta a base com as instruções do modo selecionado
    system_prompt = base_prompt + instrucoes_modo

    mensagens_api = [{"role": "system", "content": system_prompt}]
    
    for msg in historico_mensagens:
        mensagens_api.append({"role": msg.role, "content": msg.conteudo})
        
    mensagens_api.append({"role": "user", "content": nova_mensagem})

    # O segredo aqui é o stream=True
    response = client.chat.completions.create(
        model="openai/gpt-oss-120b", # ou a linha Llama 3 que você vem utilizando
        messages=mensagens_api,
        temperature=0.4,
        max_tokens=1024,
        stream=True 
    )

    # Devolvemos cada pedaço (chunk) assim que ele chega da Groq
    for chunk in response:
        pedaco = chunk.choices[0].delta.content
        if pedaco:
            yield pedaco


def avaliar_progresso_silencioso(contexto_disciplina: str, mensagem_aluno: str, resposta_tutor: str) -> dict:
    # ... (Seu código original continua igual daqui para baixo)
    system_prompt = f"""Você é um sistema de avaliação educacional avaliando um aluno de {contexto_disciplina}.
    Analise a última mensagem do aluno e a resposta do tutor.
# ... resto da função ...