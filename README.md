# AUVP Experience

Site da AUVP Experience Co. — imersões estratégicas globais.

Site estático: HTML, CSS, imagens e **um** arquivo de JavaScript. Sem build,
sem dependência, sem framework. Abrir o `index.html` no navegador já mostra a
página final — não existe passo de compilação entre o que está no repositório
e o que vai para o ar.

---

## Estrutura

```
index.html                  home
missao-china.html           página da Missão China
apps-script/
  Codigo.gs                 o que recebe os formulários e grava na planilha
                            (cópia versionada — o Google não lê daqui)
assets/
  js/
    auvp.js                 os passeios automáticos e o caça-níquel
  css/
    01-tokens.css           paleta, escala tipográfica, medidas
    02-base.css             reset e padrões do documento
    03-layout.css           .auvp-shell, utilitários de texto
    04-textura.css          grão de papel e barra de progresso
    05-botoes.css
    06-navegacao.css        barra do topo
    07-hero.css             1ª dobra — foto com overlay preto
    08-posicionamento.css   2ª dobra — roleta de pilares
    09-imersoes.css         3ª dobra — cards de destino
    10-diferencial.css      4ª dobra — índice de acessos
    11-faixa.css            5ª dobra — faixa deslizante
    12-networking.css       6ª dobra — caça-níquel
    13-experiencia.css      7ª dobra — abas
    14-faq.css              8ª dobra
    15-formularios.css      campos, chips e o formulário de sugestão
    16-rodape.css
    17-animacao.css         animações de rolagem e @keyframes
    18-missao-china.css     só a página da Missão China
  img/
    auvp-experience-horizontal.svg
    hero-imersao.jpg        fundo da 1ª dobra
    DSC*.jpg                onze fotos da Missão China — mosaico da página
                            da missão e cartões da roleta da home
    china.svg               mapa da dobra Canton Fair
    canton-fair.svg         logo que marca Guangzhou no mapa
```

Os arquivos **01 a 06, 15, 16 e 17** são compartilhados pelas duas páginas.
Os de **07 a 14** desenham as dobras da home e só entram no `index.html`; o
**18** é da Missão China e só entra no `missao-china.html`. Cada página
carrega o que usa, e nada mais.

Os arquivos de CSS são carregados por `<link>` no `<head>`, **na ordem
numérica**. A ordem é parte do desenho: tokens e base primeiro, cada dobra
depois, animação por último. Uma dobra nova = um arquivo novo + um `<link>`
no lugar certo.

Não mexa nas classes `auvp-*`: são elas que ligam o conteúdo ao estilo.

### Espaço entre as dobras

Uma dobra encosta na outra: não há margem entre elas, só o `padding-block` de
cada uma, que é o `--section-y` do `01-tokens.css`. **O vão entre duas dobras é
o dobro desse valor** — é a conta que engana: os 4rem de hoje viram 8rem de
intervalo. Para apertar ou afrouxar o ritmo da página inteira, é essa a única
linha a mexer; as dobras que precisam de mais respiro por dentro (o cabeçalho
das Imersões, o rodapé) têm o seu próprio, e esses são ajustes locais.

A exceção é o networking: lá o `padding-block` é zerado quando há script,
porque quem dá o respiro é o palco grudado de uma tela inteira.

## Publicar no GitHub Pages

**Settings → Pages → Source: Deploy from a branch → `main` / `/ (root)`.**

Não há mais nada a configurar. O `.nojekyll` diz ao GitHub para servir os
arquivos como estão, sem passar pelo Jekyll.

Para rodar localmente, abra o `index.html` direto no navegador ou suba um
servidor qualquer na pasta:

```sh
python3 -m http.server 8000
```

---

## Quase tudo é CSS

O site nasceu sem JavaScript nenhum e quase tudo continua assim:

| Interação | Como funciona |
|---|---|
| Menu em tela cheia | âncora `#menu` + `:target` — fecha sozinho ao navegar |
| Menu suspenso das Imersões | `:hover` e `:focus-within` |
| Card da China | link para a página da missão — o card inteiro é um `<a>` |
| Card de Próximos destinos | `<input type="checkbox">` + `<label>` — o card gira e mostra o formulário |
| FAQ | `<details name="…">` — abre um e fecha o outro |
| Abas da Experiência | `<input type="radio">` + `<label>` |
| Chips de destino | `<input type="checkbox">` — vão junto no formulário |
| Faixa deslizante | `@keyframes` andando -50% sobre dois grupos iguais |
| Mosaico de fotos da Missão China | `@keyframes` alternando a opacidade |
| Logo girando sobre o mapa | `@keyframes` |
| Perfis de networking | caça-níquel movido pela rolagem — ver abaixo |
| Revelação ao rolar | `animation-timeline: view()` |
| Barra de progresso | `animation-timeline: scroll()` |

