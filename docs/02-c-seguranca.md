# Security Guardian — SportFlow

**Agente responsavel:** 02-c-SEGURANCA
**Escopo:** repositorio + pipeline + deploy Azure
**Status:** relatorio recorrente (nao bloqueia individual, mas exige verde antes de cada deploy)

---

## 1. Politica geral

- Nenhum segredo (token, senha, chave privada, cookie de sessao) pode aparecer em commit, log, comentario, PR ou output de tool.
- `.env*` sempre no `.gitignore`.
- Publish profiles Azure ficam no GitHub Secrets, nunca no repo.
- Scan de segredos e OBRIGATORIO no CI (etapa `gitleaks`).

---

## 2. Checklist de scan de repositorio (rodar em CI e antes de cada deploy)

- [ ] `git ls-files | grep -iE '\.env$|\.env\..*(?<!example)$'` → deve retornar VAZIO
- [ ] `git ls-files | grep -iE '\.(pem|key|p12|pfx|jks)$'` → VAZIO
- [ ] `git log --all -p | grep -iE 'password|secret|token|api_key|private_key|BEGIN RSA' | head -50` → VAZIO
- [ ] `gitleaks detect --source . --verbose` → sem findings criticos
- [ ] Nenhuma URL com `?token=` ou `?apikey=` hardcoded no codigo

---

## 3. LGPD

- Consentimento explicito no `/register` para uso de dados pessoais (checkbox obrigatorio).
- Politica de privacidade em `/privacidade` (pagina publica).
- Direito ao esquecimento: rota SuperAdmin `POST /superadmin/tenants/:id/delete-request`.
- Retencao: soft delete → 30 dias → hard delete automatico via worker.
- Logs de audit contem `ipAddress` e `userId` — deve haver purge automatico apos 12 meses (compliance).
- Placar publico NAO seta cookie de tracking (RN-011 tacita).

---

## 4. Autenticacao e sessao

| Item | Politica |
|------|----------|
| Password hash | bcrypt cost 12 |
| Access token | JWT HS256, 15 min, HttpOnly cookie, SameSite=Strict, Secure em prod |
| Refresh token | JWT HS256, 7 dias, HttpOnly, path=`/api/v1/auth/refresh` |
| Rotacao de secret JWT | Trimestral (documentar procedimento em `docs/runbooks/rotate-jwt.md`) |
| 2FA | Obrigatorio para SuperAdmin (TOTP + backup codes) |
| Reset de senha | Link em email com token JWT curto (15 min), 1 uso |
| Rate limit login | 10 req/min por IP + 20 tentativas/24h por email |
| Bloqueio | Apos 5 tentativas falhas em 15 min, bloquear conta por 30 min |

---

## 5. Multi-tenancy

- RLS PostgreSQL ativo em TODAS as tabelas com `tenant_id`.
- Middleware `tenant.middleware.ts` executa `SET LOCAL app.current_tenant_id` a cada request.
- Teste de isolamento (`tenant-isolation.integration.test.ts`) faz parte do gate de QA e CI.
- SuperAdmin `SET app.is_superadmin = true` gera entrada no audit_log automaticamente.
- Query cross-tenant so via SuperAdmin com log; nunca via Owner/Member.

---

## 6. API hardening

- Helmet.js com CSP restritiva (nada de `unsafe-inline` em prod).
- CORS: apenas dominios frontend permitidos (env `CORS_ORIGINS`).
- Rate limit global 100 req/min por IP+tenant.
- Rate limit especifico em `/auth/*`.
- Zod valida TODOS os inputs (body, query, params).
- Nenhuma query SQL raw sem prepared statement (Prisma parameteriza por padrao).
- Stripe webhook valida assinatura HMAC com `STRIPE_WEBHOOK_SECRET`.

---

## 7. Frontend hardening

- Tokens em cookies HttpOnly — NUNCA em `localStorage`/`sessionStorage`.
- CSP com nonce em scripts inline (se houver).
- Sem `dangerouslySetInnerHTML` (React escapa por padrao).
- HTTPS obrigatorio em producao (Azure App Service redireciona).
- SRI (Subresource Integrity) em scripts CDN, se houver.

---

## 8. Dependencias

- `npm audit` no CI, falha em `high` ou `critical`.
- Renovate ou Dependabot semanal para bumps de seguranca.
- Nao usar pacote com > 6 meses sem release + < 100 stars sem revisao.

---

## 9. Deploy Azure — checklist recorrente

- [ ] Secret publish profile (`AZURE_WEBAPP_PUBLISH_PROFILE_*`) esta no GitHub Secrets, nao no repo
- [ ] Env vars sensiveis (`STRIPE_SECRET_KEY`, `JWT_*_SECRET`, `DATABASE_URL`) no App Service Configuration, nao em `.env` commitado
- [ ] SCM Basic Auth Publishing = `true` (necessario para o webapps-deploy@v3)
- [ ] Basic Authentication = `true`
- [ ] Custom domain com HTTPS + certificado gerenciado (Azure)
- [ ] `alwaysOn` ativado se plano permitir (evita cold start)
- [ ] Slot `staging` para deploy inicial + slot swap para prod
- [ ] Rollback via slot swap testado

---

## 10. Auditoria de log

Toda acao critica gera entrada em `audit_logs`:
- `auth.login` / `auth.login.failed`
- `auth.register`
- `championship.create` / `championship.update` / `championship.delete`
- `match.score.update`
- `financial.transaction.create` / `.delete`
- `license.activate` / `license.expire`
- `superadmin.tenant.override` (log especial)
- `superadmin.tenant.impersonate` (se implementado)

Nunca logar: senha, JWT, dado de cartao, CPF completo. Redigir com `***`.

---

## 11. Backup e disaster recovery

- Postgres: backup automatico Azure (7 dias retention no MVP).
- Redis: dados sao volateis (cache/queue); jobs importantes reprocessam.
- Blob Storage: replicacao LRS (geo-redundant depois de MRR justificar GRS).
- Runbook em `docs/runbooks/disaster-recovery.md` a criar depois do deploy inicial.

---

## 12. Handoff

Este relatorio deve ser reavaliado:
- Antes de cada deploy (checklist secao 9)
- Quando novo modulo com dados pessoais for adicionado
- Quando nova integracao externa for feita
- Se algum dependabot alert critical aparecer
