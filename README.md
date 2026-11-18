# D'VALLE Assessoria

Site de portfólio da D'VALLE Assessoria (cerimonial e assessoria de casamentos, Recife/RMR e online), pensado para receber o público vindo do Instagram.
Estética "Filigrana": creme, dourado antigo, Cormorant + caligrafia Pinyon Script, ornamentos em SVG que se desenham na tela.

## Começar localmente

```bash
npm install
cp .env.example .env.local   # preencha SESSION_SECRET e, sem Supabase, ADMIN_EMAIL/ADMIN_PASSWORD
npm run dev
```

- Site: `http://localhost:3000`
- Todos os eventos: `http://localhost:3000/eventos`
- Painel: `http://localhost:3000/admin` (link discreto "Área restrita" no rodapé)

## Páginas

- **Início** mostra até 6 eventos: primeiro os marcados como **Destaque** no painel, depois os mais recentes. Com mais eventos, aparece o botão "Ver todos os eventos".
- **/eventos** lista todo o portfólio, 9 por vez ("Carregar mais"), com filtro por categoria. O filtro só aparece quando existe mais de uma categoria publicada, sempre com Casamentos primeiro.
- **/eventos/[slug]** é o álbum: descrição, grade de fotos, lightbox e botão de compartilhar.

Categorias: Casamentos, 15 Anos, Aniversários e Corporativos (`lib/types.ts`).

## Painel do cliente

No `/admin` o cliente cadastra eventos com título, categoria, data, local, descrição e fotos, escolhe a capa, ordena as fotos, marca destaques, publica ou deixa como rascunho.
As fotos são redimensionadas no próprio navegador (WEBP, 2000px + miniatura de 720px) antes do envio, o que mantém cada requisição abaixo do limite de 4,5 MB da Vercel.

### Acesso

- **Com Supabase (produção):** o login usa o Supabase Auth. Nenhuma senha fica no código ou na Vercel. O administrador recebe um convite por e-mail, cria a própria senha e pode usar "Esqueci minha senha".
  - Só entra quem estiver em `ADMIN_EMAILS` (e-mails separados por vírgula). Lista vazia = ninguém entra.
  - Cada login fica registrado na tabela `admin_sessions`: sair, trocar a senha, remover o usuário no Supabase ou tirá-lo de `ADMIN_EMAILS` derruba o acesso na hora.
  - O link de "definir senha" só aceita tokens de convite/recuperação recentes, e os links de e-mail sempre usam `NEXT_PUBLIC_SITE_URL` (obrigatória).
- **Sem Supabase (desenvolvimento):** vale o `ADMIN_EMAIL` / `ADMIN_PASSWORD` do `.env.local`.

### Dados

Toda a leitura e gravação passa por `lib/store.ts`:

- **Supabase:** eventos na tabela `events`, fotos no bucket `eventos`.
- **Local:** tudo em `storage/` (fora do Git).

## Publicar na Vercel + Supabase

1. Crie um projeto em [supabase.com](https://supabase.com) (região São Paulo).
2. No **SQL Editor**, rode o conteúdo de [`supabase/schema.sql`](supabase/schema.sql). Ele cria as tabelas (`events`, `admin_sessions`) e o bucket de fotos. Pode rodar de novo após atualizações: não apaga dados.
3. Em **Authentication → Sign In / Providers**, desligue **Allow new users to sign up**. Assim só entra quem for convidado.
4. Em **Authentication → URL Configuration**, coloque o endereço do site em *Site URL* e adicione `https://SEU-DOMINIO/admin/definir-senha` em *Redirect URLs*.
5. Em **Project Settings → API**, copie a *Project URL* e a chave *service_role*.
6. Suba o código para o GitHub e importe o repositório na [Vercel](https://vercel.com/new).
7. Em **Settings → Environment Variables** da Vercel, cadastre `SESSION_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_EMAILS` e `NEXT_PUBLIC_SITE_URL` (veja `.env.example`).
8. Faça o deploy e convide o administrador (com as mesmas variáveis no `.env.local`):

   ```bash
   npm run convidar -- email@do.cliente
   ```

   Também dá para convidar pelo painel do Supabase (Authentication → Users → Invite user).

## Levar álbuns locais para o Supabase

Os eventos cadastrados sem Supabase ficam em `storage/`. Para enviá-los ao Supabase (com as chaves no `.env` e o `schema.sql` já rodado):

```bash
npm run migrar -- --simular   # confere a conexão e lista o que seria enviado
npm run migrar                # envia eventos e fotos
```

Pode rodar de novo sem duplicar nada, e os arquivos locais não são apagados.

## Estrutura

- `app/page.tsx`: página inicial (hero, destaques, assessoria, sobre, contato)
- `app/eventos/page.tsx`: portfólio completo
- `app/eventos/[slug]`: página de cada álbum
- `app/admin`: login, recuperação e definição de senha, lista e formulário de eventos
- `app/api/admin/upload`: recebe as fotos já otimizadas
- `app/media/[file]`: serve as fotos no modo local
- `lib/supabase.ts`, `lib/store.ts`, `lib/auth.ts`: Supabase, dados e sessão
- `components/ornaments.tsx`: monograma, cantos de filigrana e divisores animados
