from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional, Any

class MensagemBase(BaseModel):
    role: str
    conteudo: str

class MensagemCreate(MensagemBase):
    conversa_id: int

class MensagemResponse(MensagemBase):
    id: int
    timestamp: datetime
    class Config:
        from_attributes = True

class MetricaResponse(BaseModel):
    topico: str
    nivel_dominio: int
    erros_consecutivos: int
    class Config:
        from_attributes = True
# --- Schemas para Aluno ---
class AlunoBase(BaseModel):
    nome: str
    email: str

class AlunoCreate(AlunoBase):
    pass

class AlunoResponse(AlunoBase):
    id: int
    data_cadastro: datetime
    
    class Config:
        from_attributes = True

# --- Schemas para Conversa ---
class ConversaBase(BaseModel):
    contexto_disciplina: str

class ConversaCreate(ConversaBase):
    aluno_id: int

class ConversaResponse(ConversaBase):
    id: int
    aluno_id: int
    data_criacao: datetime
    
    class Config:
        from_attributes = True

class MetricaProgressoResponse(BaseModel):
    id: int
    topico: str
    nivel_dominio: int
    erros_consecutivos: int
    historico_desempenho: Optional[List[Any]] = None

    class Config:
        from_attributes = True