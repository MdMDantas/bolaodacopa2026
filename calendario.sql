-- =============================================
-- TABELA: jogos_calendario
-- Datas e horários dos jogos (horário de Brasília)
-- =============================================
CREATE TABLE IF NOT EXISTS jogos_calendario (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  api_id text UNIQUE NOT NULL,   -- ex: R1_C_0 (igual ao usado em resultados)
  rodada text NOT NULL,          -- R1, R2, R3
  grupo text NOT NULL,
  time_a text NOT NULL,
  time_b text NOT NULL,
  data_jogo date NOT NULL,
  horario_brasilia text NOT NULL  -- ex: 19:00
);

GRANT ALL ON jogos_calendario TO anon;
ALTER TABLE jogos_calendario DISABLE ROW LEVEL SECURITY;

-- ── INSERIR JOGOS ──────────────────────────────────────────

-- 1ª RODADA
INSERT INTO jogos_calendario (api_id, rodada, grupo, time_a, time_b, data_jogo, horario_brasilia) VALUES
-- 11/06
('R1_A_0','R1','A','México','África do Sul','2026-06-11','16:00'),
('R1_A_1','R1','A','Coreia do Sul','República Tcheca','2026-06-11','23:00'),
-- 12/06
('R1_B_0','R1','B','Canadá','Bósnia e Herzegovina','2026-06-12','16:00'),
('R1_D_0','R1','D','Estados Unidos','Paraguai','2026-06-12','22:00'),
-- 13/06
('R1_B_1','R1','B','Catar','Suíça','2026-06-13','16:00'),
('R1_C_0','R1','C','Brasil','Marrocos','2026-06-13','19:00'),
('R1_C_1','R1','C','Haiti','Escócia','2026-06-13','22:00'),
('R1_D_1','R1','D','Austrália','Turquia','2026-06-14','01:00'),
-- 14/06
('R1_E_0','R1','E','Alemanha','Curaçao','2026-06-14','14:00'),
('R1_F_1','R1','F','Holanda','Japão','2026-06-14','17:00'),
('R1_E_1','R1','E','Costa do Marfim','Equador','2026-06-14','20:00'),
('R1_F_0','R1','F','Suécia','Tunísia','2026-06-14','23:00'),
-- 15/06
('R1_H_0','R1','H','Espanha','Cabo Verde','2026-06-15','13:00'),
('R1_G_0','R1','G','Bélgica','Egito','2026-06-15','16:00'),
('R1_H_1','R1','H','Arábia Saudita','Uruguai','2026-06-15','19:00'),
('R1_G_1','R1','G','Irã','Nova Zelândia','2026-06-15','22:00'),
-- 16/06
('R1_I_0','R1','I','França','Senegal','2026-06-16','16:00'),
('R1_I_1','R1','I','Noruega','Iraque','2026-06-16','19:00'),
('R1_J_1','R1','J','Argentina','Argélia','2026-06-16','22:00'),
('R1_J_0','R1','J','Áustria','Jordânia','2026-06-17','01:00'),
-- 17/06
('R1_K_0','R1','K','Portugal','RD Congo','2026-06-17','14:00'),
('R1_L_0','R1','L','Inglaterra','Croácia','2026-06-17','17:00'),
('R1_L_1','R1','L','Gana','Panamá','2026-06-17','20:00'),
('R1_K_1','R1','K','Uzbequistão','Colômbia','2026-06-17','21:00'),