### O formulário de sugestão, e os dois cards que o cercam

**O mesmo formulário aparece em dois lugares**: no verso do card de Próximos
destinos (home) e na dobra final da Missão China. Mesma chamada, mesmos dez
destinos, mesmos dois campos e mesmo botão — o painel da Missão China repete os
valores do `.auvp-card__verso` para os dois parecerem a mesma peça. Não há
template neste site, então **ao mexer num, mexa no outro**: `index.html` e
`missao-china.html`.

Duas diferenças, ambas de propósito: o `assunto` (campo escondido) diz de qual
página veio, senão as duas origens chegam iguais na caixa de entrada; e o
"Voltar" só existe na home, onde ele desvira o card.

**Os dois aceites legais** ficam no fim, antes do botão. O primeiro é
`required`: sem ele o navegador barra o envio, igual a um campo obrigatório
vazio. A caixa é o `<input>` de verdade, visível — é isso que dá ao aviso do
navegador onde encostar. Os dois viajam como `aceite_termos` e
`aceite_novidades`, e chegam na planilha como **Sim/Não**: caixa desmarcada não
é enviada pelo navegador, e gravar a palavra deixa claro que a pergunta foi
feita e a resposta foi negativa.

> ⚠️ **Os dois links do primeiro aceite apontam para `#`.** O site ainda não
> tem páginas de Termos de Uso nem de Política de Privacidade. Enquanto
> estiverem assim, o formulário pede concordância com documentos que ninguém
> consegue abrir. **Trocar os dois `href` nos dois arquivos** é o que fecha
> isso.

**O formulário cresceu e o card ganhou teto.** Nome e telefone dividem a linha
(`.auvp-form__dupla`) e o e-mail fica sozinho, que é o que mais precisa de
largura. Ainda assim o conjunto passa de 900px, então o `.auvp-card__flip` tem
`max-height: min(86vh, 820px)`: sem ele a dobra ficava maior que a tela e o
card da China crescia junto, virando foto gigante de enchimento. Com teto, quem
cede é o verso, que rola por dentro — e o botão fica grudado no pé
(`.auvp-form__envio`), senão ele sumia abaixo da dobra do card e a pessoa não
via que havia o que enviar. Numa coluna só o teto sai: lá os cards ficam
empilhados e quem rola é a página.

Os dois cards das Imersões têm sempre a mesma altura, e é a grade que garante
isso: **não ponha `align-items: start` em `.auvp-dest__grid`**. Com ele, cada
card passa a ter a própria altura — o de Próximos destinos cresce até caber o
formulário do verso e o da China fica no mínimo, e a diferença muda de monitor
para monitor, porque o formulário quebra em mais ou menos linhas conforme a
largura. No esticado (o padrão) os dois recebem a altura da linha, que é a do
mais alto. Numa coluna só eles ficam empilhados, não lado a lado, e aí cada um
volta a ter a altura do que carrega — forçar a igualdade ali só encheria o card
da China de vazio.

As animações de rolagem estão dentro de um `@supports`. Em navegador que não
as suporta, o bloco é ignorado e o conteúdo aparece normalmente — **em nenhuma
hipótese a página fica em branco.**

### O que o JavaScript faz — e por que ele existe

O `assets/js/auvp.js` cuida de **quatro coisas**: o passeio automático da
roleta do posicionamento, o das abas da Experiência, o caça-níquel da dobra de
networking e o envio dos formulários sem sair da página. Nada mais.

Ele entrou porque apareceu um pedido que CSS não faz: **o passeio precisa
continuar depois de um clique**. CSS não sabe trocar o estado de um radio,
então o passeio era uma animação por fora — e enquanto ela rodava, o que
estava na tela não era o estado marcado. Daí vinham as duas queixas que
motivaram a mudança: a ordem dos cartões "quebrando" no fim do ciclo e o
clique nas abas parecendo não pegar.

A regra agora é: **o JavaScript comanda o estado, o CSS continua desenhando.**
Nas abas, ele só marca o próximo radio; todo o desenho vem das mesmas regras
de `:checked` de antes. Na roleta, ele desloca o trilho — a fila está
duplicada no HTML, e o laço fecha em cima da cópia do primeiro cartão, que é
idêntica ao ponto de partida, então voltar ao começo não aparece.

