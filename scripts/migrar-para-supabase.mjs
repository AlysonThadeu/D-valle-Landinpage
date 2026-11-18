// Leva os álbuns cadastrados localmente (pasta storage/) para o Supabase.
//
// Uso:
//   npm run migrar -- --simular   mostra o que seria enviado, sem gravar nada
//   npm run migrar                envia de verdade
//
// Pode rodar mais de uma vez: eventos e fotos que já existem são atualizados, não duplicados.
// Os arquivos locais NÃO são apagados.
// Lê SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY e SUPABASE_BUCKET do .env (ou .env.local).
import { readFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const SIMULAR = process.argv.includes("--simular");
const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
const BUCKET = process.env.SUPABASE_BUCKET || "eventos";
const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "storage");
const UPLOAD_DIR = path.join(DATA_DIR, "uploads");

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env antes de migrar.");
  process.exit(1);
}

let events;
try {
  events = JSON.parse(await readFile(path.join(DATA_DIR, "events.json"), "utf8"));
} catch {
  console.error(`Não encontrei ${path.join(DATA_DIR, "events.json")}. Nada para migrar.`);
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const bucket = supabase.storage.from(BUCKET);

// Confere se o schema.sql já foi rodado
const check = await supabase.from("events").select("id", { count: "exact", head: true });
if (check.error) {
  console.error(`Não consegui acessar a tabela "events": ${check.error.message}`);
  console.error("Rode o arquivo supabase/schema.sql no SQL Editor do Supabase e tente de novo.");
  process.exit(1);
}
const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
if (bucketError || !buckets.some((b) => b.id === BUCKET)) {
  console.error(`O bucket "${BUCKET}" não existe. Rode o supabase/schema.sql no SQL Editor do Supabase.`);
  process.exit(1);
}

const fileName = (url) => url.split("?")[0].split("/").pop();
const mimeOf = (name) => (name.endsWith(".webp") ? "image/webp" : "image/jpeg");
// Só aceita o formato de nome que o site gera (<uuid>.ext / <uuid>-t.ext)
const SAFE_NAME = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(?:-t)?\.(?:webp|jpg)$/;
const UPLOAD_ROOT = path.resolve(UPLOAD_DIR) + path.sep;
/** Caminho seguro dentro de uploads/, ou null se o nome for suspeito. */
function safeUploadPath(name) {
  if (!SAFE_NAME.test(name)) return null;
  const target = path.resolve(UPLOAD_DIR, path.basename(name));
  return target.startsWith(UPLOAD_ROOT) ? target : null;
}

console.log(`${SIMULAR ? "[SIMULAÇÃO] " : ""}${events.length} evento(s) encontrados em ${DATA_DIR}\n`);

let totalFiles = 0;
let failures = 0;

for (const event of events) {
  console.log(`• ${event.title}  (${event.photos.length} fotos${event.published ? "" : ", rascunho"})`);
  const photos = [];

  for (const photo of event.photos) {
    const names = { src: fileName(photo.src), thumb: fileName(photo.thumb) };
    if (!safeUploadPath(names.src) || !safeUploadPath(names.thumb)) {
      failures++;
      console.error(`    ✗ foto ignorada: nome de arquivo inválido (${names.src})`);
      continue;
    }
    const urls = {};
    for (const [key, name] of Object.entries(names)) {
      urls[key] = bucket.getPublicUrl(name).data.publicUrl;
      if (SIMULAR) {
        totalFiles++;
        continue;
      }
      try {
        const data = await readFile(safeUploadPath(name));
        const { error } = await bucket.upload(name, data, {
          contentType: mimeOf(name),
          cacheControl: "31536000",
          upsert: true,
        });
        if (error) throw error;
        totalFiles++;
      } catch (error) {
        failures++;
        console.error(`    ✗ ${name}: ${error.message ?? error}`);
      }
    }
    photos.push({ ...photo, src: urls.src, thumb: urls.thumb });
  }

  const row = {
    id: event.id,
    slug: event.slug,
    title: event.title,
    description: event.description ?? "",
    category: event.category,
    location: event.location ?? "",
    date: event.date ?? "",
    cover_id: event.coverId ?? null,
    photos,
    published: Boolean(event.published),
    featured: Boolean(event.featured),
    created_at: event.createdAt,
    updated_at: event.updatedAt,
  };

  if (SIMULAR) {
    console.log(`    → /eventos/${event.slug}`);
    continue;
  }
  const { error } = await supabase.from("events").upsert(row);
  if (error) {
    failures++;
    console.error(`    ✗ evento não salvo: ${error.message}`);
  } else {
    console.log(`    ✓ salvo → /eventos/${event.slug}`);
  }
}

console.log(
  `\n${SIMULAR ? "Simulação concluída" : "Migração concluída"}: ${events.length} evento(s), ${totalFiles} arquivo(s)${failures ? `, ${failures} falha(s)` : ""}.`,
);
if (SIMULAR) console.log("Nada foi gravado. Para enviar de verdade: npm run migrar");
else if (!failures) console.log("Depois do deploy, salve qualquer evento no painel (ou faça um novo deploy) para o site exibir os álbuns.");
process.exit(failures ? 1 : 0);
