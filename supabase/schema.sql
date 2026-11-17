-- D'VALLE Assessoria: rode uma vez no Supabase (SQL Editor > New query > Run).

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
on conflict (id) do nothing;