-- 2ª RODADA
-- 18/06
('R2_A_1','R2','A','África do Sul','República Tcheca','2026-06-18','13:00'),
('R2_B_0','R2','B','Bósnia e Herzegovina','Suíça','2026-06-18','16:00'),
('R2_B_1','R2','B','Canadá','Catar','2026-06-18','19:00'),
('R2_A_0','R2','A','México','Coreia do Sul','2026-06-18','22:00'),
-- 19/06
('R2_D_0','R2','D','Estados Unidos','Austrália','2026-06-19','16:00'),
('R2_C_0','R2','C','Marrocos','Escócia','2026-06-19','19:00'),
('R2_C_1','R2','C','Brasil','Haiti','2026-06-19','21:30'),
('R2_D_1','R2','D','Turquia','Paraguai','2026-06-20','00:00'),
-- 20/06
('R2_F_0','R2','F','Holanda','Suécia','2026-06-20','14:00'),
('R2_E_0','R2','E','Alemanha','Costa do Marfim','2026-06-20','17:00'),
('R2_E_1','R2','E','Equador','Curaçao','2026-06-20','21:00'),
('R2_F_1','R2','F','Japão','Tunísia','2026-06-20','23:00'),
-- 21/06
('R2_H_0','R2','H','Espanha','Arábia Saudita','2026-06-21','13:00'),
('R2_G_0','R2','G','Bélgica','Irã','2026-06-21','16:00'),
('R2_H_1','R2','H','Cabo Verde','Uruguai','2026-06-21','19:00'),
('R2_G_1','R2','G','Egito','Nova Zelândia','2026-06-21','22:00'),
-- 22/06
('R2_J_0','R2','J','Argentina','Áustria','2026-06-22','14:00'),
('R2_I_0','R2','I','França','Iraque','2026-06-22','18:00'),
('R2_I_1','R2','I','Noruega','Senegal','2026-06-22','21:00'),
('R2_J_1','R2','J','Jordânia','Argélia','2026-06-23','00:00'),
-- 23/06
('R2_K_0','R2','K','Portugal','Uzbequistão','2026-06-23','14:00'),
('R2_L_0','R2','L','Inglaterra','Gana','2026-06-23','17:00'),
('R2_L_1','R2','L','Panamá','Croácia','2026-06-23','20:00'),
('R2_K_1','R2','K','Colômbia','RD Congo','2026-06-23','23:00'),

-- 3ª RODADA
-- 24/06
('R3_B_0','R3','B','Canadá','Suíça','2026-06-24','16:00'),
('R3_B_1','R3','B','Bósnia e Herzegovina','Catar','2026-06-24','16:00'),
('R3_C_0','R3','C','Brasil','Escócia','2026-06-24','19:00'),
('R3_C_1','R3','C','Marrocos','Haiti','2026-06-24','19:00'),
('R3_A_0','R3','A','México','República Tcheca','2026-06-24','22:00'),
('R3_A_1','R3','A','África do Sul','Coreia do Sul','2026-06-24','22:00'),
-- 25/06
('R3_E_0','R3','E','Alemanha','Equador','2026-06-25','17:00'),
('R3_E_1','R3','E','Curaçao','Costa do Marfim','2026-06-25','17:00'),
('R3_F_0','R3','F','Japão','Suécia','2026-06-25','20:00'),
('R3_F_1','R3','F','Tunísia','Holanda','2026-06-25','20:00'),
('R3_D_0','R3','D','Estados Unidos','Turquia','2026-06-25','23:00'),
('R3_D_1','R3','D','Paraguai','Austrália','2026-06-25','23:00'),
-- 26/06
('R3_I_0','R3','I','França','Noruega','2026-06-26','16:00'),
('R3_I_1','R3','I','Senegal','Iraque','2026-06-26','16:00'),
('R3_H_0','R3','H','Espanha','Uruguai','2026-06-26','21:00'),
('R3_H_1','R3','H','Cabo Verde','Arábia Saudita','2026-06-26','21:00'),
('R3_G_0','R3','G','Egito','Irã','2026-06-27','00:00'),
('R3_G_1','R3','G','Nova Zelândia','Bélgica','2026-06-27','00:00'),
-- 27/06
('R3_L_0','R3','L','Inglaterra','Panamá','2026-06-27','18:00'),
('R3_L_1','R3','L','Croácia','Gana','2026-06-27','18:00'),
('R3_K_0','R3','K','Portugal','Colômbia','2026-06-27','20:30'),
('R3_K_1','R3','K','RD Congo','Uzbequistão','2026-06-27','20:30'),
('R3_J_0','R3','J','Argentina','Jordânia','2026-06-27','23:00'),
('R3_J_1','R3','J','Argélia','Áustria','2026-06-27','23:00')

ON CONFLICT (api_id) DO UPDATE SET
  data_jogo = EXCLUDED.data_jogo,
  horario_brasilia = EXCLUDED.horario_brasilia;
