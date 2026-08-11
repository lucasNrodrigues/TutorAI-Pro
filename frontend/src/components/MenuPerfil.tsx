"use client";
import { useState, useRef, useEffect } from 'react';

export default function MenuPerfil({ nome, foto_url, aoClicarEditar, aoSair }: any) {
  const [aberto, setAberto] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Truque clássico de UI: Fecha o menu se o usuário clicar fora dele
  useEffect(() => {
    function handleClickFora(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setAberto(false);
      }
    }
    document.addEventListener("mousedown", handleClickFora);
    return () => document.removeEventListener("mousedown", handleClickFora);
  }, []);

  // Mesma paleta de cores padrão do modal para manter a consistência
  const avatarPadrao = `https://ui-avatars.com/api/?name=${nome || "User"}&background=eff6ff&color=2563eb`;

  return (
    <div className="relative" ref={menuRef}>
      
      {/* Botão do Perfil */}
      <button 
        onClick={() => setAberto(!aberto)}
        className="flex items-center gap-3 p-1.5 pr-4 rounded-full transition-all border border-transparent hover:bg-white hover:border-gray-200 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 bg-gray-50"
      >
        <img 
          src={foto_url || avatarPadrao} 
          className="w-9 h-9 rounded-full object-cover border border-gray-200" 
          alt="Avatar do Usuário"
          onError={(e) => { (e.target as HTMLImageElement).src = avatarPadrao; }}
        />
        <span className="text-sm font-semibold text-gray-700 hidden sm:block">{nome}</span>
        
        {/* Ícone de setinha para baixo */}
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${aberto ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown (Menu Aberto) */}
      {aberto && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          
          <div className="px-4 py-2 border-b border-gray-100 mb-1">
            <p className="text-xs text-gray-500">Logado como</p>
            <p className="text-sm font-bold text-gray-800 truncate">{nome}</p>
          </div>

          <button 
            onClick={() => { aoClicarEditar(); setAberto(false); }}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
          >
            {/* Ícone de Utilizador */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            O Meu Perfil
          </button>
          
          <button 
            onClick={aoSair}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors mt-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sair do Sistema
          </button>
        </div>
      )}
    </div>
  );
}