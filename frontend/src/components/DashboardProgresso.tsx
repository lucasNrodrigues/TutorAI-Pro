"use client";

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getMetricasAluno } from '../services/api';
import { MetricaProgresso } from '../types';
import { Target, AlertTriangle, CheckCircle2, TrendingUp, BrainCircuit, Activity } from 'lucide-react'; // <-- Novos ícones adicionados

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
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 w-full h-full flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 font-medium text-sm">Processando métricas pedagógicas...</p>
      </div>
    );
  }

  if (metricas.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 w-full h-full flex flex-col items-center justify-center min-h-[400px]">
        <div className="bg-slate-50 p-4 rounded-full mb-3">
          <Activity size={32} className="text-slate-300" />
        </div>
        <p className="text-slate-500 font-medium text-center text-sm">Nenhum dado de progresso encontrado.<br/>Inicie uma conversa para gerar métricas.</p>
      </div>
    );
  }

  const disciplinaAtual = metricas[0];
  const dadosGrafico = disciplinaAtual.historico_desempenho?.map((avaliacao, index) => ({
    tentativa: `Sessão ${index + 1}`,
    dominio: avaliacao.nivel_dominio,
    topico: avaliacao.topico_especifico,
  })) || [];

  const errosConceituais = metricas.flatMap(metrica => 
    (metrica.historico_desempenho || [])
      .filter((h: any) => h.falha_conceitual && h.falha_conceitual !== "null" && h.demonstrou_entendimento === false)
      .map((erro: any) => ({
        ...erro,
        topico_geral: metrica.topico 
      }))
  );

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-100 w-full flex flex-col h-full min-w-0 overflow-hidden font-sans">
      
      {/* Cabeçalho da Disciplina */}
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600 border border-blue-100">
          <BrainCircuit size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Evolução em {disciplinaAtual.topico}</h2>
          <p className="text-slate-500 text-sm">Visão geral do seu aprendizado</p>
        </div>
      </div>

      {/* Cards de Métricas (Estilo SaaS Moderno) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4 transition-all hover:border-blue-200">
          <div className="bg-blue-50 p-3.5 rounded-xl text-blue-600">
            <Target size={24} strokeWidth={2} />
          </div>
          <div>
            <span className="text-sm font-semibold text-slate-500 block">Domínio Atual</span>
            <span className="text-3xl font-black text-slate-800">{disciplinaAtual.nivel_dominio}<span className="text-lg text-slate-400 ml-1">%</span></span>
          </div>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4 transition-all hover:border-red-200">
          <div className="bg-red-50 p-3.5 rounded-xl text-red-500">
            <AlertTriangle size={24} strokeWidth={2} />
          </div>
          <div>
            <span className="text-sm font-semibold text-slate-500 block">Dificuldades Recentes</span>
            <span className="text-3xl font-black text-slate-800">{disciplinaAtual.erros_consecutivos} <span className="text-lg font-medium text-slate-400 ml-1">erros</span></span>
          </div>
        </div>
      </div>

      {/* Gráfico de Evolução */}
      <div className="mb-4 flex items-center gap-2">
        <TrendingUp size={16} className="text-slate-400" />
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Curva de Aprendizagem</h3>
      </div>
      <div className="h-64 sm:h-72 w-full min-w-0 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dadosGrafico} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="tentativa" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', padding: '12px' }}
              labelStyle={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '4px' }}
              itemStyle={{ color: '#2563eb', fontWeight: '500' }}
            />
            <Line 
              type="monotone" 
              dataKey="dominio" 
              name="Nível de Domínio (%)"
              stroke="#2563eb" 
              strokeWidth={3}
              activeDot={{ r: 6, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }}
              dot={{ r: 4, fill: '#fff', stroke: '#2563eb', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Seção de Diagnóstico (Onde você errou) */}
      <div className="mt-8 border-t border-slate-100 pt-8 flex-1 overflow-y-auto pr-2">
        <div className="flex items-center gap-2 mb-5">
          <AlertTriangle size={18} className="text-amber-500" />
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Diagnóstico de Aprendizagem</h3>
        </div>

        <div className="space-y-3">
          {errosConceituais.length > 0 ? (
            <div className="bg-red-50/50 border border-red-100 p-5 rounded-2xl shadow-sm">
              <span className="text-xs font-bold text-red-600 uppercase mb-3 block tracking-wide">
                Pontos de Atenção Detectados
              </span>
              <ul className="space-y-3">
                {errosConceituais.map((erro: any, index: number) => (
                  <li key={index} className="flex gap-3 text-sm text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-red-50 shadow-sm">
                    <div className="mt-0.5 w-1.5 h-1.5 bg-red-400 rounded-full shrink-0"></div>
                    <div>
                      <span className="font-semibold text-slate-800 mr-1">{erro.topico_geral}:</span> 
                      {erro.falha_conceitual}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100 flex items-center gap-3 shadow-sm">
              <div className="bg-emerald-100 p-2 rounded-full text-emerald-600">
                <CheckCircle2 size={20} />
              </div>
              <p className="text-sm text-emerald-700 font-medium">
                Excelente! Nenhum erro conceitual registrado nas últimas sessões.
              </p>
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
}