**Sem o arquivo o site continua de pé.** A classe `auvp-js`, posta no `<html>`
por uma linha no `<head>` antes da primeira pintura, é o que liga o modo com
script:

| | com script | sem script |
|---|---|---|
| Roleta | trilho deslocado pelas setas e pelo relógio | fila que rola de lado com o dedo, com encaixe |
| Setas da roleta | aparecem | somem — não teriam o que comandar |
| Cópias dos cartões | entram, para fechar o laço | somem — seriam conteúdo repetido |
| Abas da Experiência | trocam no clique e sozinhas | trocam no clique |
| Networking | caça-níquel, um perfil por vez em destaque | lista com os cinco perfis à mostra |
| Envio do formulário | vai para um iframe escondido e vira um agradecimento | envio do navegador: a página vai até a resposta do script |

Os dois passeios só andam com a dobra na tela e a aba do navegador à frente, e
o cursor segura cada um na sua área: **na roleta, só quando está sobre a fila
de cartões** — parar porque o cursor passou pelo título, longe deles, era
parar sem motivo. Sob `prefers-reduced-motion` o relógio não liga e o
caça-níquel nem se monta.

### O caça-níquel do networking

**Título e texto de apoio à esquerda, o rolo à direita** — a mesma divisão do
FAQ, com as mesmas proporções e o mesmo ponto de quebra (860px). Abaixo disso
vira uma coluna só, com teto de 560px e centralizada: esparramada na tela
inteira do tablet, ela deixava metade da dobra vazia à direita.

Cada perfil tem **título e texto, e mais nada** — os algarismos romanos que
marcavam a ordem saíram: quem diz de quem é a vez é o ponto verde.

**A janela mostra três lugares em tela grande e dois em tela baixa.** Com três
lugares num celular, a altura que sobrava para cada um ficava menor que o texto
do perfil e os cinco se sobrepunham, ilegíveis. Com dois, o perfil da vez fica
no lugar de cima e o seguinte espia embaixo — e o deslocamento do rolo perde o
`+1` que centralizava.

Mas **dois lugares é regra de tela baixa, não de tela estreita**: no tablet em
pé (largura ≤ 860px e altura ≥ 1000px) voltam os três, porque com dois eles
deixavam a metade de baixo do palco vazia. É por isso que existe um
`@media (min-height: 1000px)` dentro do bloco de 860px.

O ponto verde fica numa coluna ao lado do texto, não solto por cima dele. Preso
ao topo do item, ele descolava da linha do título quanto mais alto o lugar
ficava; em coluna, os dois sobem e descem juntos.

**A rolagem fica presa aqui até os cinco perfis passarem.** Quem segura são duas
peças de CSS: o invólucro `.auvp-net__pin`, mais alto que a tela, e dentro dele
o palco `.auvp-net__palco`, grudado no topo com uma tela de altura. Enquanto o
invólucro atravessa, o palco não sai do lugar — a página parece travada e o que
anda é só o rolo.

Esse palco já existiu antes e foi tirado por deixar tela demais em branco: um
conteúdo de ~500px no meio de 900. **A diferença agora é a altura do lugar**,
que saiu de `16svh` para `27svh`: três deles somam ~80% da tela e o palco fica
cheio, não vazio. Se um dia o palco voltar a parecer vazio, é esse o número a
mexer — não o palco.

Esse número serve aos dois lados. Quanto mais alto o lugar, mais para baixo
fica o do meio, que é onde mora o perfil da vez — o que enche o palco no começo
e **encurta a sobra depois que o último perfil passa**, quando o lugar de baixo
fica vazio. Essa sobra final é do próprio mecanismo: num rolo que destaca pelo
meio, o último perfil sempre tem um lugar vazio embaixo. Dá para encurtá-la
(e está encurtada: o respiro de baixo do palco é zero e a dobra seguinte não
tem respiro de cima), mas não dá para zerá-la sem apertar os lugares — que é
justamente o que esvazia o palco durante o resto do percurso.

O curso é o que sobra do invólucro depois da tela: `100svh + (n - 1) × 40svh`,
ou seja, uma tela para o palco mais 40% de tela de rolagem por perfil que falta
passar. **Para o giro ficar mais lento, é esse `40svh` que cresce**; para ser
mais rápido, diminui. A posição é contínua — o rolo acompanha o dedo, sem
pulos — e o perfil que está no lugar do meio fica em destaque. Do JavaScript
saem só duas coisas: a variável `--pos` e a classe `esta-ativo`; todo o desenho
é do CSS.

