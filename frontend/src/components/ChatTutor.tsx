"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";

import { toast } from "sonner";

import {
  Send,
  Bot,
  Sparkles,
  BookOpen,
  Terminal,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";

import "katex/dist/katex.min.css";

interface Mensagem {
  role: "user" | "assistant";
  conteudo: string;
}

interface ChatTutorProps {
  conversaId: number;
  onNovaAvaliacao: () => void;
  onPrimeiraMensagem?: () => void;
}

/* ============================================================
   BOTÃO DE COPIAR CÓDIGO
============================================================ */

function BotaoCopiar({ texto }: { texto: string }) {
  const [copiado, setCopiado] = useState(false);

  async function copiarCodigo() {
    try {
      await navigator.clipboard.writeText(texto);

      setCopiado(true);

      setTimeout(() => {
        setCopiado(false);
      }, 2000);
    } catch (error) {
      console.error("Erro ao copiar código:", error);
      toast.error("Não foi possível copiar o código.");
    }
  }

  return (
    <button
      type="button"
      onClick={copiarCodigo}
      className="
        flex items-center gap-1.5
        px-2.5 py-1.5
        rounded-lg
        text-xs font-medium
        text-slate-300
        hover:text-white
        hover:bg-white/10
        transition-all
      "
      title="Copiar código"
    >
      {copiado ? (
        <>
          <Check size={14} />
          Copiado
        </>
      ) : (
        <>
          <Copy size={14} />
          Copiar
        </>
      )}
    </button>
  );
}

/* ============================================================
   RENDERIZAÇÃO DO MARKDOWN
============================================================ */

function MarkdownResposta({ conteudo }: { conteudo: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath, remarkGfm]}
      rehypePlugins={[rehypeKatex]}
      components={{
        /* ----------------------------------------------------
           PARÁGRAFOS
        ---------------------------------------------------- */

        p: ({ children }) => (
          <p className="mb-4 last:mb-0 leading-7 text-slate-700">
            {children}
          </p>
        ),

        /* ----------------------------------------------------
           TÍTULOS
        ---------------------------------------------------- */

        h1: ({ children }) => (
          <h1
            className="
              text-xl sm:text-2xl
              font-bold
              text-slate-900
              mt-6 mb-4
              first:mt-0
              tracking-tight
            "
          >
            {children}
          </h1>
        ),

        h2: ({ children }) => (
          <h2
            className="
              text-lg sm:text-xl
              font-bold
              text-slate-900
              mt-6 mb-3
              first:mt-0
              tracking-tight
            "
          >
            {children}
          </h2>
        ),

        h3: ({ children }) => (
          <h3
            className="
              text-base sm:text-lg
              font-semibold
              text-slate-800
              mt-5 mb-2
              first:mt-0
            "
          >
            {children}
          </h3>
        ),

        h4: ({ children }) => (
          <h4
            className="
              text-sm sm:text-base
              font-semibold
              text-slate-800
              mt-4 mb-2
            "
          >
            {children}
          </h4>
        ),

        /* ----------------------------------------------------
           LISTAS
        ---------------------------------------------------- */

        ul: ({ children }) => (
          <ul
            className="
              list-disc
              pl-6
              mb-4
              space-y-1.5
              text-slate-700
            "
          >
            {children}
          </ul>
        ),

        ol: ({ children }) => (
          <ol
            className="
              list-decimal
              pl-6
              mb-4
              space-y-2
              text-slate-700
            "
          >
            {children}
          </ol>
        ),

        li: ({ children }) => (
          <li className="pl-1 leading-7">
            {children}
          </li>
        ),

        /* ----------------------------------------------------
           TEXTO FORTE / ÊNFASE
        ---------------------------------------------------- */

        strong: ({ children }) => (
          <strong className="font-semibold text-slate-900">
            {children}
          </strong>
        ),

        em: ({ children }) => (
          <em className="italic text-slate-600">
            {children}
          </em>
        ),

        /* ----------------------------------------------------
           LINKS
        ---------------------------------------------------- */

        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="
              inline-flex
              items-center
              gap-1
              text-blue-600
              font-medium
              hover:text-blue-700
              hover:underline
              transition-colors
            "
          >
            {children}
            <ExternalLink size={12} />
          </a>
        ),

        /* ----------------------------------------------------
           CITAÇÕES
        ---------------------------------------------------- */

        blockquote: ({ children }) => (
          <blockquote
            className="
              my-4
              border-l-4
              border-blue-300
              bg-blue-50/70
              rounded-r-xl
              px-4 py-3
              text-slate-700
              italic
            "
          >
            {children}
          </blockquote>
        ),

        /* ----------------------------------------------------
           SEPARADOR
        ---------------------------------------------------- */

        hr: () => (
          <hr className="my-6 border-slate-200" />
        ),

        /* ----------------------------------------------------
           CÓDIGO
        ---------------------------------------------------- */

        code: ({
          className,
          children,
        }: {
          className?: string;
          children?: ReactNode;
        }) => {
          const linguagem =
            className?.replace("language-", "") || "";

          const codigo = String(children).replace(/\n$/, "");

          const ehBloco = Boolean(className);

          if (!ehBloco) {
            return (
              <code
                className="
                  px-1.5 py-0.5
                  rounded-md
                  bg-slate-100
                  border border-slate-200
                  text-[0.9em]
                  font-mono
                  text-blue-700
                "
              >
                {children}
              </code>
            );
          }

          return (
            <div className="my-5 overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-sm">
              {/* Cabeçalho do código */}
              <div
                className="
                  flex items-center justify-between
                  px-4 py-2.5
                  bg-slate-900
                  border-b border-slate-800
                "
              >
                <div className="flex items-center gap-2">
                  <Terminal
                    size={14}
                    className="text-slate-400"
                  />

                  <span className="text-xs font-medium text-slate-400">
                    {linguagem || "código"}
                  </span>
                </div>

                <BotaoCopiar texto={codigo} />
              </div>

              {/* Código */}
              <pre
                className="
                  overflow-x-auto
                  p-4
                  text-[13px] sm:text-sm
                  leading-6
                  font-mono
                  text-slate-200
                "
              >
                <code>{codigo}</code>
              </pre>
            </div>
          );
        },

        /* ----------------------------------------------------
           TABELAS
        ---------------------------------------------------- */

        table: ({ children }) => (
          <div className="my-5 w-full overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full min-w-[500px] border-collapse text-sm">
              {children}
            </table>
          </div>
        ),

        thead: ({ children }) => (
          <thead className="bg-slate-100">
            {children}
          </thead>
        ),

        tbody: ({ children }) => (
          <tbody className="divide-y divide-slate-200 bg-white">
            {children}
          </tbody>
        ),

        tr: ({ children }) => (
          <tr className="hover:bg-slate-50 transition-colors">
            {children}
          </tr>
        ),

        th: ({ children }) => (
          <th
            className="
              px-4 py-3
              text-left
              font-semibold
              text-slate-800
              border-b border-slate-200
            "
          >
            {children}
          </th>
        ),

        td: ({ children }) => (
          <td
            className="
              px-4 py-3
              text-slate-700
              align-top
            "
          >
            {children}
          </td>
        ),
      }}
    >
      {conteudo}
    </ReactMarkdown>
  );
}

