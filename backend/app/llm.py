import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

# Inicializa o cliente da Groq
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def gerar_resposta_pedagogica_stream(contexto_disciplina: str, historico_mensagens: list, nova_mensagem: str):
    """
    Versão em streaming que devolve a resposta palavra por palavra.
    """
    system_prompt = f"""Você é um tutor acadêmico universitário especializado em {contexto_disciplina}.
    Sua missão é ajudar o aluno a chegar na resposta correta através do raciocínio lógico e da construção do conhecimento.

    REGRAS ABSOLUTAS DE COMPORTAMENTO:
    1. NUNCA forneça a resposta final ou o cálculo resolvido logo de cara.
    2. Se o aluno errar, faça perguntas que o ajudem a identificar a falha lógica.
    3. Forneça dicas incrementais.
    4. Mantenha um tom encorajador.
    """

    mensagens_api = [{"role": "system", "content": system_prompt}]
    
    for msg in historico_mensagens:
        mensagens_api.append({"role": msg.role, "content": msg.conteudo})
        
    mensagens_api.append({"role": "user", "content": nova_mensagem})

    # O segredo aqui é o stream=True
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
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
    """
    Analisa a interação e retorna métricas estruturadas em JSON.
    """
    system_prompt = f"""Você é um sistema de avaliação educacional avaliando um aluno de {contexto_disciplina}.
    Analise a última mensagem do aluno e a resposta do tutor.
    
    Sua única tarefa é retornar um objeto JSON estrito com os seguintes campos:
    - "demonstrou_entendimento": booleano (true se o aluno acertou ou avançou, false se errou ou tem dúvida)
    - "nivel_dominio": inteiro de 0 a 100 (uma estimativa do domínio atual do aluno sobre o tópico discutido)
    - "topico_especifico": string curta (ex: "Derivadas", "Laços de Repetição", "Matrizes")
    - "falha_conceitual": string muito curta descrevendo exatamente qual foi o erro do aluno (ex: "Confundiu a porta AND com OR", "Esqueceu de fechar o parênteses lógico"). Se o aluno acertou e não cometeu erros, retorne null.
    """

    mensagens_api = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": f"Mensagem do aluno: {mensagem_aluno}\nResposta do tutor: {resposta_tutor}"}
    ]

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=mensagens_api,
        temperature=0.1, # Temperatura bem baixa para focar em precisão e não em criatividade
        response_format={"type": "json_object"} # Força a saída ser um JSON
    )

    # Converte a string JSON que a IA gerou em um dicionário Python
    resultado_json = json.loads(response.choices[0].message.content)
    return resultado_json