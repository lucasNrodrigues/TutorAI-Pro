export interface Avaliacao {
  demonstrou_entendimento: boolean;
  nivel_dominio: number;
  topico_especifico: string;
}

export interface MetricaProgresso {
  id: number;
  topico: string;
  nivel_dominio: number;
  erros_consecutivos: number;
  historico_desempenho: Avaliacao[] | null;
}