Sob `prefers-reduced-motion` o palco se desfaz: o invólucro volta a ter a altura
do conteúdo e a dobra vira a lista com os cinco perfis à mostra. Prender a
rolagem numa tela que não gira seria só rolagem perdida.

**Cuidado ao mexer:** a dobra tinha três animações de rolagem no
`17-animacao.css` — o item pulsando, o numeral preenchendo, o título
engrossando. Elas saíram junto com o desenho antigo. Duas coisas mandando na
mesma opacidade e na mesma escala é uma briga que ninguém ganha: enquanto
conviveram, o rolo ficou com os perfis em tamanhos e opacidades trocados.

---

## Antes de publicar

| O quê | Onde |
|---|---|
| Trocar o destino dos formulários | a URL do `/exec` no `action`, uma em cada página |
| Conferir as fotos da dobra Experiência | `13-experiencia.css` — as URLs foram montadas sem poder abrir o Pexels daqui; o enquadramento das malas é o que mais pede olho |
| Destino do card 2 | ver observação abaixo |

### Barra do topo

O topo percorre as dobras da home: Pilares, Imersões, Diferencial, Networking,
Experiência e FAQ. "Imersões" tem os dois papéis — **no clique**, leva à dobra
Nossas imersões; **parado sobre ele**, abre o menu com a Missão China, que é o
único item de lá. O menu aparece no cursor e também no foco do teclado, sem
script. Na página da Missão China o topo é o mesmo, com os destinos apontando
para as dobras da home.

**A barra é sticky com `margin-bottom: calc(var(--nav-h) * -1)`**: ela puxa o
que vem depois para debaixo dela, que é o que deixa o hero começar no topo da
tela. O efeito colateral é que qualquer dobra de abertura perde uma altura de
barra do seu respiro de cima — foi o que deixou o título da Missão China
encostado na barra. Por isso a abertura de lá soma `var(--nav-h)` ao próprio
`padding-block` (`18-missao-china.css`); qualquer abertura nova precisa fazer o
mesmo.

O rótulo **Pilares** é o da 2ª dobra (`#posicionamento`), a dos quatro cartões
— trocar o nome é trocar o texto do link, o `id` da seção não precisa mudar.

Abaixo de 900px os links saem do topo e quem faz o papel é o menu em tela
cheia, atrás do botão — lá a lista é plana e a Missão China aparece como item
próprio.

**Duas armadilhas de cascata moram aqui**, e as duas já morderam: a regra que
esconde os links em tela estreita e a que esconde as cópias dos cartões da
roleta têm a mesma especificidade das regras que as mostram. Quem vem por
último ganha — se alguma delas subir de lugar no arquivo, para de valer, em
silêncio.

### Responsividade

Dois pontos do site já quebraram feio em tela pequena e agora têm regra
própria. Vale saber quais são antes de mexer neles:

**Dobra Experiência, até 900px.** As abas empilham — a 768 as quatro lado a
lado já cortavam os títulos no meio ("LOGÍSTICA ORGANIZAD…"). E, empilhadas,
elas não cabem mais penduradas no rodapé do painel: em tela pequena a fila
passava por cima do título e furava a moldura por baixo. Nessa faixa o painel
deixa de posicionar por cima e volta ao fluxo; a foto e o véu seguem no fundo,
absolutos, e o painel cresce com o que tem dentro. As abas também passam a
`flex: 0 0 auto`: enquanto a base do flex era 0, o cartão aberto encolhia para
a altura do título e o `overflow: hidden` comia o fim do texto, em silêncio.

**Dobra de networking, até 860px.** Ver a seção do caça-níquel acima.

**Registro da Missão China, até 720px: foto e texto alternados.** Em tela larga
são duas faixas — três fotos em cima, três relatos no bloco verde embaixo. Num
celular as três fotos viravam colunas de ~126px, mais altas que largas por um
fator de dois e com gente cortada pela metade, e os três relatos caíam juntos
num paredão verde. Abaixo de 720px as duas faixas viram uma coluna só,
alternando: foto, relato, foto, relato, foto, relato.

O mosaico e o bloco de texto são irmãos no HTML e **precisam continuar sendo** —
é isso que desenha as duas faixas no desktop. Quem intercala é o
`display: contents`: os invólucros somem da caixa, os seis filhos viram itens
diretos da dobra e o `order` alterna. O verde e o gutter, que eram do invólucro,
passam para cada relato. Mexer nessa dobra é lembrar das duas montagens.

