"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
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
        "Olá! Sou seu tutor de IA. Escolha um modo de estudo acima e me diga qual é a sua dúvida de lógica hoje!",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [modo, setModo] = useState("tutor");

  const mensagensEndRef = useRef<HTMLDivElement>(null);

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

    const ehPrimeiraMensagem = mensagens.length <= 1;
    const textoDigitado = input.trim();

    const novaMensagem: Mensagem = {
      role: "user",
      conteudo: textoDigitado,
    };

    setMensagens((prev) => [...prev, novaMensagem]);
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

      /* ========================================================
         CRIA BALÃO DO ASSISTENTE
      ======================================================== */

      setMensagens((prev) => [
        ...prev,
        {
          role: "assistant",
          conteudo: "",
        },
      ]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      let textoAcumulado = "";

      /* ========================================================
         STREAM
      ======================================================== */

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        const pedaco = decoder.decode(value, {
          stream: true,
        });

        textoAcumulado += pedaco;

        setMensagens((prev) => {
          const novoArray = [...prev];

          if (novoArray.length > 0) {
            novoArray[novoArray.length - 1] = {
              ...novoArray[novoArray.length - 1],
              conteudo: textoAcumulado,
            };
          }

          return novoArray;
        });
      }

      /* ========================================================
         ATUALIZA DASHBOARD
      ======================================================== */

      onNovaAvaliacao();

      /* ========================================================
         GERAR TÍTULO
      ======================================================== */

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
          novoArray[novoArray.length - 1].role ===
            "assistant"
        ) {
          novoArray.pop();
        }

        if (
          novoArray.length > 0 &&
          novoArray[novoArray.length - 1].role ===
            "user"
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
            dados.map((m: any) => ({
              role: m.role,
              conteudo: m.conteudo,
            }));

          if (mensagensFormatadas.length > 0) {
            setMensagens(mensagensFormatadas);
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
        flex
        flex-col
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
      {/* ========================================================
          CABEÇALHO
      ======================================================== */}

      <div
        className="
          bg-white
          px-5
          sm:px-6
          py-3.5
          flex
          items-center
          justify-between
          border-b
          border-slate-200
          z-10
          shrink-0
        "
      >
        <div
          className="
            flex
            items-center
            gap-3
          "
        >
          {/* ÍCONE */}

          <div className="relative">
            <div
              className="
                bg-blue-50
                p-2.5
                rounded-xl
                text-blue-600
                border
                border-blue-100
              "
            >
              <Bot size={22} />
            </div>

            {/* STATUS */}

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

          {/* TEXTO */}

          <div>
            <h2
              className="
                text-slate-800
                font-semibold
                text-sm
                sm:text-base
              "
            >
              TutorAI Pro
            </h2>

            <p
              className="
                text-slate-500
                text-xs
                flex
                items-center
                gap-1
              "
            >
              <Sparkles size={12} />

              Assistente com RAG

              <span
                className="
                  text-emerald-500
                  font-medium
                  ml-1
                "
              >
                • Online
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================
          MODOS DE ESTUDO
      ======================================================== */}

      <div
        className="
          bg-white
          border-b
          border-slate-200
          px-4
          py-2.5
          flex
          gap-2
          overflow-x-auto
          whitespace-nowrap
          justify-start
          sm:justify-center
          shrink-0
        "
      >
        {/* MODO TUTOR */}

        <button
          type="button"
          onClick={() => setModo("tutor")}
          className={`
            flex
            items-center
            gap-2
            px-4
            py-2
            rounded-xl
            text-sm
            font-semibold
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

        {/* EXERCÍCIOS */}

        <button
          type="button"
          onClick={() => setModo("exercicios")}
          className={`
            flex
            items-center
            gap-2
            px-4
            py-2
            rounded-xl
            text-sm
            font-semibold
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

        {/* REVISÃO */}

        <button
          type="button"
          onClick={() => setModo("revisao")}
          className={`
            flex
            items-center
            gap-2
            px-4
            py-2
            rounded-xl
            text-sm
            font-semibold
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

      {/* ========================================================
          MENSAGENS
      ======================================================== */}

      <div
        className="
          flex-1
          min-h-0
          min-w-0
          overflow-y-auto
          p-4
          sm:p-6
          w-full
        "
      >
        <div
          className="
            w-full
            max-w-5xl
            mx-auto
            flex
            flex-col
            gap-5
          "
        >
          {mensagens.map((msg, idx) => (
            <div
              key={idx}
              className={`
                flex
                gap-3
                w-full
                ${
                  msg.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }
              `}
            >
              {/* ÍCONE DO BOT */}

              {msg.role === "assistant" && (
                <div
                  className="
                    w-8
                    h-8
                    sm:w-9
                    sm:h-9
                    rounded-full
                    bg-blue-600
                    border-2
                    border-white
                    shadow-sm
                    flex
                    items-center
                    justify-center
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

              {/* BALÃO */}

              {msg.conteudo.trim() !== "" && (
                <div
                  className={`
                    max-w-[90%]
                    sm:max-w-[80%]
                    lg:max-w-[75%]
                    px-4
                    sm:px-5
                    py-3
                    sm:py-4
                    text-[14px]
                    sm:text-[15px]
                    leading-relaxed
                    shadow-sm
                    break-words
                    overflow-hidden
                    ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white rounded-2xl rounded-tr-sm"
                        : "bg-white text-slate-700 border border-slate-200 rounded-2xl rounded-tl-sm"
                    }
                  `}
                >
                  {msg.role === "user" ? (
                    <span className="whitespace-pre-wrap">
                      {msg.conteudo}
                    </span>
                  ) : (
                    <div
                      className="
                        prose
                        prose-sm
                        prose-slate
                        max-w-none
                        break-words
                      "
                    >
                      <ReactMarkdown
                        remarkPlugins={[
                          remarkMath,
                          remarkGfm,
                        ]}
                        rehypePlugins={[rehypeKatex]}
                      >
                        {msg.conteudo}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* ====================================================
              LOADING
          ==================================================== */}

          {loading && (
            <div
              className="
                flex
                gap-4
                w-full
                justify-start
                items-center
              "
            >
              <div
                className="
                  w-9
                  h-9
                  rounded-full
                  bg-blue-600
                  border-2
                  border-white
                  shadow-sm
                  flex
                  items-center
                  justify-center
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
                  border
                  border-slate-200
                  rounded-2xl
                  rounded-tl-sm
                  px-5
                  py-4
                  shadow-sm
                  flex
                  items-center
                  gap-1.5
                  h-[52px]
                "
              >
                <div
                  className="
                    w-2
                    h-2
                    bg-slate-400
                    rounded-full
                    animate-bounce
                  "
                />

                <div
                  className="
                    w-2
                    h-2
                    bg-slate-400
                    rounded-full
                    animate-bounce
                  "
                  style={{
                    animationDelay: "0.2s",
                  }}
                />

                <div
                  className="
                    w-2
                    h-2
                    bg-slate-400
                    rounded-full
                    animate-bounce
                  "
                  style={{
                    animationDelay: "0.4s",
                  }}
                />
              </div>
            </div>
          )}

          {/* REFERÊNCIA DO SCROLL */}

          <div
            ref={mensagensEndRef}
            className="h-4"
          />
        </div>
      </div>

      {/* ========================================================
          INPUT
      ======================================================== */}

      <div
        className="
          shrink-0
          bg-white
          px-4
          pt-3
          pb-4
          sm:px-5
          sm:pb-5
          flex
          justify-center
          border-t
          border-slate-200
        "
      >
        <form
          onSubmit={enviarMensagem}
          className="
            w-full
            max-w-5xl
            relative
            flex
            items-center
          "
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Pergunte ao tutor (Modo ${modo})...`}
            className="
              w-full
              bg-slate-50
              border
              border-slate-300
              rounded-2xl
              pl-5
              pr-14
              py-3.5
              focus:outline-none
              focus:border-blue-500
              focus:ring-4
              focus:ring-blue-500/10
              text-slate-800
              text-sm
              sm:text-base
              transition-all
            "
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="
              absolute
              right-2
              p-2.5
              bg-blue-600
              text-white
              rounded-xl
              hover:bg-blue-700
              disabled:bg-slate-300
              disabled:text-slate-500
              disabled:cursor-not-allowed
              transition-colors
              shadow-sm
              flex
              items-center
              justify-center
            "
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