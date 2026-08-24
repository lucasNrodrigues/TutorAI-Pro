"use client";

import { useState, useEffect } from 'react';
import { api } from '@/services/api'; // <--- Importando a nossa API configurada

import DashboardProgresso from '@/components/DashboardProgresso';
import ChatTutor from '@/components/ChatTutor';
import ModalPerfil from '@/components/ModalPerfil';
import MenuPerfil from '@/components/MenuPerfil';
import DashboardProfessor from '@/components/DashboardProfessor'; 
import BarraXP from '@/components/BarraXP';
import SidebarConversas from '@/components/SidebarConversas';

interface Usuario {
  aluno_id: number;
  conversa_id: number;
  nome: string;
  email: string;
  cargo: string;
  disciplina: string;
  foto_url?: string;
  bio?: string;
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

  const [conversaAtiva, setConversaAtiva] = useState<number | null>(null);
  const [refreshSidebar, setRefreshSidebar] = useState(0);

  // 1. RECUPERA A SESSÃO SALVA AO ABRIR O SITE
  useEffect(() => {
    const sessaoSalva = localStorage.getItem('@TutorAI:user');
    if (sessaoSalva) {
      setUsuarioLogado(JSON.parse(sessaoSalva));
    }
  }, []);

  // 2. FUNÇÃO CENTRALIZADA DE LOGOUT
  function handleLogout() {
    setUsuarioLogado(null);
    localStorage.removeItem('@TutorAI:user');
  }

  // 3. FUNÇÃO CENTRALIZADA PARA ATUALIZAR PERFIL E SESSÃO
  function handleAtualizarPerfil(novosDados: any) {
    if (!usuarioLogado) return;
    const usuarioAtualizado = { ...usuarioLogado, ...novosDados };
    setUsuarioLogado(usuarioAtualizado);
    localStorage.setItem('@TutorAI:user', JSON.stringify(usuarioAtualizado));
  }

  // 4. REFATORAÇÃO: USANDO AXIOS PARA CRIAR CHAT
  async function criarNovoChat() {
    try {
      const res = await api.post("/conversas/", {
        aluno_id: usuarioLogado?.aluno_id, 
        contexto_disciplina: usuarioLogado?.disciplina 
      });
      setConversaAtiva(res.data.id);
    } catch (error) {
      console.error("Erro ao criar novo chat", error);
    }
  }

  function handleNovaMensagem() {
    setTimeout(() => setRefreshTrigger((prev) => prev + 1), 3000);
  }

  // 5. REFATORAÇÃO: USANDO AXIOS NO LOGIN/CADASTRO E SALVANDO SESSÃO
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setSucesso("");
    setLoading(true);

    const url = isLogin ? "/login/" : "/cadastro/";
    const body = isLogin 
      ? { email, senha }
      : { nome, email, senha };

    try {
      const res = await api.post(url, body);
      const data = res.data;

      if (isLogin) {
        setUsuarioLogado(data);
        localStorage.setItem('@TutorAI:user', JSON.stringify(data)); // Salva no navegador!
      } else {
        setSucesso("Cadastro realizado! Agora você pode fazer o login.");
        setIsLogin(true);
        setSenha("");
      }
    } catch (error: any) {
      // O Axios guarda a resposta de erro do servidor dentro de error.response.data
      const mensagemErro = error.response?.data?.detail || "Ocorreu um erro na requisição.";
      setErro(mensagemErro);
    } finally {
      setLoading(false);
    }
  }

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

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center py-4 sm:py-8 px-2 sm:px-4 lg:px-8 overflow-x-hidden w-full">
      
      <header className="w-full max-w-360 mb-8 flex flex-col md:flex-row gap-6 justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center md:text-left">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{NOME_DO_SITE}</h1>
          <p className="text-gray-500 text-sm">
            {usuarioLogado.cargo === "professor" ? "Painel Administrativo" : `Disciplina ativa: ${usuarioLogado.disciplina}`}
          </p>
          {usuarioLogado.bio && (
            <p className="text-gray-400 text-xs mt-1 italic">"{usuarioLogado.bio}"</p>
          )}
        </div>
  
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full md:w-auto justify-center md:justify-end">
          {usuarioLogado.cargo === "aluno" && (
            <BarraXP nivel={usuarioLogado.nivel} xpAtual={usuarioLogado.xp} />
          )}
          
          <MenuPerfil 
            nome={usuarioLogado.nome}
            foto_url={usuarioLogado.foto_url}
            aoClicarEditar={() => setModalAberto(true)}
            aoSair={handleLogout} // <--- Passando a função de logout com limpeza de cache
          />
        </div>
      </header>
      
      {usuarioLogado.cargo === "professor" ? (
        <DashboardProfessor emailProfessor={usuarioLogado.email} />
      ) : (
        <div className="w-full max-w-360 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 flex-1 min-h-0">
          <section className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 w-full min-w-0 flex flex-col h-100 lg:h-auto overflow-hidden">
            <SidebarConversas 
              alunoId={usuarioLogado.aluno_id}
              conversaAtivaId={conversaAtiva || usuarioLogado.conversa_id}
              refreshTrigger={refreshSidebar}
              aoSelecionarConversa={(id: number) => setConversaAtiva(id)}
              aoCriarNovoChat={criarNovoChat}
            />
          </section>

          <section className="lg:col-span-5 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden min-h-125 lg:min-h-0 w-full min-w-0">
            <ChatTutor 
              conversaId={conversaAtiva || usuarioLogado.conversa_id} 
              onNovaAvaliacao={handleNovaMensagem} 
              onPrimeiraMensagem={() => setRefreshSidebar(prev => prev + 1)} 
            />
          </section>

          <section className="lg:col-span-4 flex flex-col gap-6 w-full min-w-0 overflow-y-auto">
            <DashboardProgresso 
              alunoId={usuarioLogado.aluno_id} 
              refreshTrigger={refreshTrigger} 
            />
          </section>
        </div>
      )}

      {modalAberto && (
        <ModalPerfil 
          nomeAtual={usuarioLogado.nome} 
          fotoAtual={usuarioLogado.foto_url} 
          bioAtual={usuarioLogado.bio}      
          alunoId={usuarioLogado.aluno_id}
          fechar={() => setModalAberto(false)}
          aoSalvar={handleAtualizarPerfil} // <--- Passando a função que atualiza estado e localStorage
        />
      )}
    </main>
  );
}