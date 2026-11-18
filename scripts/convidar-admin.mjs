// Envia o convite de acesso ao painel. A pessoa recebe um e-mail e cria a própria senha.
// Uso: npm run convidar -- email@do.cliente
// Lê SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY e NEXT_PUBLIC_SITE_URL do .env (ou .env.local).
import { createClient } from "@supabase/supabase-js";

const email = process.argv[2]?.trim().toLowerCase();
const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SITE_URL } = process.env;

if (!email || !email.includes("@")) {
  console.error("Informe o e-mail: npm run convidar -- email@do.cliente");
  process.exit(1);
}
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !NEXT_PUBLIC_SITE_URL) {
  console.error("Defina SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY e NEXT_PUBLIC_SITE_URL no .env.");
  process.exit(1);
}

const allowed = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
if (!allowed.includes(email)) {
  console.error(`${email} não está em ADMIN_EMAILS. Adicione o e-mail no .env e na Vercel antes de convidar, senão o login será recusado.`);
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const { error } = await supabase.auth.admin.inviteUserByEmail(email, {
  redirectTo: `${NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")}/admin/definir-senha`,
});

if (error) {
  console.error(`Não foi possível convidar: ${error.message}`);
  process.exit(1);
}
console.log(`Convite enviado para ${email}. O link vale por 24 horas.`);
