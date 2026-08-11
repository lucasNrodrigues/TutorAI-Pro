"use client";

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getMetricasAluno } from '../services/api';
import { MetricaProgresso } from '../types';

export default function DashboardProgresso({ alunoId, refreshTrigger }: { alunoId: number, refreshTrigger: number }) {
  const [metricas, setMetricas] = useState<MetricaProgresso[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarDados() {
      try {
        const dados = await getMetricasAluno(alunoId);
        setMetricas(dados);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    carregarDados();
  }, [alunoId, refreshTrigger]);

  if (loading) {
    return <div className="text-gray-500 animate-pulse">Carregando métricas pedagógicas...</div>;
  }

  if (metricas.length === 0) {
    return <div className="text-gray-500">Nenhum dado de progresso encontrado para este aluno.</div>;
  }

  // 1. O Gráfico principal continua mostrando a última disciplina ativa (metricas[0])
  const disciplinaAtual = metricas[0];
  const dadosGrafico = disciplinaAtual.historico_desempenho?.map((avaliacao, index) => ({
    tentativa: `Interação ${index + 1}`,
    dominio: avaliacao.nivel_dominio,
    topico: avaliacao.topico_especifico,
  })) || [];

  // 2. A MÁGICA AQUI: Varremos TODAS as métricas do banco em busca de falhas conceituais!
  const errosConceituais = metricas.flatMap(metrica => 
    (metrica.historico_desempenho || [])
      .filter((h: any) => h.falha_conceitual && h.falha_conceitual !== "null" && h.demonstrou_entendimento === false)
      .map((erro: any) => ({
        ...erro,
        topico_geral: metrica.topico // Guardamos de qual métrica esse erro veio
      }))
  );

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 w-full flex flex-col h-full min-w-0 overflow-hidden">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Progresso: {disciplinaAtual.topico}</h2>
        <div className="flex gap-4 mt-2">
          <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
            <span className="text-sm text-blue-600 block font-medium">Domínio Atual</span>
            <span className="text-2xl font-bold text-blue-900">{disciplinaAtual.nivel_dominio}%</span>
          </div>
          <div className="bg-red-50 px-4 py-2 rounded-lg border border-red-100">
            <span className="text-sm text-red-600 block font-medium">Erros Consecutivos</span>
            <span className="text-2xl font-bold text-red-900">{disciplinaAtual.erros_consecutivos}</span>
          </div>
        </div>
      </div>

     <div className="h-64 sm:h-72 w-full mt-4 sm:mt-8 min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dadosGrafico}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="tentativa" stroke="#9ca3af" fontSize={12} />
            <YAxis domain={[0, 100]} stroke="#9ca3af" fontSize={12} />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              labelStyle={{ fontWeight: 'bold', color: '#374151' }}
            />
            <Line 
              type="monotone" 
              dataKey="dominio" 
              name="Nível de Domínio (%)"
              stroke="#3b82f6" 
              strokeWidth={3}
              activeDot={{ r: 8 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* NOVA SEÇÃO: MAPA DE ERROS CONCEITUAIS */}
      <div className="mt-8 border-t border-gray-100 pt-6 flex-1 overflow-y-auto pr-2">
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          Pontos de Atenção (Onde você errou)
        </h3>

        <div className="space-y-3">
          {errosConceituais.length > 0 ? (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm">
              <span className="text-xs font-bold text-red-700 uppercase mb-2 block">
                Tópicos para Revisão
              </span>
              <ul className="list-disc pl-5 text-sm text-red-800 space-y-2">
                {errosConceituais.map((erro: any, index: number) => (
                  <li key={index} className="leading-relaxed">
                    {/* Agora ele mostra exatamente onde o erro ocorreu */}
                    <span className="font-semibold">{erro.topico_geral}:</span> {erro.falha_conceitual}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-green-600 bg-green-50 p-4 rounded-lg border border-green-100 flex items-center gap-2 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Excelente! Nenhum erro conceitual registrado até o momento.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}