**O respiro das dobras, até 720px.** O `clamp` do `--section-y` trava no mínimo
bem antes do celular (3,8vw de 390px dá 15px, muito abaixo dos 2rem), então a
tela pequena herdava o respiro pensado para a grande — 64px de vão entre duas
dobras, quase 8% de uma tela de 844px. Abaixo de 720px o mínimo é menor e o vão
cai para 44px. É uma linha só, no `01-tokens.css`.

**O lugar do caça-níquel deixa de ser fração da tela, até 720px.** Em tela
grande o lugar é `27svh` e sobra palco: o que fica em volta do rolo é respiro.
Num celular não sobra nada, e o `24svh` da faixa de 860px deixava a soma
(título + dois lugares) bem menor que o palco — o resto virava vão, e o pior
aparecia depois do último perfil, quando o lugar de baixo esvazia: eram ~360px
de nada no 390×844, com o rolo ocupando só 68% da tela.

Abaixo de 720px o lugar passa a ser **o que sobra do palco depois do título,
dividido pelo número de lugares**: `calc((100svh - var(--nav-h) - 13rem) / 3)`.
O rolo preenche o palco em vez de flutuar no meio dele, e o vão que sobrava
vira o lugar do perfil seguinte, que é conteúdo. O giro e a trava são
exatamente os mesmos do desktop — muda só a conta da altura.

As `13rem` são a reserva do bloco de título (o `h2` em duas linhas, o parágrafo
de apoio e o intervalo entre eles): se esse texto crescer, é esse número que
acompanha.

Abaixo de 720px de altura são dois lugares em vez de três, com o da vez em cima
e o seguinte espiando embaixo: com três, o que sobrava para cada um ficava menor
que o texto de um perfil e eles se sobrepunham.

Medido de 320×568 a 719×900: o lugar fica entre 142px e 216px contra um perfil
de 90px (nunca aperta), a grade sobra 21–33px dentro do palco (nunca estoura), o
rolo passa a ocupar **79% a 86%** da tela e a sobra depois do último perfil cai
de 360px para 189–312px. Essa sobra final é a mesma do desktop: num rolo que
destaca pelo meio, o último perfil sempre tem um lugar vazio embaixo.

O resto do site já era fluido e continua: conferido de 320px a 1920px nas duas
páginas, sem estouro horizontal e sem elemento fora da tela.

### Formulário — para onde vai o que as pessoas escrevem

O `action` dos dois formulários aponta para um **app da web do Apps Script**,
que grava cada resposta numa planilha do Google. A URL termina em `/exec` e
**está escrita nas duas páginas** (`index.html` e `missao-china.html`): trocar
o destino é trocar as duas.

O que sai no envio:

| campo | o que é |
|---|---|
| `origem` | `home` ou `missao-china` — para saber de onde veio |
| `assunto` | o mesmo, em texto, para quem lê a planilha |
| `destinos[]` | um valor por caixinha marcada (chega como lista) |
| `sugestao` | o campo aberto, obrigatório |
| `nome` | obrigatório |
| `email` | obrigatório |
| `telefone` | opcional |
| `aceite_termos` | **obrigatório** — trava o envio se não for marcado |
| `aceite_novidades` | opcional |
| `_isca` | a armadilha de robô: preenchida, o script descarta |

A ordem das colunas na planilha é a do `COLUNAS`, no topo do `Codigo.gs`, e o
`appendRow` do `gravar()` precisa segui-la **linha a linha**. Ao acrescentar um
campo, mexa nos dois — e nos dois HTML, que não têm template. O script reescreve
sozinho o cabeçalho quando ele não bate com o `COLUNAS`; o que ele não faz é
consertar as linhas gravadas antes, que ficam na ordem antiga.

**O envio funciona com e sem JavaScript, e é o `target` que separa os dois
casos.** Ele não está no HTML de propósito: sem script, o `<form>` faz o envio
do navegador mesmo, a página vai até o `/exec` e mostra a resposta do script —
feio, mas a linha é gravada. Com script, o `auvp.js` cria um iframe escondido,
põe o `target` nele e troca o formulário por um agradecimento, sem tirar
ninguém da página.

