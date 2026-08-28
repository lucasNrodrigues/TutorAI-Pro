"use client";
import { useEffect, useState } from 'react';
import { Plus, MessageSquare, History } from 'lucide-react'; // <-- Importando ícones modernos

export default function SidebarConversas({ alunoId, conversaAtivaId, refreshTrigger, aoSelecionarConversa, aoCriarNovoChat }: any) {
  const [conversas, setConversas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`https://tutorai-backend-km0b.onrender.com/alunos/${alunoId}/conversas?t=${Date.now()}`, {
      cache: 'no-store' 
    })
      .then(res => res.json())
      .then(data => {
        setConversas(data);
        setLoading(false);
      })
      .catch(err => console.error("Erro ao carregar conversas:", err));
  }, [alunoId, conversaAtivaId, refreshTrigger]); 

  return (
    // Coloquei um padding interno p-5 para desgrudar das bordas
    <div className="w-full flex flex-col h-full bg-white p-5 font-sans">
      
      {/* Botão de Ação Primária (Sólido e Moderno) */}
      <button 
        onClick={aoCriarNovoChat}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 py-3 rounded-xl font-semibold transition-all mb-6 shadow-sm"
      >
        <Plus size={18} strokeWidth={2.5} />
        Novo Chat
      </button>

      {/* Título da Seção com Ícone */}
      <div className="flex items-center gap-2 mb-4 px-1">
        <History size={16} className="text-slate-400" />
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Histórico de Estudos</h3>
      </div>
      
      {/* Lista de Conversas com espaçamento suave */}
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
        {loading ? (
          <div className="flex justify-center py-6">
             <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : conversas.length === 0 ? (
          <p className="text-sm text-slate-400 text-center mt-4">Nenhuma sessão salva.</p>
        ) : (
          conversas.map((chat) => (
            <button
              key={chat.id}
              onClick={() => aoSelecionarConversa(chat.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-all border ${
                conversaAtivaId === chat.id 
                  ? "bg-blue-50 text-blue-700 border-blue-200 shadow-sm font-medium" 
                  : "bg-transparent text-slate-600 border-transparent hover:bg-slate-50"
              }`}
            >
              <MessageSquare 
                size={16} 
                className={conversaAtivaId === chat.id ? "text-blue-600 shrink-0" : "text-slate-400 shrink-0"} 
              />
              <span className="truncate text-left flex-1">
                {chat.contexto_disciplina || `Sessão #${chat.id}`}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}