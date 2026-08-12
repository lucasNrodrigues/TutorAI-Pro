import axios from 'axios';
import { MetricaProgresso } from '../types';

export const api = axios.create({
  // Colocando o link direto para ignorar o erro da Vercel
  baseURL: 'https://tutorai-backend-km0b.onrender.com',
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