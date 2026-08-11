"use client";

interface BarraXPProps {
  nivel: number;
  xpAtual: number;
}

export default function BarraXP({ nivel, xpAtual }: BarraXPProps) {
  const xpNecessario = nivel * 100;
  const porcentagem = Math.min(100, Math.round((xpAtual / xpNecessario) * 100));

  return (
    <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
      
      {/* Badge do Nível */}
      <div className="flex flex-col items-center justify-center bg-blue-600 w-10 h-10 rounded-full text-white shadow-md border-2 border-blue-200 shrink-0">
        <span className="text-[10px] font-bold uppercase leading-none mt-1">Lvl</span>
        <span className="text-lg font-extrabold leading-none">{nivel}</span>
      </div>

      {/* Barra de Progresso */}
      <div className="flex-1 min-w-37.5">
        {/* Adicionado items-center, gap-2, truncate e whitespace-nowrap */}
        <div className="flex justify-between items-center gap-2 text-xs font-semibold text-gray-500 mb-1">
          <span className="truncate">Iniciante em Lógica</span>
          <span className="whitespace-nowrap">{xpAtual} / {xpNecessario} XP</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div 
            className="bg-linear-to-r from-blue-400 to-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out" 
            style={{ width: `${porcentagem}%` }}
          ></div>
        </div>
      </div>
      
    </div>
  );
}