/* ============================================================
   COMPONENTE PRINCIPAL
============================================================ */

export default function ChatTutor({
  conversaId,
  onNovaAvaliacao,
  onPrimeiraMensagem,
}: ChatTutorProps) {
  /* ============================================================
     ESTADOS
  ============================================================ */

  const [mensagens, setMensagens] = useState<Mensagem[]>([
    {
      role: "assistant",
      conteudo:
        "Olá! Sou seu tutor de IA. Escolha um modo de estudo acima e me diga qual é a sua dúvida hoje!",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [modo, setModo] = useState("tutor");

  const mensagensEndRef =
    useRef<HTMLDivElement>(null);

  /* ============================================================
     SCROLL AUTOMÁTICO
  ============================================================ */

  const scrollToBottom = () => {
    mensagensEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [mensagens]);

  /* ============================================================
     ENVIAR MENSAGEM
  ============================================================ */

  async function enviarMensagem(e: FormEvent) {
    e.preventDefault();

    if (!input.trim() || loading) {
      return;
    }

    const textoDigitado = input.trim();
    const ehPrimeiraMensagem = mensagens.length <= 1;

    const novaMensagem: Mensagem = {
      role: "user",
      conteudo: textoDigitado,
    };

    setMensagens((prev) => [
      ...prev,
      novaMensagem,
    ]);

    setInput("");
    setLoading(true);

    try {
      const response = await fetch(
        "https://tutorai-backend-km0b.onrender.com/chat/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            conversa_id: conversaId,
            role: "user",
            conteudo: textoDigitado,
            modo_estudo: modo,
          }),
        }
      );

      if (!response.ok || !response.body) {
        throw new Error(
          "Erro na conexão com o servidor."
        );
      }

      setLoading(false);

      setMensagens((prev) => [
        ...prev,
        {
          role: "assistant",
          conteudo: "",
        },
      ]);

      const reader =
        response.body.getReader();

      const decoder =
        new TextDecoder("utf-8");

      let respostaCompleta = "";

      while (true) {
        const { done, value } =
          await reader.read();

        if (done) {
          break;
        }

        const pedaco = decoder.decode(value, {
          stream: true,
        });

        respostaCompleta += pedaco;

        setMensagens((prev) => {
          const novoArray = [...prev];

          if (novoArray.length > 0) {
            novoArray[
              novoArray.length - 1
            ].conteudo = respostaCompleta;
          }

          return novoArray;
        });
      }

      onNovaAvaliacao();

      /* --------------------------------------------------------
         GERA TÍTULO DA CONVERSA
      -------------------------------------------------------- */

      if (ehPrimeiraMensagem) {
        fetch(
          `https://tutorai-backend-km0b.onrender.com/conversas/${conversaId}/gerar-titulo`,
          {
            method: "PUT",
          }
        )
          .then(() => {
            if (onPrimeiraMensagem) {
              onPrimeiraMensagem();
            }
          })
          .catch((err) =>
            console.error(
              "Erro ao gerar título:",
              err
            )
          );
      }
    } catch (error) {
      console.error(
        "Erro no fluxo do chat:",
        error
      );

      toast.error(
        "Opa! A mensagem não pôde ser enviada. Verifique sua conexão."
      );

      setInput(textoDigitado);

      setMensagens((prev) => {
        const novoArray = [...prev];

        if (
          novoArray.length > 0 &&
          novoArray[
            novoArray.length - 1
          ].role === "assistant"
        ) {
          novoArray.pop();
        }

        if (
          novoArray.length > 0 &&
          novoArray[
            novoArray.length - 1
          ].role === "user"
        ) {
          novoArray.pop();
        }

        return novoArray;
      });
    } finally {
      setLoading(false);
    }
  }

  /* ============================================================
     BUSCAR HISTÓRICO
  ============================================================ */

  useEffect(() => {
    async function buscarHistorico() {
      setMensagens([]);

      try {
        const res = await fetch(
          `https://tutorai-backend-km0b.onrender.com/conversas/${conversaId}/mensagens`
        );

        if (res.ok) {
          const dados = await res.json();

          const mensagensFormatadas: Mensagem[] =
            dados.map((m: unknown) => {
              if (
                typeof m === "object" &&
                m !== null &&
                "role" in m &&
                "conteudo" in m
              ) {
                const mensagem =
                  m as {
                    role: string;
                    conteudo: string;
                  };

                return {
                  role:
                    mensagem.role === "user"
                      ? "user"
                      : "assistant",
                  conteudo:
                    mensagem.conteudo,
                };
              }

              return {
                role: "assistant",
                conteudo:
                  "Erro ao formatar mensagem.",
              };
            });

          if (mensagensFormatadas.length > 0) {
            setMensagens(
              mensagensFormatadas
            );
          } else {
            setMensagens([
              {
                role: "assistant",
                conteudo:
                  "Olá! Sou seu tutor de IA. Escolha um modo de estudo acima e me diga qual é a sua dúvida hoje!",
              },
            ]);
          }
        }
      } catch (error) {
        console.error(
          "Erro ao carregar histórico:",
          error
        );

        setMensagens([
          {
            role: "assistant",
            conteudo:
              "Olá! Sou seu tutor de IA. Escolha um modo de estudo acima e me diga qual é a sua dúvida hoje!",
          },
        ]);
      }
    }

    if (conversaId) {
      buscarHistorico();
    }
  }, [conversaId]);

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <div
      className="
        flex flex-col
        flex-1
        min-h-0
        min-w-0
        h-full
        w-full
        bg-slate-50
        overflow-hidden
        font-sans
      "
    >
      {/* ======================================================
          CABEÇALHO
      ====================================================== */}

      <div
        className="
          bg-white
          px-4 sm:px-6
          py-3.5
          flex items-center justify-between
          border-b border-slate-200
          z-10
          shrink-0
        "
      >
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="relative">
            <div
              className="
                bg-blue-50
                p-2.5
                rounded-xl
                text-blue-600
                border border-blue-100
                shadow-sm
              "
            >
              <Bot size={22} />
            </div>

            <span
              className="
                absolute
                bottom-0
                right-0
                w-2.5
                h-2.5
                bg-emerald-500
                rounded-full
                border-2
                border-white
              "
            />
          </div>

          {/* Informações */}
          <div>
            <h2 className="text-slate-800 font-semibold text-sm sm:text-base">
              TutorAI Pro
            </h2>

            <p className="text-slate-500 text-xs flex items-center gap-1">
              <Sparkles size={12} />

              <span>
                Assistente com RAG
              </span>

              <span className="text-emerald-500 font-medium ml-1">
                • Online
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* ======================================================
          MODOS DE ESTUDO
      ====================================================== */}

      <div
        className="
          bg-white
          border-b border-slate-200
          px-4
          py-2.5
          flex gap-2
          overflow-x-auto
          whitespace-nowrap
          justify-start sm:justify-center
          shrink-0
          scrollbar-thin
        "
      >
        {/* Modo Tutor */}
        <button
          type="button"
          onClick={() => setModo("tutor")}
          className={`
            flex items-center gap-2
            px-4 py-2
            rounded-xl
            text-sm font-semibold
            transition-all
            shrink-0
            ${
              modo === "tutor"
                ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm"
                : "bg-slate-50 text-slate-500 hover:bg-slate-100 border border-transparent"
            }
          `}
        >
          <Bot size={16} />
          Modo Tutor
        </button>

        {/* Exercícios */}
        <button
          type="button"
          onClick={() =>
            setModo("exercicios")
          }
          className={`
            flex items-center gap-2
            px-4 py-2
            rounded-xl
            text-sm font-semibold
            transition-all
            shrink-0
            ${
              modo === "exercicios"
                ? "bg-amber-50 text-amber-700 border border-amber-200 shadow-sm"
                : "bg-slate-50 text-slate-500 hover:bg-slate-100 border border-transparent"
            }
          `}
        >
          <Terminal size={16} />
          Exercícios
        </button>

        {/* Revisão */}
        <button
          type="button"
          onClick={() =>
            setModo("revisao")
          }
          className={`
            flex items-center gap-2
            px-4 py-2
            rounded-xl
            text-sm font-semibold
            transition-all
            shrink-0
            ${
              modo === "revisao"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm"
                : "bg-slate-50 text-slate-500 hover:bg-slate-100 border border-transparent"
            }
          `}
        >
          <BookOpen size={16} />
          Revisão Rápida
        </button>
      </div>

      {/* ======================================================
          MENSAGENS
      ====================================================== */}

      <div
        className="
          flex-1
          min-h-0
          min-w-0
          overflow-y-auto
          px-3 sm:px-5
          py-5 sm:py-7
          w-full
          scroll-smooth
        "
      >
        <div
          className="
            w-full
            max-w-4xl
            mx-auto
            flex flex-col
            gap-6
          "
        >
          {mensagens.map((msg, idx) => {
            const ehUsuario =
              msg.role === "user";

            const mensagemVazia =
              msg.conteudo.trim() === "";

            return (
              <div
                key={idx}
                className={`
                  flex
                  w-full
                  gap-3
                  ${
                    ehUsuario
                      ? "justify-end"
                      : "justify-start"
                  }
                `}
              >
                {/* ==================================================
                    AVATAR DA IA
                ================================================== */}

                {!ehUsuario && (
                  <div
                    className="
                      w-8 h-8
                      sm:w-9 sm:h-9
                      rounded-full
                      bg-blue-600
                      shadow-sm
                      flex items-center justify-center
                      shrink-0
                      mt-1
                    "
                  >
                    <Bot
                      size={18}
                      className="text-white"
                    />
                  </div>
                )}

                {/* ==================================================
                    MENSAGEM DO USUÁRIO
                ================================================== */}

                {ehUsuario ? (
                  <div
                    className="
                      max-w-[88%]
                      sm:max-w-[78%]
                      lg:max-w-[70%]
                      rounded-2xl
                      rounded-tr-md
                      bg-blue-600
                      text-white
                      px-4 sm:px-5
                      py-3
                      sm:py-3.5
                      shadow-sm
                      text-[14px]
                      sm:text-[15px]
                      leading-7
                      break-words
                      whitespace-pre-wrap
                    "
                  >
                    {msg.conteudo}
                  </div>
                ) : (
                  /* ==================================================
                     MENSAGEM DA IA
                  ================================================== */

                  <div
                    className="
                      min-w-0
                      max-w-[calc(100%-3rem)]
                      sm:max-w-[85%]
                      lg:max-w-[82%]
                    "
                  >
                    {!mensagemVazia && (
                      <div
                        className="
                          bg-white
                          border border-slate-200
                          rounded-2xl
                          rounded-tl-md
                          px-4 sm:px-6
                          py-4 sm:py-5
                          shadow-sm
                          text-[14px]
                          sm:text-[15px]
                          overflow-hidden
                        "
                      >
                        <div
                          className="
                            max-w-none
                            break-words
                            text-slate-700
                          "
                        >
                          <MarkdownResposta
                            conteudo={
                              msg.conteudo
                            }
                          />
                        </div>
                      </div>
                    )}

                    {/* Indicador durante streaming */}
                    {mensagemVazia &&
                      !loading && (
                        <div
                          className="
                            bg-white
                            border border-slate-200
                            rounded-2xl
                            rounded-tl-md
                            px-5 py-4
                            shadow-sm
                          "
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" />
                            <span
                              className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"
                              style={{
                                animationDelay:
                                  "0.15s",
                              }}
                            />
                            <span
                              className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"
                              style={{
                                animationDelay:
                                  "0.3s",
                              }}
                            />
                          </div>
                        </div>
                      )}
                  </div>
                )}
              </div>
            );
          })}

          {/* ======================================================
              LOADING
          ====================================================== */}

          {loading && (
            <div className="flex gap-3 w-full justify-start items-center">
              <div
                className="
                  w-8 h-8
                  sm:w-9 sm:h-9
                  rounded-full
                  bg-blue-600
                  shadow-sm
                  flex items-center justify-center
                  shrink-0
                "
              >
                <Bot
                  size={18}
                  className="text-white"
                />
              </div>

              <div
                className="
                  bg-white
                  border border-slate-200
                  rounded-2xl
                  rounded-tl-md
                  px-5 py-4
                  shadow-sm
                  flex items-center gap-1.5
                "
              >
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />

                <span
                  className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                  style={{
                    animationDelay:
                      "0.15s",
                  }}
                />

                <span
                  className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                  style={{
                    animationDelay:
                      "0.3s",
                  }}
                />
              </div>
            </div>
          )}

          <div
            ref={mensagensEndRef}
            className="h-2"
          />
        </div>
      </div>

      {/* ======================================================
          INPUT
      ====================================================== */}

      <div
        className="
          shrink-0
          bg-white
          px-3 sm:px-5
          pt-3
          pb-3 sm:pb-5
          flex justify-center
          border-t border-slate-200
        "
      >
        <form
          onSubmit={enviarMensagem}
          className="
            w-full
            max-w-4xl
            relative
            flex items-center
          "
        >
          <input
            type="text"
            value={input}
            onChange={(e) =>
              setInput(e.target.value)
            }
            placeholder={`Pergunte ao tutor (Modo ${modo})...`}
            className="
              w-full
              bg-slate-50
              border border-slate-300
              rounded-2xl
              pl-5
              pr-14
              py-3.5
              sm:py-4
              focus:outline-none
              focus:border-blue-500
              focus:ring-4
              focus:ring-blue-500/10
              text-slate-800
              text-sm sm:text-base
              placeholder:text-slate-400
              transition-all
              shadow-sm
            "
            disabled={loading}
          />

          <button
            type="submit"
            disabled={
              loading || !input.trim()
            }
            className="
              absolute
              right-2
              p-2.5
              bg-blue-600
              text-white
              rounded-xl
              hover:bg-blue-700
              active:scale-95
              disabled:bg-slate-300
              disabled:text-slate-500
              disabled:cursor-not-allowed
              transition-all
              shadow-sm
              flex items-center
              justify-center
            "
            title="Enviar mensagem"
          >
            <Send
              size={18}
              className={
                input.trim() && !loading
                  ? "translate-x-px -translate-y-px"
                  : ""
              }
            />
          </button>
        </form>
      </div>
    </div>
  );
}