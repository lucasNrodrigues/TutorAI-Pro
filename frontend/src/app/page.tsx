"use client";

import { useState } from 'react';
import DashboardProgresso from '@/components/DashboardProgresso';
import ChatTutor from '@/components/ChatTutor';
import ModalPerfil from '@/components/ModalPerfil';
import MenuPerfil from '@/components/MenuPerfil';
import DashboardProfessor from '@/components/DashboardProfessor'; 
import BarraXP from '@/components/BarraXP';
import SidebarConversas from '@/components/SidebarConversas';

// 1. ATUALIZAMOS A INTERFACE PARA RECEBER O CARGO E EMAIL
interface Usuario {
  aluno_id: number;
  conversa_id: number;
  nome: string;
  email: string;
  cargo: string;
  disciplina: string;
  foto_url?: string;
  bio?: string; // <-- ADICIONE ISSO AQUI
  xp: number;
  nivel: number;
}

export default function Home() {
  const [usuarioLogado, setUsuarioLogado] = useState<Usuario | null>(null);
  
  // Estados do Formulário
  const [isLogin, setIsLogin] = useState(true);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const NOME_DO_SITE = "TutorAI Pro";
  const MENSAGEM_BOAS_VINDAS = "Seu parceiro de estudos inteligente, focado em lógica e raciocínio acadêmico.";
  const [modalAberto, setModalAberto] = useState(false);
  
  // Estados de UI
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Adicione este estado novo para controlar o chat atual
  const [conversaAtiva, setConversaAtiva] = useState<number | null>(null);

  // ADICIONE ESTA LINHA AQUI, JUNTO COM OS OUTROS ESTADOS:
  const [refreshSidebar, setRefreshSidebar] = useState(0);

  async function criarNovoChat() {
    try {
      const res = await fetch("http://localhost:8000/conversas/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          aluno_id: usuarioLogado?.aluno_id, 
          contexto_disciplina: usuarioLogado?.disciplina 
        })
      });
      const data = await res.json();
      setConversaAtiva(data.id); // Muda o foco para a nova conversa
    } catch (error) {
      console.error("Erro ao criar novo chat", error);
    }
  }

  function handleNovaMensagem() {
    setTimeout(() => setRefreshTrigger((prev) => prev + 1), 3000);
  }


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setSucesso("");
    setLoading(true);

    const url = isLogin ? "http://localhost:8000/login/" : "http://localhost:8000/cadastro/";
    const body = isLogin 
      ? JSON.stringify({ email, senha })
      : JSON.stringify({ nome, email, senha });

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Ocorreu um erro na requisição.");
      }

      if (isLogin) {
        setUsuarioLogado(data);
      } else {
        setSucesso("Cadastro realizado! Agora você pode fazer o login.");
        setIsLogin(true);
        setSenha("");
      }
    } catch (error: any) {
      setErro(error.message);
    } finally {
      setLoading(false);
    }
  }

  // TELA DE LOGIN / CADASTRO
  if (!usuarioLogado) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md border border-gray-100">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-blue-600">{NOME_DO_SITE}</h1>
            <p className="text-gray-600 mt-2">{MENSAGEM_BOAS_VINDAS}</p>
          </div>
          
          <div className="flex mb-6 border-b border-gray-200">
            <button 
              onClick={() => { setIsLogin(true); setErro(""); setSucesso(""); }}
              className={`flex-1 pb-2 font-medium ${isLogin ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400'}`}
            >
              Entrar
            </button>
            <button 
              onClick={() => { setIsLogin(false); setErro(""); setSucesso(""); }}
              className={`flex-1 pb-2 font-medium ${!isLogin ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400'}`}
            >
              Cadastrar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {!isLogin && (
              <input 
                type="text"
                placeholder="Seu Nome Completo"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 text-black focus:outline-none focus:border-blue-500"
                required={!isLogin}
              />
            )}
            <input 
              type="email"
              placeholder="exemplo@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 text-black focus:outline-none focus:border-blue-500"
              required
            />
            <input 
              type="password"
              placeholder="Sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 text-black focus:outline-none focus:border-blue-500"
              required
            />
            
            {erro && <span className="text-red-500 text-sm font-medium">{erro}</span>}
            {sucesso && <span className="text-green-600 text-sm font-medium">{sucesso}</span>}
            
            <button 
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white py-2 mt-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "Aguarde..." : (isLogin ? "Acessar Dashboard" : "Criar Conta")}
            </button>
          </form>
        </div>
      </main>
    );
  }

 // TELA PRINCIPAL LOGADO
  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center py-4 sm:py-8 px-2 sm:px-4 lg:px-8 overflow-x-hidden w-full">
      
      {/* Cabeçalho Organizado Responsivo (SaaS Style) */}
      <header className="w-full max-w-360 mb-8 flex flex-col md:flex-row gap-6 justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center md:text-left">
        
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{NOME_DO_SITE}</h1>
          <p className="text-gray-500 text-sm">
            {usuarioLogado.cargo === "professor" ? "Painel Administrativo" : `Disciplina ativa: ${usuarioLogado.disciplina}`}
          </p>
          {/* Mostra a bio do utilizador no painel principal! */}
          {usuarioLogado.bio && (
            <p className="text-gray-400 text-xs mt-1 italic">"{usuarioLogado.bio}"</p>
          )}
        </div>
  
        {/* Container da Direita: Empilha no celular (sm), alinha lado a lado no PC */}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full md:w-auto justify-center md:justify-end">
          {/* A mágica visual acontece aqui */}
          {usuarioLogado.cargo === "aluno" && (
            <BarraXP nivel={usuarioLogado.nivel} xpAtual={usuarioLogado.xp} />
          )}
          
          <MenuPerfil 
            nome={usuarioLogado.nome}
            foto_url={usuarioLogado.foto_url}
            aoClicarEditar={() => setModalAberto(true)}
            aoSair={() => setUsuarioLogado(null)}
          />
        </div>
      </header>
      
     {/* 2. ROTEAMENTO CONDICIONAL (O CORAÇÃO DA FASE 2) */}
      {usuarioLogado.cargo === "professor" ? (
        
        // Se for professor, mostra o painel administrativo
        <DashboardProfessor emailProfessor={usuarioLogado.email} />
        
      ) : (
        
        // Se for aluno, mostra o Novo Layout com 3 Colunas!
        <div className="w-full max-w-360 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 flex-1 min-h-0">
          
          {/* Coluna 1: O Menu Lateral (Ocupa 3 de 12 colunas no desktop) */}
          <section className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 w-full min-w-0 flex flex-col h-100 lg:h-auto overflow-hidden">
            <SidebarConversas 
              alunoId={usuarioLogado.aluno_id}
              conversaAtivaId={conversaAtiva || usuarioLogado.conversa_id}
              refreshTrigger={refreshSidebar}
              aoSelecionarConversa={(id: number) => setConversaAtiva(id)}
              aoCriarNovoChat={criarNovoChat}
            />
          </section>

          {/* Coluna 2: O Chat Tutor (Ocupa 5 de 12 colunas no desktop) */}
          <section className="lg:col-span-5 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col min-h-125 lg:min-h-0 w-full min-w-0">
            <ChatTutor 
              conversaId={conversaAtiva || usuarioLogado.conversa_id} 
              onNovaAvaliacao={handleNovaMensagem} 
              onPrimeiraMensagem={() => setRefreshSidebar(prev => prev + 1)} 
            />
          </section>

          {/* Coluna 3: O Dashboard (Ocupa 4 de 12 colunas no desktop) */}
          <section className="lg:col-span-4 flex flex-col gap-6 w-full min-w-0 overflow-y-auto">
            <DashboardProgresso 
              alunoId={usuarioLogado.aluno_id} 
              refreshTrigger={refreshTrigger} 
            />
          </section>

        </div>
        
      )}

      {/* Modal de Edição de Perfil */}
      {modalAberto && (
        <ModalPerfil 
          nomeAtual={usuarioLogado.nome} 
          fotoAtual={usuarioLogado.foto_url} // <- Passando a foto para o modal
          bioAtual={usuarioLogado.bio}       // <- Passando a bio para o modal
          alunoId={usuarioLogado.aluno_id}
          fechar={() => setModalAberto(false)}
          aoSalvar={(novosDados: any) => setUsuarioLogado({...usuarioLogado, ...novosDados})} // <- Atualiza nome, bio e foto de uma vez!
        />
      )}
    </main>
  );
}