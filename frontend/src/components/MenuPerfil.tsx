"use client";

import { useEffect, useRef, useState } from "react";
import {
  User,
  Settings,
  LogOut,
  ChevronDown,
  ShieldCheck,
} from "lucide-react";

interface MenuPerfilProps {
  nome?: string;
  foto_url?: string;
  aoClicarEditar: () => void;
  aoClicarConfiguracoes: () => void;
  aoSair: () => void;
}

export default function MenuPerfil({
  nome,
  foto_url,
  aoClicarEditar,
  aoClicarConfiguracoes,
  aoSair,
}: MenuPerfilProps) {
  const [aberto, setAberto] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  const nomeUsuario = nome?.trim() || "Usuário";

  /**
   * Avatar padrão usando as iniciais/nome do usuário.
   */
  const avatarPadrao = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    nomeUsuario
  )}&background=eff6ff&color=2563eb&size=128&bold=true`;

  /**
   * Fecha o menu quando o usuário clica fora.
   */
  useEffect(() => {
    function handleClickFora(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setAberto(false);
      }
    }

    document.addEventListener("mousedown", handleClickFora);

    return () => {
      document.removeEventListener("mousedown", handleClickFora);
    };
  }, []);

  /**
   * Fecha o menu com ESC.
   */
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setAberto(false);
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  /**
   * Abre/fecha o menu.
   */
  function alternarMenu() {
    setAberto((prev) => !prev);
  }

  /**
   * Abre o perfil.
   */
  function abrirPerfil() {
    setAberto(false);
    aoClicarEditar();
  }

  /**
   * Abre configurações.
   */
  function abrirConfiguracoes() {
    setAberto(false);
    aoClicarConfiguracoes();
  }

  /**
   * Sai do sistema.
   */
  function sair() {
    setAberto(false);
    aoSair();
  }

  return (
    <div
      ref={menuRef}
      className="relative"
    >
      {/* ============================================================
          BOTÃO DO USUÁRIO
      ============================================================ */}

      <button
        type="button"
        onClick={alternarMenu}
        aria-expanded={aberto}
        aria-haspopup="menu"
        className="
          group
          flex
          items-center
          gap-2.5
          sm:gap-3
          p-1.5
          pr-2.5
          sm:pr-3.5
          rounded-full
          bg-slate-50
          border
          border-slate-200
          hover:bg-white
          hover:border-slate-300
          hover:shadow-sm
          focus:outline-none
          focus:ring-2
          focus:ring-blue-500/30
          transition-all
          duration-200
        "
      >
        {/* Avatar */}

        <div className="relative shrink-0">
          <img
            src={foto_url || avatarPadrao}
            alt={`Avatar de ${nomeUsuario}`}
            className="
              w-9
              h-9
              sm:w-10
              sm:h-10
              rounded-full
              object-cover
              border-2
              border-white
              shadow-sm
              bg-slate-100
            "
            onError={(event) => {
              const img = event.currentTarget;

              if (img.src !== avatarPadrao) {
                img.src = avatarPadrao;
              }
            }}
          />

          {/* Status online */}

          <span
            className="
              absolute
              right-0
              bottom-0
              w-2.5
              h-2.5
              rounded-full
              bg-emerald-500
              border-2
              border-white
            "
          />
        </div>

        {/* Nome */}

        <div className="hidden sm:flex flex-col items-start min-w-0 max-w-[150px]">
          <span
            className="
              text-sm
              font-semibold
              text-slate-700
              truncate
              w-full
              text-left
            "
          >
            {nomeUsuario}
          </span>

          <span className="text-[11px] text-slate-400 leading-tight">
            Minha conta
          </span>
        </div>

        {/* Seta */}

        <ChevronDown
          size={16}
          className={`
            shrink-0
            text-slate-400
            transition-transform
            duration-200
            ${aberto ? "rotate-180 text-blue-500" : ""}
          `}
        />
      </button>

      {/* ============================================================
          DROPDOWN
      ============================================================ */}

      {aberto && (
        <div
          role="menu"
          className="
            absolute
            right-0
            top-full
            mt-2.5
            w-[280px]
            max-w-[calc(100vw-24px)]
            bg-white
            border
            border-slate-200
            rounded-2xl
            shadow-xl
            shadow-slate-900/10
            overflow-hidden
            z-[100]
            animate-in
            fade-in
            slide-in-from-top-2
            duration-200
          "
        >
          {/* ========================================================
              CABEÇALHO DO MENU
          ======================================================== */}

          <div
            className="
              px-4
              py-4
              bg-gradient-to-br
              from-blue-50
              via-white
              to-white
              border-b
              border-slate-100
            "
          >
            <div className="flex items-center gap-3">
              {/* Avatar maior */}

              <img
                src={foto_url || avatarPadrao}
                alt={`Avatar de ${nomeUsuario}`}
                className="
                  w-12
                  h-12
                  rounded-full
                  object-cover
                  border-2
                  border-white
                  shadow-sm
                  bg-slate-100
                "
                onError={(event) => {
                  const img = event.currentTarget;

                  if (img.src !== avatarPadrao) {
                    img.src = avatarPadrao;
                  }
                }}
              />

              {/* Informações */}

              <div className="min-w-0 flex-1">
                <p
                  className="
                    text-sm
                    font-bold
                    text-slate-800
                    truncate
                  "
                >
                  {nomeUsuario}
                </p>

                <div className="flex items-center gap-1.5 mt-1">
                  <span
                    className="
                      w-1.5
                      h-1.5
                      rounded-full
                      bg-emerald-500
                    "
                  />

                  <span className="text-xs text-slate-500">
                    Conta ativa
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================
              OPÇÕES
          ======================================================== */}

          <div className="p-2">
            {/* Meu Perfil */}

            <button
              type="button"
              role="menuitem"
              onClick={abrirPerfil}
              className="
                w-full
                flex
                items-center
                gap-3
                px-3
                py-3
                rounded-xl
                text-left
                text-slate-700
                hover:bg-blue-50
                hover:text-blue-700
                transition-colors
                duration-150
                group
              "
            >
              <span
                className="
                  flex
                  items-center
                  justify-center
                  w-9
                  h-9
                  rounded-lg
                  bg-slate-100
                  text-slate-500
                  group-hover:bg-blue-100
                  group-hover:text-blue-600
                  transition-colors
                "
              >
                <User size={18} />
              </span>

              <span className="flex-1 min-w-0">
                <span className="block text-sm font-semibold">
                  O Meu Perfil
                </span>

                <span className="block text-xs text-slate-400 mt-0.5">
                  Edite suas informações pessoais
                </span>
              </span>
            </button>

            {/* Configurações */}

            <button
              type="button"
              role="menuitem"
              onClick={abrirConfiguracoes}
              className="
                w-full
                flex
                items-center
                gap-3
                px-3
                py-3
                rounded-xl
                text-left
                text-slate-700
                hover:bg-slate-50
                hover:text-slate-900
                transition-colors
                duration-150
                group
              "
            >
              <span
                className="
                  flex
                  items-center
                  justify-center
                  w-9
                  h-9
                  rounded-lg
                  bg-slate-100
                  text-slate-500
                  group-hover:bg-slate-200
                  group-hover:text-slate-700
                  transition-colors
                "
              >
                <Settings
                  size={18}
                  className="group-hover:rotate-45 transition-transform duration-300"
                />
              </span>

              <span className="flex-1 min-w-0">
                <span className="block text-sm font-semibold">
                  Configurações
                </span>

                <span className="block text-xs text-slate-400 mt-0.5">
                  Preferências da conta
                </span>
              </span>
            </button>

            {/* Segurança */}

            <div
              className="
                flex
                items-center
                gap-3
                px-3
                py-3
                rounded-xl
                text-slate-500
              "
            >
              <span
                className="
                  flex
                  items-center
                  justify-center
                  w-9
                  h-9
                  rounded-lg
                  bg-emerald-50
                  text-emerald-600
                "
              >
                <ShieldCheck size={18} />
              </span>

              <span className="flex-1 min-w-0">
                <span className="block text-sm font-medium text-slate-600">
                  Conta protegida
                </span>

                <span className="block text-xs text-slate-400 mt-0.5">
                  Seus dados estão seguros
                </span>
              </span>
            </div>
          </div>

          {/* ========================================================
              SAIR
          ======================================================== */}

          <div className="border-t border-slate-100 p-2">
            <button
              type="button"
              role="menuitem"
              onClick={sair}
              className="
                w-full
                flex
                items-center
                gap-3
                px-3
                py-3
                rounded-xl
                text-left
                text-red-600
                hover:bg-red-50
                transition-colors
                duration-150
                group
              "
            >
              <span
                className="
                  flex
                  items-center
                  justify-center
                  w-9
                  h-9
                  rounded-lg
                  bg-red-50
                  text-red-500
                  group-hover:bg-red-100
                  transition-colors
                "
              >
                <LogOut size={18} />
              </span>

              <span className="flex-1">
                <span className="block text-sm font-semibold">
                  Sair do Sistema
                </span>

                <span className="block text-xs text-red-400 mt-0.5">
                  Encerrar sua sessão
                </span>
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}