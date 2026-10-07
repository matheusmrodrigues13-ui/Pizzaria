/**
 * La Tavola — comportamento do site
 * Carrinho (localStorage), personalizador de pizza, menu mobile e WhatsApp.
 */
(function () {
  'use strict';

  var CHAVE = 'lt_cart';

  /* ----------------------------- utilidades ----------------------------- */
  function ler() {
    try {
      return JSON.parse(localStorage.getItem(CHAVE)) || [];
    } catch (erro) {
      return [];
    }
  }

  function gravar(itens) {
    localStorage.setItem(CHAVE, JSON.stringify(itens));
    renderizar();
  }

  function dinheiro(valor) {
    return 'R$ ' + Number(valor || 0).toFixed(2).replace('.', ',');
  }

  function url(caminho) {
    return (window.LT_BASE || '') + '/' + caminho;
  }

  function chaveItem(item) {
    var extras = (item.adicionais || []).map(function (a) { return a.nome; }).join('+');
    return [item.id, item.tamanho || '', item.borda || '', extras, item.observacoes || ''].join('|');
  }

  function escapar(texto) {
    return String(texto == null ? '' : texto)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* ------------------------------ carrinho ------------------------------ */
  function adicionar(item) {
    var itens = ler();
    var chave = chaveItem(item);
    var achou = false;

    itens.forEach(function (existente) {
      if (chaveItem(existente) === chave) {
        existente.quantidade += item.quantidade || 1;
        achou = true;
      }
    });

    if (!achou) {
      item.quantidade = item.quantidade || 1;
      itens.push(item);
    }

    gravar(itens);
    abrirCarrinho();
  }

  function alterarQuantidade(chave, delta) {
    var itens = ler();
    itens.forEach(function (item) {
      if (chaveItem(item) === chave) {
        item.quantidade += delta;
      }
    });
    itens = itens.filter(function (item) { return item.quantidade > 0; });
    gravar(itens);
  }

  function remover(chave) {
    gravar(ler().filter(function (item) { return chaveItem(item) !== chave; }));
  }

  function subtotal(itens) {
    return itens.reduce(function (soma, item) {
      return soma + (Number(item.preco_unitario) * Number(item.quantidade));
    }, 0);
  }

  /* ------------------------------ desenho ------------------------------- */
  function renderizar() {
    var itens = ler();
    var quantidade = itens.reduce(function (s, i) { return s + Number(i.quantidade); }, 0);

    var badge = document.getElementById('carrinho-badge');
    if (badge) {
      badge.textContent = quantidade;
      badge.style.display = quantidade > 0 ? 'grid' : 'none';
    }

    var lista = document.getElementById('carrinho-lista');
    var rodape = document.getElementById('carrinho-rodape');

    if (lista) {
      if (!itens.length) {
        lista.innerHTML = '<div class="drawer__vazio"><p>Seu carrinho está vazio.</p>' +
          '<a class="btn btn--fantasma btn--pequeno mt-2" href="' + url('cardapio.php') + '">Ver cardápio</a></div>';
        if (rodape) { rodape.innerHTML = ''; }
      } else {
        lista.innerHTML = itens.map(function (item) {
          var chave = escapar(chaveItem(item));
          var detalhes = [];
          if (item.tamanho) { detalhes.push(escapar(item.tamanho)); }
          if (item.borda && item.borda !== 'Sem borda recheada') { detalhes.push('Borda: ' + escapar(item.borda)); }
          if (item.adicionais && item.adicionais.length) {
            detalhes.push('+ ' + item.adicionais.map(function (a) { return escapar(a.nome); }).join(', '));
          }
          if (item.observacoes) { detalhes.push('"' + escapar(item.observacoes) + '"'); }

          return '<div class="item-carrinho">' +
            '<div class="item-carrinho__info">' +
              '<div class="item-carrinho__nome">' + escapar(item.nome) + '</div>' +
              (detalhes.length ? '<div class="item-carrinho__detalhe">' + detalhes.join(' · ') + '</div>' : '') +
              '<div class="preco mt-1">' + dinheiro(item.preco_unitario * item.quantidade) + '</div>' +
            '</div>' +
            '<div class="item-carrinho__acoes">' +
              '<button type="button" data-remover="' + chave + '" title="Remover" aria-label="Remover">&times;</button>' +
              '<div class="qtd">' +
                '<button type="button" data-qtd="' + chave + '" data-delta="-1" aria-label="Diminuir">&minus;</button>' +
                '<span class="preco">' + item.quantidade + '</span>' +
                '<button type="button" data-qtd="' + chave + '" data-delta="1" aria-label="Aumentar">+</button>' +
              '</div>' +
            '</div>' +
          '</div>';
        }).join('');

        if (rodape) {
          rodape.innerHTML =
            '<div class="linha-total"><span>Subtotal</span><span class="preco">' + dinheiro(subtotal(itens)) + '</span></div>' +
            '<a class="btn btn--primario btn--bloco" href="' + url('checkout.php') + '">Finalizar pedido &rarr;</a>';
        }
      }
    }

    var listaCheckout = document.getElementById('checkout-lista');
    if (listaCheckout) {
      listaCheckout.innerHTML = itens.map(function (item) {
        var chave = escapar(chaveItem(item));
        return '<div class="item-carrinho">' +
          '<div class="item-carrinho__info">' +
            '<div class="item-carrinho__nome">' + escapar(item.nome) + '</div>' +
            (item.tamanho ? '<div class="item-carrinho__detalhe">' + escapar(item.tamanho) +
              (item.borda && item.borda !== 'Sem borda recheada' ? ' · Borda: ' + escapar(item.borda) : '') + '</div>' : '') +
            '<div class="preco mt-1">' + dinheiro(item.preco_unitario * item.quantidade) + '</div>' +
          '</div>' +
          '<div class="item-carrinho__acoes">' +
            '<button type="button" data-remover="' + chave + '" aria-label="Remover">&times;</button>' +
            '<div class="qtd">' +
              '<button type="button" data-qtd="' + chave + '" data-delta="-1" aria-label="Diminuir">&minus;</button>' +
              '<span class="preco">' + item.quantidade + '</span>' +
              '<button type="button" data-qtd="' + chave + '" data-delta="1" aria-label="Aumentar">+</button>' +
            '</div>' +
          '</div>' +
        '</div>';
      }).join('');

      var campoItens = document.getElementById('itens-json');
      if (campoItens) { campoItens.value = JSON.stringify(itens); }

      atualizarTotaisCheckout();
    }
  }

  function atualizarTotaisCheckout() {
    var itens = ler();
    var sub = subtotal(itens);
    var seletorBairro = document.getElementById('bairro');
    var radios = document.querySelectorAll('input[name="tipo"]');
    var tipo = 'entrega';
    radios.forEach(function (r) { if (r.checked) { tipo = r.value; } });

    var taxa = 0;
    if (tipo === 'entrega' && seletorBairro && seletorBairro.selectedOptions.length) {
      taxa = Number(seletorBairro.selectedOptions[0].dataset.taxa || 0);
    }

    var campoSub = document.getElementById('checkout-subtotal');
    var campoTaxa = document.getElementById('checkout-taxa');
    var campoTotal = document.getElementById('checkout-total');
    var linhaTaxa = document.getElementById('linha-taxa');

    if (campoSub) { campoSub.textContent = dinheiro(sub); }
    if (campoTaxa) { campoTaxa.textContent = dinheiro(taxa); }
    if (campoTotal) { campoTotal.textContent = dinheiro(sub + taxa); }
    if (linhaTaxa) { linhaTaxa.style.display = tipo === 'entrega' ? 'flex' : 'none'; }
  }

  /* ------------------------------ drawer -------------------------------- */
  function abrirCarrinho() {
    var drawer = document.getElementById('carrinho');
    if (drawer) { drawer.classList.add('aberto'); }
  }

  function fecharCarrinho() {
    var drawer = document.getElementById('carrinho');
    if (drawer) { drawer.classList.remove('aberto'); }
  }

  /* --------------------------- personalizador --------------------------- */
  var produtoAtual = null;

  function abrirPersonalizador(id) {
    var dados = window.LT_DADOS || {};
    var produto = (dados.produtos || {})[id];
    if (!produto) { return; }

    produtoAtual = produto;

    var modal = document.getElementById('modal-pizza');
    if (!modal) { return; }

    document.getElementById('modal-titulo').textContent = produto.nome;
    document.getElementById('modal-descricao').textContent = produto.descricao || '';

    // tamanhos
    var tamanhos = [
      { nome: 'Pequena', preco: produto.preco_pequena },
      { nome: 'Média', preco: produto.preco_media },
      { nome: 'Grande', preco: produto.preco_grande }
    ].filter(function (t) { return t.preco; });

    var htmlTamanhos = tamanhos.map(function (t, indice) {
      return '<label class="opcao' + (indice === tamanhos.length - 1 ? ' marcada' : '') + '">' +
        '<input type="radio" name="tamanho" value="' + escapar(t.nome) + '"' + (indice === tamanhos.length - 1 ? ' checked' : '') + '>' +
        '<span>' + escapar(t.nome) + ' — ' + dinheiro(t.preco) + '</span></label>';
    }).join('');
    document.getElementById('modal-tamanhos').innerHTML = htmlTamanhos;

    // bordas
    document.getElementById('modal-bordas').innerHTML = (dados.bordas || []).map(function (b, indice) {
      return '<label class="opcao' + (indice === 0 ? ' marcada' : '') + '">' +
        '<input type="radio" name="borda" value="' + escapar(b.nome) + '" data-preco="' + b.preco + '"' + (indice === 0 ? ' checked' : '') + '>' +
        '<span>' + escapar(b.nome) + (b.preco ? ' (+' + dinheiro(b.preco) + ')' : '') + '</span></label>';
    }).join('');

    // adicionais
    document.getElementById('modal-adicionais').innerHTML = (dados.adicionais || []).map(function (a) {
      return '<label class="opcao">' +
        '<input type="checkbox" name="adicional" value="' + escapar(a.nome) + '" data-preco="' + a.preco + '">' +
        '<span>' + escapar(a.nome) + ' (+' + dinheiro(a.preco) + ')</span></label>';
    }).join('');

    document.getElementById('modal-observacoes').value = '';

    modal.classList.add('aberto');
    atualizarTotalModal();
  }

  function fecharPersonalizador() {
    var modal = document.getElementById('modal-pizza');
    if (modal) { modal.classList.remove('aberto'); }
    produtoAtual = null;
  }

  function calcularTotalModal() {
    if (!produtoAtual) { return 0; }
    var total = 0;

    var tamanhoMarcado = document.querySelector('input[name="tamanho"]:checked');
    var tamanho = tamanhoMarcado ? tamanhoMarcado.value : null;

    if (tamanho === 'Pequena') { total = Number(produtoAtual.preco_pequena || 0); }
    else if (tamanho === 'Média') { total = Number(produtoAtual.preco_media || 0); }
    else if (tamanho === 'Grande') { total = Number(produtoAtual.preco_grande || 0); }
    else { total = Number(produtoAtual.preco || 0); }

    var borda = document.querySelector('input[name="borda"]:checked');
    if (borda) { total += Number(borda.dataset.preco || 0); }

    document.querySelectorAll('input[name="adicional"]:checked').forEach(function (a) {
      total += Number(a.dataset.preco || 0);
    });

    return total;
  }

  function atualizarTotalModal() {
    var alvo = document.getElementById('modal-total');
    if (alvo) { alvo.textContent = dinheiro(calcularTotalModal()); }
  }

  function confirmarPersonalizacao() {
    if (!produtoAtual) { return; }

    var tamanhoMarcado = document.querySelector('input[name="tamanho"]:checked');
    var bordaMarcada = document.querySelector('input[name="borda"]:checked');

    var adicionais = [];
    document.querySelectorAll('input[name="adicional"]:checked').forEach(function (a) {
      adicionais.push({ nome: a.value, preco: Number(a.dataset.preco || 0) });
    });

    adicionar({
      id: produtoAtual.id,
      nome: produtoAtual.nome,
      tipo: produtoAtual.categoria,
      tamanho: tamanhoMarcado ? tamanhoMarcado.value : null,
      borda: bordaMarcada ? bordaMarcada.value : null,
      adicionais: adicionais,
      observacoes: document.getElementById('modal-observacoes').value.trim(),
      preco_unitario: calcularTotalModal(),
      quantidade: 1
    });

    fecharPersonalizador();
  }

  /* ------------------------------- eventos ------------------------------ */
  document.addEventListener('click', function (evento) {
    var alvo = evento.target.closest('[data-acao]');

    if (alvo) {
      var acao = alvo.dataset.acao;

      if (acao === 'abrir-carrinho') { abrirCarrinho(); return; }
      if (acao === 'fechar-carrinho') { fecharCarrinho(); return; }
      if (acao === 'fechar-modal') { fecharPersonalizador(); return; }
      if (acao === 'confirmar-pizza') { confirmarPersonalizacao(); return; }
      if (acao === 'menu') {
        var menu = document.getElementById('nav-mobile');
        if (menu) { menu.classList.toggle('aberto'); }
        return;
      }
      if (acao === 'admin-menu') {
        var lateral = document.querySelector('.admin__lateral');
        if (lateral) { lateral.classList.toggle('aberto'); }
        return;
      }
    }

    // botão "personalizar" de uma pizza
    var personalizar = evento.target.closest('[data-personalizar]');
    if (personalizar) {
      abrirPersonalizador(personalizar.dataset.personalizar);
      return;
    }

    // botão "adicionar" de item simples
    var adicionarBtn = evento.target.closest('[data-adicionar]');
    if (adicionarBtn) {
      adicionar({
        id: adicionarBtn.dataset.adicionar,
        nome: adicionarBtn.dataset.nome,
        tipo: adicionarBtn.dataset.tipo,
        tamanho: null,
        borda: null,
        adicionais: [],
        observacoes: '',
        preco_unitario: Number(adicionarBtn.dataset.preco || 0),
        quantidade: 1
      });
      return;
    }

    var qtdBtn = evento.target.closest('[data-qtd]');
    if (qtdBtn) {
      alterarQuantidade(qtdBtn.dataset.qtd, Number(qtdBtn.dataset.delta));
      return;
    }

    var removerBtn = evento.target.closest('[data-remover]');
    if (removerBtn) {
      remover(removerBtn.dataset.remover);
    }
  });

  document.addEventListener('change', function (evento) {
    // marca visual das opções
    if (evento.target.matches('input[name="tamanho"], input[name="borda"]')) {
      var grupo = evento.target.name;
      document.querySelectorAll('input[name="' + grupo + '"]').forEach(function (input) {
        input.closest('.opcao').classList.toggle('marcada', input.checked);
      });
      atualizarTotalModal();
    }

    if (evento.target.matches('input[name="adicional"]')) {
      evento.target.closest('.opcao').classList.toggle('marcada', evento.target.checked);
      atualizarTotalModal();
    }

    if (evento.target.id === 'bairro' || evento.target.name === 'tipo') {
      atualizarTotaisCheckout();
    }

    if (evento.target.name === 'tipo') {
      document.querySelectorAll('input[name="tipo"]').forEach(function (input) {
        input.closest('.opcao').classList.toggle('marcada', input.checked);
      });
      var blocoEndereco = document.getElementById('bloco-endereco');
      if (blocoEndereco) {
        blocoEndereco.style.display = evento.target.value === 'entrega' ? 'block' : 'none';
      }
    }
  });

  document.addEventListener('keydown', function (evento) {
    if (evento.key === 'Escape') {
      fecharCarrinho();
      fecharPersonalizador();
    }
  });

  /* --------------------------- contato/WhatsApp -------------------------- */
  function iniciarContato() {
    var form = document.getElementById('form-contato');
    if (!form) { return; }

    form.addEventListener('submit', function (evento) {
      evento.preventDefault();

      var nome = form.nome.value.trim();
      var mensagem = form.mensagem.value.trim();
      var erro = document.getElementById('contato-erro');

      if (!nome || !mensagem) {
        erro.textContent = 'Preencha seu nome e a mensagem.';
        erro.style.display = 'block';
        return;
      }

      var numero = form.dataset.whatsapp;
      if (!numero) {
        erro.textContent = 'O WhatsApp da pizzaria ainda não foi configurado.';
        erro.style.display = 'block';
        return;
      }

      erro.style.display = 'none';

      var linhas = ['*Contato pelo site La Tavola*', '', '*Nome:* ' + nome];
      if (form.email.value.trim()) { linhas.push('*E-mail:* ' + form.email.value.trim()); }
      if (form.telefone.value.trim()) { linhas.push('*Telefone:* ' + form.telefone.value.trim()); }
      if (form.assunto.value.trim()) { linhas.push('*Assunto:* ' + form.assunto.value.trim()); }
      linhas.push('', mensagem);

      window.open('https://wa.me/' + numero + '?text=' + encodeURIComponent(linhas.join('\n')), '_blank');
    });
  }

  /* -------------------------------- início ------------------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    if (document.body.dataset.limparCarrinho === '1') {
      localStorage.removeItem(CHAVE);
    }
    renderizar();
    iniciarContato();
  });

  window.LaTavola = {
    adicionar: adicionar,
    renderizar: renderizar,
    abrirCarrinho: abrirCarrinho
  };
})();