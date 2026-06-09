-- ══════════════════════════════════════════════════════════
-- BOLÃO DO TETEU 2026 — Setup completo v2
-- Cole no SQL Editor do Supabase e clique em Run
-- ══════════════════════════════════════════════════════════

-- 1. APAGAR tabelas antigas
DROP TABLE IF EXISTS pontuacoes CASCADE;
DROP TABLE IF EXISTS palpites_fase1 CASCADE;
DROP TABLE IF EXISTS palpites_fase2 CASCADE;
DROP TABLE IF EXISTS resultados CASCADE;
DROP TABLE IF EXISTS boloes CASCADE;

-- 2. BOLÕES
CREATE TABLE boloes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  criado_em timestamptz DEFAULT now(),
  nome text NOT NULL,
  senha text NOT NULL,
  codigo text UNIQUE NOT NULL
);

-- 3. PALPITES FASE 1
CREATE TABLE palpites_fase1 (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  criado_em timestamptz DEFAULT now(),
  bolao_id uuid REFERENCES boloes(id),
  apelido text NOT NULL,
  nome text NOT NULL,
  telefone text,
  -- Grupos
  gA_1 text, gA_2 text, gA_3 text, gA_4 text,
  gB_1 text, gB_2 text, gB_3 text, gB_4 text,
  gC_1 text, gC_2 text, gC_3 text, gC_4 text,
  gD_1 text, gD_2 text, gD_3 text, gD_4 text,
  gE_1 text, gE_2 text, gE_3 text, gE_4 text,
  gF_1 text, gF_2 text, gF_3 text, gF_4 text,
  gG_1 text, gG_2 text, gG_3 text, gG_4 text,
  gH_1 text, gH_2 text, gH_3 text, gH_4 text,
  gI_1 text, gI_2 text, gI_3 text, gI_4 text,
  gJ_1 text, gJ_2 text, gJ_3 text, gJ_4 text,
  gK_1 text, gK_2 text, gK_3 text, gK_4 text,
  gL_1 text, gL_2 text, gL_3 text, gL_4 text,
  -- Terceiros
  t1 text, t2 text, t3 text, t4 text,
  t5 text, t6 text, t7 text, t8 text,
  -- Zebras
  zebra1 text, zebra2 text, zebra3 text, zebra4 text,
  -- Placares (rodada_grupo_jogo_time)
  -- Armazenados como JSONB para simplicidade
  placares jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT palpites_fase1_unique UNIQUE (bolao_id, apelido)
);

-- 4. PALPITES FASE 2
-- Uma linha por (bolao_id, apelido, fase) — cada aba é completamente independente
-- fase pode ser: 'matamata', 'r16avos', 'roitavas', 'rquartas', 'rsemi', 'rfinal'
CREATE TABLE palpites_fase2 (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  criado_em timestamptz DEFAULT now(),
  atualizado_em timestamptz DEFAULT now(),
  bolao_id uuid REFERENCES boloes(id),
  apelido text NOT NULL,
  nome text NOT NULL,
  telefone text,
  fase text NOT NULL,          -- qual aba: 'matamata', 'r16avos', 'roitavas', etc.
  placares_mm jsonb DEFAULT '{}'::jsonb,  -- placares dos jogos daquela fase
  dados_mm jsonb DEFAULT '{}'::jsonb,     -- dados extras (chaveamento, campeão, etc.)
  CONSTRAINT palpites_fase2_unique UNIQUE (bolao_id, apelido, fase)
);

-- Índices para busca rápida
CREATE INDEX idx_pf2_bolao_apelido ON palpites_fase2(bolao_id, apelido);
CREATE INDEX idx_pf2_fase ON palpites_fase2(fase);

-- 5. RESULTADOS REAIS (alimentados pela API)
CREATE TABLE resultados (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  atualizado_em timestamptz DEFAULT now(),
  grupo text,
  rodada int,
  time_a text NOT NULL,
  time_b text NOT NULL,
  gols_a int,
  gols_b int,
  finalizado boolean DEFAULT false,
  api_id text UNIQUE
);

-- 6. PONTUAÇÕES (calculadas automaticamente)
CREATE TABLE pontuacoes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  atualizado_em timestamptz DEFAULT now(),
  bolao_id uuid REFERENCES boloes(id),
  palpite_id uuid,
  apelido text NOT NULL,
  pts_grupos int DEFAULT 0,
  pts_terceiros int DEFAULT 0,
  pts_placares int DEFAULT 0,
  pts_zebras int DEFAULT 0,
  total int DEFAULT 0
);

-- 7. PERMISSÕES
GRANT USAGE ON SCHEMA public TO anon;
GRANT ALL ON boloes TO anon;
GRANT ALL ON palpites_fase1 TO anon;
GRANT ALL ON palpites_fase2 TO anon;
GRANT SELECT ON resultados TO anon;
GRANT SELECT ON pontuacoes TO anon;

ALTER TABLE boloes DISABLE ROW LEVEL SECURITY;
ALTER TABLE palpites_fase1 DISABLE ROW LEVEL SECURITY;
ALTER TABLE palpites_fase2 DISABLE ROW LEVEL SECURITY;
ALTER TABLE resultados DISABLE ROW LEVEL SECURITY;
ALTER TABLE pontuacoes DISABLE ROW LEVEL SECURITY;

-- =============================================
-- TABELA: usuarios (sistema de login)
-- =============================================
create table if not exists usuarios (
  id uuid default gen_random_uuid() primary key,
  apelido text unique not null,
  telefone text not null,
  criado_em timestamp with time zone default now()
);

-- Índice para busca por apelido
create index if not exists idx_usuarios_apelido on usuarios(apelido);

-- Row Level Security: leitura pública, inserção pública
alter table usuarios enable row level security;

drop policy if exists "usuarios_select" on usuarios;
drop policy if exists "usuarios_insert" on usuarios;
create policy "usuarios_select" on usuarios for select using (true);
create policy "usuarios_insert" on usuarios for insert with check (true);

-- =============================================
-- ATUALIZAÇÃO: vincular criador ao bolão
-- =============================================
alter table boloes add column if not exists criador_apelido text;
alter table boloes add column if not exists criador_telefone text;
