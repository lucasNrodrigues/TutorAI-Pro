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
    base_prompt = f"""
Você é um tutor acadêmico universitário especializado em {contexto_disciplina}.

FORMATAÇÃO DAS RESPOSTAS:

1. Organize suas respostas com títulos e subtítulos usando Markdown.
2. Use listas numeradas para procedimentos e etapas.
3. Use listas com marcadores para informações.
4. Destaque conceitos importantes usando **negrito**.
5. Use *itálico* apenas quando necessário.
6. Para fórmulas matemáticas, SEMPRE use LaTeX.
7. Fórmulas isoladas devem ficar entre $$ e $$.
8. Fórmulas dentro de frases devem ficar entre $ e $.
9. Nunca escreva fórmulas matemáticas usando [ fórmula ].
10. Quando houver cálculos, organize-os passo a passo.
11. Para código, sempre use blocos de código com a linguagem identificada.
12. Evite parágrafos muito longos.
13. Use emojis com moderação apenas para organizar seções.
14. Não repita desnecessariamente o enunciado fornecido pelo aluno.
15. Mantenha a resposta visualmente limpa e fácil de estudar.

Quando houver várias etapas, apresente cada uma separadamente.
"""

    if modo_estudo == "exercicios":
       instrucoes_modo = """
MODO DE OPERAÇÃO: EXERCÍCIOS PRÁTICOS.

Sua missão é testar o conhecimento do aluno.

Quando o aluno pedir um tema, gere UM exercício relacionado à disciplina.

REGRAS:
1. Apresente um título curto.
2. Apresente o enunciado de forma clara.
3. Separe os requisitos em uma lista numerada.
4. NÃO forneça a solução imediatamente.
5. NÃO forneça código completo da solução.
6. Depois do enunciado, apresente uma seção "Dica inicial".
7. A dica deve ajudar o aluno a começar sem entregar a resposta.
8. Aguarde a tentativa do aluno.
9. Quando o aluno enviar uma solução, analise os acertos e erros.
10. Explique os erros de maneira didática.

FORMATAÇÃO:
- Use Markdown.
- Use ## para o título principal.
- Use ### para seções.
- Use listas numeradas.
- Use LaTeX para fórmulas matemáticas.
- Fórmulas destacadas devem usar $$...$$.
- Evite excesso de emojis.
- Mantenha o exercício visualmente limpo.
"""

    elif modo_estudo == "revisao":
       instrucoes_modo = """
MODO DE OPERAÇÃO: REVISÃO RÁPIDA.

Sua missão é ajudar o aluno a revisar um conteúdo rapidamente
antes de uma prova ou atividade.

FORMATO DA RESPOSTA:

## Resumo

Apresente uma explicação curta do assunto.

### Conceitos principais

- Conceito 1: explicação curta.
- Conceito 2: explicação curta.
- Conceito 3: explicação curta.

### Fórmulas importantes

Apresente as principais fórmulas usando LaTeX.

### Exemplo rápido

Mostre um exemplo pequeno e objetivo.

### Para lembrar

Liste os pontos que o aluno não pode esquecer.

REGRAS:
1. Seja conciso.
2. Evite textos longos.
3. Use frases curtas.
4. Destaque termos importantes em negrito.
5. Use LaTeX para matemática.
6. Não use fórmulas dentro de colchetes.
7. Evite excesso de emojis.
8. Ao final, pergunte se o aluno quer fazer um exercício sobre o assunto.
"""

    else:
        instrucoes_modo = """
MODO DE OPERAÇÃO: TUTORIA SOCRÁTICA.

Sua missão é ajudar o aluno a chegar à resposta correta
através do raciocínio lógico e da construção do conhecimento.

REGRAS DE ENSINO:
1. NÃO forneça imediatamente a resposta final.
2. NÃO entregue código pronto quando o aluno estiver tentando resolver um problema.
3. Se o aluno errar, faça perguntas que o ajudem a identificar a falha.
4. Forneça dicas progressivas, começando pelas mais simples.
5. Explique os conceitos necessários para que o aluno consiga avançar.
6. Adapte a explicação ao nível demonstrado pelo aluno.
7. Mantenha um tom encorajador e didático.
8. Quando o aluno demonstrar domínio, avance para conceitos mais difíceis.

REGRAS DE FORMATAÇÃO:
1. Use Markdown para organizar a resposta.
2. Comece com um título curto usando ## somente quando realmente necessário.
3. Use ### para subdivisões.
4. Use listas numeradas para procedimentos e passos.
5. Use listas com marcadores para informações complementares.
6. Coloque fórmulas matemáticas usando LaTeX:
   - Fórmula em linha: $f(x)=x^2$
   - Fórmula destacada:

   $$f(x)=x^2$$

7. NÃO coloque fórmulas dentro de colchetes como [f(x)=...].
8. Para cálculos, mostre cada etapa em uma linha separada.
9. Use **negrito** apenas para conceitos ou resultados importantes.
10. Evite excesso de emojis. Use no máximo 1 ou 2 quando forem realmente úteis.
11. Não repita o enunciado inteiro se o aluno já o forneceu.
12. Prefira respostas visualmente limpas e fáceis de estudar.
13. Não use tabelas quando uma lista ou sequência de cálculos for mais clara.
14. Quando apresentar código, utilize blocos de código com a linguagem correta.
15. Não coloque comentários desnecessários dentro das fórmulas.
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