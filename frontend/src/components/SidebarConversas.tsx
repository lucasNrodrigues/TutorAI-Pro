"use client";
import { useEffect, useState } from 'react';

export default function SidebarConversas({ alunoId, conversaAtivaId, refreshTrigger, aoSelecionarConversa, aoCriarNovoChat }: any) {
  const [conversas, setConversas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Busca a lista de chats assim que o menu carrega
 useEffect(() => {
    // O "?t=" com o tempo atual garante que a URL é sempre única, destruindo o cache do navegador
    fetch(`http://localhost:8000/alunos/${alunoId}/conversas?t=${Date.now()}`, {
      cache: 'no-store' // Força o Next.js a fazer um pedido real ao servidor
    })
      .then(res => res.json())
      .then(data => {
        setConversas(data);
        setLoading(false);
      })
      .catch(err => console.error("Erro ao carregar conversas:", err));
  }, [alunoId, conversaAtivaId, refreshTrigger]); // <-- Garante que o refreshTrigger está aqui!
  return (
    <div className="w-full flex flex-col h-full bg-white">
      
      {/* Botão de Novo Chat */}
      <button 
        onClick={aoCriarNovoChat}
        className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 py-3 rounded-xl font-semibold transition-colors mb-6 shadow-sm"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
        Novo Chat
      </button>

      {/* Lista de Histórico */}
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">Histórico de Estudos</h3>
      
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {loading ? (
          <p className="text-sm text-gray-400 text-center mt-4">Carregando...</p>
        ) : (
          conversas.map((chat) => (
            <button
              key={chat.id}
              onClick={() => aoSelecionarConversa(chat.id)}
              className={`w-full text-left px-3 py-3 rounded-lg text-sm truncate transition-colors border ${
                conversaAtivaId === chat.id 
                  ? "bg-blue-600 text-white border-blue-600 shadow-md" 
                  : "bg-gray-50 text-gray-700 border-transparent hover:bg-gray-100"
              }`}
            >
              <span className="block truncate font-medium">
                {chat.contexto_disciplina || `Sessão #${chat.id}`}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}