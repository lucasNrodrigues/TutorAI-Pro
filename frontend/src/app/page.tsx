"use client";

import { useState, useEffect } from 'react';
import { api } from '@/services/api'; // <--- Importando a nossa API configurada

import { Menu, X } from 'lucide-react';

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

  const [menuMobileAberto, setMenuMobileAberto] = useState(false);

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
  // Modifique a função existente para esta:
  async function criarNovoChat(topicoFoco?: string) {
    try {
      // Se clicou no botão revisar, cria um contexto focado. Se não, usa a disciplina normal.
      const contexto = topicoFoco 
        ? `Revisão focada em: ${topicoFoco} (Disciplina: ${usuarioLogado?.disciplina})` 
        : usuarioLogado?.disciplina;

      const res = await api.post("/conversas/", {
        aluno_id: usuarioLogado?.aluno_id, 
        contexto_disciplina: contexto 
      });
      
      setConversaAtiva(res.data.id);
      setRefreshSidebar(prev => prev + 1); // Força a sidebar lateral a atualizar para mostrar o novo chat
      setMenuMobileAberto(false); // Se estiver no celular, fecha o menu automaticamente
      
    } catch (error) {
      console.error("Erro ao criar novo chat de revisão", error);
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
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
        <div className="bg-white p-8 rounded-2xl shadow-sm w-full max-w-md border border-slate-200">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black text-blue-600 tracking-tight">{NOME_DO_SITE}</h1>
            <p className="text-slate-500 mt-2 text-sm">{MENSAGEM_BOAS_VINDAS}</p>
          </div>
          
          <div className="flex mb-6 border-b border-slate-200">
            <button 
              onClick={() => { setIsLogin(true); setErro(""); setSucesso(""); }}
              className={`flex-1 pb-3 font-semibold text-sm transition-all ${isLogin ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Acessar
            </button>
            <button 
              onClick={() => { setIsLogin(false); setErro(""); setSucesso(""); }}
              className={`flex-1 pb-3 font-semibold text-sm transition-all ${!isLogin ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Criar Conta
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {!isLogin && (
              <input 
                type="text"
                placeholder="Seu Nome Completo"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm"
                required={!isLogin}
              />
            )}
            <input 
              type="email"
              placeholder="exemplo@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm"
              required
            />
            <input 
              type="password"
              placeholder="Sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm"
              required
            />
            
            {erro && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium border border-red-100">{erro}</div>}
            {sucesso && <div className="bg-emerald-50 text-emerald-600 p-3 rounded-lg text-sm font-medium border border-emerald-100">{sucesso}</div>}
            
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3.5 mt-2 rounded-xl font-bold hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500 transition-colors shadow-sm"
            >
              {loading ? "Processando..." : (isLogin ? "Entrar na Plataforma" : "Finalizar Cadastro")}
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center py-4 sm:py-6 px-3 sm:px-4 lg:px-8 overflow-x-hidden w-full font-sans">
      
      <header className="w-full max-w-[1400px] mb-6 flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-slate-200 text-center md:text-left z-20">
        
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
          {/* Botão Hambúrguer (Apenas Mobile) */}
          {!menuMobileAberto && (
            <button 
              onClick={() => setMenuMobileAberto(true)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <Menu size={24} />
            </button>
          )}

          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">{NOME_DO_SITE}</h1>
            <p className="text-slate-500 text-xs font-medium">
              {usuarioLogado.cargo === "professor" ? "Painel Administrativo" : `Disciplina: ${usuarioLogado.disciplina}`}
            </p>
          </div>
        </div>
  
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full md:w-auto justify-center md:justify-end mt-4 md:mt-0">
          {usuarioLogado.cargo === "aluno" && (
            <div className="hidden sm:block">
              <BarraXP nivel={usuarioLogado.nivel} xpAtual={usuarioLogado.xp} />
            </div>
          )}
          
          <MenuPerfil 
            nome={usuarioLogado.nome}
            foto_url={usuarioLogado.foto_url}
            aoClicarEditar={() => setModalAberto(true)}
            aoSair={handleLogout} 
          />
        </div>
      </header>
      
      {usuarioLogado.cargo === "professor" ? (
        <DashboardProfessor emailProfessor={usuarioLogado.email} />
      ) : (
        <div className="w-full max-w-[1400px] grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 h-[calc(100dvh-150px)] relative">
          
          {/* Overlay escuro para Mobile (fecha o menu ao clicar fora) */}
          {menuMobileAberto && (
            <div 
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
              onClick={() => setMenuMobileAberto(false)}
            />
          )}

          {/* Sidebar Conversas (Deslizante no Mobile, Fixa no Desktop) */}
          <section className={`
            fixed inset-y-0 left-0 z-50 w-[280px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out 
            lg:relative lg:w-full lg:col-span-3 lg:shadow-sm lg:transform-none lg:flex lg:rounded-2xl lg:border border-slate-200
            ${menuMobileAberto ? "translate-x-0" : "-translate-x-full"}
            flex flex-col h-full overflow-hidden
          `}>
            {/* Cabeçalho Mobile da Sidebar com botão de fechar */}
            <div className="flex justify-between items-center p-4 lg:hidden bg-slate-50 border-b border-slate-200">
              <span className="font-bold text-slate-700">Menu</span>
              <button 
                onClick={() => setMenuMobileAberto(false)}
                className="p-2 text-slate-500 hover:bg-slate-200 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Barra XP extra para mobile (já que escondemos a do cabeçalho em telas pequenas) */}
            <div className="lg:hidden p-4 border-b border-slate-100">
              <BarraXP nivel={usuarioLogado.nivel} xpAtual={usuarioLogado.xp} />
            </div>

            <SidebarConversas 
              alunoId={usuarioLogado.aluno_id}
              conversaAtivaId={conversaAtiva || usuarioLogado.conversa_id}
              refreshTrigger={refreshSidebar}
              aoSelecionarConversa={(id: number) => {
                setConversaAtiva(id);
                setMenuMobileAberto(false); // Fecha o menu ao escolher chat
              }}
              aoCriarNovoChat={() => {
                criarNovoChat();
                setMenuMobileAberto(false); // Fecha o menu ao criar chat
              }}
            />
          </section>

          {/* Área do Chat (Colspan 5 para dar espaço pro Dashboard) */}
          <section className="lg:col-span-5 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden min-h-[500px] lg:min-h-0 w-full relative z-10">
            <ChatTutor 
              conversaId={conversaAtiva || usuarioLogado.conversa_id} 
              onNovaAvaliacao={handleNovaMensagem} 
              onPrimeiraMensagem={() => setRefreshSidebar(prev => prev + 1)} 
            />
          </section>

          {/* Dashboard de Progresso */}
          <section className="lg:col-span-4 flex flex-col w-full min-w-0 overflow-y-auto mb-6 lg:mb-0">
            <DashboardProgresso 
              alunoId={usuarioLogado.aluno_id} 
              refreshTrigger={refreshTrigger} 
              // 👇 A MÁGICA ACONTECE AQUI:
              onRevisarTopico={(topico) => criarNovoChat(topico)}
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
          aoSalvar={handleAtualizarPerfil}
        />
      )}
    </main>
  );
}