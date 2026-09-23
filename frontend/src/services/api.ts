import axios from "axios";
import { MetricaProgresso } from "../types";

export const api = axios.create({
  baseURL: "https://tutorai-backend-km0b.onrender.com",
});

export async function getMetricasAluno(
  alunoId: number
): Promise<MetricaProgresso[]> {
  try {
    const resposta = await api.get(`/alunos/${alunoId}/metricas`);

    return resposta.data;
  } catch (error) {
    console.error("Erro ao buscar métricas:", error);

    throw new Error("Falha ao buscar as métricas do aluno");
  }
}