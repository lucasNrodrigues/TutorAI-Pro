"use client";

import { useEffect, useState } from "react";
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

// 1. ADICIONAMOS A PROP 'onPrimeiraMensagem' AQUI
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

  async function enviarMensagem(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    // 2. A PORTA LÓGICA: Verifica se é o primeiro envio antes de atualizarmos a tela
    // (Pode ser 0 se veio do banco vazio, ou 1 por causa da saudação padrão)
    const ehPrimeiraMensagem = mensagens.length <= 1;

    const textoDigitado = input;
    const novaMensagem: Mensagem = { role: "user", conteudo: textoDigitado };
    
    setMensagens((prev) => [...prev, novaMensagem]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/chat/", {
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

      // 3. O GATILHO DO TÍTULO: Se for a primeira mensagem, chama o backend
      if (ehPrimeiraMensagem) {
        fetch(`http://localhost:8000/conversas/${conversaId}/gerar-titulo`, { method: "PUT" })
          .then(() => {
            if (onPrimeiraMensagem) onPrimeiraMensagem(); // Avisa a Sidebar para piscar/atualizar
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
        const res = await fetch(`http://localhost:8000/conversas/${conversaId}/mensagens`);
        if (res.ok) {
          const dados = await res.json();
          const mensagensFormatadas = dados.map((m: any) => ({
            role: m.role,
            conteudo: m.conteudo
          }));
          
          // Se o banco trouxer mensagens, usa elas. Se não, volta a saudação padrão.
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
    <div className="bg-white flex flex-col h-full w-full rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
        <h2 className="text-white font-semibold">Tutor Interativo</h2>
      </div>

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
      </div>

      <form onSubmit={enviarMensagem} className="p-3 sm:p-4 bg-white border-t border-gray-100 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Digite sua dúvida..."
          className="w-full flex-1 min-w-0 border border-gray-300 rounded-lg px-3 sm:px-4 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-black text-sm sm:text-base"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0 text-sm sm:text-base"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}