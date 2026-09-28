/* Interações da AUVP Experience
   ==========================================================
   O site foi feito inteiro em CSS e só ganhou este arquivo quando
   apareceu um pedido que CSS não faz: que o passeio automático das duas
   roletas continue depois de um clique. CSS não sabe trocar o estado de
   um radio, então o passeio era uma animação por fora — e enquanto ela
   rodava, o que estava na tela não era o estado marcado. Era daí que
   vinham as duas queixas: a ordem dos cartões "quebrando" e o clique nas
   abas parecendo não pegar.

   A regra aqui é: o JavaScript comanda o estado, o CSS continua
   desenhando. Sem o arquivo, as duas dobras seguem utilizáveis — a
   roleta vira uma fila que rola de lado com o dedo, as abas continuam
   trocando no clique. Nada depende de script para ser lido.

   Quem liga o modo com script é a classe `auvp-js`, posta no <html> por
   uma linha no <head>, antes da primeira pintura, para não haver salto.
*/
(() => {
  'use strict';

  const semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* Relógio que só anda quando a dobra está na tela, a aba do navegador
     está à frente e ninguém está com o cursor na `zona` — a área que
     segura o passeio, que nem sempre é a dobra inteira. Na roleta é só a
     fila de cartões: parar por causa do cursor em cima do título, longe
     dos cartões, era parar sem motivo. Qualquer ação manual reinicia a
     contagem — é isso que faz o passeio continuar depois do clique. */
  function relogio(raiz, passo, intervalo, zona) {
    let id = null;
    let naTela = false;
    let parado = false;

    const parar = () => { clearInterval(id); id = null; };
    const tocar = () => {
      parar();
      if (naTela && !parado && !semMovimento.matches && !document.hidden) {
        id = setInterval(passo, intervalo);
      }
    };

    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entradas) => {
        naTela = entradas[0].isIntersecting;
        tocar();
      }, { threshold: 0.2 }).observe(raiz);
    } else {
      naTela = true;
      tocar();
    }

    const segurar = () => { parado = true; parar(); };
    const soltar = () => { parado = false; tocar(); };
    const area = zona || raiz;
    area.addEventListener('pointerenter', segurar);
    area.addEventListener('pointerleave', soltar);
    area.addEventListener('focusin', segurar);
    area.addEventListener('focusout', soltar);
    document.addEventListener('visibilitychange', tocar);
    semMovimento.addEventListener('change', tocar);

    return { reiniciar: tocar };
  }

  /* ---- Roleta do posicionamento ----
     A fila está duplicada no HTML. Avançar anda um cartão; quando o
     trilho para sobre a cópia do primeiro, ele volta ao começo sem
     transição — como o que está na tela é idêntico, o pulo não aparece.
     É esse ida-e-volta silencioso que fecha o laço sem rebobinar. */
  function roleta(raiz) {
    const trilho = raiz.querySelector('.auvp-roleta__trilho');
    const cartoes = Array.from(trilho.children);
    const total = cartoes.length / 2;
    const anterior = raiz.querySelector('.auvp-roleta__bt--anterior');
    const proximo = raiz.querySelector('.auvp-roleta__bt--proximo');
    if (!trilho || total < 2 || !anterior || !proximo) return;

    let i = 0;

    const passo = () =>
      cartoes[1].getBoundingClientRect().left - cartoes[0].getBoundingClientRect().left;

    const mover = (comTransicao) => {
      if (!comTransicao) trilho.style.transition = 'none';
      trilho.style.transform = `translateX(${-i * passo()}px)`;
      if (!comTransicao) {
        void trilho.offsetWidth;   // força o reflow: sem isso o 'none' não vale
        trilho.style.transition = '';
      }
    };

    const avancar = () => {
      i += 1;
      mover(true);
      if (i < total) return;
      // parou sobre a cópia do primeiro cartão: volta ao começo calado
      const fim = (e) => {
        if (e.target !== trilho || e.propertyName !== 'transform') return;
        trilho.removeEventListener('transitionend', fim);
        i = 0;
        mover(false);
      };
      trilho.addEventListener('transitionend', fim);
    };

    const voltar = () => {
      if (i === 0) {               // salta para a cópia e desce dali
        i = total;
        mover(false);
      }
      i -= 1;
      mover(true);
    };

    const janela = raiz.querySelector('.auvp-roleta__janela');
    // 4,5s entre um cartão e o seguinte. Já foi 2,5s, e no cartão com o
    // texto mais longo não dava tempo de ler antes de ele sair.
    const conta = relogio(raiz, avancar, 4500, janela);
    proximo.addEventListener('click', () => { avancar(); conta.reiniciar(); });
    anterior.addEventListener('click', () => { voltar(); conta.reiniciar(); });

    let redesenho;
    window.addEventListener('resize', () => {
      clearTimeout(redesenho);
      redesenho = setTimeout(() => { if (i >= total) i = 0; mover(false); }, 150);
    });

    mover(false);
  }

  /* ---- Abas da Experiência ----
     Aqui o estado continua nos radios, do jeito que já era: o relógio só
     marca o próximo. Clicar numa aba dispara o `change`, que reinicia a
     contagem — o passeio segue de onde a pessoa parou, em vez de morrer
     no primeiro clique. */
  function abas(painel) {
    const radios = Array.from(painel.querySelectorAll('input[type="radio"]'));
    if (radios.length < 2) return;

    const avancar = () => {
      const atual = radios.findIndex((r) => r.checked);
      radios[(atual + 1) % radios.length].checked = true;
    };

    const conta = relogio(painel, avancar, 4000);
    radios.forEach((r) => r.addEventListener('change', conta.reiniciar));
  }

  /* ---- Caça-níquel do networking ----
     A rolagem fica presa na dobra até os cinco perfis passarem. Quem
     prende é o CSS: o invólucro é mais alto que a tela e o palco dentro
     dele fica grudado no topo. O que sobra do invólucro depois da tela —
     o curso — é a régua do giro: quanto dele já andou é exatamente
     quanto do rolo já girou.

     A posição é contínua (o rolo acompanha o dedo, sem pulos) e o perfil
     que está no lugar do meio é o que fica em destaque. Quem desenha é o
     CSS: daqui saem só o `--pos` e a classe `esta-ativo`. */
  function cacaNiquel(pin) {
    const rolo = pin.querySelector('.auvp-net__rolo');
    if (!rolo) return;
    const itens = Array.from(rolo.children);
    if (itens.length < 2) return;
    pin.style.setProperty('--n', itens.length);

    let ativo = -1;
    let pedido = null;

    const medir = () => {
      const curso = pin.offsetHeight - window.innerHeight;
      if (curso <= 0) return;                       // palco solto: nada a girar
      const andado = Math.min(Math.max(-pin.getBoundingClientRect().top, 0), curso);
      const pos = (andado / curso) * (itens.length - 1);
      rolo.style.setProperty('--pos', pos.toFixed(4));
      const perto = Math.round(pos);
      if (perto === ativo) return;
      if (itens[ativo]) itens[ativo].classList.remove('esta-ativo');
      itens[perto].classList.add('esta-ativo');
      ativo = perto;
    };

    const agendar = () => {
      if (pedido) return;
      pedido = requestAnimationFrame(() => { pedido = null; medir(); });
    };

    window.addEventListener('scroll', agendar, { passive: true });
    window.addEventListener('resize', agendar);
    medir();
  }

  /* ---- Envio dos formulários ----
     O `action` do <form> aponta para um app da web do Apps Script, que
     grava a resposta numa planilha. Sem este arquivo o envio continua
     acontecendo — é o do navegador mesmo, que sai da página e mostra a
     resposta do script. Feio, mas a linha é gravada, e é por isso que o
     `target` não está no HTML: ele é posto aqui, só quando há script.

     Com script, o envio vai para um iframe escondido e a página não se
     mexe. O que não dá para fazer é ler a resposta: ela vem de outro
     domínio, e o navegador não deixa. Por isso o agradecimento é dado no
     `load` do iframe — que diz "o servidor respondeu", não "deu certo" —
     e, se esse `load` não vier (há navegador que recusa emoldurar a
     resposta do Google), um prazo curto o dá assim mesmo. O pedido saiu
     nos dois casos; quem confere de verdade é a planilha. */
  function envioRemoto(form) {
    const alvo = 'auvp-recebedor';
    let quadro = document.querySelector('iframe[name="' + alvo + '"]');
    if (!quadro) {
      quadro = document.createElement('iframe');
      quadro.name = alvo;
      quadro.title = 'Envio do formulário';
      quadro.setAttribute('aria-hidden', 'true');
      quadro.setAttribute('tabindex', '-1');
      // Fora da vista, mas carregando: `display: none` em iframe é
      // terreno movediço entre navegadores.
      quadro.style.cssText = 'position:absolute;width:0;height:0;border:0;left:-9999px';
      document.body.appendChild(quadro);
    }
    form.target = alvo;

    const botao = form.querySelector('button[type="submit"]');
    const rotulo = botao ? botao.innerHTML : '';
    // A chamada que fica acima do formulário ("Marque os destinos…") pede
    // o que já foi feito, então ela sai junto: depois do envio, o painel
    // é só o agradecimento.
    const chamada = form.previousElementSibling &&
      form.previousElementSibling.tagName === 'P' ? form.previousElementSibling : null;
    let enviando = false;
    let prazo = null;

    const agradecer = () => {
      if (!enviando) return;              // `load` inicial do iframe, não o nosso
      enviando = false;
      clearTimeout(prazo);

      const aviso = document.createElement('div');
      aviso.className = 'auvp-form__recibo';
      aviso.setAttribute('role', 'status');
      aviso.innerHTML =
        '<span class="auvp-form__selo" aria-hidden="true"></span>' +
        '<strong>Sugestão recebida.</strong>' +
        '<span class="auvp-form__recibo-apoio">Obrigado. Ela entra na curadoria dos próximos roteiros.</span>';

      if (chamada) chamada.remove();
      form.replaceWith(aviso);
    };

    form.addEventListener('submit', () => {
      // O navegador só dispara `submit` depois de validar os campos
      // obrigatórios, então aqui o envio já está de saída.
      enviando = true;
      if (botao) {
        botao.disabled = true;
        botao.innerHTML = 'Enviando…';
      }
      clearTimeout(prazo);
      prazo = setTimeout(agradecer, 4000);
    });

    quadro.addEventListener('load', agradecer);

    // Se o botão ficar preso em "Enviando…" por muito tempo, algo saiu do
    // esperado: devolve o rótulo para a pessoa poder tentar de novo.
    form.addEventListener('submit', () => {
      setTimeout(() => {
        if (botao && botao.disabled && document.contains(form)) {
          botao.innerHTML = rotulo;
          botao.disabled = !aceiteMarcado(form);
        }
      }, 12000);
    });
  }

  /* ---- Aceite dos Termos trava o envio ----
     O botão só acende depois que a caixa dos Termos de Uso é marcada.
     O `required` na caixa continua lá: sem script, é ele que barra o
     envio. Com o botão desligado, nem o Enter num campo de texto envia —
     o navegador não faz envio implícito por um botão desabilitado. */
  function aceiteMarcado(form) {
    const caixa = form.querySelector('input[name="aceite_termos"]');
    return !caixa || caixa.checked;
  }

  function aceiteTrava(form) {
    const caixa = form.querySelector('input[name="aceite_termos"]');
    const botao = form.querySelector('button[type="submit"]');
    if (!caixa || !botao) return;
    const atualizar = () => { botao.disabled = !caixa.checked; };
    caixa.addEventListener('change', atualizar);
    // O navegador pode devolver a caixa marcada ao voltar para a página;
    // o estado do botão parte do que a caixa mostra, não do HTML.
    atualizar();
  }

  document.querySelectorAll('.auvp-roleta').forEach(roleta);
  document.querySelectorAll('.auvp-form--remoto').forEach(envioRemoto);
  document.querySelectorAll('.auvp-form--remoto').forEach(aceiteTrava);
  document.querySelectorAll('.auvp-exp__panel').forEach(abas);
  if (!semMovimento.matches) document.querySelectorAll('.auvp-net__pin').forEach(cacaNiquel);
})();
