from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class Aluno(Base):
    __tablename__ = "alunos"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    senha_hash = Column(String(255), nullable=False) # <--- NOVA COLUNA DE SEGURANÇA
    data_cadastro = Column(DateTime, default=datetime.utcnow)
    foto_url = Column(String(255), default="https://ui-avatars.com/api/?name=User")
    bio = Column(String(500), default="Olá, estou estudando lógica!")
    cargo = Column(String(50), default="aluno")
    xp = Column(Integer, default=0)
    nivel = Column(Integer, default=1)

    conversas = relationship("Conversa", back_populates="aluno")
    metricas = relationship("MetricaProgresso", back_populates="aluno")

class Conversa(Base):
    __tablename__ = "conversas"

    id = Column(Integer, primary_key=True, index=True)
    aluno_id = Column(Integer, ForeignKey("alunos.id"))
    contexto_disciplina = Column(String(100), nullable=False) # Ex: "Cálculo I", "Estrutura de Dados"
    data_criacao = Column(DateTime, default=datetime.utcnow)

    aluno = relationship("Aluno", back_populates="conversas")
    mensagens = relationship("Mensagem", back_populates="conversa")

class Mensagem(Base):
    __tablename__ = "mensagens"

    id = Column(Integer, primary_key=True, index=True)
    conversa_id = Column(Integer, ForeignKey("conversas.id"))
    role = Column(String(20), nullable=False) # 'user' ou 'assistant'
    conteudo = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    conversa = relationship("Conversa", back_populates="mensagens")

class MetricaProgresso(Base):
    __tablename__ = "metricas_progresso"

    id = Column(Integer, primary_key=True, index=True)
    aluno_id = Column(Integer, ForeignKey("alunos.id"))
    topico = Column(String(100), nullable=False) # Ex: "Matrizes", "Ponteiros"
    nivel_dominio = Column(Integer, default=0)    # Escala de 0 a 100
    erros_consecutivos = Column(Integer, default=0) # Controlado pelo módulo pedagógico
    historico_desempenho = Column(JSON, nullable=True) # Guarda logs das respostas anteriores

    aluno = relationship("Aluno", back_populates="metricas")