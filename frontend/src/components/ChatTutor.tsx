"use client";

// 1. ADICIONE O useRef AQUI NA IMPORTAÇÃO
import { useEffect, useState, useRef } from "react";
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import { toast } from 'sonner';
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
    { role: "assistant", conteudo: "Olá! Sou seu tutor de IA. Em que conceito você está com dúvida hoje?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // 2. CRIE A REFERÊNCIA INVISÍVEL
  const mensagensEndRef = useRef<HTMLDivElement>(null);

  // 3. CRIE A FUNÇÃO QUE FORÇA A ROLAGEM SUAVE
  const scrollToBottom = () => {
    mensagensEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 4. ATIVE A ROLAGEM SEMPRE QUE A LISTA DE MENSAGENS MUDAR
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
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Erro na conexão com o servidor do tutor.");
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
          .catch(err => console.error("Erro ao gerar título automático:", err));
      }

    } catch (error) {
      console.error("Erro no fluxo do chat:", error);
      toast.error("Opa! A mensagem não pôde ser enviada. Verifique sua conexão.");
      setInput(textoDigitado);

      setMensagens((prev) => {
        const novoArray = [...prev];
        if (novoArray.length > 0 && novoArray[novoArray.length - 1].role === "assistant") {
          novoArray.pop(); 
        }
        if (novoArray.length > 0 && novoArray[novoArray.length - 1].role === "user") {
          novoArray.pop();
        }
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
            setMensagens([{ role: "assistant", conteudo: "Olá! Sou seu tutor de IA. Em que conceito você está com dúvida hoje?" }]);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar histórico:", error);
      }
    }
    
    if (conversaId) {
      buscarHistorico();
    }
  }, [conversaId]);

  return (
    // Trocamos o h-full por h-[600px] para travar o tamanho da caixa
<div className="bg-white flex flex-col h-[calc(100dvh-200px)] w-full rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
        <h2 className="text-white font-semibold">Tutor Interativo</h2>
      </div>

      {/* Como a caixa de cima agora tem um limite, esta div aqui vai criar a rolagem interna! */}
      <div className="flex-1 p-6 overflow-y-auto bg-gray-50 flex flex-col gap-4">
        {mensagens.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm overflow-x-auto ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-br-none shadow-sm"
                  : "bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm"
              }`}
            >
              {msg.role === "user" ? (
                msg.conteudo
              ) : (
                <div className="prose prose-sm max-w-none text-gray-800 break-words">
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
          <div className="flex justify-start">
            <div className="bg-white text-gray-500 border border-gray-200 rounded-2xl rounded-bl-none px-4 py-3 text-sm shadow-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
            </div>
          </div>
        )}
        
        {/* 5. A ÂNCORA INVISÍVEL NO FINAL DA LISTA DE MENSAGENS */}
        <div ref={mensagensEndRef} />
      </div>

       {/* Trocamos p-4 por px-4 pt-4 pb-3 para espremer o fundo */}
  <form onSubmit={enviarMensagem} className="shrink-0 px-4 pt-4 pb-3 bg-white border-t border-gray-100 flex flex-col gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Digite sua dúvida..."
          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-black text-sm sm:text-base shadow-sm"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base shadow-sm uppercase tracking-wide"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}