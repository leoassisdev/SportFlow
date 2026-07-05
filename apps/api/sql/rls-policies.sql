-- SportFlow — Row-Level Security policies
-- Rodar apos a migration inicial do Prisma criar as tabelas.
-- Aplica isolamento por tenant_id + bypass para superadmin.

-- =========================================================
-- HELPERS
-- =========================================================
CREATE OR REPLACE FUNCTION current_tenant_id()
RETURNS uuid AS $$
  SELECT NULLIF(current_setting('app.current_tenant_id', true), '')::uuid;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION is_superadmin()
RETURNS boolean AS $$
  SELECT COALESCE(current_setting('app.is_superadmin', true), 'false')::boolean;
$$ LANGUAGE sql STABLE;

-- =========================================================
-- ENABLE RLS
-- =========================================================
ALTER TABLE tenants                ENABLE ROW LEVEL SECURITY;
ALTER TABLE users                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE licenses               ENABLE ROW LEVEL SECURITY;
ALTER TABLE championships          ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants           ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches                ENABLE ROW LEVEL SECURITY;
ALTER TABLE score_entries          ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_jobs            ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs             ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- POLICIES — isolamento por tenant + superadmin bypass
-- =========================================================
CREATE POLICY tenant_isolation ON tenants
  USING (is_superadmin() OR id = current_tenant_id());

CREATE POLICY tenant_isolation ON users
  USING (is_superadmin() OR tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation ON licenses
  USING (is_superadmin() OR tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation ON championships
  USING (is_superadmin() OR tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation ON participants
  USING (is_superadmin() OR tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation ON matches
  USING (is_superadmin() OR tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation ON score_entries
  USING (is_superadmin() OR tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation ON financial_transactions
  USING (is_superadmin() OR tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation ON export_jobs
  USING (is_superadmin() OR tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation ON audit_logs
  USING (is_superadmin() OR tenant_id = current_tenant_id());

-- Tabela leads e visivel apenas para superadmin (funil de aquisicao)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY superadmin_only ON leads USING (is_superadmin());
