# DUST — Museu do Inusitado

Uma rede social em forma de museu: publique coisas estranhas, inúteis ou
esquecidas, conte suas histórias e descubra as peças da comunidade. O app usa
Expo/React Native e funciona na web, iOS e Android.

## O que já está pronto

- Cadastro e login por e-mail, com sessão persistente e confirmação por e-mail.
- Acervo pesquisável por texto e categoria; busca de visitantes.
- Perfis públicos, seguidores, feed de quem você segue e edição do próprio perfil.
- Publicações com descrição, categoria, imagem e história; curtidas, comentários
  e itens salvos.
- Fotos escolhidas diretamente da biblioteca do dispositivo, sem campo de link.
- Atividades para novos seguidores, curtidas, comentários e peças publicadas.
- Visita de demonstração sem cadastro, com interações salvas localmente no
  dispositivo quando o Supabase não está configurado.
- Interface adaptável a celular e desktop, com a identidade visual do DUST.
- Navegação inferior persistente nas telas sociais e cartões de publicação
  redesenhados para uma experiência de feed mais familiar.
- Supabase com políticas de segurança por linha (RLS) e hospedagem web configurada
  para Vercel.

## Configurar o Supabase

1. Crie um projeto no [Supabase](https://supabase.com/dashboard).
2. No **SQL Editor** do projeto, execute o conteúdo de
   [`supabase/migrations/20261014000000_initial_schema.sql`](./supabase/migrations/20261014000000_initial_schema.sql).
   Isso cria tabelas, relações, notificações e políticas RLS.
3. Copie a URL do projeto e a chave **Publishable** da página **Connect**.
   A chave publishable é própria para apps cliente; nunca use nem publique a
   chave `service_role`.
4. Na raiz do projeto, crie `.env` a partir do modelo:

   ```powershell
   Copy-Item .env.example .env
   ```

5. Preencha `.env`:

   ```dotenv
   EXPO_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
   EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sua-chave-publishable
   ```

   Essas variáveis são incorporadas ao app web e mobile. A segurança dos dados
   vem das políticas RLS da migração, não de esconder a chave publishable.

Contas locais antigas não são migradas: por segurança, senhas não são copiadas
do armazenamento local. Cada visitante deverá criar uma conta nova no Supabase.

## Executar localmente

Requisitos: Node.js compatível com o Expo SDK 57 e npm.

```powershell
npm ci
npx expo start
```

Para testar a versão web de produção localmente:

```powershell
npm run build:web
npx expo serve
```

Os comandos `npm run lint` e `npm run typecheck` verificam estilo e TypeScript.

## Publicar na Vercel

1. Importe este repositório na [Vercel](https://vercel.com/new). O arquivo
   `vercel.json` configura o build de produção, a pasta `dist` e o fallback
   das rotas do Expo Router. O build falha de propósito se as variáveis do
   Supabase não estiverem configuradas.
2. Em **Settings → Environment Variables**, adicione
   `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` para
   Production, Preview e Development, conforme necessário.
3. Faça o deploy pelo painel ou, com a Vercel CLI autenticada, execute:

   ```powershell
   npm run deploy:web
   ```

4. No Supabase, ajuste **Authentication → URL Configuration**: defina a URL
   publicada como **Site URL** e inclua também as URLs locais e de preview
   necessárias em **Redirect URLs** para que as confirmações de cadastro
   retornem ao app.

Para alterar apenas a hospedagem, gere os arquivos estáticos com
`npm run build:web` e publique a pasta `dist` em qualquer host estático com
fallback de rota para `/`.

## Aplicativo iOS e Android

O mesmo projeto pode ser executado pelo Expo Go durante o desenvolvimento. Para
distribuição, configure uma conta Expo/EAS e gere builds com o perfil escolhido.
Nunca crie nem edite manualmente `ios/` ou `android/`; este projeto usa
Continuous Native Generation.
