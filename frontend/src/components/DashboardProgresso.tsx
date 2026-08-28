"use client";

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getMetricasAluno } from '../services/api';
import { MetricaProgresso } from '../types';
import { Target, AlertTriangle, CheckCircle2, TrendingUp, BrainCircuit, Activity, BookOpen } from 'lucide-react';

// 1. ADICIONAMOS A PROP onRevisarTopico PARA OUVIR O CLIQUE DO BOTÃO
export default function DashboardProgresso({ 
  alunoId, 
  refreshTrigger, 
  onRevisarTopico 
}: { 
  alunoId: number, 
  refreshTrigger: number,
  onRevisarTopico?: (topico: string) => void 
}) {
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

  if (loading) { /* ... (mesmo loading de antes) ... */ return <div className="p-6 text-center text-slate-400 animate-pulse">Carregando métricas...</div>; }
  if (metricas.length === 0) { /* ... (mesmo empty state) ... */ return <div className="p-6 text-center text-slate-400">Nenhum dado encontrado.</div>; }

  const disciplinaAtual = metricas[0];
  const dadosGrafico = disciplinaAtual.historico_desempenho?.map((avaliacao, index) => ({
    tentativa: `Sessão ${index + 1}`,
    dominio: avaliacao.nivel_dominio,
    topico: avaliacao.topico_especifico,
  })) || [];

  // 2. SEPARAMOS OS TÓPICOS QUE PRECISAM DE REVISÃO (Domínio menor que 70 ou com erros)
  const topicosParaRevisao = metricas.filter(m => m.nivel_dominio < 70 || m.erros_consecutivos > 0);

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-100 w-full flex flex-col h-full min-w-0 overflow-hidden font-sans">
      
      {/* Cabeçalho da Disciplina (Igual ao anterior) */}
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600 border border-blue-100">
          <BrainCircuit size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Evolução em {disciplinaAtual.topico}</h2>
          <p className="text-slate-500 text-sm">Visão geral do seu aprendizado</p>
        </div>
      </div>

      {/* Cards Superiores (Igual ao anterior) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4">
          <div className="bg-blue-50 p-3.5 rounded-xl text-blue-600"><Target size={24} strokeWidth={2} /></div>
          <div>
            <span className="text-sm font-semibold text-slate-500 block">Domínio Atual</span>
            <span className="text-3xl font-black text-slate-800">{disciplinaAtual.nivel_dominio}<span className="text-lg text-slate-400 ml-1">%</span></span>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4">
          <div className="bg-red-50 p-3.5 rounded-xl text-red-500"><AlertTriangle size={24} strokeWidth={2} /></div>
          <div>
            <span className="text-sm font-semibold text-slate-500 block">Dificuldades Recentes</span>
            <span className="text-3xl font-black text-slate-800">{disciplinaAtual.erros_consecutivos} <span className="text-lg font-medium text-slate-400 ml-1">erros</span></span>
          </div>
        </div>
      </div>

      {/* Gráfico Omitido por brevidade, pode manter o seu exato código do LineChart aqui! */}
      <div className="h-64 sm:h-72 w-full min-w-0 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 mb-8">
          <ResponsiveContainer width="100%" height="100%">
             {/* SEU GRÁFICO ENTRA AQUI */}
             <LineChart data={dadosGrafico}><Line type="monotone" dataKey="dominio" stroke="#2563eb" strokeWidth={3} /></LineChart>
          </ResponsiveContainer>
      </div>

      {/* 3. A NOVA SEÇÃO INTERATIVA E GAMIFICADA DE REVISÃO */}
      <div className="border-t border-slate-100 pt-8 flex-1 overflow-y-auto pr-2">
        <div className="flex items-center gap-2 mb-5">
          <AlertTriangle size={18} className="text-amber-500" />
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Tópicos para Revisão</h3>
        </div>

        <div className="space-y-4">
          {topicosParaRevisao.length > 0 ? (
            topicosParaRevisao.map((metrica, idx) => (
              <div key={idx} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col gap-3 transition-all hover:border-blue-200 hover:shadow-md relative overflow-hidden group">
                
                {/* Faixa lateral indicativa de gravidade */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-colors ${metrica.nivel_dominio < 50 ? 'bg-red-500' : 'bg-amber-400'}`}></div>
                
                {/* Título e Porcentagem */}
                <div className="flex justify-between items-center pl-2">
                  <span className="font-bold text-slate-800">{metrica.topico}</span>
                  <span className={`font-black ${metrica.nivel_dominio < 50 ? 'text-red-500' : 'text-amber-500'}`}>
                    {metrica.nivel_dominio}%
                  </span>
                </div>
                
                {/* Barra de Progresso Customizada */}
                <div className="w-full bg-slate-100 rounded-full h-2 ml-2 w-[calc(100%-8px)] overflow-hidden">
                  <div 
                    className={`h-2 rounded-full transition-all duration-1000 ${metrica.nivel_dominio < 50 ? 'bg-red-500' : 'bg-amber-400'}`} 
                    style={{ width: `${metrica.nivel_dominio}%` }}
                  ></div>
                </div>

                {/* Mostrar o último erro para dar contexto */}
                {metrica.historico_desempenho?.filter((h: any) => h.falha_conceitual && h.falha_conceitual !== "null").slice(-1).map((erro: any, i: number) => (
                   <p key={i} className="text-xs text-slate-500 ml-2 mt-1 leading-relaxed">
                     <span className="font-semibold text-slate-600">Último erro:</span> {erro.falha_conceitual}
                   </p>
                ))}

                {/* BOTÃO DE AÇÃO */}
                <button 
                  onClick={() => onRevisarTopico && onRevisarTopico(metrica.topico)}
                  className="mt-2 ml-2 flex items-center justify-center gap-2 py-2.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 hover:text-blue-700 text-slate-600 rounded-xl text-sm font-bold transition-all w-[calc(100%-8px)] shadow-sm"
                >
                  <BookOpen size={16} /> 
                  Revisar Agora
                </button>
              </div>
            ))
          ) : (
            <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100 flex items-center gap-3 shadow-sm">
              <div className="bg-emerald-100 p-2 rounded-full text-emerald-600">
                <CheckCircle2 size={20} />
              </div>
              <p className="text-sm text-emerald-700 font-medium">
                Tudo sob controle! Não há pendências de revisão no momento.
              </p>
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
}