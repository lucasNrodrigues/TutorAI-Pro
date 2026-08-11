"use client";
import { useEffect, useState } from 'react';
import DashboardProgresso from '@/components/DashboardProgresso'; // Importamos o gráfico que já existe!

export default function DashboardProfessor({ emailProfessor }: { emailProfessor: string }) {
  const [alunos, setAlunos] = useState<any[]>([]);
  // Novo estado para controlar qual aluno o professor quer ver
  const [alunoSelecionado, setAlunoSelecionado] = useState<number | null>(null);
  const [mensagemUpload, setMensagemUpload] = useState("");
  const [fazendoUpload, setFazendoUpload] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFazendoUpload(true);
    setMensagemUpload("Enviando arquivo...");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:8000/admin/upload/", {
        method: "POST",
        body: formData, // Quando enviamos arquivo, não usamos JSON.stringify
      });
      const data = await res.json();
      
      if (res.ok) {
        setMensagemUpload("✅ " + data.mensagem);
      } else {
        setMensagemUpload("❌ Erro: " + data.detail);
      }
    } catch (error) {
      setMensagemUpload("❌ Erro de conexão com o servidor.");
    } finally {
      setFazendoUpload(false);
    }
  }

  // Se nenhum aluno foi clicado, mostramos a tabela normal
  return (
    <div className="w-full max-w-7xl bg-white p-8 rounded-xl shadow-sm border border-gray-100">
      
      {/* Cabeçalho do Painel com o Botão de Upload */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Painel de Controle da Turma</h2>
        
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{mensagemUpload}</span>
          <label className={`cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition ${fazendoUpload ? "opacity-50" : ""}`}>
            {fazendoUpload ? "Processando..." : "Subir PDF da Aula"}
            <input 
              type="file" 
              accept="application/pdf" 
              className="hidden" 
              onChange={handleUpload}
              disabled={fazendoUpload}
            />
          </label>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-600">
              <th className="p-4 font-semibold">Nome do Aluno</th>
              <th className="p-4 font-semibold">Email</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold">Ação</th>
            </tr>
          </thead>
          <tbody>
            {alunos.map((aluno) => (
              <tr key={aluno.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-4 flex items-center gap-3">
                  <img src={aluno.foto_url || `https://ui-avatars.com/api/?name=${aluno.nome}`} className="w-8 h-8 rounded-full" />
                  <span className="font-medium text-gray-800">{aluno.nome}</span>
                </td>
                <td className="p-4 text-gray-600">{aluno.email}</td>
                <td className="p-4">
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">Ativo</span>
                </td>
                <td className="p-4">
                  {/* Adicionamos a ação de clique aqui */}
                  <button 
                    onClick={() => setAlunoSelecionado(aluno.id)}
                    className="text-blue-600 hover:underline text-sm font-medium"
                  >
                    Ver Desempenho
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}