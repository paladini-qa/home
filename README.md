# Dashboard Pessoal Google

Um dashboard pessoal com estética glassmorphism que integra Google Tasks, Calendar e Drive.

![Dashboard Preview](https://via.placeholder.com/800x400?text=Dashboard+Preview)

## Features

- **Google Tasks**: Visualize e gerencie suas tarefas pendentes
- **Google Calendar**: Veja os próximos 7 dias de eventos
- **Google Drive**: Acesso rápido aos arquivos marcados com estrela
- **Design Glassmorphism**: Interface moderna com blur e transparências
- **100% Client-Side**: Seus dados ficam apenas no seu navegador

## Configuração

### 1. Criar projeto no Google Cloud Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Vá em **APIs & Services > Credentials**
4. Clique em **Create Credentials > OAuth client ID**
5. Selecione **Web application**
6. Adicione as origens JavaScript autorizadas:
   - Para desenvolvimento local: `http://localhost:3000`
   - Para produção: `https://SEU-USUARIO.github.io`
7. Copie o **Client ID** gerado

### 2. Habilitar APIs necessárias

No Google Cloud Console, habilite as seguintes APIs:

- [Google Tasks API](https://console.cloud.google.com/apis/library/tasks.googleapis.com)
- [Google Calendar API](https://console.cloud.google.com/apis/library/calendar-json.googleapis.com)
- [Google Drive API](https://console.cloud.google.com/apis/library/drive.googleapis.com)

### 3. Configurar variáveis de ambiente

Para desenvolvimento local, crie um arquivo `.env.local`:

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=seu-client-id.apps.googleusercontent.com
```

Para deploy no GitHub Pages, adicione o secret no repositório:

1. Vá em **Settings > Secrets and variables > Actions**
2. Adicione um novo secret: `GOOGLE_CLIENT_ID` com o valor do seu Client ID

### 4. Configurar GitHub Pages

1. Vá em **Settings > Pages**
2. Em **Source**, selecione **GitHub Actions**
3. O deploy será automático em cada push para `main`

## Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build
```

## Deploy

O deploy é automático via GitHub Actions. Basta fazer push para a branch `main`.

Se estiver usando um repositório com nome diferente do seu usuário, descomente e configure o `basePath` em `next.config.ts`:

```typescript
const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: '/nome-do-seu-repo',
  assetPrefix: '/nome-do-seu-repo/',
};
```

## Stack

- **Framework**: Next.js 14 (App Router, Static Export)
- **Styling**: Tailwind CSS
- **Auth**: Google Identity Services (OAuth2)
- **State**: Zustand
- **Icons**: Lucide React
- **Animations**: Framer Motion

## Licença

MIT
