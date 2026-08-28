"use client";

import { useEffect, useState, useRef } from "react";
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import { toast } from 'sonner';
import { Send, Bot, Sparkles, BookOpen, Terminal } from 'lucide-react'; // <-- Novos ícones para os modos
import 'katex/dist/katex.min.css';

interface Mensagem {
  role: "user" | "assistant";
  conteudo: string;
}

interface ChatTutorProps {
  conversaId: number;
  onNovaAvaliacao: () => void;
  onPrimeiraMensagem?: () => void; 
}

export default function ChatTutor({ conversaId, onNovaAvaliacao, onPrimeiraMensagem }: ChatTutorProps) {
  const [mensagens, setMensagens] = useState<Mensagem[]>([
    { role: "assistant", conteudo: "Olá! Sou seu tutor de IA. Escolha um modo de estudo acima e me diga qual é a sua dúvida de lógica hoje!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  
  // NOVO: Estado para controlar o modo de estudo
  const [modo, setModo] = useState("tutor"); 

  const mensagensEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    mensagensEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [mensagens]);

  async function enviarMensagem(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const ehPrimeiraMensagem = mensagens.length <= 1;
    const textoDigitado = input;
    const novaMensagem: Mensagem = { role: "user", conteudo: textoDigitado };
    
    setMensagens((prev) => [...prev, novaMensagem]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("https://tutorai-backend-km0b.onrender.com/chat/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversa_id: conversaId,
          role: "user",
          conteudo: textoDigitado, 
          modo_estudo: modo // <-- Enviando o modo para o seu backend FastAPI
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Erro na conexão com o servidor.");
      }

      setMensagens((prev) => [...prev, { role: "assistant", conteudo: "" }]);
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let textoAcumulado = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const pedaco = decoder.decode(value, { stream: true });
        textoAcumulado += pedaco;

        setMensagens((prev) => {
          const novoArray = [...prev];
          novoArray[novoArray.length - 1].conteudo = textoAcumulado;
          return novoArray;
        });
      }

      onNovaAvaliacao();

      if (ehPrimeiraMensagem) {
        fetch(`https://tutorai-backend-km0b.onrender.com/conversas/${conversaId}/gerar-titulo`, { method: "PUT" })
          .then(() => {
            if (onPrimeiraMensagem) onPrimeiraMensagem(); 
          })
          .catch(err => console.error("Erro ao gerar título:", err));
      }

    } catch (error) {
      console.error("Erro no fluxo do chat:", error);
      toast.error("Opa! A mensagem não pôde ser enviada. Verifique sua conexão.");
      setInput(textoDigitado);

      setMensagens((prev) => {
        const novoArray = [...prev];
        if (novoArray.length > 0 && novoArray[novoArray.length - 1].role === "assistant") novoArray.pop(); 
        if (novoArray.length > 0 && novoArray[novoArray.length - 1].role === "user") novoArray.pop();
        return novoArray;
      });

    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function buscarHistorico() {
      setMensagens([]); 
      try {
        const res = await fetch(`https://tutorai-backend-km0b.onrender.com/conversas/${conversaId}/mensagens`);
        if (res.ok) {
          const dados = await res.json();
          const mensagensFormatadas = dados.map((m: any) => ({
            role: m.role,
            conteudo: m.conteudo
          }));
          
          if (mensagensFormatadas.length > 0) {
            setMensagens(mensagensFormatadas);
          } else {
            setMensagens([{ role: "assistant", conteudo: "Olá! Sou seu tutor de IA. Escolha um modo de estudo acima e me diga qual é a sua dúvida de lógica hoje!" }]);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar histórico:", error);
      }
    }
    
    if (conversaId) buscarHistorico();
  }, [conversaId]);

  return (
    <div className="flex flex-col flex-1 h-full w-full bg-slate-50 overflow-hidden font-sans">
      
      {/* Cabeçalho Minimalista */}
      <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-slate-200 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600 border border-blue-100">
            <Bot size={22} />
          </div>
          <div>
            <h2 className="text-slate-800 font-semibold text-sm sm:text-base">TutorAI Pro</h2>
            <p className="text-slate-500 text-xs flex items-center gap-1">
              <Sparkles size={12} /> Assistente com RAG
            </p>
          </div>
        </div>
      </div>

      {/* NOVO: Barra de Seleção de Modos */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex gap-2 overflow-x-auto justify-center z-0 shadow-sm">
        <button 
          onClick={() => setModo("tutor")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${modo === "tutor" ? "bg-blue-100 text-blue-700 border border-blue-200" : "bg-slate-50 text-slate-500 hover:bg-slate-100 border border-transparent"}`}
        >
          <Bot size={16} /> Modo Tutor
        </button>
        <button 
          onClick={() => setModo("exercicios")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${modo === "exercicios" ? "bg-amber-100 text-amber-700 border border-amber-200" : "bg-slate-50 text-slate-500 hover:bg-slate-100 border border-transparent"}`}
        >
          <Terminal size={16} /> Exercícios
        </button>
        <button 
          onClick={() => setModo("revisao")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${modo === "revisao" ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-slate-50 text-slate-500 hover:bg-slate-100 border border-transparent"}`}
        >
          <BookOpen size={16} /> Revisão Rápida
        </button>
      </div>

      {/* Área de rolagem de mensagens */}
      <div className="flex-1 overflow-y-auto px-4 py-8 flex flex-col items-center">
        <div className="w-full max-w-3xl flex flex-col gap-8">
          
          {mensagens.map((msg, idx) => (
            <div key={idx} className={`flex gap-4 w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="w-9 h-9 rounded-full bg-blue-600 border-2 border-white shadow-sm flex items-center justify-center shrink-0 mt-1">
                  <Bot size={18} className="text-white" />
                </div>
              )}
              <div
                className={`max-w-[85%] sm:max-w-[75%] px-5 py-4 text-[15px] leading-relaxed overflow-x-auto shadow-sm ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-2xl rounded-tr-sm"
                    : "bg-white text-slate-700 border border-slate-200 rounded-2xl rounded-tl-sm"
                }`}
              >
                {msg.role === "user" ? (
                  msg.conteudo
                ) : (
                  <div className="prose prose-sm prose-slate max-w-none break-words">
                    <ReactMarkdown
                      remarkPlugins={[remarkMath, remarkGfm]}
                      rehypePlugins={[rehypeKatex]}
                    >
                      {msg.conteudo}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-4 w-full justify-start items-center">
              <div className="w-9 h-9 rounded-full bg-blue-600 border-2 border-white shadow-sm flex items-center justify-center shrink-0">
                <Bot size={18} className="text-white" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm flex items-center gap-1.5 h-[52px]">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
              </div>
            </div>
          )}
          
          <div ref={mensagensEndRef} className="h-4" />
        </div>
      </div>

      {/* Input Moderno */}
      <div className="shrink-0 bg-slate-50 px-4 pt-2 pb-6 flex justify-center border-t border-slate-200/50">
        <form onSubmit={enviarMensagem} className="w-full max-w-3xl relative flex items-center group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Pergunte ao tutor (Modo ${modo})...`}
            className="w-full bg-white border border-slate-300 rounded-full pl-6 pr-14 py-3.5 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-slate-800 text-sm sm:text-base shadow-sm transition-all"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="absolute right-2 p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center"
          >
            <Send size={18} className={input.trim() && !loading ? "translate-x-[1px] translate-y-[-1px]" : ""} />
          </button>
        </form>
      </div>
    </div>
  );
}