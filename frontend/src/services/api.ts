import { MetricaProgresso } from '../types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
});

export async function getMetricasAluno(alunoId: number): Promise<MetricaProgresso[]> {
  const resposta = await fetch(`${API_URL}/alunos/${alunoId}/metricas`);
  
  if (!resposta.ok) {
    throw new Error('Falha ao buscar as métricas do aluno');
  }
  
  return resposta.json();
}