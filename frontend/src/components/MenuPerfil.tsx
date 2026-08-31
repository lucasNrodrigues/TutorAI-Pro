"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  LogOut,
  UserRound,
  Settings,
  ShieldCheck,
} from "lucide-react";

interface MenuPerfilProps {
  nome?: string;
  foto_url?: string;
  aoClicarEditar: () => void;
  aoSair: () => void;
}

export default function MenuPerfil({
  nome,
  foto_url,
  aoClicarEditar,
  aoSair,
}: MenuPerfilProps) {
  const [aberto, setAberto] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  const nomeUsuario = nome?.trim() || "Usuário";

  const avatarPadrao = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    nomeUsuario
  )}&background=eff6ff&color=2563eb&size=128&bold=true`;

  useEffect(() => {
    function handleClickFora(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setAberto(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setAberto(false);
      }
    }

    document.addEventListener("mousedown", handleClickFora);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickFora);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function handleEditar() {
    setAberto(false);
    aoClicarEditar();
  }

  function handleSair() {
    setAberto(false);
    aoSair();
  }

  return (
    <div ref={menuRef} className="relative">
      {/* BOTÃO DO PERFIL */}

      <button
        type="button"
        onClick={() => setAberto((prev) => !prev)}
        aria-expanded={aberto}
        aria-haspopup="menu"
        className="
          group
          flex
          items-center
          gap-2.5
          rounded-full
          border
          border-slate-200
          bg-white
          p-1.5
          pr-3
          shadow-sm
          transition-all
          duration-200
          hover:border-slate-300
          hover:shadow-md
          focus:outline-none
          focus:ring-2
          focus:ring-blue-500/30
        "
      >
        <div className="relative">
          <img
            src={foto_url || avatarPadrao}
            alt={`Avatar de ${nomeUsuario}`}
            className="
              h-9
              w-9
              rounded-full
              border-2
              border-white
              bg-slate-100
              object-cover
              shadow-sm
            "
            onError={(event) => {
              event.currentTarget.src = avatarPadrao;
            }}
          />

          {/* STATUS ONLINE */}

          <span
            className="
              absolute
              bottom-0
              right-0
              h-2.5
              w-2.5
              rounded-full
              border-2
              border-white
              bg-emerald-500
            "
          />
        </div>

        <div className="hidden min-w-0 text-left sm:block">
          <p className="max-w-[130px] truncate text-sm font-semibold text-slate-700">
            {nomeUsuario}
          </p>

          <p className="text-[11px] font-medium text-slate-400">
            Estudante
          </p>
        </div>

        <ChevronDown
          size={16}
          className={`
            text-slate-400
            transition-transform
            duration-200
            ${aberto ? "rotate-180" : ""}
          `}
        />
      </button>

      {/* DROPDOWN */}

      {aberto && (
        <div
          role="menu"
          className="
            absolute
            right-0
            z-50
            mt-2.5
            w-72
            origin-top-right
            overflow-hidden
            rounded-2xl
            border
            border-slate-200
            bg-white
            shadow-xl
            shadow-slate-900/10
            animate-in
            fade-in
            zoom-in-95
            slide-in-from-top-2
            duration-200
          "
        >
          {/* CABEÇALHO */}

          <div className="border-b border-slate-100 bg-gradient-to-br from-blue-50/80 via-white to-white p-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={foto_url || avatarPadrao}
                  alt=""
                  className="
                    h-12
                    w-12
                    rounded-full
                    border-2
                    border-white
                    object-cover
                    shadow-sm
                  "
                  onError={(event) => {
                    event.currentTarget.src = avatarPadrao;
                  }}
                />

                <span
                  className="
                    absolute
                    bottom-0
                    right-0
                    h-3
                    w-3
                    rounded-full
                    border-2
                    border-white
                    bg-emerald-500
                  "
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-slate-800">
                  {nomeUsuario}
                </p>

                <div className="mt-1 flex items-center gap-1.5">
                  <ShieldCheck
                    size={13}
                    className="text-emerald-500"
                  />

                  <span className="text-xs font-medium text-slate-500">
                    Perfil ativo
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* OPÇÕES */}

          <div className="p-2">
            <button
              type="button"
              role="menuitem"
              onClick={handleEditar}
              className="
                flex
                w-full
                items-center
                gap-3
                rounded-xl
                px-3
                py-3
                text-left
                transition-colors
                hover:bg-blue-50
              "
            >
              <div
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-lg
                  bg-blue-50
                  text-blue-600
                "
              >
                <UserRound size={17} />
              </div>

              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-700">
                  Meu Perfil
                </p>

                <p className="text-xs text-slate-400">
                  Editar informações
                </p>
              </div>
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={() => setAberto(false)}
              className="
                flex
                w-full
                items-center
                gap-3
                rounded-xl
                px-3
                py-3
                text-left
                transition-colors
                hover:bg-slate-50
              "
            >
              <div
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-lg
                  bg-slate-100
                  text-slate-500
                "
              >
                <Settings size={17} />
              </div>

              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-700">
                  Configurações
                </p>

                <p className="text-xs text-slate-400">
                  Preferências da conta
                </p>
              </div>
            </button>
          </div>

          {/* SAIR */}

          <div className="border-t border-slate-100 p-2">
            <button
              type="button"
              role="menuitem"
              onClick={handleSair}
              className="
                flex
                w-full
                items-center
                gap-3
                rounded-xl
                px-3
                py-3
                text-left
                transition-colors
                hover:bg-red-50
              "
            >
              <div
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-lg
                  bg-red-50
                  text-red-500
                "
              >
                <LogOut size={17} />
              </div>

              <div className="flex-1">
                <p className="text-sm font-semibold text-red-600">
                  Sair do sistema
                </p>

                <p className="text-xs text-red-400">
                  Encerrar sessão
                </p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}