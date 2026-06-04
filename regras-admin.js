// regras-admin.js — Fonte da verdade para o motor de pontuação
// Bolão da Copa 2026

var REGRAS = {

  // ── PARTE 1: CLASSIFICAÇÃO DOS GRUPOS ──────────────────────
  grupos: {
    posicao_exata: 1,       // acertou a posição exata (1º, 2º, 3º ou 4º) de uma seleção no grupo
    classificado_direto: 1  // acertou que a seleção passou entre os 2 primeiros (mesmo invertendo a ordem)
    // Máximo por grupo: 4 posições × 1pt + 2 classificados × 1pt = 6pts
    // Máximo total (12 grupos): 72 pontos
  },

  // ── BÔNUS: MELHORES TERCEIROS ───────────────────────────────
  terceiros: {
    avancou_posicao_certa: 2, // acertou qual 3º lugar avançou E sua posição no ranking dos 8
    avancou_posicao_errada: 1, // acertou que o 3º lugar avançou, mas errou a posição no ranking
    nao_avancou: 0             // a seleção não avançou como terceiro
    // Máximo: 8 terceiros × 2pts = 16 pontos
  },

  // ── PARTE 2: PLACARES ───────────────────────────────────────
  placares: {
    placar_exato: 3,          // acertou placar exato (ex: 2×1 = 2×1). Empate exato também vale (0×0 = 0×0)
    vencedor_diff_certa: 2,   // acertou o vencedor E a diferença de gols (ex: disse 3×1, foi 2×0 = ambos ganham por 2)
    empate_errado: 2,         // acertou que seria empate mas errou o placar (ex: disse 2×2, foi 1×1)
    so_vencedor: 1,           // acertou só o vencedor (ex: disse 3×0, foi 1×0). NÃO existe +1 para empate
    apostou_vencedor_empatou: 0, // apostou em vencedor mas o jogo empatou
    errou_tudo: 0             // errou completamente
    // Regra especial: dos 72 jogos, só os 24 MELHORES palpites contam
    // Máximo: 24 × 3pts = 72 pontos
  },

  // ── PARTE 3: ZEBRAS ─────────────────────────────────────────
  zebras: {
    primeiro_lugar: 6,  // sua zebra ficou em 1º lugar do grupo
    segundo_lugar: 4,   // sua zebra ficou em 2º lugar do grupo
    melhor_terceiro: 2, // sua zebra passou como um dos melhores terceiros
    eliminada: 0        // sua zebra foi eliminada na fase de grupos
    // Máximo: 4 zebras × 6pts = 24 pontos
  },

  // ── TIMES CONSIDERADOS ZEBRA ────────────────────────────────
  times_zebra: [
    'Curaçao', 'Haiti', 'Nova Zelândia', 'Jordânia',
    'Iraque', 'Panamá', 'Catar', 'Arábia Saudita'
  ],

  // ── CRITÉRIOS DE DESEMPATE (classificação dos grupos) ───────
  // Usados para montar a tabela real de cada grupo via API
  // e calcular quais 8 terceiros avançam
  desempate_grupo: [
    'pontos',        // 1º: vitória = 3pts, empate = 1pt, derrota = 0pt
    'saldo_gols',    // 2º: gols marcados - gols sofridos
    'gols_marcados', // 3º: total de gols marcados nos 3 jogos
    'disciplina',    // 4º: menos cartões (vermelho direto = 3pts, AM+VM = 3pts, amarelo = 1pt)
    'ranking_fifa'   // 5º: melhor posição no ranking FIFA
  ],

  // ── PONTUAÇÃO MÁXIMA TOTAL ───────────────────────────────────
  maximos: {
    grupos: 72,      // 48pts posições + 24pts classificados diretos
    terceiros: 16,   // 8 × 2pts
    placares: 72,    // 24 melhores × 3pts
    zebras: 24,      // 4 × 6pts
    total: 184
  },

  // ── LÓGICA DE PONTUAÇÃO DE PLACAR ───────────────────────────
  // Função que calcula pontos dado um palpite e resultado real
  calcularPlacar: function(palpiteA, palpiteB, realA, realB) {
    palpiteA = parseInt(palpiteA); palpiteB = parseInt(palpiteB);
    realA = parseInt(realA);       realB = parseInt(realB);
    if (isNaN(palpiteA) || isNaN(palpiteB)) return 0;

    // Placar exato
    if (palpiteA === realA && palpiteB === realB) return REGRAS.placares.placar_exato;

    var palpiteEmpate = (palpiteA === palpiteB);
    var realEmpate    = (realA === realB);

    // Apostou empate e foi empate (mas placar errado)
    if (palpiteEmpate && realEmpate) return REGRAS.placares.empate_errado;

    // Apostou em vencedor mas empatou
    if (!palpiteEmpate && realEmpate) return REGRAS.placares.apostou_vencedor_empatou;

    // Apostou em empate mas teve vencedor
    if (palpiteEmpate && !realEmpate) return REGRAS.placares.errou_tudo;

    // Ambos têm vencedor — checar se é o mesmo
    var palpiteVenceu = (palpiteA > palpiteB) ? 'A' : 'B';
    var realVenceu    = (realA > realB)       ? 'A' : 'B';
    if (palpiteVenceu !== realVenceu) return REGRAS.placares.errou_tudo;

    // Mesmo vencedor — checar diferença de gols
    var diffPalpite = Math.abs(palpiteA - palpiteB);
    var diffReal    = Math.abs(realA - realB);
    if (diffPalpite === diffReal) return REGRAS.placares.vencedor_diff_certa;

    return REGRAS.placares.so_vencedor;
  }
};
