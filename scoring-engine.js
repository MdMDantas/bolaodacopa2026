// scoring-engine.js — Motor de pontuação compartilhado (Bolão Copa 2026)
// Replica a lógica de cálculo de ranking.html (Fase de Grupos: grupos,
// placares R1-R3, zebras e melhores terceiros), porém parametrizado por um
// conjunto de resultados — permitindo recalcular o total de cada
// participante considerando apenas os jogos até uma certa data.
//
// Depende de REGRAS (regras-admin.js).

var SCORING = (function() {

  var GRUPOS_DISPLAY = {
    A:['México','África do Sul','Coreia do Sul','República Tcheca'],
    B:['Canadá','Bósnia e Herzegovina','Catar','Suíça'],
    C:['Brasil','Marrocos','Haiti','Escócia'],
    D:['Estados Unidos','Turquia','Paraguai','Austrália'],
    E:['Alemanha','Curaçao','Costa do Marfim','Equador'],
    F:['Holanda','Japão','Suécia','Tunísia'],
    G:['Bélgica','Egito','Irã','Nova Zelândia'],
    H:['Espanha','Cabo Verde','Arábia Saudita','Uruguai'],
    I:['França','Senegal','Noruega','Iraque'],
    J:['Argentina','Argélia','Áustria','Jordânia'],
    K:['Portugal','RD Congo','Uzbequistão','Colômbia'],
    L:['Inglaterra','Croácia','Gana','Panamá']
  };

  var JOGOS_R1={A:[['México','África do Sul'],['Coreia do Sul','República Tcheca']],B:[['Canadá','Bósnia e Herzegovina'],['Catar','Suíça']],C:[['Brasil','Marrocos'],['Haiti','Escócia']],D:[['Estados Unidos','Paraguai'],['Austrália','Turquia']],E:[['Alemanha','Curaçao'],['Costa do Marfim','Equador']],F:[['Holanda','Japão'],['Suécia','Tunísia']],G:[['Bélgica','Egito'],['Irã','Nova Zelândia']],H:[['Espanha','Cabo Verde'],['Arábia Saudita','Uruguai']],I:[['França','Senegal'],['Noruega','Iraque']],J:[['Argentina','Argélia'],['Áustria','Jordânia']],K:[['Portugal','RD Congo'],['Uzbequistão','Colômbia']],L:[['Inglaterra','Croácia'],['Gana','Panamá']]};
  var JOGOS_R2={A:[['México','Coreia do Sul'],['África do Sul','República Tcheca']],B:[['Canadá','Catar'],['Bósnia e Herzegovina','Suíça']],C:[['Brasil','Haiti'],['Marrocos','Escócia']],D:[['Estados Unidos','Austrália'],['Turquia','Paraguai']],E:[['Alemanha','Costa do Marfim'],['Curaçao','Equador']],F:[['Holanda','Suécia'],['Japão','Tunísia']],G:[['Bélgica','Irã'],['Egito','Nova Zelândia']],H:[['Espanha','Arábia Saudita'],['Cabo Verde','Uruguai']],I:[['França','Iraque'],['Noruega','Senegal']],J:[['Argentina','Áustria'],['Argélia','Jordânia']],K:[['Portugal','Uzbequistão'],['Colômbia','RD Congo']],L:[['Inglaterra','Gana'],['Croácia','Panamá']]};
  var JOGOS_R3={A:[['México','República Tcheca'],['África do Sul','Coreia do Sul']],B:[['Canadá','Suíça'],['Bósnia e Herzegovina','Catar']],C:[['Brasil','Escócia'],['Marrocos','Haiti']],D:[['Estados Unidos','Turquia'],['Paraguai','Austrália']],E:[['Alemanha','Equador'],['Curaçao','Costa do Marfim']],F:[['Holanda','Tunísia'],['Japão','Suécia']],G:[['Bélgica','Nova Zelândia'],['Egito','Irã']],H:[['Espanha','Uruguai'],['Cabo Verde','Arábia Saudita']],I:[['França','Noruega'],['Senegal','Iraque']],J:[['Argentina','Jordânia'],['Argélia','Áustria']],K:[['Portugal','Colômbia'],['RD Congo','Uzbequistão']],L:[['Inglaterra','Panamá'],['Croácia','Gana']]};

  var JOGOS_RANK = [];
  [['R1',JOGOS_R1],['R2',JOGOS_R2],['R3',JOGOS_R3]].forEach(function(rd) {
    var r = rd[0], obj = rd[1];
    Object.keys(obj).forEach(function(g) {
      obj[g].forEach(function(jogo, i) { JOGOS_RANK.push({ r:r, g:g, i:i, a:jogo[0], b:jogo[1] }); });
    });
  });

  function jogoKeyR(j) { return j.r + '_' + j.g + '_' + j.i; }

  function acharResultado(resultadosDB, key) {
    return resultadosDB.find(function(x) { return x.api_id === key; }) || null;
  }

  function calcularTabela(g, resultadosDB) {
    var times = GRUPOS_DISPLAY[g], tab = {};
    times.forEach(function(t) { tab[t] = { t:t, p:0, j:0, v:0, e:0, d:0, gf:0, gc:0, sg:0 }; });
    JOGOS_RANK.filter(function(j) { return j.g === g; }).forEach(function(jogo) {
      var res = acharResultado(resultadosDB, jogoKeyR(jogo));
      if (!res || res.gols_a === null || res.gols_b === null) return;
      var ga = parseInt(res.gols_a), gb = parseInt(res.gols_b);
      var ta = tab[jogo.a], tb = tab[jogo.b];
      if (!ta || !tb) return;
      ta.j++; tb.j++; ta.gf+=ga; ta.gc+=gb; ta.sg+=ga-gb; tb.gf+=gb; tb.gc+=ga; tb.sg+=gb-ga;
      if (ga > gb) { ta.v++; ta.p+=3; tb.d++; }
      else if (ga < gb) { tb.v++; tb.p+=3; ta.d++; }
      else { ta.e++; ta.p++; tb.e++; tb.p++; }
    });
    return Object.values(tab).sort(function(a,b) {
      if (b.p !== a.p) return b.p - a.p;
      if (b.sg !== a.sg) return b.sg - a.sg;
      return b.gf - a.gf;
    });
  }

  // Mescla múltiplas linhas de palpites_fase1 por apelido (igual ranking.html)
  function mesclarPalpites(palpitesArr) {
    var palpitesMap = {};
    palpitesArr.forEach(function(x) {
      var chave = x.bolao_id + '|' + x.apelido;
      if (!palpitesMap[chave]) palpitesMap[chave] = {};
      Object.keys(x).forEach(function(k) {
        if (k === 'placares') {
          var pl = x[k];
          if (pl) {
            if (typeof pl === 'string') { try { pl = JSON.parse(pl); } catch(e) { pl = {}; } }
            if (!palpitesMap[chave].placares) palpitesMap[chave].placares = {};
            Object.assign(palpitesMap[chave].placares, pl);
          }
        } else if (x[k] !== null && x[k] !== undefined && x[k] !== '') {
          palpitesMap[chave][k] = x[k];
        }
      });
    });
    return palpitesMap;
  }

  // Calcula a pontuação (fase de grupos) de cada participante com base num
  // conjunto de resultados (já filtrado, ex: apenas jogos até uma certa data)
  // e nos palpites de fase 1.
  function calcular(resultadosDB, palpitesArr) {
    var palpitesMap = mesclarPalpites(palpitesArr);
    var tabelaCache = {};
    function tab(g) {
      if (!tabelaCache[g]) tabelaCache[g] = calcularTabela(g, resultadosDB);
      return tabelaCache[g];
    }

    var pontuacoes = [];
    Object.keys(palpitesMap).forEach(function(chave) {
      var p1 = palpitesMap[chave];
      var pts_grupos=0, pts_placares=0, pts_zebras=0, pts_terceiros=0;

      // Grupos
      Object.keys(GRUPOS_DISPLAY).forEach(function(g) {
        var t = tab(g);
        if (!t.some(function(x){return x.j>0;})) return;
        for (var pos=1; pos<=4; pos++) {
          var tp = p1['g'+g.toLowerCase()+'_'+pos] || p1['g'+g+'_'+pos] || '';
          if (!tp) continue;
          var posReal = t.findIndex(function(x){return x.t===tp;});
          if (posReal === -1) continue;
          if (posReal+1 === pos) pts_grupos += REGRAS.grupos.posicao_exata;
          if (posReal < 2 && pos <= 2) pts_grupos += REGRAS.grupos.classificado_direto;
        }
      });

      // Placares
      var placares = p1.placares || {};
      if (typeof placares === 'string') { try { placares = JSON.parse(placares); } catch(e) { placares = {}; } }
      if (typeof placares !== 'object' || placares === null) placares = {};
      var ptsR1=[], ptsR2=[], ptsR3=[];
      JOGOS_RANK.forEach(function(jogo) {
        var key = jogoKeyR(jogo);
        var res = acharResultado(resultadosDB, key);
        if (!res || res.gols_a === null || res.gols_b === null) return;
        var pa = placares['placar_'+key+'_a'], pb = placares['placar_'+key+'_b'];
        if (pa===undefined || pa===null || pb===undefined || pb===null) return;
        var pts = REGRAS.calcularPlacar(pa, pb, res.gols_a, res.gols_b);
        if (jogo.r === 'R1') ptsR1.push(pts);
        else if (jogo.r === 'R2') ptsR2.push(pts);
        else ptsR3.push(pts);
      });
      var todosP = ptsR1.concat(ptsR2).concat(ptsR3); todosP.sort(function(a,b){return b-a;});
      pts_placares = todosP.slice(0,24).reduce(function(s,v){return s+v;},0);
      var pR1 = ptsR1.reduce(function(s,v){return s+v;},0);
      var pR2 = ptsR2.reduce(function(s,v){return s+v;},0);
      var pR3 = ptsR3.reduce(function(s,v){return s+v;},0);

      // Zebras
      for (var zi=1; zi<=4; zi++) {
        var zebra = p1['zebra'+zi]; if (!zebra) continue;
        var grupoZ = null;
        Object.keys(GRUPOS_DISPLAY).forEach(function(g){ if (GRUPOS_DISPLAY[g].indexOf(zebra)>=0) grupoZ=g; });
        if (!grupoZ) continue;
        var tabZ = tab(grupoZ);
        if (!tabZ.some(function(x){return x.j>0;})) continue;
        var posZ = tabZ.findIndex(function(x){return x.t===zebra;});
        if (posZ===0) pts_zebras += REGRAS.zebras.primeiro_lugar;
        else if (posZ===1) pts_zebras += REGRAS.zebras.segundo_lugar;
        else if (posZ===2) pts_zebras += REGRAS.zebras.melhor_terceiro;
      }

      // Melhores terceiros
      var todosTerceiros = [];
      Object.keys(GRUPOS_DISPLAY).forEach(function(g) {
        var t = tab(g);
        if (t[2] && t[2].j>0) todosTerceiros.push({t:t[2].t, p:t[2].p, sg:t[2].sg, gf:t[2].gf});
      });
      todosTerceiros.sort(function(a,b){if(b.p!==a.p)return b.p-a.p;if(b.sg!==a.sg)return b.sg-a.sg;return b.gf-a.gf;});
      var oitoMelhores = todosTerceiros.slice(0,8).map(function(x){return x.t;});
      for (var ti=1; ti<=8; ti++) {
        var tPalpite = p1['t'+ti]; if (!tPalpite) continue;
        var posRealT = oitoMelhores.indexOf(tPalpite); if (posRealT===-1) continue;
        if (posRealT+1 === ti) pts_terceiros += REGRAS.terceiros.avancou_posicao_certa;
        else pts_terceiros += REGRAS.terceiros.avancou_posicao_errada;
      }

      pontuacoes.push({
        bolao_id: p1.bolao_id,
        apelido: p1.apelido,
        pts_grupos: pts_grupos,
        pts_placares: pts_placares,
        pts_placares_r1: pR1,
        pts_placares_r2: pR2,
        pts_placares_r3: pR3,
        pts_zebras: pts_zebras,
        pts_terceiros: pts_terceiros,
        total: pts_grupos + pts_placares + pts_zebras + pts_terceiros
      });
    });

    return pontuacoes;
  }

  return {
    JOGOS_RANK: JOGOS_RANK,
    jogoKeyR: jogoKeyR,
    calcular: calcular
  };
})();
