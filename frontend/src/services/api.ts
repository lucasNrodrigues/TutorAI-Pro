import axios from 'axios';
import { MetricaProgresso } from '../types';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
});

export async function getMetricasAluno(alunoId: number): Promise<MetricaProgresso[]> {
  try {
    // Usando a instância 'api' que configuramos acima
    const resposta = await api.get(`/alunos/${alunoId}/metricas`);
    return resposta.data;
  } catch (error) {
    throw new Error('Falha ao buscar as métricas do aluno');
  }
}