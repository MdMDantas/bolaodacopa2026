// bolao-modal.js — com suporte a login
var PARTICIPANTE = null;
var _bolaoCallback = null;

async function abrirBolaoModal(callback) {
  _bolaoCallback = callback;

  // Se usuário já está logado, preenche automaticamente
  var usuario = (typeof AUTH !== 'undefined') ? AUTH.get() : null;

  var overlay = document.getElementById('bolaoModalOverlay');
  if (!overlay) return;
  overlay.style.display = 'flex';
  document.getElementById('bolaoStep1').style.display = 'block';
  document.getElementById('bolaoStep2').style.display = 'none';
  document.getElementById('m_erro').style.display = 'none';

  // Auto-preencher apelido e telefone se logado
  if (usuario) {
    var apelidoEl = document.getElementById('m_apelido');
    var telefoneEl = document.getElementById('m_telefone');
    if (apelidoEl) { apelidoEl.value = usuario.apelido; apelidoEl.readOnly = true; apelidoEl.style.opacity='0.7'; }
    if (telefoneEl) { telefoneEl.value = usuario.telefone; telefoneEl.readOnly = true; telefoneEl.style.opacity='0.7'; }
  }

  // Auto-preencher último bolão usado
  var ultimoBolao = (typeof AUTH !== 'undefined') ? AUTH.getUltimoBolao() : '';
  var codigoEl = document.getElementById('m_codigo');
  if (codigoEl && ultimoBolao) codigoEl.value = ultimoBolao;

  var sel = document.getElementById('m_bolao_select');
  if (sel) {
    sel.innerHTML = '<option value="">Carregando...</option>';
    fetch(SUPABASE_URL + '/rest/v1/boloes?select=id,nome,codigo&order=criado_em.desc', {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
    }).then(function(r) { return r.json(); })
    .then(function(boloes) {
      if (boloes && boloes.length) {
        sel.innerHTML = '<option value="">— Escolha seu bolão —</option>';
        boloes.forEach(function(b) {
          var selected = (ultimoBolao && b.codigo === ultimoBolao) ? ' selected' : '';
          sel.innerHTML += '<option value="' + b.codigo + '"' + selected + '>' + b.nome + '</option>';
        });
      } else {
        sel.innerHTML = '<option value="">Nenhum bolão encontrado</option>';
      }
    }).catch(function(e) {
      console.error('Erro ao carregar bolões:', e);
      sel.innerHTML = '<option value="">Erro ao carregar</option>';
    });
  }
}

async function confirmarBolao() {
  var apelido = document.getElementById('m_apelido').value.trim();
  var telefone = document.getElementById('m_telefone').value.trim();
  var bolaoSel = document.getElementById('m_bolao_select').value.trim();
  var codigoInput = document.getElementById('m_codigo').value.trim().toUpperCase();
  var erroEl = document.getElementById('m_erro');

  if (!apelido) { erroEl.textContent = 'Por favor preencha seu apelido.'; erroEl.style.display = 'block'; return; }
  if (!bolaoSel) { erroEl.textContent = 'Selecione um bolão.'; erroEl.style.display = 'block'; return; }
  if (!codigoInput) { erroEl.textContent = 'Digite o código do bolão.'; erroEl.style.display = 'block'; return; }
  if (bolaoSel !== codigoInput) { erroEl.textContent = 'Código incorreto para este bolão.'; erroEl.style.display = 'block'; return; }

  var bolao = await DB.buscarBolao(codigoInput);
  if (!bolao) { erroEl.textContent = 'Bolão não encontrado.'; erroEl.style.display = 'block'; return; }

  PARTICIPANTE = { apelido: apelido, nome: apelido, telefone: telefone, bolao: bolao };

  // Salvar último bolão usado
  if (typeof AUTH !== 'undefined') AUTH.salvarUltimoBolao(codigoInput);

  if (_bolaoCallback) {
    var ok = await _bolaoCallback(PARTICIPANTE);
    if (ok) {
      document.getElementById('bolaoStep1').style.display = 'none';
      document.getElementById('bolaoStep2').style.display = 'block';
      document.getElementById('bolaoStep2msg').textContent = 'Olá, ' + apelido + '! Seus palpites foram salvos no bolão "' + bolao.nome + '".';
    } else {
      erroEl.textContent = 'Erro ao salvar palpites. Verifique sua conexão.';
      erroEl.style.display = 'block';
    }
  }
}

function fecharBolaoModal() {
  var overlay = document.getElementById('bolaoModalOverlay');
  if (overlay) overlay.style.display = 'none';
}

function verRanking() {
  if (PARTICIPANTE && PARTICIPANTE.bolao) {
    window.location.href = 'ranking.html?bolao=' + PARTICIPANTE.bolao.codigo;
  }
}
