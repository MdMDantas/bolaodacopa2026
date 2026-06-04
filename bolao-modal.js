// bolao-modal.js — login obrigatório, só código do bolão
var PARTICIPANTE = null;
var _bolaoCallback = null;

async function abrirBolaoModal(callback) {
  _bolaoCallback = callback;

  var usuario = (typeof AUTH !== 'undefined') ? AUTH.get() : null;
  var overlay = document.getElementById('bolaoModalOverlay');
  if (!overlay) return;
  overlay.style.display = 'flex';
  document.getElementById('m_erro').style.display = 'none';

  // Se não está logado, mostrar tela de login
  if (!usuario) {
    document.getElementById('bolaoStep1').style.display = 'none';
    document.getElementById('bolaoStep2').style.display = 'none';
    document.getElementById('bolaoStepLogin').style.display = 'block';
    return;
  }

  // Logado: mostrar só campo de código
  document.getElementById('bolaoStepLogin').style.display = 'none';
  document.getElementById('bolaoStep1').style.display = 'block';
  document.getElementById('bolaoStep2').style.display = 'none';

  // Mostrar nome do usuário logado
  var userLabel = document.getElementById('m_usuario_label');
  if (userLabel) userLabel.textContent = 'Olá, ' + usuario.apelido + '!';

  // Auto-preencher último bolão
  var ultimoBolao = AUTH.getUltimoBolao();
  var codigoEl = document.getElementById('m_codigo');
  if (codigoEl && ultimoBolao) codigoEl.value = ultimoBolao;
}

async function confirmarBolao() {
  var usuario = (typeof AUTH !== 'undefined') ? AUTH.get() : null;
  if (!usuario) {
    document.getElementById('m_erro').textContent = 'Faça login primeiro.';
    document.getElementById('m_erro').style.display = 'block';
    return;
  }

  var codigoInput = document.getElementById('m_codigo').value.trim().toUpperCase();
  var erroEl = document.getElementById('m_erro');

  if (!codigoInput) {
    erroEl.textContent = 'Digite o código do bolão.';
    erroEl.style.display = 'block';
    return;
  }

  var bolao = await DB.buscarBolao(codigoInput);
  if (!bolao) {
    erroEl.textContent = 'Código não encontrado. Verifique e tente novamente.';
    erroEl.style.display = 'block';
    return;
  }

  PARTICIPANTE = {
    apelido: usuario.apelido,
    nome: usuario.apelido,
    telefone: usuario.telefone,
    bolao: bolao
  };

  AUTH.salvarUltimoBolao(codigoInput);

  if (_bolaoCallback) {
    var btnConfirmar = document.getElementById('m_btn_confirmar');
    if (btnConfirmar) { btnConfirmar.disabled = true; btnConfirmar.textContent = 'Salvando...'; }

    var ok = await _bolaoCallback(PARTICIPANTE);

    if (btnConfirmar) { btnConfirmar.disabled = false; btnConfirmar.textContent = 'CONFIRMAR E ENVIAR'; }

    if (ok) {
      document.getElementById('bolaoStep1').style.display = 'none';
      document.getElementById('bolaoStep2').style.display = 'block';
      document.getElementById('bolaoStep2msg').textContent = 'Palpites salvos no bolão "' + bolao.nome + '". Boa sorte, ' + usuario.apelido + '!';
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

function verMeusPalpites() {
  window.location.href = 'meus-palpites.html';
}
