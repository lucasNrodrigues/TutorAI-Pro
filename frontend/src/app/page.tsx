/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import { useState, useEffect } from "react";

import { api } from "@/services/api";

import { Menu, X } from "lucide-react";

import DashboardProgresso from "@/components/DashboardProgresso";
import ChatTutor from "@/components/ChatTutor";
import ModalPerfil from "@/components/ModalPerfil";
import MenuPerfil from "@/components/MenuPerfil";
import DashboardProfessor from "@/components/DashboardProfessor";
import BarraXP from "@/components/BarraXP";
import SidebarConversas from "@/components/SidebarConversas";
import Configuracoes from "@/components/Configuracoes";

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

  const [isLogin, setIsLogin] = useState(true);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const NOME_DO_SITE = "TutorAI Pro";

  const MENSAGEM_BOAS_VINDAS =
    "Seu parceiro de estudos inteligente, focado em lógica e raciocínio acadêmico.";

  const [modalAberto, setModalAberto] = useState(false);
  const [configuracoesAberto, setConfiguracoesAberto] = useState(false);

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [loading, setLoading] = useState(false);

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [conversaAtiva, setConversaAtiva] = useState<number | null>(null);

  const [refreshSidebar, setRefreshSidebar] = useState(0);

  const [menuMobileAberto, setMenuMobileAberto] = useState(false);

  useEffect(() => {
    const sessaoSalva = localStorage.getItem("@TutorAI:user");

    if (sessaoSalva) {
      setUsuarioLogado(JSON.parse(sessaoSalva));
    }
  }, []);

  function handleLogout() {
    setUsuarioLogado(null);
    localStorage.removeItem("@TutorAI:user");
  }

  function handleAtualizarPerfil(novosDados: any) {
    if (!usuarioLogado) return;

    const usuarioAtualizado = {
      ...usuarioLogado,
      ...novosDados,
    };

    setUsuarioLogado(usuarioAtualizado);

    localStorage.setItem(
      "@TutorAI:user",
      JSON.stringify(usuarioAtualizado)
    );
  }

  async function criarNovoChat(topicoFoco?: string) {
    try {
      const contexto = topicoFoco
        ? `Revisão focada em: ${topicoFoco} (Disciplina: ${usuarioLogado?.disciplina})`
        : usuarioLogado?.disciplina;

      const res = await api.post("/conversas/", {
        aluno_id: usuarioLogado?.aluno_id,
        contexto_disciplina: contexto,
      });

      setConversaAtiva(res.data.id);

      setRefreshSidebar((prev) => prev + 1);

      setMenuMobileAberto(false);
    } catch (error) {
      console.error("Erro ao criar novo chat", error);
    }
  }

  function handleNovaMensagem() {
    setTimeout(() => {
      setRefreshTrigger((prev) => prev + 1);
    }, 3000);
  }

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

        localStorage.setItem(
          "@TutorAI:user",
          JSON.stringify(data)
        );
      } else {
        setSucesso(
          "Cadastro realizado! Agora você pode fazer o login."
        );

        setIsLogin(true);
        setSenha("");
      }
    } catch (error: any) {
      const mensagemErro =
        error.response?.data?.detail ||
        "Ocorreu um erro na requisição.";

      setErro(mensagemErro);
    } finally {
      setLoading(false);
    }
  }

  /*
   * ============================================================
   * TELA DE LOGIN
   * ============================================================
   */

  if (!usuarioLogado) {
    return (
      <main
        className="
          min-h-screen
          bg-slate-50
          dark:bg-slate-950
          flex
          items-center
          justify-center
          p-6
          font-sans
          transition-colors
          duration-200
        "
      >
        <div
          className="
            bg-white
            dark:bg-slate-900
            p-8
            rounded-2xl
            shadow-sm
            w-full
            max-w-md
            border
            border-slate-200
            dark:border-slate-800
            transition-colors
            duration-200
          "
        >
          <div className="text-center mb-8">
            <h1
              className="
                text-4xl
                font-black
                text-blue-600
                tracking-tight
              "
            >
              {NOME_DO_SITE}
            </h1>

            <p
              className="
                text-slate-500
                dark:text-slate-400
                mt-2
                text-sm
              "
            >
              {MENSAGEM_BOAS_VINDAS}
            </p>
          </div>

          <div
            className="
              flex
              mb-6
              border-b
              border-slate-200
              dark:border-slate-800
            "
          >
            <button
              onClick={() => {
                setIsLogin(true);
                setErro("");
                setSucesso("");
              }}
              className={`
                flex-1
                pb-3
                font-semibold
                text-sm
                transition-all
                ${
                  isLogin
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                }
              `}
            >
              Acessar
            </button>

            <button
              onClick={() => {
                setIsLogin(false);
                setErro("");
                setSucesso("");
              }}
              className={`
                flex-1
                pb-3
                font-semibold
                text-sm
                transition-all
                ${
                  !isLogin
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                }
              `}
            >
              Criar Conta
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
          >
            {!isLogin && (
              <input
                type="text"
                placeholder="Seu Nome Completo"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="
                  w-full
                  border
                  border-slate-300
                  dark:border-slate-700
                  bg-white
                  dark:bg-slate-950
                  text-slate-800
                  dark:text-slate-100
                  placeholder:text-slate-400
                  dark:placeholder:text-slate-500
                  rounded-xl
                  px-4
                  py-3
                  focus:outline-none
                  focus:border-blue-500
                  focus:ring-4
                  focus:ring-blue-500/10
                  transition-all
                  text-sm
                "
                required={!isLogin}
              />
            )}

            <input
              type="email"
              placeholder="exemplo@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="
                w-full
                border
                border-slate-300
                dark:border-slate-700
                bg-white
                dark:bg-slate-950
                text-slate-800
                dark:text-slate-100
                placeholder:text-slate-400
                dark:placeholder:text-slate-500
                rounded-xl
                px-4
                py-3
                focus:outline-none
                focus:border-blue-500
                focus:ring-4
                focus:ring-blue-500/10
                transition-all
                text-sm
              "
              required
            />

            <input
              type="password"
              placeholder="Sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="
                w-full
                border
                border-slate-300
                dark:border-slate-700
                bg-white
                dark:bg-slate-950
                text-slate-800
                dark:text-slate-100
                placeholder:text-slate-400
                dark:placeholder:text-slate-500
                rounded-xl
                px-4
                py-3
                focus:outline-none
                focus:border-blue-500
                focus:ring-4
                focus:ring-blue-500/10
                transition-all
                text-sm
              "
              required
            />

            {erro && (
              <div
                className="
                  bg-red-50
                  dark:bg-red-950/40
                  text-red-600
                  dark:text-red-400
                  p-3
                  rounded-lg
                  text-sm
                  font-medium
                  border
                  border-red-100
                  dark:border-red-900/50
                "
              >
                {erro}
              </div>
            )}

            {sucesso && (
              <div
                className="
                  bg-emerald-50
                  dark:bg-emerald-950/40
                  text-emerald-600
                  dark:text-emerald-400
                  p-3
                  rounded-lg
                  text-sm
                  font-medium
                  border
                  border-emerald-100
                  dark:border-emerald-900/50
                "
              >
                {sucesso}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="
                w-full
                bg-blue-600
                text-white
                py-3.5
                mt-2
                rounded-xl
                font-bold
                hover:bg-blue-700
                disabled:bg-slate-300
                disabled:text-slate-500
                dark:disabled:bg-slate-700
                dark:disabled:text-slate-400
                transition-colors
                shadow-sm
              "
            >
              {loading
                ? "Processando..."
                : isLogin
                ? "Entrar na Plataforma"
                : "Finalizar Cadastro"}
            </button>
          </form>
        </div>
      </main>
    );
  }

  /*
   * ============================================================
   * APLICAÇÃO PRINCIPAL
   * ============================================================
   */

  return (
    <main
      className="
        min-h-screen
        bg-slate-50
        dark:bg-slate-950
        flex
        flex-col
        items-center
        py-4
        px-4
        lg:px-6
        w-full
        font-sans
        text-slate-800
        dark:text-slate-100
        transition-colors
        duration-200
      "
    >
      {/* HEADER */}

      <header
        className="
          w-full
          max-w-[1600px]
          mx-auto
          mb-5
          flex
          flex-col
          md:flex-row
          gap-4
          justify-between
          items-center
          bg-white
          dark:bg-slate-900
          px-6
          py-4
          rounded-2xl
          shadow-sm
          border
          border-slate-200
          dark:border-slate-800
          text-center
          md:text-left
          z-20
          transition-colors
          duration-200
        "
      >
        <div
          className="
            flex
            items-center
            gap-4
            w-full
            md:w-auto
            justify-between
            md:justify-start
          "
        >
          {!menuMobileAberto && (
            <button
              onClick={() => setMenuMobileAberto(true)}
              className="
                lg:hidden
                p-2
                text-slate-600
                dark:text-slate-300
                hover:bg-slate-100
                dark:hover:bg-slate-800
                rounded-xl
                transition-colors
              "
            >
              <Menu size={24} />
            </button>
          )}

          <div>
            <h1
              className="
                text-xl
                font-black
                text-slate-800
                dark:text-slate-100
                tracking-tight
              "
            >
              {NOME_DO_SITE}
            </h1>

            <p
              className="
                text-slate-500
                dark:text-slate-400
                text-xs
                font-medium
              "
            >
              {usuarioLogado.cargo === "professor"
                ? "Painel Administrativo"
                : `Disciplina: ${usuarioLogado.disciplina}`}
            </p>
          </div>
        </div>

        <div
          className="
            flex
            flex-col
            sm:flex-row
            items-center
            gap-4
            sm:gap-6
            w-full
            md:w-auto
            justify-center
            md:justify-end
            mt-2
            md:mt-0
          "
        >
          {usuarioLogado.cargo === "aluno" && (
            <div className="hidden sm:block">
              <BarraXP
                nivel={usuarioLogado.nivel}
                xpAtual={usuarioLogado.xp}
              />
            </div>
          )}

          <MenuPerfil
            nome={usuarioLogado.nome}
            foto_url={usuarioLogado.foto_url}
            aoClicarEditar={() => setModalAberto(true)}
            aoClicarConfiguracoes={() =>
              setConfiguracoesAberto(true)
            }
            aoSair={handleLogout}
          />
        </div>
      </header>

      {/* DASHBOARD PROFESSOR */}

      {usuarioLogado.cargo === "professor" ? (
        <DashboardProfessor
          emailProfessor={usuarioLogado.email}
        />
      ) : (
        /*
         * ========================================================
         * GRID PRINCIPAL
         * ========================================================
         */

        <div
          className="
            w-full
            max-w-[1600px]
            mx-auto
            grid
            grid-cols-1
            lg:grid-cols-[280px_minmax(0,1fr)_360px]
            gap-5
            h-auto
            lg:h-[calc(100vh-150px)]
            min-h-0
            relative
          "
        >
          {/* OVERLAY MOBILE */}

          {menuMobileAberto && (
            <div
              className="
                fixed
                inset-0
                bg-slate-900/50
                dark:bg-black/70
                backdrop-blur-sm
                z-40
                lg:hidden
                transition-opacity
              "
              onClick={() =>
                setMenuMobileAberto(false)
              }
            />
          )}

          {/* SIDEBAR */}

          <section
            className={`
              fixed
              inset-y-0
              left-0
              z-50
              w-75
              bg-white
              dark:bg-slate-900
              shadow-2xl
              transition-transform
              duration-300
              ease-in-out

              ${
                menuMobileAberto
                  ? "translate-x-0"
                  : "-translate-x-full"
              }

              lg:static
              lg:translate-x-0
              lg:w-full
              lg:h-full
              lg:shadow-sm
              lg:rounded-2xl
              lg:border
              lg:border-slate-200
              lg:dark:border-slate-800

              flex
              flex-col
              overflow-hidden
            `}
          >
            {/* HEADER MOBILE */}

            <div
              className="
                flex
                justify-between
                items-center
                p-4
                lg:hidden
                bg-slate-50
                dark:bg-slate-950
                border-b
                border-slate-200
                dark:border-slate-800
              "
            >
              <span
                className="
                  font-bold
                  text-slate-700
                  dark:text-slate-200
                "
              >
                Menu
              </span>

              <button
                onClick={() =>
                  setMenuMobileAberto(false)
                }
                className="
                  p-2
                  text-slate-500
                  dark:text-slate-400
                  hover:bg-slate-200
                  dark:hover:bg-slate-800
                  rounded-xl
                  transition-colors
                "
              >
                <X size={20} />
              </button>
            </div>

            {/* XP MOBILE */}

            <div
              className="
                lg:hidden
                p-4
                border-b
                border-slate-100
                dark:border-slate-800
                flex
                justify-center
              "
            >
              <BarraXP
                nivel={usuarioLogado.nivel}
                xpAtual={usuarioLogado.xp}
              />
            </div>

            {/* CONVERSAS */}

            <SidebarConversas
              alunoId={usuarioLogado.aluno_id}
              conversaAtivaId={
                conversaAtiva ||
                usuarioLogado.conversa_id
              }
              refreshTrigger={refreshSidebar}
              aoSelecionarConversa={(id: number) => {
                setConversaAtiva(id);
                setMenuMobileAberto(false);
              }}
              aoCriarNovoChat={() => {
                criarNovoChat();
                setMenuMobileAberto(false);
              }}
            />
          </section>

          {/* CHAT */}

          <section
            className="
              bg-white
              dark:bg-slate-900
              rounded-2xl
              shadow-sm
              border
              border-slate-200
              dark:border-slate-800
              flex
              flex-col
              overflow-hidden
              h-[75vh]
              lg:h-full
              min-h-0
              min-w-0
              w-full
              relative
              z-10
              transition-colors
              duration-200
            "
          >
            <ChatTutor
              conversaId={
                conversaAtiva ||
                usuarioLogado.conversa_id
              }
              onNovaAvaliacao={handleNovaMensagem}
              onPrimeiraMensagem={() =>
                setRefreshSidebar(
                  (prev) => prev + 1
                )
              }
            />
          </section>

          {/* DASHBOARD DE PROGRESSO */}

          <section
            className="
              flex
              flex-col
              w-full
              min-w-0
              min-h-0
              overflow-y-auto
              mb-6
              lg:mb-0
              lg:h-full
            "
          >
            <DashboardProgresso
              alunoId={usuarioLogado.aluno_id}
              refreshTrigger={refreshTrigger}
              onRevisarTopico={(topico) =>
                criarNovoChat(topico)
              }
            />
          </section>
        </div>
      )}

      {/* MODAL PERFIL */}

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

      {/* CONFIGURAÇÕES */}

      {configuracoesAberto && (
        <Configuracoes
          fechar={() =>
            setConfiguracoesAberto(false)
          }
        />
      )}
    </main>
  );
}