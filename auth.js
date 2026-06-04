// auth.js — Sistema de login por apelido + telefone
var AUTH = {

  // Chave no localStorage
  _key: 'bolao_usuario',

  // Retorna usuário logado ou null
  get: function() {
    try {
      var raw = localStorage.getItem(AUTH._key);
      return raw ? JSON.parse(raw) : null;
    } catch(e) { return null; }
  },

  // Salva sessão
  _salvar: function(usuario) {
    localStorage.setItem(AUTH._key, JSON.stringify(usuario));
  },

  // Logout
  sair: function() {
    localStorage.removeItem(AUTH._key);
    localStorage.removeItem('bolao_ultimo');
  },

  // Salva último bolão usado
  salvarUltimoBolao: function(codigoBolao) {
    localStorage.setItem('bolao_ultimo', codigoBolao);
  },

  // Retorna último bolão usado
  getUltimoBolao: function() {
    return localStorage.getItem('bolao_ultimo') || '';
  },

  // Cadastro: cria novo usuário
  cadastrar: async function(apelido, telefone) {
    var tel = telefone.replace(/\D/g,'');
    if (!apelido || apelido.length < 2) return { ok: false, erro: 'Apelido muito curto.' };
    if (tel.length < 10) return { ok: false, erro: 'Telefone inválido. Use DDD + número.' };

    // Verifica se apelido já existe
    var check = await fetch(SUPABASE_URL + '/rest/v1/usuarios?apelido=eq.' + encodeURIComponent(apelido) + '&select=id', {
      headers: DB.h()
    });
    if (check.ok) {
      var existe = await check.json();
      if (existe.length) return { ok: false, erro: 'Esse apelido já está em uso. Escolha outro.' };
    }

    var resp = await fetch(SUPABASE_URL + '/rest/v1/usuarios', {
      method: 'POST',
      headers: Object.assign({}, DB.h(), {'Prefer': 'return=representation'}),
      body: JSON.stringify({ apelido: apelido, telefone: tel })
    });
    if (!resp.ok) {
      var e = await resp.text();
      console.error('cadastrar:', e);
      return { ok: false, erro: 'Erro ao cadastrar. Tente novamente.' };
    }
    var data = await resp.json();
    var usuario = Array.isArray(data) ? data[0] : data;
    AUTH._salvar(usuario);
    return { ok: true, usuario: usuario };
  },

  // Login: valida apelido + telefone
  entrar: async function(apelido, telefone) {
    var tel = telefone.replace(/\D/g,'');
    if (!apelido || !tel) return { ok: false, erro: 'Preencha apelido e telefone.' };

    var resp = await fetch(SUPABASE_URL + '/rest/v1/usuarios?apelido=eq.' + encodeURIComponent(apelido) + '&select=*', {
      headers: DB.h()
    });
    if (!resp.ok) return { ok: false, erro: 'Erro de conexão. Tente novamente.' };
    var data = await resp.json();
    if (!data.length) return { ok: false, erro: 'Apelido não encontrado.' };

    var usuario = data[0];
    if (usuario.telefone !== tel) return { ok: false, erro: 'Telefone incorreto.' };

    AUTH._salvar(usuario);
    return { ok: true, usuario: usuario };
  }
};
