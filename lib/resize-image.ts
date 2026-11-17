/** Redimensiona e comprime a foto no navegador (respeitando a orientação EXIF). */

async function encode(source: CanvasImageSource, w: number, h: number, quality: number, type?: string) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, 0, 0, w, h);
  const toBlob = (t: string) => new Promise<Blob | null>((r) => canvas.toBlob(r, t, quality));
  if (type) return (await toBlob(type))!;
  // Safari antigo não gera WEBP (devolve PNG); nesse caso usamos JPEG.
  const webp = await toBlob("image/webp");
  if (webp?.type === "image/webp") return webp;
  const jpeg = await toBlob("image/jpeg");
  if (!jpeg) throw new Error("Não foi possível comprimir a imagem.");
  return jpeg;
}

function fit(w: number, h: number, max: number) {
  const scale = Math.min(1, max / Math.max(w, h));
  return [Math.round(w * scale), Math.round(h * scale)] as const;
}

export async function resizeImage(file: File) {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error("Formato não suportado neste navegador. Envie JPG ou PNG.");
  }
  try {
    const [w, h] = fit(bitmap.width, bitmap.height, 2000);
    const full = await encode(bitmap, w, h, 0.82);
    const [tw, th] = fit(bitmap.width, bitmap.height, 720);
    const thumb = await encode(bitmap, tw, th, 0.74, full.type);
    return { full, thumb, width: w, height: h };
  } finally {
    bitmap.close();
  }
}
