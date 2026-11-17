import { isAdmin } from "@/lib/auth";
import { isPhotoMime, storePhoto } from "@/lib/store";

// A Vercel limita o corpo da requisição a ~4,5 MB; as fotos chegam já redimensionadas pelo navegador.
const MAX_BYTES = 4 * 1024 * 1024;

export async function POST(request: Request) {
  if (!(await isAdmin())) return Response.json({ error: "Sessão expirada. Entre novamente." }, { status: 401 });

  const form = await request.formData();
  const full = form.get("full");
  const thumb = form.get("thumb");
  const width = Number(form.get("width"));
  const height = Number(form.get("height"));

  if (!(full instanceof File) || !(thumb instanceof File)) return Response.json({ error: "Arquivo ausente." }, { status: 400 });
  if (!isPhotoMime(full.type) || full.type !== thumb.type) return Response.json({ error: "Formato não suportado." }, { status: 400 });
  if (full.size + thumb.size > MAX_BYTES) return Response.json({ error: "Imagem grande demais após compressão." }, { status: 413 });
  if (!(width > 0 && height > 0 && width <= 4000 && height <= 4000)) return Response.json({ error: "Dimensões inválidas." }, { status: 400 });

  try {
    const photo = await storePhoto(
      Buffer.from(await full.arrayBuffer()),
      Buffer.from(await thumb.arrayBuffer()),
      full.type,
      { width: Math.round(width), height: Math.round(height) },
    );
    return Response.json(photo);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Não foi possível salvar a imagem." }, { status: 500 });
  }
}
