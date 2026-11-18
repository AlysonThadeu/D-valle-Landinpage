-- D'VALLE Assessoria: rode no Supabase (SQL Editor > New query > Run).
-- Pode ser executado de novo sem perder dados: só cria o que falta e corrige o bucket.

-- Tabela de eventos
create table if not exists public.events (
  id          uuid primary key,
  slug        text not null unique,
  title       text not null,
  description text not null default '',
  category    text not null check (category in ('casamento', '15-anos', 'aniversario', 'corporativo')),
  location    text not null default '',
  date        text not null default '',          -- AAAA-MM-DD ou vazio
  cover_id    text,
  photos      jsonb not null default '[]'::jsonb, -- [{id, src, thumb, width, height}]
  published   boolean not null default false,
  featured    boolean not null default false,       -- aparece na página inicial
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Só o servidor do site (chave service_role) acessa a tabela.
-- Com RLS ligado e nenhuma política, a chave pública (anon) não lê nem grava nada.
alter table public.events enable row level security;

-- Bucket público para as fotos (leitura aberta, gravação apenas pelo servidor)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('eventos', 'eventos', true, 5242880, array['image/webp', 'image/jpeg'])
on conflict (id) do update set
  public             = excluded.public,
  file_size_limit    = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Sessões do painel. Cada login é uma linha: apagar a linha derruba o acesso na hora
-- (logout, troca de senha). Remover o usuário em Authentication > Users apaga as sessões dele.
create table if not exists public.admin_sessions (
  id          uuid primary key,
  user_id     uuid not null references auth.users (id) on delete cascade,
  email       text not null,
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null
);
create index if not exists admin_sessions_user_id_idx on public.admin_sessions (user_id);
alter table public.admin_sessions enable row level security;
