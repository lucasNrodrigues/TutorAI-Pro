"use client";

import { Trophy, Zap } from 'lucide-react';

interface BarraXPProps {
  nivel: number;
  xpAtual: number;
}

export default function BarraXP({ nivel, xpAtual }: BarraXPProps) {
  const xpNecessario = nivel * 100;
  const porcentagem = Math.min(100, Math.round((xpAtual / xpNecessario) * 100));

  return (
    <div className="flex items-center gap-4 bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-100 font-sans">
      
      {/* Badge do Nível (Estilo SaaS, fundo suave) */}
      <div className="flex flex-col items-center justify-center bg-blue-50 w-12 h-12 rounded-xl text-blue-600 border border-blue-100 shrink-0 relative overflow-hidden">
        <Zap size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.07]" />
        <span className="text-[9px] font-bold uppercase tracking-wider text-blue-500 mb-0.5 z-10">Lvl</span>
        <span className="text-lg font-black leading-none z-10">{nivel}</span>
      </div>

      {/* Barra de Progresso */}
      <div className="flex-1 min-w-[180px]">
        
        {/* Textos Acima da Barra */}
        <div className="flex justify-between items-center gap-3 text-xs font-semibold mb-2">
          <div className="flex items-center gap-1.5 text-slate-700">
            <Trophy size={14} className="text-amber-500" strokeWidth={2.5} />
            <span className="truncate">Iniciante em Lógica</span>
          </div>
          <span className="whitespace-nowrap font-medium text-slate-400">
            <span className="text-blue-600 font-bold">{xpAtual}</span> / {xpNecessario} XP
          </span>
        </div>
        
        {/* Trilho da Barra */}
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/50">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-700 ease-out relative" 
            style={{ width: `${porcentagem}%` }}
          >
            {/* Efeito de brilho sutil dentro da barra (Glassmorphism) */}
            <div className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-r from-transparent to-white/20"></div>
          </div>
        </div>
        
      </div>
    </div>
  );
}