"use client";
import { useState } from 'react';
import { toast } from 'sonner';

// Agora o modal recebe a fotoAtual e bioAtual do page.tsx
export default function ModalPerfil({ nomeAtual, fotoAtual, bioAtual, alunoId, aoSalvar, fechar }: any) {
  const [novoNome, setNovoNome] = useState(nomeAtual || "");
  const [fotoUrl, setFotoUrl] = useState(fotoAtual || "");
  const [bio, setBio] = useState(bioAtual || "");
  const [loading, setLoading] = useState(false);
  const [fazendoUploadFoto, setFazendoUploadFoto] = useState(false);

   // 1. O encodeURIComponent transforma espaços em "%20", garantindo que a URL não quebre!
  const nomeFormatado = encodeURIComponent(novoNome || "User");
  
  // 2. Usamos o nome formatado e adicionamos um fallback super seguro
  const avatarPreview = fotoUrl || `https://ui-avatars.com/api/?name=${nomeFormatado}&background=eff6ff&color=2563eb&size=128`;
  // Função para subir a imagem física para o backend
  async function handleUploadFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFazendoUploadFoto(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`http://localhost:8000/alunos/${alunoId}/foto`, {
        method: "POST",
        body: formData,
      });
      
      if (!res.ok) throw new Error("Erro no upload");
      
      const data = await res.json();
      setFotoUrl(data.url);
      toast.success("Foto alterada!"); // Aviso elegante
      
    } catch (error) {
      toast.error("Falha ao enviar a imagem. Verifique o tamanho do arquivo.");
    } finally {
      setFazendoUploadFoto(false);
    }
  }

  async function salvar() {
  setLoading(true);
  try {
    const res = await fetch(`http://localhost:8000/alunos/${alunoId}/perfil`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: novoNome, foto_url: fotoUrl, bio: bio })
    });
    
    if (!res.ok) throw new Error("Erro ao comunicar com o servidor.");

    aoSalvar({ nome: novoNome, foto_url: fotoUrl, bio: bio });
    fechar();
    
    // Feedback de Sucesso!
    toast.success("Perfil atualizado com sucesso!");
    
  } catch (error) {
    console.error(error);
    // Feedback de Erro!
    toast.error("Não foi possível salvar o perfil. Tente novamente.");
  } finally {
    setLoading(false);
  }
}

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100">
        
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-800">O Meu Perfil</h2>
          <button onClick={fechar} className="text-gray-400 hover:bg-gray-200 p-1 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 space-y-5">
          
          {/* O Avatar agora é um botão de Upload disfarçado */}
          <div className="flex flex-col items-center justify-center mb-2">
            <label className={`relative cursor-pointer group ${fazendoUploadFoto ? 'opacity-50' : 'hover:opacity-90'}`}>
              <img 
                src={avatarPreview} 
                alt="Preview do Perfil" 
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md bg-gray-100 transition-all"
                onError={(e) => {
                  // Se a foto do servidor falhar, ele força o avatar de iniciais
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${nomeFormatado}&background=fecaca&color=dc2626&size=128`;
                }}
              />
              {/* Overlay escura que aparece quando passa o mouse */}
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-xs font-bold">Mudar Foto</span>
              </div>
              {/* O input de arquivo escondido */}
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleUploadFoto}
                disabled={fazendoUploadFoto}
              />
            </label>
            {fazendoUploadFoto && <p className="text-xs text-blue-600 mt-2 font-medium">Carregando foto...</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Nome Completo</label>
            <input 
              className="w-full border border-gray-300 px-4 py-2.5 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500" 
              value={novoNome} 
              onChange={(e) => setNovoNome(e.target.value)} 
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Biografia Acadêmica</label>
            <textarea 
              className="w-full border border-gray-300 px-4 py-3 rounded-lg text-gray-800 h-24 resize-none focus:ring-2 focus:ring-blue-500" 
              placeholder="Ex: Estudante da UFERSA apaixonado por Lógica..." 
              value={bio} 
              onChange={(e) => setBio(e.target.value)} 
            />
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3 justify-end rounded-b-2xl">
          <button onClick={fechar} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            Cancelar
          </button>
          <button onClick={salvar} disabled={loading || fazendoUploadFoto} className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
            {loading ? "Salvando..." : "Salvar Perfil"}
          </button>
        </div>
        
      </div>
    </div>
  );
}