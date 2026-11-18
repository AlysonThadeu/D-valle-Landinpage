import { isAdmin } from "@/lib/auth";
import { isPhotoMime, storePhoto } from "@/lib/store";

// A Vercel limita o corpo da requisição a ~4,5 MB; as fotos chegam já redimensionadas pelo navegador.
const MAX_BYTES = 4 * 1024 * 1024;

function hasSignature(buf: Buffer, mime: string) {
  if (mime === "image/jpeg") return buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
  if (mime === "image/webp") return buf.length > 12 && buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP";
  return false;
}

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

  const fullBuf = Buffer.from(await full.arrayBuffer());
  const thumbBuf = Buffer.from(await thumb.arrayBuffer());
  // Confere a assinatura real do arquivo (não confia só no tipo informado pelo navegador)
  if (!hasSignature(fullBuf, full.type) || !hasSignature(thumbBuf, full.type)) {
    return Response.json({ error: "Arquivo de imagem inválido." }, { status: 400 });
  }

  try {
    const photo = await storePhoto(
      fullBuf,
      thumbBuf,
      full.type,
      { width: Math.round(width), height: Math.round(height) },
    );
    return Response.json(photo);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Não foi possível salvar a imagem." }, { status: 500 });
  }
}
