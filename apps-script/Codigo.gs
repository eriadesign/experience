/** AUVP Experience — recebe os formulários de sugestão de destino.
 *
 *  Este arquivo é a cópia versionada do que está no projeto do Apps
 *  Script preso à planilha. O Google não lê daqui: ao mudar algo,
 *  copie para lá e **publique uma nova versão** (Implantar → Gerenciar
 *  implantações → ✏️ → Versão: Nova versão). Sem isso a URL do /exec
 *  continua servindo o código antigo — é o erro nº 1 daqui.
 *
 *  A URL do /exec está no `action` dos dois formulários, no index.html
 *  e no missao-china.html.
 */

/* Deixe vazio se este projeto nasceu de Extensões → Apps Script de
   dentro da planilha: aí `getActive()` acha a planilha sozinho.
   Se o projeto for avulso (criado em script.google.com), `getActive()`
   devolve null e nada é gravado — nesse caso ponha aqui o id da
   planilha, que é o trecho entre /d/ e /edit na URL dela. */
const PLANILHA_ID = '';

const ABA = 'Sugestões';
/* Os aceites entram no fim de propósito: assim as linhas já gravadas no
   layout anterior continuam válidas, sem precisar de remanejo. */
const COLUNAS = ['Data', 'Origem', 'Nome', 'E-mail', 'Telefone',
                 'Destinos marcados', 'Sugestão', 'Assunto',
                 'Aceitou termos', 'Quer novidades'];

/** O envio dos formulários cai aqui. */
function doPost(e) {
  try {
    gravar((e && e.parameter) || {}, (e && e.parameters) || {});
    return json({ ok: true });
  } catch (erro) {
    // Aparece em "Execuções", no menu da esquerda do editor. É lá que se
    // olha quando o site diz que enviou e a planilha não tem a linha.
    console.error(erro);
    return json({ ok: false, erro: String(erro) });
  }
}

/** Abrir a URL do /exec no navegador cai aqui: é o teste de vida.
 *  Acrescentar ?teste=1 grava uma linha, provando a ponta a ponta. */
function doGet(e) {
  const p = (e && e.parameter) || {};

  if (p.teste === '1') {
    try {
      gravar({
        origem: 'teste-doGet',
        nome: 'Fulano de Teste',
        telefone: '(00) 00000-0000',
        sugestao: 'Linha de teste, pode apagar',
        email: 'teste@exemplo.com',
        assunto: 'Teste de ligação',
      }, {});
      return texto('OK — gravei uma linha de teste na aba "' + ABA + '".');
    } catch (erro) {
      return texto('FALHOU ao gravar: ' + erro);
    }
  }

  try {
    const f = folha();
    return texto([
      'No ar.',
      'Planilha: ' + f.getParent().getName(),
      'Aba: ' + f.getName(),
      'Linhas gravadas: ' + Math.max(0, f.getLastRow() - 1),
      '',
      'Para gravar uma linha de teste, acrescente ?teste=1 nesta URL.',
    ].join('\n'));
  } catch (erro) {
    return texto('No ar, mas NÃO consigo abrir a planilha: ' + erro +
      '\n\nSe diz que a planilha é nula, preencha PLANILHA_ID no topo do arquivo.');
  }
}

function gravar(p, ps) {
  if (p._isca) return;                 // armadilha de robô: descarta calado

  const trava = LockService.getScriptLock();
  trava.waitLock(30000);               // dois envios ao mesmo tempo não
  try {                                // podem disputar a mesma linha
    // A ordem tem de bater com COLUNAS, linha a linha.
    folha().appendRow([
      new Date(),
      p.origem || '',
      p.nome || '',
      p.email || '',
      p.telefone || '',
      (ps['destinos[]'] || []).join(', '),
      p.sugestao || '',
      p.assunto || '',
      // Caixa desmarcada não é enviada pelo navegador: a ausência é o
      // "não". Gravar a palavra, e não o vazio, deixa claro na planilha
      // que a pergunta foi feita e a resposta foi negativa.
      p.aceite_termos ? 'Sim' : 'Não',
      p.aceite_novidades ? 'Sim' : 'Não',
    ]);
  } finally {
    trava.releaseLock();
  }
}

