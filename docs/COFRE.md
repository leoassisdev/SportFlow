# Cofre de Segredos — SportFlow

**Regra sagrada:** Nenhum segredo entra no repositorio. Todos os arquivos
sensiveis ficam em `.cofre/` (gitignored) ou no gerenciador de senhas.

---

## Segredos utilizados pelo SportFlow

| Segredo | Onde ele vai | Como referenciar |
|---------|--------------|------------------|
| **Google OAuth Client ID** | `.env` local (dev) + Azure App Service Configuration (prod) | `GOOGLE_CLIENT_ID` |
| **Google OAuth Client Secret** | `.env` local (dev) + Azure App Service Configuration (prod) | `GOOGLE_CLIENT_SECRET` |
| **Google OAuth Redirect URI** | `.env` (não e segredo, mas fica junto) | `GOOGLE_REDIRECT_URI` |
| **Stripe Secret Key (live)** | `.cofre/stripe.md` + Azure App Service Config | `STRIPE_SECRET_KEY` |
| **Stripe Webhook Secret** | `.cofre/stripe.md` + Azure | `STRIPE_WEBHOOK_SECRET` |
| **JWT Access Secret** | `.env` local (dev), rotacionado tri em prod (Azure) | `JWT_ACCESS_SECRET` |
| **JWT Refresh Secret** | `.env` + Azure | `JWT_REFRESH_SECRET` |
| **Azure Blob Connection String** | `.cofre/azure.md` + Azure App Service Config | `AZURE_BLOB_CONNECTION_STRING` |
| **Publish Profile API/WEB** | GitHub Secrets (`AZURE_WEBAPP_PUBLISH_PROFILE_API/WEB`) | via workflow |

---

## Como configurar Google OAuth (passo a passo)

### 1. Criar credencial no Google Cloud Console

1. https://console.cloud.google.com → seleciona/cria projeto "SportFlow"
2. Menu → APIs & Services → Credentials
3. "+ Create Credentials" → OAuth client ID
4. Se pedir OAuth consent screen primeiro:
   - User Type: External
   - App name: SportFlow
   - Support email: leo@ ...
   - Developer contact: leo@ ...
   - Scopes: `openid`, `email`, `profile` (obrigatórios)
   - Test users: emails que farao login em dev
5. Application type: Web application
6. Name: SportFlow (dev) [e crie outro separado pra prod]
7. Authorized JavaScript origins:
   - Dev: `http://localhost:3000`
   - Prod: `https://sportflow.com.br`
8. Authorized redirect URIs:
   - Dev: `http://localhost:3001/api/v1/auth/google/callback`
   - Prod: `https://api.sportflow.com.br/api/v1/auth/google/callback`
9. Copia Client ID e Client Secret.

### 2. Guardar em `.cofre/google-oauth.md`

```md
# Google OAuth — SportFlow

## Dev (localhost)
- Client ID: 1234567890-xxxxxxxxx.apps.googleusercontent.com
- Client Secret: GOCSPX-XXXXXXXXXXXXXXXXX
- Redirect URI: http://localhost:3001/api/v1/auth/google/callback

## Prod
- Client ID: 9876543210-yyyyyyyyy.apps.googleusercontent.com
- Client Secret: GOCSPX-YYYYYYYYYYYYYYYYY
- Redirect URI: https://api.sportflow.com.br/api/v1/auth/google/callback
```

### 3. Copiar pro `.env` (dev)

```env
GOOGLE_CLIENT_ID="1234567890-xxxxxxxxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-XXXXXXXXXXXXXXXXX"
GOOGLE_REDIRECT_URI="http://localhost:3001/api/v1/auth/google/callback"
```

### 4. Em prod (Azure App Service)

Portal Azure → sportflow-api → Configuration → Application settings:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI`

Nunca colocar essas vars num arquivo commitado. Nunca colocar em log.

---

## Checklist antes de commitar

- [ ] `git ls-files | grep -iE '\.cofre|client_secret|GOCSPX|whsec_'` retorna VAZIO
- [ ] `git ls-files | grep -iE '\.env$'` retorna VAZIO (só `.env.example` OK)
- [ ] `git ls-files | xargs grep -l "GOCSPX-" 2>/dev/null` retorna VAZIO

---

## Se vazou

1. Google Cloud Console → Credentials → editar OAuth client → "Reset secret"
2. Atualizar `.env` local + Azure App Service Config
3. Trocar o secret no `.cofre/google-oauth.md`
4. `git filter-repo` ou BFG pra remover do histórico se necessario
5. Push force (avisar time antes)
6. Registrar incidente em `docs/incidentes.md`

---

## Rotacao periódica

| Segredo | Periodicidade | Responsável |
|---------|---------------|-------------|
| Google Client Secret | 6 meses | SuperAdmin |
| JWT Access/Refresh | 3 meses | SuperAdmin |
| Stripe Secret (live) | 12 meses | SuperAdmin |
| Azure Publish Profile | 12 meses | SuperAdmin |
