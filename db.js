var SUPABASE_URL = 'https://myytheficqokbjbkmeiv.supabase.co';
var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eXRoZWZpY3Fva2JqYmttZWl2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDM1NTMwNCwiZXhwIjoyMDk1OTMxMzA0fQ.-KV4Iaz-hSxdXyhJGYBXo0W9VTmwZctk0kWvZWqIDaE';

var DB = {
  h: function() {
    return {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_KEY
    };
  },

  criarBolao: async function(nome, senha) {
    var codigo = nome.toUpperCase().replace(/[^A-Z0-9]/g,'').substring(0,6) + Date.now().toString().slice(-4) + Math.floor(Math.random()*99);
    var resp = await fetch(SUPABASE_URL + '/rest/v1/boloes', {
      method: 'POST',
      headers: Object.assign({}, DB.h(), {'Prefer': 'return=representation'}),
      body: JSON.stringify({ nome: nome, senha: senha, codigo: codigo })
    });
    if (!resp.ok) { var e = await resp.text(); console.error('criarBolao:', resp.status, e); return null; }
    var data = await resp.json();
    return Array.isArray(data) ? data[0] : data;
  },

  verificarSenha: async function(codigo, senha) {
    var resp = await fetch(SUPABASE_URL + '/rest/v1/boloes?codigo=eq.' + encodeURIComponent(codigo.toUpperCase()) + '&select=*', {
      headers: DB.h()
    });
    if (!resp.ok) { console.error('verificarSenha:', resp.status); return null; }
    var data = await resp.json();
    if (!data.length) return null;
    return data[0].senha === senha ? data[0] : null;
  },

  salvarPalpiteFase1: async function(row) {
    // Tenta PATCH (atualizar linha existente) — só toca nos campos enviados
    var filtro = '?bolao_id=eq.' + row.bolao_id + '&apelido=eq.' + encodeURIComponent(row.apelido);
    var patch = await fetch(SUPABASE_URL + '/rest/v1/palpites_fase1' + filtro, {
      method: 'PATCH',
      headers: Object.assign({}, DB.h(), {'Prefer': 'return=minimal'}),
      body: JSON.stringify(row)
    });
    if (patch.ok) return true;
    // Se não existe ainda, cria com POST
    var post = await fetch(SUPABASE_URL + '/rest/v1/palpites_fase1', {
      method: 'POST',
      headers: Object.assign({}, DB.h(), {'Prefer': 'return=minimal'}),
      body: JSON.stringify(row)
    });
    if (!post.ok) { var e = await post.text(); console.error('salvarFase1:', post.status, e); }
    return post.ok;
  },

  buscarPalpiteFase1: async function(bolaoId, apelido) {
    var url = SUPABASE_URL + '/rest/v1/palpites_fase1?bolao_id=eq.' + bolaoId + '&apelido=eq.' + encodeURIComponent(apelido) + '&select=*&limit=1';
    var resp = await fetch(url, { headers: DB.h() });
    if (!resp.ok) return null;
    var data = await resp.json();
    return data.length ? data[0] : null;
  },

  salvarPalpiteFase2: async function(row) {
    var resp = await fetch(SUPABASE_URL + '/rest/v1/palpites_fase2', {
      method: 'POST',
      headers: Object.assign({}, DB.h(), {
        'Prefer': 'resolution=merge-duplicates,return=minimal',
        'on_conflict': 'bolao_id,apelido,fase'
      }),
      body: JSON.stringify(row)
    });
    if (!resp.ok) { var e = await resp.text(); console.error('salvarFase2:', resp.status, e); }
    return resp.ok;
  },

  buscarPalpitesFase2: async function(bolaoId, apelido) {
    var url = SUPABASE_URL + '/rest/v1/palpites_fase2?bolao_id=eq.' + bolaoId + '&apelido=eq.' + encodeURIComponent(apelido) + '&select=fase,placares_mm';
    var resp = await fetch(url, { headers: DB.h() });
    if (!resp.ok) return {};
    var rows = await resp.json();
    // retorna objeto indexado por fase: { r16avos: {...}, roitavas: {...}, ... }
    var result = {};
    rows.forEach(function(r) { result[r.fase] = r.placares_mm || {}; });
    return result;
  },

  buscarRanking: async function(bolaoId) {
    var resp = await fetch(SUPABASE_URL + '/rest/v1/pontuacoes?bolao_id=eq.' + bolaoId + '&select=*&order=total.desc', {
      headers: DB.h()
    });
    if (!resp.ok) return [];
    return await resp.json();
  },

  listarBoloes: async function() {
    var resp = await fetch(SUPABASE_URL + '/rest/v1/boloes?select=id,nome,codigo&order=criado_em.desc', {
      headers: DB.h()
    });
    if (!resp.ok) return [];
    return await resp.json();
  },

  buscarBolao: async function(codigo) {
    var resp = await fetch(SUPABASE_URL + '/rest/v1/boloes?codigo=eq.' + encodeURIComponent(codigo) + '&select=*', {
      headers: DB.h()
    });
    if (!resp.ok) return null;
    var data = await resp.json();
    return data.length ? data[0] : null;
  }
};

var CONFIG = { SUPABASE_URL: SUPABASE_URL, SUPABASE_KEY: SUPABASE_KEY };
