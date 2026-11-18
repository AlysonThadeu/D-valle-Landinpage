import { promises as fs } from "node:fs";
import path from "node:path";
import { UPLOAD_DIR, usingSupabase } from "@/lib/store";

// Usado apenas no modo local (sem Supabase). Em produção as fotos vêm do Supabase Storage.
export async function GET(_req: Request, ctx: RouteContext<"/media/[file]">) {
  if (usingSupabase) return new Response("Not found", { status: 404 });
  const { file } = await ctx.params;
  const match = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(?:-t)?\.(webp|jpg)$/.exec(file);
  if (!match) return new Response("Not found", { status: 404 });
  try {
    const data = await fs.readFile(path.join(UPLOAD_DIR, file));
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": match[1] === "webp" ? "image/webp" : "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