**O agradecimento fica sozinho no painel.** A chamada de cima ("Marque os
destinos…") sai junto com o formulário, porque pede o que já foi feito — sendo
a única coisa ali, ela é tamanho de título, com um selo verde acima. No card da
home o painel passa a centralizar o conteúdo (`:has(.auvp-form__recibo)`),
senão o agradecimento ficava pendurado no topo com meia altura de card vazia
embaixo; o "Voltar" continua, porque é a única saída de volta para a frente do
card.

**O agradecimento é otimista, e isso é de propósito.** A resposta vem de outro
domínio e o navegador não deixa lê-la; o que dá para saber é que o servidor
respondeu (o `load` do iframe) — e, se nem isso vier, um prazo de 4s o mostra
assim mesmo. O pedido saiu nos dois casos. **Quem confirma de verdade é a
planilha**, e é lá que se confere quando alguém disser que enviou e sumiu.

O código que recebe está no projeto do Apps Script, preso à planilha
(Extensões → Apps Script), e uma cópia dele mora em **`apps-script/Codigo.gs`**
para ficar versionada junto com o site. **O Google não lê daqui**: ao mudar
algo, copie para lá e publique.

Dois cuidados que respondem por quase toda falha de ligação:

1. **Toda alteração no código só vale depois de "Implantar → Gerenciar
   implantações → ✏️ → Versão: Nova versão".** Até isso, a URL do `/exec`
   continua servindo o código antigo. Criar uma implantação nova, em vez de
   versionar a existente, gera **outra URL** — e aí é o `action` das duas
   páginas que precisa mudar.
2. **O acesso da implantação precisa ser "Qualquer pessoa"**, não "qualquer
   pessoa com Conta do Google". Com a segunda, quem não estiver logado recebe
   uma tela de login no lugar da gravação.

### Quando a linha não aparece na planilha

O agradecimento no site é otimista e não prova nada — quem prova é a planilha.
Três lugares para olhar, nesta ordem:

1. **Abra a URL do `/exec` no navegador.** O `doGet` responde em texto: se
   disser "No ar" com o nome da planilha e a contagem de linhas, o script está
   certo e o problema é do lado do envio. Se pedir login, é o acesso da
   implantação. Se der `Script function not found: doGet`, o código publicado é
   antigo — falta a nova versão.
2. **`?teste=1` no fim dessa mesma URL** grava uma linha. Se gravar, a ponta
   Google está inteira.
3. **"Execuções", no menu da esquerda do editor.** Cada envio do site vira uma
   execução ali, com o erro por extenso quando falha. **Nenhuma execução** quer
   dizer que o pedido não chegou — a essa altura, o suspeito é a implantação ou
   a página publicada ainda ser a antiga.

A armadilha mais silenciosa é o projeto do Apps Script ser **avulso** em vez de
preso à planilha: `SpreadsheetApp.getActive()` devolve null, nada é gravado e o
site continua agradecendo. É para isso que existe a constante `PLANILHA_ID` no
topo do `Codigo.gs`.

### Missão China

A abertura é só o título e a frase, no papel. A faixa de foto que havia ali
saiu: era a foto da home repetida e empurrava o mosaico — que já é imagem, e
imagem de verdade desta viagem — para baixo da dobra.

**O mosaico** são três quadros parados que trocam a foto por dentro, com
fade — não é uma esteira rolando. As fotos de um quadro ficam empilhadas no
mesmo lugar e só a opacidade se alterna, com atrasos negativos dividindo o
ciclo entre elas.

São onze fotos da viagem, repartidas em 4 + 4 + 3. A quantidade tem de estar
dita na classe do quadro: `--quarteto` para quatro, `--duo` para duas, e nada
para três, que é o padrão. É ela que divide o ciclo em partes iguais e
encolhe a janela de exibição na mesma proporção — com quatro fotos, cada uma
fica um quarto do ciclo no ar, não um terço. **Ao acrescentar ou tirar foto
de um quadro, acerte essa classe junto** — é o que mantém a conta fechada.

Os ciclos dos quadros de quatro fotos cresceram junto (16s e 20s, contra os
18s do quadro de três): no ciclo antigo cada foto passaria depressa demais
para ser vista.

Dois cuidados que sustentam o efeito. As janelas de fade se sobrepõem: se
apenas se encostassem, sobraria um piscar de fundo entre uma foto e a
seguinte. E o passo de cada quadro é o `--ciclo` dele, nunca um
`animation-duration` por fora — os atrasos são frações de `--ciclo`, e
alterar a duração por outro caminho faz atraso e duração deixarem de bater,
o que reabre o piscar.

As fotos são reduzidas para 1600px no lado maior antes de entrar. Os
originais têm 4240px, para aparecerem num quadro de ~500px — sem reduzir, a
dobra baixa oito vezes mais pixel do que mostra. As quatro últimas somavam
3,0 MB e ficaram em 861 KB. **Foto nova passa por essa régua antes de subir.**

O vídeo da dobra da culinária é o do YouTube, embutido pelo domínio
`youtube-nocookie.com`, que não deixa cookie de rastreio em quem só passa
pela página sem dar play. Ele começa sozinho e **mudo** — navegador nenhum
permite autoplay com som, então o `mute=1` é o preço de não ficar só a
miniatura. O `loading="lazy"` faz o vídeo carregar quando a dobra se
aproxima, não no carregamento da página. Para trocar o vídeo, troque o ID na
URL do `<iframe>`.

**O mapa da Canton Fair** é o `assets/img/china.svg`, entrando como `<img>`.
O cinza mora dentro do próprio arquivo (`#a8a6a1`) em vez de no CSS, para não
existirem duas cópias dos contornos — para escurecer ou clarear o mapa, mude
a cor lá.

A logo (`assets/img/canton-fair.svg`) fica por cima, posicionada em
porcentagem sobre o desenho — `left: 68%; top: 86%`, que é onde cai
Guangzhou. Ela gira devagar para a esquerda, uma volta a cada 18 segundos.
Quem posiciona é o `<span>` de fora e quem gira é a `<img>` de dentro: se as
duas transformações ficassem no mesmo elemento, a rotação apagaria a
centralização e a logo sairia do lugar. Sob `prefers-reduced-motion`, o giro
para junto com o resto das animações do site.

### Roleta do posicionamento

Os quatro pilares da 2ª dobra são cartões com foto num trilho horizontal. A
frase da dobra ocupa a coluna da esquerda e os cartões correm à direita dela —
é o que deixa o canto esquerdo com peso em vez de vazio. Abaixo de 1200px as
duas partes viram uma coluna só, com a frase em cima, e as setas passam para
depois dos cartões: lá em cima, antes até da frase, elas apareciam sem nada
para comandar.

Quantos cartões cabem na janela é o `--vis` (1 em tela estreita, 2 no
restante). O passo — a distância de um cartão ao seguinte — quem mede é o
próprio JavaScript, no elemento, então ele vale em qualquer largura sem o CSS
repetir a conta.

A fila está duplicada no HTML e é a cópia que fecha o laço sem costura: o
trilho anda até parar sobre a cópia do primeiro cartão e volta ao começo sem
transição, o que não aparece porque a tela é idêntica. **Mexeu num cartão,
mexa no gêmeo.**

O passeio anda de **4,5 em 4,5 segundos** — o número está no `roleta()` do
`assets/js/auvp.js`. Já foi 2,5s, e no cartão de texto mais longo não dava
tempo de ler antes de ele sair.

### Diferencial

Era um globo girando com uma parede de palavras por cima. Virou um índice:
cinco linhas, cada uma com a palavra e um traço que atravessa. Cada linha
entra com a rolagem, no timeline dela mesma — o escalonamento vem da posição
na tela, não de `animation-delay` — e o cursor completa o traço e empurra a
palavra. Nada de imagem externa: a dobra é só tipografia e um filete.

A revelação termina em `entry 100%`, o instante em que a linha acabou de
entrar inteira na tela. Enquanto ia até `cover 30%`, a última linha ficava
parada no meio da animação, mais clara que as outras — parecia cor diferente,
e era só a revelação sem terminar.
### Fotos da dobra Experiência

As quatro entram por URL do CDN do Pexels. O endereço se monta a partir do id
que aparece no fim do link da página da foto:

```
página  pexels.com/pt-br/foto/…-14036272/
CDN     images.pexels.com/photos/14036272/pexels-photo-14036272.jpeg?auto=compress&cs=tinysrgb&w=1600
```

Se for trocar alguma, **troque a linha, não acrescente outra**: duas regras
para o mesmo `--bg` e a última cala a primeira, em silêncio. Foi assim que a
aba 01 já mostrou a foto errada, depois de um merge deixar dois conjuntos de
URLs no arquivo.

O quadro da dobra é largo e baixo, e o `cover` corta em cima e embaixo. Na
foto das malas isso comia justo o que interessa, porque mala fica apoiada no
chão: o recorte dela é puxado para baixo com `background-position: center
72%`. É o único botão — 50% é o centro da foto, e quanto maior, mais o
recorte desce.

### Fontes

Duas famílias, carregadas por `<link>` no `<head>`:

- **General Sans** (Fontshare) — títulos, botões e rótulos de interface
- **Red Hat Mono** (Google Fonts) — texto corrido

Se algum dos dois serviços estiver indisponível, a página cai para a fonte de
sistema — continua legível e com a mesma diagramação (testado).

Para auto-hospedar e não depender de serviço externo, baixe os `.woff2` das
duas, coloque em `assets/fonts/` e troque os dois `<link>` por `@font-face`
no `01-tokens.css`.

### Cores e legibilidade

Tudo em neutros de papel e tinta. O verde **#023620** é pontual — aparece só
em chapéus, números de seção, a palavra destacada de cada título, estados
ativos, botões e marcas pequenas. O rodapé e a primeira dobra são as áreas
escuras.

Existe uma segunda versão do acento, o `--verde-claro` (**#a9c9b6**), só para
fundo escuro: sobre o overlay preto do hero o verde original desaparece. Ele
é o contrário do outro — sobre o papel, reprova no contraste. Cada um no seu
fundo.

Todas as cores são variáveis no `01-tokens.css`. Para trocar o acento, mude
uma linha:

```css
--verde: #023620;
```

Os tons de tinta foram calibrados por contraste medido, não por aparência.
Todo texto do site fica acima de 4.5:1 sobre o papel — o mínimo da WCAG para
texto normal. Se for criar um tom novo, meça antes: `--ink-45` já foi 2.82:1
e `--ink-30` já foi 1.91:1, e era exatamente o que deixava rótulos e legendas
ilegíveis. O único tom abaixo da linha é o `--ink-30` (3.44:1), reservado a
placeholder de campo, que não carrega informação — quem carrega é o `<label>`
ao lado.

### Imagens

O texto da primeira dobra já chega escrito sobre a foto: entra no
carregamento, em menos de um segundo, e não depende mais de rolagem. Quem
abre a página e não rola lê a dobra inteira.

**A dobra tem 88svh, não 100**: ela para um pouco antes do fim da tela para a
próxima aparecer por baixo, e é esse pedaço espiando que convida a rolar. Uma
tela cheia até a borda não dá pista de que há mais. O número está em duas
linhas do `07-hero.css` (`.auvp-hero-pin` e o `min-height` do `.auvp-hero`) e
as duas mudam juntas.

O fundo da primeira dobra é `assets/img/hero-imersao.jpg`. Para trocar, troque
o arquivo ou o `src` do `<img class="auvp-art">` dentro de `.auvp-hero__media`.
Sobre ela vai o overlay preto (`.auvp-hero__scrim`): uma camada chapada em
toda a foto mais um degradê que fecha no rodapé, onde o texto mora. A soma
das duas deixa ~75% de preto embaixo, o suficiente para o texto branco, e
~45% no meio, onde a foto ainda precisa aparecer. Ao trocar por uma foto mais
clara, é esse par de valores que se ajusta.

Os cartões da roleta usam as fotos da Missão China que já estão no
repositório. As fotos dos cards de destino e da dobra Experiência ainda vêm
do Pexels, por URL. Para deixar o site inteiro auto-contido, baixe cada uma
para `assets/img/` e troque os `src`.

A arte vetorial das dobras (skylines, cordilheira com mina, malha de
meridianos) foi desenhada em SVG para o projeto e está embutida no markup.

---

## Divergências no briefing

1. **O card 2** vinha rotulado como *Portugal*, mas título e subtítulo
   descreviam o **Chile** (“o coração mineiro da América Latina”). Foi tratado
   como Chile, e “mercado europeu” virou “mercado latino-americano”. Se o
   destino correto for Portugal, esse card precisa ser reescrito.
2. A estrutura do briefing **pula o item 7** (vai de 6 para 8). Nada ficou de
   fora; as seções foram renumeradas de 01 a 07 na interface.
3. A dobra de candidatura não tinha copy no briefing e foi escrita seguindo o
   tom das demais.

## Histórico

O site nasceu como **um `index.html` único**, para ser copiado e colado num
widget HTML do Elementor. Disso vinham duas coisas que não existem mais:

- todo o CSS ficava num `<style>` dentro do `<body>`;
- todo seletor era escopado em `.auvp-x` e havia um bloco de reset por
  elemento, para o tema do WordPress não vazar para dentro do site.

Fora do WordPress nada disso é necessário. A reestruturação removeu o escopo e
a barreira **sem mudar uma linha de copy nem um pixel do desenho** — a
verificação foi feita comparando as duas versões pixel a pixel.
