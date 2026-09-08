"use client";

import { useState } from "react";

import {
  Trophy,
  Zap,
  X,
  BookOpen,
  CheckCircle2,
  Flame,
  Target,
  ChevronRight,
} from "lucide-react";

interface HistoricoXP {
  descricao: string;
  xp: number;
  tipo?: "estudo" | "exercicio" | "sequencia" | "conquista";
}

interface BarraXPProps {
  nivel: number;
  xpAtual: number;
  historicoXP?: HistoricoXP[];
}

export default function BarraXP({
  nivel,
  xpAtual,
  historicoXP = [],
}: BarraXPProps) {
  const [modalAberto, setModalAberto] = useState(false);

  const xpNecessario = nivel * 100;

  const porcentagem = Math.min(
    100,
    Math.round((xpAtual / xpNecessario) * 100)
  );

  const xpFaltante = Math.max(
    0,
    xpNecessario - xpAtual
  );

  function getIcone(tipo?: HistoricoXP["tipo"]) {
    switch (tipo) {
      case "exercicio":
        return <CheckCircle2 size={16} />;

      case "sequencia":
        return <Flame size={16} />;

      case "conquista":
        return <Trophy size={16} />;

      default:
        return <BookOpen size={16} />;
    }
  }

  return (
    <>
      {/* =========================================================
          BARRA DE XP
      ========================================================= */}

      <button
        type="button"
        onClick={() => setModalAberto(true)}
        className="
          group
          w-full
          flex
          items-center
          gap-3
          sm:gap-4
          bg-white
          px-4
          sm:px-5
          py-3
          rounded-2xl
          shadow-sm
          border border-slate-100
          font-sans
          text-left
          cursor-pointer
          hover:border-blue-200
          hover:shadow-md
          transition-all
          duration-200
          min-w-0
        "
        title="Ver seu progresso de XP"
      >
        {/* BADGE DO NÍVEL */}

        <div
          className="
            flex
            flex-col
            items-center
            justify-center
            bg-blue-50
            w-11
            h-11
            sm:w-12
            sm:h-12
            rounded-xl
            text-blue-600
            border border-blue-100
            shrink-0
            relative
            overflow-hidden
            group-hover:bg-blue-100
            transition-colors
          "
        >
          <Zap
            size={24}
            className="
              absolute
              top-1/2
              left-1/2
              -translate-x-1/2
              -translate-y-1/2
              opacity-[0.07]
            "
          />

          <span
            className="
              text-[9px]
              font-bold
              uppercase
              tracking-wider
              text-blue-500
              mb-0.5
              z-10
            "
          >
            Lvl
          </span>

          <span
            className="
              text-lg
              font-black
              leading-none
              z-10
            "
          >
            {nivel}
          </span>
        </div>

        {/* CONTEÚDO DA BARRA */}

        <div className="flex-1 min-w-0">
          {/* TEXTO */}

          <div
            className="
              flex
              justify-between
              items-center
              gap-2
              mb-2
              min-w-0
            "
          >
            <div
              className="
                flex
                items-center
                gap-1.5
                text-slate-700
                min-w-0
              "
            >
              <Trophy
                size={14}
                className="
                  text-amber-500
                  shrink-0
                "
                strokeWidth={2.5}
              />

              <span
                className="
                  text-xs
                  sm:text-sm
                  font-semibold
                  truncate
                "
              >
                Iniciante em Lógica
              </span>
            </div>

            <span
              className="
                whitespace-nowrap
                text-[11px]
                sm:text-xs
                font-medium
                text-slate-400
                shrink-0
              "
            >
              <span className="text-blue-600 font-bold">
                {xpAtual}
              </span>{" "}
              / {xpNecessario} XP
            </span>
          </div>

          {/* BARRA */}

          <div
            className="
              w-full
              bg-slate-100
              rounded-full
              h-2.5
              overflow-hidden
              border border-slate-200/50
            "
          >
            <div
              className="
                bg-blue-500
                h-full
                rounded-full
                transition-all
                duration-700
                ease-out
                relative
              "
              style={{
                width: `${porcentagem}%`,
              }}
            >
              <div
                className="
                  absolute
                  inset-0
                  bg-gradient-to-r
                  from-transparent
                  to-white/25
                "
              />
            </div>
          </div>
        </div>

        {/* INDICADOR DE CLIQUE */}

        <ChevronRight
          size={18}
          className="
            text-slate-300
            group-hover:text-blue-500
            group-hover:translate-x-0.5
            transition-all
            shrink-0
          "
        />
      </button>

      {/* =========================================================
          MODAL DE XP
      ========================================================= */}

      {modalAberto && (
        <div
          className="
            fixed
            inset-0
            z-[100]
            flex
            items-center
            justify-center
            p-4
            bg-slate-950/40
            backdrop-blur-sm
          "
          onClick={() => setModalAberto(false)}
        >
          <div
            className="
              w-full
              max-w-md
              max-h-[90vh]
              overflow-y-auto
              bg-white
              rounded-3xl
              shadow-2xl
              border border-slate-200
              font-sans
              animate-in
              fade-in
              zoom-in-95
              duration-200
            "
            onClick={(e) => e.stopPropagation()}
          >
            {/* CABEÇALHO */}

            <div
              className="
                relative
                px-5
                sm:px-6
                pt-6
                pb-5
                bg-gradient-to-br
                from-blue-50
                via-white
                to-indigo-50
                border-b
                border-slate-100
              "
            >
              <button
                type="button"
                onClick={() =>
                  setModalAberto(false)
                }
                className="
                  absolute
                  top-4
                  right-4
                  w-8
                  h-8
                  flex
                  items-center
                  justify-center
                  rounded-full
                  text-slate-400
                  hover:text-slate-700
                  hover:bg-white
                  transition-all
                "
                aria-label="Fechar"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3">
                <div
                  className="
                    w-12
                    h-12
                    rounded-2xl
                    bg-blue-600
                    text-white
                    flex
                    items-center
                    justify-center
                    shadow-lg
                    shadow-blue-500/20
                  "
                >
                  <Zap size={24} />
                </div>

                <div>
                  <p
                    className="
                      text-xs
                      font-bold
                      uppercase
                      tracking-wider
                      text-blue-500
                    "
                  >
                    Seu progresso
                  </p>

                  <h2
                    className="
                      text-xl
                      font-black
                      text-slate-800
                    "
                  >
                    Nível {nivel}
                  </h2>
                </div>
              </div>

              {/* XP */}

              <div className="mt-6">
                <div
                  className="
                    flex
                    items-end
                    justify-between
                    gap-3
                    mb-2
                  "
                >
                  <div>
                    <span
                      className="
                        text-3xl
                        font-black
                        text-slate-800
                      "
                    >
                      {xpAtual}
                    </span>

                    <span
                      className="
                        text-sm
                        font-medium
                        text-slate-400
                        ml-1
                      "
                    >
                      XP
                    </span>
                  </div>

                  <span
                    className="
                      text-xs
                      font-semibold
                      text-slate-400
                    "
                  >
                    {xpNecessario} XP
                  </span>
                </div>

                <div
                  className="
                    w-full
                    h-3
                    bg-slate-200
                    rounded-full
                    overflow-hidden
                  "
                >
                  <div
                    className="
                      h-full
                      bg-blue-600
                      rounded-full
                      transition-all
                      duration-700
                    "
                    style={{
                      width: `${porcentagem}%`,
                    }}
                  />
                </div>

                <div
                  className="
                    flex
                    justify-between
                    items-center
                    mt-2
                  "
                >
                  <span
                    className="
                      text-xs
                      font-semibold
                      text-blue-600
                    "
                  >
                    {porcentagem}% concluído
                  </span>

                  <span
                    className="
                      text-xs
                      text-slate-400
                    "
                  >
                    {xpFaltante > 0
                      ? `${xpFaltante} XP restantes`
                      : "Nível completo!"}
                  </span>
                </div>
              </div>
            </div>

            {/* HISTÓRICO */}

            <div className="p-5 sm:p-6">
              <div
                className="
                  flex
                  items-center
                  justify-between
                  mb-4
                "
              >
                <div>
                  <h3
                    className="
                      font-bold
                      text-slate-800
                    "
                  >
                    XP conquistado
                  </h3>

                  <p
                    className="
                      text-xs
                      text-slate-400
                      mt-0.5
                    "
                  >
                    Suas atividades recentes
                  </p>
                </div>

                <div
                  className="
                    flex
                    items-center
                    gap-1.5
                    bg-amber-50
                    text-amber-600
                    px-2.5
                    py-1.5
                    rounded-lg
                    text-xs
                    font-bold
                  "
                >
                  <Zap size={13} />
                  XP
                </div>
              </div>

              {historicoXP.length > 0 ? (
                <div className="space-y-3">
                  {historicoXP.map(
                    (item, index) => (
                      <div
                        key={`${item.descricao}-${index}`}
                        className="
                          flex
                          items-center
                          gap-3
                          p-3
                          rounded-xl
                          bg-slate-50
                          border border-slate-100
                        "
                      >
                        <div
                          className="
                            w-9
                            h-9
                            rounded-xl
                            bg-white
                            border border-slate-200
                            flex
                            items-center
                            justify-center
                            text-blue-600
                            shrink-0
                          "
                        >
                          {getIcone(item.tipo)}
                        </div>

                        <div
                          className="
                            flex-1
                            min-w-0
                          "
                        >
                          <p
                            className="
                              text-sm
                              font-semibold
                              text-slate-700
                              break-words
                            "
                          >
                            {item.descricao}
                          </p>
                        </div>

                        <span
                          className="
                            text-sm
                            font-black
                            text-emerald-600
                            whitespace-nowrap
                          "
                        >
                          +{item.xp} XP
                        </span>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div
                  className="
                    text-center
                    py-8
                    px-4
                    rounded-2xl
                    bg-slate-50
                    border border-dashed
                    border-slate-200
                  "
                >
                  <div
                    className="
                      w-11
                      h-11
                      mx-auto
                      mb-3
                      rounded-full
                      bg-white
                      border border-slate-200
                      flex
                      items-center
                      justify-center
                      text-slate-400
                    "
                  >
                    <Target size={20} />
                  </div>

                  <p
                    className="
                      text-sm
                      font-semibold
                      text-slate-600
                    "
                  >
                    Nenhum XP registrado ainda
                  </p>

                  <p
                    className="
                      text-xs
                      text-slate-400
                      mt-1
                    "
                  >
                    Continue estudando para
                    começar a ganhar XP.
                  </p>
                </div>
              )}

              {/* RESUMO */}

              {historicoXP.length > 0 && (
                <div
                  className="
                    mt-5
                    pt-5
                    border-t
                    border-slate-100
                    flex
                    items-center
                    justify-between
                  "
                >
                  <span
                    className="
                      text-sm
                      font-medium
                      text-slate-500
                    "
                  >
                    XP das atividades
                  </span>

                  <span
                    className="
                      text-lg
                      font-black
                      text-emerald-600
                    "
                  >
                    +
                    {historicoXP.reduce(
                      (total, item) =>
                        total + item.xp,
                      0
                    )}{" "}
                    XP
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}