/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  FileText,
  GraduationCap,
  Loader2,
  RefreshCw,
  Target,
  TrendingUp,
  Upload,
  Users,
  XCircle,
} from "lucide-react";

import { api, getMetricasAluno } from "@/services/api";
import type { MetricaProgresso } from "@/types";

interface DashboardProfessorProps {
  emailProfessor: string;
}

interface Aluno {
  id: number;
  nome: string;
  email: string;
  foto_url?: string | null;
  cargo?: string;
  disciplina?: string;
  xp?: number;
  nivel?: number;
}

interface Avaliacao {
  falha_conceitual: boolean;
  demonstrou_entendimento: boolean;
  nivel_dominio: number;
  topico_especifico: string;
}

export default function DashboardProfessor({
  emailProfessor,
}: DashboardProfessorProps) {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [alunoSelecionado, setAlunoSelecionado] = useState<Aluno | null>(null);

  const [metricas, setMetricas] = useState<MetricaProgresso[]>([]);

  const [carregandoAlunos, setCarregandoAlunos] = useState(true);
  const [carregandoMetricas, setCarregandoMetricas] = useState(false);

  const [erro, setErro] = useState("");
  const [erroMetricas, setErroMetricas] = useState("");

  const [mensagemUpload, setMensagemUpload] = useState("");
  const [fazendoUpload, setFazendoUpload] = useState(false);

  /*
   * ============================================================
   * CARREGAR ALUNOS
   * ============================================================
   */

  async function carregarAlunos() {
    try {
      setCarregandoAlunos(true);
      setErro("");

      const resposta = await api.get<Aluno[]>("/admin/alunos", {
        params: {
          email: emailProfessor,
        },
      });

      setAlunos(resposta.data || []);
    } catch (error: any) {
      console.error("Erro ao carregar alunos:", error);

      const mensagem =
        error?.response?.data?.detail ||
        "Não foi possível carregar os alunos.";

      setErro(mensagem);
      setAlunos([]);
    } finally {
      setCarregandoAlunos(false);
    }
  }

  /*
   * ============================================================
   * CARREGAR MÉTRICAS DO ALUNO
   * ============================================================
   */

  async function carregarMetricas(aluno: Aluno) {
    try {
      setAlunoSelecionado(aluno);
      setMetricas([]);
      setErroMetricas("");
      setCarregandoMetricas(true);

      const dados = await getMetricasAluno(aluno.id);

      setMetricas(dados || []);
    } catch (error) {
      console.error("Erro ao carregar métricas:", error);

      setErroMetricas(
        "Não foi possível carregar o desempenho deste aluno."
      );
    } finally {
      setCarregandoMetricas(false);
    }
  }

  /*
   * ============================================================
   * CARREGAR ALUNOS AO ABRIR O PAINEL
   * ============================================================
   */

  useEffect(() => {
    if (!emailProfessor) return;

    carregarAlunos();
  }, [carregarAlunos, emailProfessor]);

  /*
   * ============================================================
   * UPLOAD DO PDF
   * ============================================================
   */

  async function handleUpload(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    if (file.type !== "application/pdf") {
      setMensagemUpload("❌ Selecione apenas arquivos PDF.");
      e.target.value = "";
      return;
    }

    try {
      setFazendoUpload(true);
      setMensagemUpload("Enviando PDF...");

      const formData = new FormData();
      formData.append("file", file);

      const resposta = await api.post("/admin/upload/", formData);

      setMensagemUpload(
        "✅ " +
          (resposta.data?.mensagem ||
            "PDF enviado e processado com sucesso.")
      );
    } catch (error: any) {
      console.error("Erro no upload:", error);

      const detalhe =
        error?.response?.data?.detail ||
        "Erro ao enviar o PDF.";

      setMensagemUpload("❌ " + detalhe);
    } finally {
      setFazendoUpload(false);
      e.target.value = "";
    }
  }

  /*
   * ============================================================
   * VOLTAR PARA A LISTA
   * ============================================================
   */

  function voltarParaAlunos() {
    setAlunoSelecionado(null);
    setMetricas([]);
    setErroMetricas("");
  }

  /*
   * ============================================================
   * CÁLCULOS DO DASHBOARD
   * ============================================================
   */

  const estatisticas = useMemo(() => {
    if (metricas.length === 0) {
      return {
        dominioMedio: 0,
        topicos: 0,
        erros: 0,
        avaliacoes: 0,
      };
    }

    const dominioMedio =
      metricas.reduce(
        (total, metrica) => total + Number(metrica.nivel_dominio || 0),
        0
      ) / metricas.length;

    const erros = metricas.reduce(
      (maior, metrica) =>
        Math.max(maior, Number(metrica.erros_consecutivos || 0)),
      0
    );

    const avaliacoes = metricas.reduce(
      (total, metrica) =>
        total + (metrica.historico_desempenho?.length || 0),
      0
    );

    return {
      dominioMedio: Math.round(dominioMedio),
      topicos: metricas.length,
      erros,
      avaliacoes,
    };
  }, [metricas]);

  /*
   * ============================================================
   * HISTÓRICO DE AVALIAÇÕES
   * ============================================================
   */

  const historico = useMemo(() => {
    const lista: Array<
      Avaliacao & {
        topico: string;
      }
    > = [];

    metricas.forEach((metrica) => {
      const historicoMetrica =
        metrica.historico_desempenho || [];

      historicoMetrica.forEach((avaliacao) => {
        lista.push({
          ...avaliacao,
          topico: metrica.topico,
        });
      });
    });

    return lista;
  }, [metricas]);

  /*
   * ============================================================
   * TÓPICOS QUE PRECISAM DE ATENÇÃO
   * ============================================================
   */

  const topicosAtencao = useMemo(() => {
    return [...metricas]
      .sort(
        (a, b) =>
          Number(a.nivel_dominio || 0) -
          Number(b.nivel_dominio || 0)
      )
      .slice(0, 5);
  }, [metricas]);

  /*
   * ============================================================
   * COMPONENTE DE BARRA DE DOMÍNIO
   * ============================================================
   */

  function BarraDominio({
    valor,
    grande = false,
  }: {
    valor: number;
    grande?: boolean;
  }) {
    const percentual = Math.max(0, Math.min(100, Number(valor) || 0));

    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-1">
          <span
            className={
              grande
                ? "text-sm font-medium text-slate-700 dark:text-slate-300"
                : "text-xs font-medium text-slate-600 dark:text-slate-400"
            }
          >
            Domínio
          </span>

          <span
            className={
              grande
                ? "text-sm font-bold text-slate-800 dark:text-slate-100"
                : "text-xs font-bold text-slate-700 dark:text-slate-200"
            }
          >
            {percentual.toFixed(0)}%
          </span>
        </div>

        <div
          className={
            grande
              ? "h-3 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden"
              : "h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden"
          }
        >
          <div
            className="h-full rounded-full bg-blue-600 transition-all duration-500"
            style={{ width: `${percentual}%` }}
          />
        </div>
      </div>
    );
  }

  /*
   * ============================================================
   * TELA DE DETALHES DO ALUNO
   * ============================================================
   */

  if (alunoSelecionado) {
    return (
      <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Cabeçalho */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <button
            onClick={voltarParaAlunos}
            className="flex items-center gap-2 w-fit px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <ArrowLeft size={18} />
            Voltar para alunos
          </button>

          <button
            onClick={() => carregarMetricas(alunoSelecionado)}
            disabled={carregandoMetricas}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={carregandoMetricas ? "animate-spin" : ""}
            />
            Atualizar
          </button>
        </div>

        {/* Identificação do aluno */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-5 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <img
              src={
                alunoSelecionado.foto_url ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  alunoSelecionado.nome
                )}&background=2563eb&color=fff`
              }
              alt={alunoSelecionado.nome}
              className="w-16 h-16 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700"
            />

            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                {alunoSelecionado.nome}
              </h2>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                {alunoSelecionado.email}
              </p>

              {alunoSelecionado.disciplina && (
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                  {alunoSelecionado.disciplina}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Erro */}
        {erroMetricas && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 p-4 text-red-700 dark:text-red-300">
            <AlertCircle size={20} className="mt-0.5 shrink-0" />

            <div>
              <p className="font-semibold">
                Erro ao carregar desempenho
              </p>

              <p className="text-sm mt-1">{erroMetricas}</p>
            </div>
          </div>
        )}

        {/* Loading */}
        {carregandoMetricas ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2
              size={40}
              className="animate-spin text-blue-600 mb-4"
            />

            <p className="text-slate-600 dark:text-slate-400">
              Carregando desempenho do aluno...
            </p>
          </div>
        ) : metricas.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center">
            <BookOpen
              size={42}
              className="mx-auto text-slate-400 mb-4"
            />

            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              Ainda não existem métricas
            </h3>

            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Este aluno ainda não possui dados suficientes de
              desempenho.
            </p>
          </div>
        ) : (
          <>
            {/* Cards de resumo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    Domínio médio
                  </span>

                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                    <Target size={20} />
                  </div>
                </div>

                <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                  {estatisticas.dominioMedio}%
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    Tópicos avaliados
                  </span>

                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                    <BookOpen size={20} />
                  </div>
                </div>

                <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                  {estatisticas.topicos}
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    Erros consecutivos
                  </span>

                  <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400">
                    <AlertCircle size={20} />
                  </div>
                </div>

                <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                  {estatisticas.erros}
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    Avaliações
                  </span>

                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-950/50 text-green-600 dark:text-green-400">
                    <TrendingUp size={20} />
                  </div>
                </div>

                <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                  {estatisticas.avaliacoes}
                </p>
              </div>
            </div>

            {/* Tópicos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                    <BookOpen size={20} />
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">
                      Desempenho por tópico
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Domínio registrado pelo sistema
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
                  {metricas.map((metrica) => (
                    <div key={metrica.id}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {metrica.topico}
                        </span>

                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {metrica.erros_consecutivos} erro(s)
                        </span>
                      </div>

                      <BarraDominio
                        valor={metrica.nivel_dominio}
                        grande
                      />
                    </div>
                  ))}
                </div>
              </section>

              {/* Pontos de atenção */}
              <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400">
                    <AlertCircle size={20} />
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">
                      Pontos de atenção
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Tópicos com menor domínio registrado
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {topicosAtencao.map((metrica) => (
                    <div
                      key={metrica.id}
                      className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {metrica.topico}
                        </span>

                        {Number(metrica.nivel_dominio) < 50 ? (
                          <span className="text-xs font-bold text-red-600 dark:text-red-400">
                            Atenção
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-orange-600 dark:text-orange-400">
                            Acompanhar
                          </span>
                        )}
                      </div>

                      <BarraDominio
                        valor={metrica.nivel_dominio}
                      />
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Histórico */}
            <section className="mt-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                  <TrendingUp size={20} />
                </div>

                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100">
                    Histórico de avaliações
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Registros das avaliações realizadas pelo TutorAI
                  </p>
                </div>
              </div>

              {historico.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Ainda não existem avaliações no histórico.
                </p>
              ) : (
                <div className="space-y-3">
                  {historico
                    .slice()
                    .reverse()
                    .slice(0, 10)
                    .map((avaliacao, index) => (
                      <div
                        key={`${avaliacao.topico}-${index}`}
                        className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between rounded-xl border border-slate-100 dark:border-slate-800 p-4"
                      >
                        <div className="flex items-center gap-3">
                          {avaliacao.demonstrou_entendimento ? (
                            <CheckCircle2
                              size={20}
                              className="text-green-600 dark:text-green-400 shrink-0"
                            />
                          ) : (
                            <XCircle
                              size={20}
                              className="text-red-600 dark:text-red-400 shrink-0"
                            />
                          )}

                          <div>
                            <p className="font-medium text-slate-800 dark:text-slate-200">
                              {avaliacao.topico_especifico ||
                                avaliacao.topico}
                            </p>

                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Tópico: {avaliacao.topico}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          {avaliacao.falha_conceitual && (
                            <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                              Falha conceitual
                            </span>
                          )}

                          <span className="font-bold text-slate-700 dark:text-slate-200">
                            {Number(
                              avaliacao.nivel_dominio || 0
                            ).toFixed(0)}
                            %
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    );
  }

  /*
   * ============================================================
   * LISTA DE ALUNOS
   * ============================================================
   */

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
              <GraduationCap size={26} />
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">
                Painel do Professor
              </h1>

              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Acompanhe o desempenho dos seus alunos.
              </p>
            </div>
          </div>
        </div>

        {/* Upload */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {mensagemUpload && (
            <span className="text-sm text-slate-600 dark:text-slate-300 max-w-xs">
              {mensagemUpload}
            </span>
          )}

          <label
            className={`flex items-center justify-center gap-2 cursor-pointer px-4 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition ${
              fazendoUpload
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            {fazendoUpload ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Upload size={18} />
            )}

            {fazendoUpload
              ? "Processando..."
              : "Subir PDF da Aula"}

            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleUpload}
              disabled={fazendoUpload}
            />
          </label>
        </div>
      </div>

      {/* Erro */}
      {erro && (
        <div className="mb-6 flex items-start justify-between gap-4 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 p-4">
          <div className="flex items-start gap-3 text-red-700 dark:text-red-300">
            <AlertCircle size={20} className="mt-0.5 shrink-0" />

            <div>
              <p className="font-semibold">
                Não foi possível carregar os alunos
              </p>

              <p className="text-sm mt-1">{erro}</p>
            </div>
          </div>

          <button
            onClick={carregarAlunos}
            className="shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900 text-sm font-medium text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/40"
          >
            <RefreshCw size={15} />
            Tentar novamente
          </button>
        </div>
      )}

      {/* Card principal */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Título da tabela */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <Users size={20} />
            </div>

            <div>
              <h2 className="font-bold text-slate-800 dark:text-slate-100">
                Alunos
              </h2>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                {alunos.length} aluno(s) encontrado(s)
              </p>
            </div>
          </div>

          <button
            onClick={carregarAlunos}
            disabled={carregandoAlunos}
            className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={carregandoAlunos ? "animate-spin" : ""}
            />
            Atualizar
          </button>
        </div>

        {/* Loading */}
        {carregandoAlunos ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2
              size={40}
              className="animate-spin text-blue-600 mb-4"
            />

            <p className="text-slate-600 dark:text-slate-400">
              Carregando alunos...
            </p>
          </div>
        ) : alunos.length === 0 ? (
          /* Sem alunos */
          <div className="text-center py-20 px-6">
            <Users
              size={48}
              className="mx-auto text-slate-300 dark:text-slate-600 mb-4"
            />

            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              Nenhum aluno encontrado
            </h3>

            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">
              Ainda não existem alunos cadastrados para serem
              exibidos no painel.
            </p>
          </div>
        ) : (
          /* Tabela */
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800">
                  <th className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-300">
                    Aluno
                  </th>

                  <th className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-300">
                    Email
                  </th>

                  <th className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-300">
                    Status
                  </th>

                  <th className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-300 text-right">
                    Ação
                  </th>
                </tr>
              </thead>

              <tbody>
                {alunos.map((aluno) => (
                  <tr
                    key={aluno.id}
                    className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3 min-w-55">
                        <img
                          src={
                            aluno.foto_url ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              aluno.nome
                            )}&background=2563eb&color=fff`
                          }
                          alt={aluno.nome}
                          className="w-10 h-10 rounded-full object-cover"
                        />

                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-100">
                            {aluno.nome}
                          </p>

                          {aluno.disciplina && (
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {aluno.disciplina}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="p-4 text-sm text-slate-600 dark:text-slate-400">
                      {aluno.email}
                    </td>

                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400 px-2.5 py-1 rounded-full text-xs font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        Ativo
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => carregarMetricas(aluno)}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition"
                      >
                        Ver desempenho
                        <ChevronRight size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Informação do professor */}
      <div className="mt-5 flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
        <FileText size={14} />

        <span>
          Professor conectado: {emailProfessor}
        </span>
      </div>
    </div>
  );
}