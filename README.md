# 🎓 TutorAI Pro - Sistema de Tutoria Inteligente Gamificado

> Uma plataforma educacional interativa impulsionada por LLMs e Geração Aumentada por Recuperação (RAG), projetada para auxiliar o raciocínio lógico de estudantes de engenharia através do Método Socrático.

## 💻 Sobre o Projeto

O **TutorAI Pro** é um Trabalho de Conclusão de Curso desenvolvido para o curso de Engenharia de Computação da Universidade Federal Rural do Semi-Árido (UFERSA). O objetivo do sistema não é fornecer respostas prontas, mas sim atuar como um tutor virtual que estimula a resolução de problemas, identificando lacunas conceituais e gamificando o processo de aprendizagem em disciplinas como Lógica de Programação e Eletrônica Digital.

### ✨ Principais Funcionalidades

- **Chat Interativo Socrático:** IA configurada (via *System Prompts* rigorosos) para guiar o aluno através de perguntas, sem revelar o código ou a lógica final.
- **Integração RAG (Retrieval-Augmented Generation):** Respostas ancoradas em materiais oficiais e ementas fornecidas pelos docentes, reduzindo o risco de alucinações matemáticas ou conceituais.
- **Avaliação Silenciosa (Background Tasks):** Processamento assíncrono que analisa as interações do chat em segundo plano, identificando erros recorrentes e alimentando o banco de dados sem interromper o fluxo do aluno.
- **Gamificação e Métricas:** Sistema de XP, progressão de níveis e um Dashboard visual (construído com Recharts) que exibe o domínio atual do discente e alerta sobre tópicos que exigem maior atenção.

## 🛠️ Arquitetura e Tecnologias Utilizadas

A plataforma foi construída sob uma arquitetura de microsserviços, separando responsabilidades para garantir escalabilidade e performance:

*   **Frontend:** React, Next.js, Tailwind CSS (Mobile-First Responsivo).
*   **Backend:** Python, FastAPI (Processamento assíncrono e Streaming de IA).
*   **Banco de Dados:** PostgreSQL, modelado via SQLAlchemy (ORM).
*   **Inteligência Artificial:** Llama 3 (via Groq API) para inferência ultrarrápida.

## ⚙️ Como rodar localmente

```bash
# Clone este repositório
$ git clone [https://github.com/lucasNrodrigues/TutorAI-Pro.git)

# Acesse a pasta do projeto
$ cd tutorai-pro

# Instale as dependências do Frontend
$ npm install

# Instale as dependências do Backend (em seu ambiente virtual Python)
$ pip install -r requirements.txt

# Execute a aplicação
$ npm run dev
