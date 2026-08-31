"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import {
  Camera,
  Check,
  Loader2,
  Save,
  UserRound,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface DadosPerfil {
  nome: string;
  foto_url: string;
  bio: string;
}

interface ModalPerfilProps {
  nomeAtual?: string;
  fotoAtual?: string;
  bioAtual?: string;
  alunoId: number;
  aoSalvar: (dados: DadosPerfil) => void;
  fechar: () => void;
}

export default function ModalPerfil({
  nomeAtual,
  fotoAtual,
  bioAtual,
  alunoId,
  aoSalvar,
  fechar,
}: ModalPerfilProps) {
  const [novoNome, setNovoNome] = useState(nomeAtual || "");
  const [fotoUrl, setFotoUrl] = useState(fotoAtual || "");
  const [bio, setBio] = useState(bioAtual || "");

  const [loading, setLoading] = useState(false);
  const [fazendoUploadFoto, setFazendoUploadFoto] =
    useState(false);

  const nomeFormatado = encodeURIComponent(
    novoNome || "Usuário"
  );

  const avatarPadrao = `https://ui-avatars.com/api/?name=${nomeFormatado}&background=eff6ff&color=2563eb&size=256&bold=true`;

  const avatarPreview = fotoUrl || avatarPadrao;

  /* ============================================================
     FECHAR COM ESC
  ============================================================ */

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !loading) {
        fechar();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [fechar, loading]);

  /* ============================================================
     UPLOAD DA FOTO
  ============================================================ */

  async function handleUploadFoto(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    /* Validação */

    if (!file.type.startsWith("image/")) {
      toast.error("Selecione uma imagem válida.");
      return;
    }

    const tamanhoMaximo = 5 * 1024 * 1024;

    if (file.size > tamanhoMaximo) {
      toast.error("A imagem deve ter no máximo 5 MB.");
      return;
    }

    setFazendoUploadFoto(true);

    const formData = new FormData();

    formData.append("file", file);

    try {
      const res = await fetch(
        `http://localhost:8000/alunos/${alunoId}/foto`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) {
        throw new Error("Erro no upload");
      }

      const data = await res.json();

      setFotoUrl(data.url);

      toast.success("Foto alterada com sucesso!");
    } catch (error) {
      console.error(error);

      toast.error(
        "Falha ao enviar a imagem. Verifique o arquivo e tente novamente."
      );
    } finally {
      setFazendoUploadFoto(false);

      event.target.value = "";
    }
  }

  /* ============================================================
     SALVAR PERFIL
  ============================================================ */

  async function salvar() {
    if (!novoNome.trim()) {
      toast.error("Informe seu nome.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `http://localhost:8000/alunos/${alunoId}/perfil`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nome: novoNome.trim(),
            foto_url: fotoUrl,
            bio: bio.trim(),
          }),
        }
      );

      if (!res.ok) {
        throw new Error(
          "Erro ao comunicar com o servidor."
        );
      }

      const dadosAtualizados: DadosPerfil = {
        nome: novoNome.trim(),
        foto_url: fotoUrl,
        bio: bio.trim(),
      };

      aoSalvar(dadosAtualizados);

      toast.success(
        "Perfil atualizado com sucesso!"
      );

      fechar();
    } catch (error) {
      console.error(error);

      toast.error(
        "Não foi possível salvar o perfil. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-slate-950/50
        p-4
        backdrop-blur-sm
        animate-in
        fade-in
        duration-200
      "
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          fechar();
        }
      }}
    >
      <div
        className="
          w-full
          max-w-lg
          overflow-hidden
          rounded-3xl
          border
          border-slate-200
          bg-white
          shadow-2xl
          shadow-slate-950/20
          animate-in
          fade-in
          zoom-in-95
          slide-in-from-bottom-3
          duration-200
        "
      >
        {/* ======================================================
            CABEÇALHO
        ====================================================== */}

        <div
          className="
            relative
            overflow-hidden
            border-b
            border-slate-100
            bg-gradient-to-br
            from-blue-50
            via-white
            to-white
            px-6
            py-5
          "
        >
          {/* Decoração */}

          <div
            className="
              absolute
              -right-10
              -top-10
              h-32
              w-32
              rounded-full
              bg-blue-100/50
              blur-2xl
            "
          />

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-xl
                  bg-blue-600
                  text-white
                  shadow-lg
                  shadow-blue-600/20
                "
              >
                <UserRound size={21} />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Meu Perfil
                </h2>

                <p className="text-xs text-slate-500">
                  Personalize suas informações
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={fechar}
              disabled={loading}
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-xl
                text-slate-400
                transition-colors
                hover:bg-white
                hover:text-slate-700
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
              aria-label="Fechar"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* ======================================================
            CONTEÚDO
        ====================================================== */}

        <div className="space-y-6 p-6">
          {/* AVATAR */}

          <div className="flex flex-col items-center">
            <label
              className={`
                group
                relative
                cursor-pointer
                ${
                  fazendoUploadFoto
                    ? "cursor-wait opacity-60"
                    : ""
                }
              `}
            >
              <div
                className="
                  absolute
                  -inset-1
                  rounded-full
                  bg-gradient-to-br
                  from-blue-400
                  to-indigo-500
                  opacity-20
                  blur-sm
                "
              />

              <img
                src={avatarPreview}
                alt="Foto do perfil"
                className="
                  relative
                  h-28
                  w-28
                  rounded-full
                  border-4
                  border-white
                  bg-slate-100
                  object-cover
                  shadow-lg
                  transition-transform
                  duration-200
                  group-hover:scale-[1.02]
                "
                onError={(event) => {
                  event.currentTarget.src =
                    avatarPadrao;
                }}
              />

              {/* OVERLAY */}

              <div
                className="
                  absolute
                  inset-0
                  flex
                  items-center
                  justify-center
                  rounded-full
                  bg-slate-950/50
                  opacity-0
                  transition-opacity
                  duration-200
                  group-hover:opacity-100
                "
              >
                {fazendoUploadFoto ? (
                  <Loader2
                    size={24}
                    className="
                      animate-spin
                      text-white
                    "
                  />
                ) : (
                  <Camera
                    size={25}
                    className="text-white"
                  />
                )}
              </div>

              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleUploadFoto}
                disabled={
                  fazendoUploadFoto || loading
                }
              />
            </label>

            <p className="mt-3 text-sm font-semibold text-slate-700">
              {fazendoUploadFoto
                ? "Enviando foto..."
                : "Alterar foto"}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              JPG, PNG ou WEBP • Máx. 5 MB
            </p>
          </div>

          {/* NOME */}

          <div>
            <label
              htmlFor="nome-perfil"
              className="
                mb-2
                block
                text-sm
                font-semibold
                text-slate-700
              "
            >
              Nome completo
            </label>

            <input
              id="nome-perfil"
              type="text"
              value={novoNome}
              onChange={(event) =>
                setNovoNome(event.target.value)
              }
              placeholder="Digite seu nome"
              disabled={loading}
              className="
                w-full
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                px-4
                py-3
                text-sm
                text-slate-800
                outline-none
                transition-all
                placeholder:text-slate-400
                hover:border-slate-300
                focus:border-blue-500
                focus:bg-white
                focus:ring-4
                focus:ring-blue-500/10
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            />
          </div>

          {/* BIO */}

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label
                htmlFor="bio-perfil"
                className="
                  block
                  text-sm
                  font-semibold
                  text-slate-700
                "
              >
                Biografia acadêmica
              </label>

              <span className="text-xs text-slate-400">
                {bio.length}/300
              </span>
            </div>

            <textarea
              id="bio-perfil"
              value={bio}
              maxLength={300}
              onChange={(event) =>
                setBio(event.target.value)
              }
              disabled={loading}
              placeholder="Conte um pouco sobre seus estudos..."
              className="
                min-h-[110px]
                w-full
                resize-none
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                px-4
                py-3
                text-sm
                leading-relaxed
                text-slate-800
                outline-none
                transition-all
                placeholder:text-slate-400
                hover:border-slate-300
                focus:border-blue-500
                focus:bg-white
                focus:ring-4
                focus:ring-blue-500/10
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            />
          </div>
        </div>

        {/* ======================================================
            RODAPÉ
        ====================================================== */}

        <div
          className="
            flex
            items-center
            justify-end
            gap-3
            border-t
            border-slate-100
            bg-slate-50/70
            px-6
            py-4
          "
        >
          <button
            type="button"
            onClick={fechar}
            disabled={loading}
            className="
              rounded-xl
              border
              border-slate-200
              bg-white
              px-5
              py-2.5
              text-sm
              font-semibold
              text-slate-600
              shadow-sm
              transition-all
              hover:bg-slate-50
              hover:text-slate-800
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={salvar}
            disabled={
              loading ||
              fazendoUploadFoto ||
              !novoNome.trim()
            }
            className="
              flex
              items-center
              gap-2
              rounded-xl
              bg-blue-600
              px-5
              py-2.5
              text-sm
              font-semibold
              text-white
              shadow-lg
              shadow-blue-600/20
              transition-all
              hover:bg-blue-700
              hover:shadow-blue-600/30
              disabled:cursor-not-allowed
              disabled:bg-slate-300
              disabled:shadow-none
            "
          >
            {loading ? (
              <>
                <Loader2
                  size={17}
                  className="animate-spin"
                />
                Salvando...
              </>
            ) : (
              <>
                <Save size={17} />
                Salvar alterações
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}