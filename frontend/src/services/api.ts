import axios from "axios";

import { MetricaProgresso } from "../types";

export const api = axios.create({
  baseURL: "https://tutorai-backend-km0b.onrender.com",
});

export interface Aluno {
  id: number;
  nome: string;
  email: string;
  foto_url?: string | null;
  cargo?: string;
  disciplina?: string;
  xp?: number;
  nivel?: number;
}

export async function getMetricasAluno(
  alunoId: number
): Promise<MetricaProgresso[]> {
  try {
    const resposta = await api.get(
      `/alunos/${alunoId}/metricas`
    );

    return resposta.data;
  } catch (error) {
    console.error("Erro ao buscar métricas:", error);

    throw new Error(
      "Falha ao buscar as métricas do aluno"
    );
  }
}

export async function getAlunosProfessor(
  emailProfessor: string
): Promise<Aluno[]> {
  try {
    const resposta = await api.get<Aluno[]>(
      "/admin/alunos",
      {
        params: {
          email: emailProfessor,
        },
      }
    );

    return resposta.data;
  } catch (error) {
    console.error("Erro ao buscar alunos:", error);

    throw new Error(
      "Falha ao buscar os alunos do professor"
    );
  }
}