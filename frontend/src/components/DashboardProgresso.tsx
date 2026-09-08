"use client";

import { useEffect, useState } from "react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { getMetricasAluno } from "../services/api";
import { MetricaProgresso } from "../types";

import {
  Target,
  AlertTriangle,
  CheckCircle2,
  BrainCircuit,
  BookOpen,
} from "lucide-react";

interface DashboardProgressoProps {
  alunoId: number;
  refreshTrigger: number;
  onRevisarTopico?: (topico: string) => void;
}

export default function DashboardProgresso({
  alunoId,
  refreshTrigger,
  onRevisarTopico,
}: DashboardProgressoProps) {
  const [metricas, setMetricas] = useState<MetricaProgresso[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarDados() {
      try {
        setLoading(true);

        const dados = await getMetricasAluno(alunoId);

        setMetricas(dados);
      } catch (error) {
        console.error("Erro ao carregar métricas:", error);
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, [alunoId, refreshTrigger]);

  if (loading) {
    return (
      <div className="p-6 text-center text-slate-400 animate-pulse">
        Carregando métricas...
      </div>
    );
  }

  if (metricas.length === 0) {
    return (
      <div className="p-6 text-center text-slate-400">
        Nenhum dado encontrado.
      </div>
    );
  }

  const disciplinaAtual = metricas[0];

  const dadosGrafico =
    disciplinaAtual.historico_desempenho?.map((avaliacao, index) => ({
      tentativa: `Sessão ${index + 1}`,
      dominio: avaliacao.nivel_dominio,
      topico: avaliacao.topico_especifico,
    })) || [];

  const topicosParaRevisao = metricas.filter(
    (m) => m.nivel_dominio < 70 || m.erros_consecutivos > 0,
  );

  return (
    <div
      className="
        bg-white
        rounded-2xl
        shadow-sm
        border border-slate-100
        w-full
        min-w-0
        max-w-full
        h-full
        min-h-0
        overflow-y-auto
        overflow-x-hidden
        font-sans
      "
    >
      <div className="p-5 sm:p-6 lg:p-8 w-full min-w-0">
        {/* =========================================================
            CABEÇALHO
        ========================================================= */}

        <div className="flex items-start gap-3 mb-6 min-w-0">
          <div
            className="
              bg-blue-50
              p-2.5
              rounded-xl
              text-blue-600
              border border-blue-100
              shrink-0
            "
          >
            <BrainCircuit size={24} />
          </div>

          <div className="min-w-0 flex-1">
            <h2
              className="
                text-lg
                sm:text-xl
                font-bold
                text-slate-800
                tracking-tight
                wrap-break-word
              "
            >
              Evolução em {disciplinaAtual.topico}
            </h2>

            <p className="text-slate-500 text-sm mt-0.5">
              Visão geral do seu aprendizado
            </p>
          </div>
        </div>

       {/* =========================================================
            CARDS SUPERIORES
        ========================================================= */}

        <div className="flex flex-col gap-3 mb-8 w-full min-w-0">
          {/* DOMÍNIO ATUAL */}
          <div
            className="
              bg-white
              border border-slate-200
              rounded-2xl
              p-4
              flex
              items-center
              gap-3.5
              min-w-0
              w-full
              shadow-sm
            "
          >
            <div
              className="
                bg-blue-50
                p-3
                rounded-xl
                text-blue-600
                shrink-0
              "
            >
              <Target size={22} strokeWidth={2} />
            </div>

            <div className="min-w-0 flex-1">
              <span
                className="
                  text-xs
                  font-semibold
                  text-slate-500
                  block
                  whitespace-nowrap
                "
              >
                Domínio Atual
              </span>

              <div className="flex items-baseline gap-1 min-w-0">
                <span
                  className="
                    text-2xl
                    font-black
                    text-slate-800
                    leading-tight
                  "
                >
                  {disciplinaAtual.nivel_dominio}
                </span>

                <span
                  className="
                    text-sm
                    font-semibold
                    text-slate-400
                  "
                >
                  %
                </span>
              </div>
            </div>
          </div>

          {/* DIFICULDADES RECENTES */}
          <div
            className="
              bg-white
              border border-slate-200
              rounded-2xl
              p-4
              flex
              items-center
              gap-3.5
              min-w-0
              w-full
              shadow-sm
            "
          >
            <div
              className="
                bg-red-50
                p-3
                rounded-xl
                text-red-500
                shrink-0
              "
            >
              <AlertTriangle size={22} strokeWidth={2} />
            </div>

            <div className="min-w-0 flex-1">
              <span
                className="
                  text-xs
                  font-semibold
                  text-slate-500
                  block
                  whitespace-nowrap
                "
              >
                Dificuldades Recentes
              </span>

              <div className="flex items-baseline gap-1 min-w-0">
                <span
                  className="
                    text-2xl
                    font-black
                    text-slate-800
                    leading-tight
                  "
                >
                  {disciplinaAtual.erros_consecutivos}
                </span>

                <span
                  className="
                    text-sm
                    font-medium
                    text-slate-400
                  "
                >
                  erros
                </span>
              </div>
            </div>
          </div>
        </div>  

        {/* =========================================================
            GRÁFICO
        ========================================================= */}

        <div
          className="
            w-full
            min-w-0
            h-64
            sm:h-72
            bg-slate-50/50
            p-3
            sm:p-4
            rounded-2xl
            border border-slate-100
            mb-8
            overflow-hidden
          "
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={dadosGrafico}
              margin={{
                top: 10,
                right: 10,
                left: -15,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />

              <XAxis
                dataKey="tentativa"
                tick={{
                  fontSize: 11,
                  fill: "#64748b",
                }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                domain={[0, 100]}
                tick={{
                  fontSize: 11,
                  fill: "#64748b",
                }}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
                formatter={(value) => [`${value}%`, "Domínio"]}
              />

              <Line
                type="monotone"
                dataKey="dominio"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{
                  r: 4,
                  fill: "#2563eb",
                }}
                activeDot={{
                  r: 6,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* =========================================================
            TÓPICOS PARA REVISÃO
        ========================================================= */}

        <div
          className="
            border-t
            border-slate-100
            pt-7
            w-full
            min-w-0
          "
        >
          <div
            className="
              flex
              items-center
              gap-2
              mb-5
              min-w-0
            "
          >
            <div
              className="
                bg-amber-50
                p-2
                rounded-lg
                text-amber-500
                shrink-0
              "
            >
              <AlertTriangle size={18} />
            </div>

            <h3
              className="
                text-sm
                font-bold
                text-slate-700
                uppercase
                tracking-wider
                truncate
              "
            >
              Tópicos para Revisão
            </h3>
          </div>

          <div className="space-y-4 w-full min-w-0">
            {topicosParaRevisao.length > 0 ? (
              topicosParaRevisao.map((metrica, idx) => {
                const dominioBaixo = metrica.nivel_dominio < 50;

                const ultimosErros = metrica.historico_desempenho
                  ?.filter((h) => h.falha_conceitual)
                  .slice(-1);

                return (
                  <div
                    key={idx}
                    className="
                        relative
                        bg-white
                        border border-slate-200
                        rounded-2xl
                        p-4
                        sm:p-5
                        shadow-sm
                        flex
                        flex-col
                        gap-3
                        transition-all
                        hover:border-blue-200
                        hover:shadow-md
                        overflow-hidden
                        min-w-0
                        w-full
                      "
                  >
                    {/* FAIXA LATERAL */}

                    <div
                      className={`
                          absolute
                          left-0
                          top-0
                          bottom-0
                          w-1.5
                          ${dominioBaixo ? "bg-red-500" : "bg-amber-400"}
                        `}
                    />

                    {/* TÍTULO + PORCENTAGEM */}

                    <div
                      className="
                          flex
                          items-center
                          justify-between
                          gap-3
                          pl-2
                          min-w-0
                          w-full
                        "
                    >
                      <span
                        className="
                            font-bold
                            text-slate-800
                            text-sm
                            sm:text-base
                            wrap-break-word
                            min-w-0
                            flex-1
                          "
                      >
                        {metrica.topico}
                      </span>

                      <span
                        className={`
                            font-black
                            text-sm
                            sm:text-base
                            shrink-0
                            ${dominioBaixo ? "text-red-500" : "text-amber-500"}
                          `}
                      >
                        {metrica.nivel_dominio}%
                      </span>
                    </div>

                    {/* BARRA DE PROGRESSO */}

                    <div
                      className="
                          pl-2
                          w-full
                        "
                    >
                      <div
                        className="
                            w-full
                            bg-slate-100
                            rounded-full
                            h-2
                            overflow-hidden
                          "
                      >
                        <div
                          className={`
                              h-2
                              rounded-full
                              transition-all
                              duration-1000
                              ${dominioBaixo ? "bg-red-500" : "bg-amber-400"}
                            `}
                          style={{
                            width: `${Math.min(
                              Math.max(metrica.nivel_dominio, 0),
                              100,
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* ÚLTIMO ERRO */}

                    {ultimosErros && ultimosErros.length > 0 && (
                      <div className="pl-2 min-w-0">
                        {ultimosErros.map((erro, i) => (
                          <p
                            key={i}
                            className="
            text-xs
            sm:text-sm
            text-slate-500
            leading-relaxed
            wrap-break-word
          "
                          >
                            <span className="font-semibold text-slate-600">
                              Falha conceitual identificada.
                            </span>
                          </p>
                        ))}
                      </div>
                    )}

                    {/* BOTÃO */}

                    <div className="pl-2 w-full">
                      <button
                        type="button"
                        onClick={() => onRevisarTopico?.(metrica.topico)}
                        className="
                            w-full
                            flex
                            items-center
                            justify-center
                            gap-2
                            py-2.5
                            px-4
                            bg-slate-50
                            hover:bg-blue-50
                            border border-slate-200
                            hover:border-blue-200
                            hover:text-blue-700
                            text-slate-600
                            rounded-xl
                            text-sm
                            font-bold
                            transition-all
                            shadow-sm
                          "
                      >
                        <BookOpen size={16} />

                        <span>Revisar Agora</span>
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div
                className="
                  bg-emerald-50/50
                  p-5
                  rounded-2xl
                  border border-emerald-100
                  flex
                  items-center
                  gap-3
                  shadow-sm
                  min-w-0
                "
              >
                <div
                  className="
                    bg-emerald-100
                    p-2
                    rounded-full
                    text-emerald-600
                    shrink-0
                  "
                >
                  <CheckCircle2 size={20} />
                </div>

                <p
                  className="
                    text-sm
                    text-emerald-700
                    font-medium
                    leading-relaxed
                  "
                >
                  Tudo sob controle! Não há pendências de revisão no momento.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