function folha() {
  const planilha = PLANILHA_ID
    ? SpreadsheetApp.openById(PLANILHA_ID)
    : SpreadsheetApp.getActive();

  if (!planilha) {
    throw new Error('Planilha nula — o projeto não está preso a nenhuma. ' +
      'Preencha PLANILHA_ID no topo do arquivo.');
  }

  let f = planilha.getSheetByName(ABA);
  if (!f) {
    f = planilha.insertSheet(ABA);
    cabecalho(f);
    return f;
  }

  // Aba existente mais estreita que o cabeçalho de hoje: alarga antes de
  // tentar ler a faixa, senão a leitura abaixo já estoura.
  const faltam = COLUNAS.length - f.getMaxColumns();
  if (faltam > 0) f.insertColumnsAfter(f.getMaxColumns(), faltam);

  // Aba que já existe com o cabeçalho de uma versão anterior: reescreve.
  // Sem isso, campos novos entram sob rótulos velhos e a planilha mente.
  const atual = f.getRange(1, 1, 1, COLUNAS.length).getValues()[0];
  if (atual.join('|') !== COLUNAS.join('|')) {
    migrar(f, atual);
    cabecalho(f);
  }
  return f;
}

/* O layout que existiu antes de Nome e Telefone entrarem. Fica aqui para
   as linhas gravadas naquela época serem remanejadas em vez de ficarem
   sob rótulos errados quando o cabeçalho muda. */
const COLUNAS_V1 = ['Data', 'Origem', 'Destinos marcados', 'Sugestão', 'E-mail', 'Assunto'];

/** Remaneja as linhas do layout antigo para o de hoje, uma única vez.
 *  Só mexe se o cabeçalho for exatamente o antigo — qualquer outra coisa
 *  ele deixa quieta, porque remanejar no escuro é pior que não remanejar. */
function migrar(f, atual) {
  if (atual.slice(0, COLUNAS_V1.length).join('|') !== COLUNAS_V1.join('|')) return;

  const quantas = f.getLastRow() - 1;
  if (quantas < 1) return;

  const velhas = f.getRange(2, 1, quantas, COLUNAS_V1.length).getValues();
  const novas = velhas.map((l) => {
    const nova = [
      l[0],   // Data
      l[1],   // Origem
      '',     // Nome — não existia
      l[4],   // E-mail
      '',     // Telefone — não existia
      l[2],   // Destinos marcados
      l[3],   // Sugestão
      l[5],   // Assunto
    ];
    // Completa até a largura de hoje: cada coluna criada depois deste
    // layout entra vazia, e o setValues exige a linha do tamanho exato
    // da faixa.
    while (nova.length < COLUNAS.length) nova.push('');
    return nova;
  });
  f.getRange(2, 1, novas.length, COLUNAS.length).setValues(novas);
}

/** Escreve (ou reescreve) a primeira linha com os nomes das colunas.
 *  Alarga a aba antes: uma planilha nova vem com 26 colunas, mas uma aba
 *  enxugada à mão pode ter menos que o COLUNAS de hoje, e aí tanto ler
 *  quanto escrever a faixa estoura com "range exceeds grid limits". */
function cabecalho(f) {
  const faltam = COLUNAS.length - f.getMaxColumns();
  if (faltam > 0) f.insertColumnsAfter(f.getMaxColumns(), faltam);
  f.getRange(1, 1, 1, COLUNAS.length).setValues([COLUNAS]).setFontWeight('bold');
  f.setFrozenRows(1);
}

/** Rode este pelo editor (▶) para provar que a gravação funciona com as
 *  suas permissões, sem passar pela web. */
function testarGravacao() {
  gravar({
    origem: 'teste-editor',
    nome: 'Fulano de Teste',
    telefone: '(00) 00000-0000',
    sugestao: 'Linha de teste, pode apagar',
    email: 'teste@exemplo.com',
    assunto: 'Teste de ligação',
  }, {});
  console.log('Gravou. Confira a aba "' + ABA + '".');
}

const json = (d) => ContentService.createTextOutput(JSON.stringify(d))
  .setMimeType(ContentService.MimeType.JSON);
const texto = (s) => ContentService.createTextOutput(s)
  .setMimeType(ContentService.MimeType.TEXT);
