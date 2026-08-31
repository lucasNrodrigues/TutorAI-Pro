/* eslint-disable react-hooks/static-components */
"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  Check,
  ChevronRight,
  Eye,
  Lock,
  Moon,
  Save,
  Shield,
  Sun,
  UserRound,
  Volume2,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface ConfiguracoesProps {
  fechar: () => void;
}

type AbaConfiguracao =
  | "conta"
  | "aparencia"
  | "notificacoes"
  | "privacidade";

interface Preferencias {
  notificacoes: boolean;
  sons: boolean;
  modoEscuro: boolean;
  mostrarAtividade: boolean;
}

export default function Configuracoes({
  fechar,
}: ConfiguracoesProps) {
  const [aba, setAba] =
    useState<AbaConfiguracao>("conta");

  const [preferencias, setPreferencias] =
    useState<Preferencias>({
      notificacoes: true,
      sons: true,
      modoEscuro: false,
      mostrarAtividade: true,
    });

  const [salvando, setSalvando] = useState(false);

  /* ============================================================
     FECHAR COM ESC
  ============================================================ */

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !salvando) {
        fechar();
      }
    }

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [fechar, salvando]);

  /* ============================================================
     SALVAR
  ============================================================ */

  function salvarConfiguracoes() {
    setSalvando(true);

    try {
      /*
       * Aqui você poderá futuramente enviar
       * as preferências para o backend.
       */

      localStorage.setItem(
        "tutorai_preferencias",
        JSON.stringify(preferencias)
      );

      toast.success(
        "Configurações salvas com sucesso!"
      );
    } catch (error) {
      console.error(error);

      toast.error(
        "Não foi possível salvar as configurações."
      );
    } finally {
      setTimeout(() => {
        setSalvando(false);
      }, 400);
    }
  }

  /* ============================================================
     COMPONENTE SWITCH
  ============================================================ */

  function Switch({
    ativo,
    onChange,
  }: {
    ativo: boolean;
    onChange: () => void;
  }) {
    return (
      <button
        type="button"
        onClick={onChange}
        aria-pressed={ativo}
        className={`
          relative
          h-6
          w-11
          shrink-0
          rounded-full
          transition-colors
          duration-200
          focus:outline-none
          focus:ring-4
          focus:ring-blue-500/20
          ${
            ativo
              ? "bg-blue-600"
              : "bg-slate-300"
          }
        `}
      >
        <span
          className={`
            absolute
            top-1/2
            h-4
            w-4
            -translate-y-1/2
            rounded-full
            bg-white
            shadow-sm
            transition-transform
            duration-200
            ${
              ativo
                ? "translate-x-6"
                : "translate-x-1"
            }
          `}
        />
      </button>
    );
  }

  /* ============================================================
     ITEM DO MENU
  ============================================================ */

  function MenuItem({
    id,
    icon,
    titulo,
    descricao,
  }: {
    id: AbaConfiguracao;
    icon: React.ReactNode;
    titulo: string;
    descricao: string;
  }) {
    const ativo = aba === id;

    return (
      <button
        type="button"
        onClick={() => setAba(id)}
        className={`
          flex
          w-full
          items-center
          gap-3
          rounded-xl
          px-3
          py-3
          text-left
          transition-all
          ${
            ativo
              ? "bg-blue-50 text-blue-700"
              : "text-slate-600 hover:bg-slate-50"
          }
        `}
      >
        <div
          className={`
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-lg
            ${
              ativo
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-500"
            }
          `}
        >
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <p
            className={`
              text-sm
              font-semibold
              ${
                ativo
                  ? "text-blue-700"
                  : "text-slate-700"
              }
            `}
          >
            {titulo}
          </p>

          <p className="mt-0.5 truncate text-[11px] text-slate-400">
            {descricao}
          </p>
        </div>

        <ChevronRight
          size={16}
          className={`
            shrink-0
            ${
              ativo
                ? "text-blue-500"
                : "text-slate-300"
            }
          `}
        />
      </button>
    );
  }

  return (
    <div
      className="
        fixed
        inset-0
        z-[60]
        flex
        items-center
        justify-center
        bg-slate-950/50
        p-4
        backdrop-blur-sm
        animate-in
        fade-in
        duration-200
      "
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !salvando
        ) {
          fechar();
        }
      }}
    >
      <div
        className="
          flex
          h-[min(680px,calc(100vh-32px))]
          w-full
          max-w-4xl
          overflow-hidden
          rounded-3xl
          border
          border-slate-200
          bg-white
          shadow-2xl
          shadow-slate-950/20
          animate-in
          fade-in
          zoom-in-95
          slide-in-from-bottom-3
          duration-200
        "
      >
        {/* ======================================================
            MENU LATERAL
        ====================================================== */}

        <aside
          className="
            hidden
            w-64
            shrink-0
            border-r
            border-slate-100
            bg-slate-50/70
            md:flex
            md:flex-col
          "
        >
          {/* LOGO */}

          <div
            className="
              flex
              items-center
              gap-3
              border-b
              border-slate-100
              px-5
              py-5
            "
          >
            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-blue-600
                text-white
                shadow-lg
                shadow-blue-600/20
              "
            >
              <Shield size={20} />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-800">
                Configurações
              </p>

              <p className="text-[11px] text-slate-400">
                TutorAI Pro
              </p>
            </div>
          </div>

          {/* MENU */}

          <div className="flex-1 space-y-1 p-3">
            <p
              className="
                px-3
                pb-2
                pt-2
                text-[10px]
                font-bold
                uppercase
                tracking-wider
                text-slate-400
              "
            >
              Conta
            </p>

            <MenuItem
              id="conta"
              icon={<UserRound size={17} />}
              titulo="Minha conta"
              descricao="Informações da conta"
            />

            <p
              className="
                px-3
                pb-2
                pt-5
                text-[10px]
                font-bold
                uppercase
                tracking-wider
                text-slate-400
              "
            >
              Preferências
            </p>

            <MenuItem
              id="aparencia"
              icon={
                <Sun size={17} />
              }
              titulo="Aparência"
              descricao="Tema e visual"
            />

            <MenuItem
              id="notificacoes"
              icon={
                <Bell size={17} />
              }
              titulo="Notificações"
              descricao="Alertas e atividades"
            />

            <MenuItem
              id="privacidade"
              icon={
                <Lock size={17} />
              }
              titulo="Privacidade"
              descricao="Controle da sua conta"
            />
          </div>

          {/* RODAPÉ */}

          <div className="border-t border-slate-100 p-4">
            <div
              className="
                rounded-xl
                border
                border-blue-100
                bg-blue-50
                p-3
              "
            >
              <p className="text-xs font-semibold text-blue-700">
                TutorAI Pro
              </p>

              <p className="mt-1 text-[10px] leading-relaxed text-blue-500">
                Personalize sua experiência
                de estudos.
              </p>
            </div>
          </div>
        </aside>

        {/* ======================================================
            CONTEÚDO
        ====================================================== */}

        <div className="flex min-w-0 flex-1 flex-col">
          {/* CABEÇALHO */}

          <header
            className="
              flex
              shrink-0
              items-center
              justify-between
              border-b
              border-slate-100
              px-5
              py-4
              sm:px-6
            "
          >
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                {aba === "conta" &&
                  "Minha conta"}

                {aba === "aparencia" &&
                  "Aparência"}

                {aba === "notificacoes" &&
                  "Notificações"}

                {aba === "privacidade" &&
                  "Privacidade"}
              </h2>

              <p className="mt-0.5 text-xs text-slate-400">
                Gerencie suas preferências
              </p>
            </div>

            <button
              type="button"
              onClick={fechar}
              disabled={salvando}
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-xl
                text-slate-400
                transition-colors
                hover:bg-slate-100
                hover:text-slate-700
                disabled:opacity-50
              "
              aria-label="Fechar configurações"
            >
              <X size={20} />
            </button>
          </header>

          {/* MENU MOBILE */}

          <div
            className="
              flex
              gap-2
              overflow-x-auto
              border-b
              border-slate-100
              p-3
              md:hidden
            "
          >
            <button
              type="button"
              onClick={() => setAba("conta")}
              className={`
                flex
                shrink-0
                items-center
                gap-2
                rounded-xl
                px-3
                py-2
                text-xs
                font-semibold
                ${
                  aba === "conta"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600"
                }
              `}
            >
              <UserRound size={14} />
              Conta
            </button>

            <button
              type="button"
              onClick={() => setAba("aparencia")}
              className={`
                flex
                shrink-0
                items-center
                gap-2
                rounded-xl
                px-3
                py-2
                text-xs
                font-semibold
                ${
                  aba === "aparencia"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600"
                }
              `}
            >
              <Sun size={14} />
              Aparência
            </button>

            <button
              type="button"
              onClick={() =>
                setAba("notificacoes")
              }
              className={`
                flex
                shrink-0
                items-center
                gap-2
                rounded-xl
                px-3
                py-2
                text-xs
                font-semibold
                ${
                  aba === "notificacoes"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600"
                }
              `}
            >
              <Bell size={14} />
              Notificações
            </button>

            <button
              type="button"
              onClick={() =>
                setAba("privacidade")
              }
              className={`
                flex
                shrink-0
                items-center
                gap-2
                rounded-xl
                px-3
                py-2
                text-xs
                font-semibold
                ${
                  aba === "privacidade"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600"
                }
              `}
            >
              <Lock size={14} />
              Privacidade
            </button>
          </div>

          {/* CONTEÚDO SCROLLÁVEL */}

          <main className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
            {/* ==================================================
                CONTA
            ================================================== */}

            {aba === "conta" && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    Informações da conta
                  </h3>

                  <p className="mt-1 text-xs text-slate-400">
                    Gerencie as informações básicas
                    do seu perfil.
                  </p>
                </div>

                <div
                  className="
                    flex
                    items-center
                    gap-4
                    rounded-2xl
                    border
                    border-slate-200
                    bg-slate-50/70
                    p-4
                  "
                >
                  <div
                    className="
                      flex
                      h-12
                      w-12
                      items-center
                      justify-center
                      rounded-full
                      bg-blue-100
                      text-blue-600
                    "
                  >
                    <UserRound size={21} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-700">
                      Perfil do estudante
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Para alterar nome, foto ou
                      biografia, utilize &ldquo;Meu
                      Perfil&quot;.
                    </p>
                  </div>
                </div>

                <div
                  className="
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    p-4
                  "
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">
                        Sessão atual
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Sua conta está protegida.
                      </p>
                    </div>

                    <div
                      className="
                        flex
                        items-center
                        gap-1.5
                        rounded-full
                        bg-emerald-50
                        px-2.5
                        py-1
                        text-[10px]
                        font-bold
                        text-emerald-600
                      "
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Ativa
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ==================================================
                APARÊNCIA
            ================================================== */}

            {aba === "aparencia" && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    Aparência
                  </h3>

                  <p className="mt-1 text-xs text-slate-400">
                    Personalize como o TutorAI
                    aparece para você.
                  </p>
                </div>

                {/* TEMA */}

                <div
                  className="
                    rounded-2xl
                    border
                    border-slate-200
                    p-4
                  "
                >
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-slate-700">
                      Tema
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Escolha entre modo claro e
                      escuro.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* CLARO */}

                    <button
                      type="button"
                      onClick={() =>
                        setPreferencias(
                          (prev) => ({
                            ...prev,
                            modoEscuro: false,
                          })
                        )
                      }
                      className={`
                        rounded-xl
                        border
                        p-3
                        text-left
                        transition-all
                        ${
                          !preferencias.modoEscuro
                            ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500/10"
                            : "border-slate-200 hover:bg-slate-50"
                        }
                      `}
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-amber-500 shadow-sm">
                          <Sun size={17} />
                        </div>

                        {!preferencias.modoEscuro && (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white">
                            <Check size={12} />
                          </div>
                        )}
                      </div>

                      <p className="text-xs font-bold text-slate-700">
                        Claro
                      </p>

                      <p className="mt-1 text-[10px] text-slate-400">
                        Visual claro
                      </p>
                    </button>

                    {/* ESCURO */}

                    <button
                      type="button"
                      onClick={() =>
                        setPreferencias(
                          (prev) => ({
                            ...prev,
                            modoEscuro: true,
                          })
                        )
                      }
                      className={`
                        rounded-xl
                        border
                        p-3
                        text-left
                        transition-all
                        ${
                          preferencias.modoEscuro
                            ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500/10"
                            : "border-slate-200 hover:bg-slate-50"
                        }
                      `}
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-white shadow-sm">
                          <Moon size={17} />
                        </div>

                        {preferencias.modoEscuro && (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white">
                            <Check size={12} />
                          </div>
                        )}
                      </div>

                      <p className="text-xs font-bold text-slate-700">
                        Escuro
                      </p>

                      <p className="mt-1 text-[10px] text-slate-400">
                        Visual escuro
                      </p>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ==================================================
                NOTIFICAÇÕES
            ================================================== */}

            {aba === "notificacoes" && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    Notificações
                  </h3>

                  <p className="mt-1 text-xs text-slate-400">
                    Escolha quais avisos deseja
                    receber.
                  </p>
                </div>

                <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200">
                  {/* NOTIFICAÇÕES */}

                  <div className="flex items-center gap-4 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Bell size={18} />
                    </div>

                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-700">
                        Notificações
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Receber avisos sobre
                        atividades e estudos.
                      </p>
                    </div>

                    <Switch
                      ativo={
                        preferencias.notificacoes
                      }
                      onChange={() =>
                        setPreferencias(
                          (prev) => ({
                            ...prev,
                            notificacoes:
                              !prev.notificacoes,
                          })
                        )
                      }
                    />
                  </div>

                  {/* SONS */}

                  <div className="flex items-center gap-4 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                      <Volume2 size={18} />
                    </div>

                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-700">
                        Sons
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Reproduzir sons para
                        determinadas ações.
                      </p>
                    </div>

                    <Switch
                      ativo={preferencias.sons}
                      onChange={() =>
                        setPreferencias(
                          (prev) => ({
                            ...prev,
                            sons: !prev.sons,
                          })
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ==================================================
                PRIVACIDADE
            ================================================== */}

            {aba === "privacidade" && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    Privacidade
                  </h3>

                  <p className="mt-1 text-xs text-slate-400">
                    Controle a visibilidade das suas
                    atividades.
                  </p>
                </div>

                <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200">
                  <div className="flex items-center gap-4 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <Eye size={18} />
                    </div>

                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-700">
                        Mostrar atividade
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Permitir que sua atividade
                        acadêmica seja exibida.
                      </p>
                    </div>

                    <Switch
                      ativo={
                        preferencias.mostrarAtividade
                      }
                      onChange={() =>
                        setPreferencias(
                          (prev) => ({
                            ...prev,
                            mostrarAtividade:
                              !prev.mostrarAtividade,
                          })
                        )
                      }
                    />
                  </div>
                </div>

                <div
                  className="
                    rounded-2xl
                    border
                    border-amber-200
                    bg-amber-50
                    p-4
                  "
                >
                  <div className="flex gap-3">
                    <Shield
                      size={18}
                      className="mt-0.5 shrink-0 text-amber-600"
                    />

                    <div>
                      <p className="text-xs font-bold text-amber-800">
                        Sobre sua privacidade
                      </p>

                      <p className="mt-1 text-xs leading-relaxed text-amber-700">
                        Suas informações são
                        utilizadas para
                        personalizar sua
                        experiência no TutorAI.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>

          {/* ====================================================
              RODAPÉ
          ==================================================== */}

          <footer
            className="
              flex
              shrink-0
              items-center
              justify-end
              gap-3
              border-t
              border-slate-100
              bg-slate-50/70
              px-5
              py-4
              sm:px-6
            "
          >
            <button
              type="button"
              onClick={fechar}
              disabled={salvando}
              className="
                rounded-xl
                border
                border-slate-200
                bg-white
                px-4
                py-2.5
                text-sm
                font-semibold
                text-slate-600
                shadow-sm
                transition-colors
                hover:bg-slate-50
                disabled:opacity-50
              "
            >
              Fechar
            </button>

            <button
              type="button"
              onClick={salvarConfiguracoes}
              disabled={salvando}
              className="
                flex
                items-center
                gap-2
                rounded-xl
                bg-blue-600
                px-4
                py-2.5
                text-sm
                font-semibold
                text-white
                shadow-lg
                shadow-blue-600/20
                transition-all
                hover:bg-blue-700
                disabled:cursor-not-allowed
                disabled:bg-slate-300
                disabled:shadow-none
              "
            >
              {salvando ? (
                <>
                  <span
                    className="
                      h-4
                      w-4
                      animate-spin
                      rounded-full
                      border-2
                      border-white/30
                      border-t-white
                    "
                  />
                  Salvando...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Salvar
                </>
              )}
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
}
