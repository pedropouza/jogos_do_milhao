// Lista com os jogos que foram procurados.
let gamesList = [];
// Procura pelo jogo, salva na lista e retorna os dados formatados.
async function fetchGamesBR(game, numberGame) {
    const response = await fetch(`https://api.guidi.dev.br/loteria/${game}/${numberGame}`);
    const gameResult = await response.json();
    gamesList.push(gameResult.listaDezenas);
    const tr = document.createElement('tr');
    const tdDate = document.createElement('td');
    const tdNum = document.createElement('td');
    const tdRes = document.createElement('td');
    tdDate.textContent = gameResult.dataApuracao;
    tdNum.textContent = gameResult.numero.toString();
    tdRes.textContent = gameResult.listaDezenas.join(" - ");
    tr.append(tdDate, tdNum, tdRes);
    const gameResultsHTML = document.querySelector('#gameResults .gameResults > tbody');
    gameResultsHTML.append(tr);
}
// Mostra os jogos Brasileiro, ordenados da distancia escolhida até o ultimo.
async function showGamesBR(game, range) {
    showLoader();
    const response = await fetch(`https://api.guidi.dev.br/loteria/${game}/ultimo`);
    const gameResult = await response.json();
    const lastNumber = gameResult.numero;
    const rangeFor = lastNumber - range;
    for (let i = lastNumber; i > rangeFor; i--) {
        await fetchGamesBR(game, i);
    }
    const orderedFrequencies = countFreq(gamesList);
    orderedFrequencies.forEach((obj) => {
        const tr = document.createElement('tr');
        const tdNum = document.createElement('td');
        const tdFreq = document.createElement('td');
        tdNum.textContent = obj.number.toString();
        tdFreq.textContent = obj.frequency.toString();
        tr.append(tdNum, tdFreq);
        const frequenciesNumberHTML = document.querySelector('#gameResults .frequenciesNumber > tbody');
        frequenciesNumberHTML.append(tr);
    });
    hideLoader();
}
// Mostra os jogos Europeu, ordenados da distania escolhida ate o ultimo.
async function showGamesEU(range) {
    showLoader();
    const response = await fetch('https://euromillions.api.pedromealha.dev/draws');
    const gameResult = await response.json();
    const allGames = gameResult.length - 1;
    const rangeGame = gameResult.length - range;
    for (let i = allGames; i >= rangeGame; i--) {
        const tr = document.createElement('tr');
        const tdDate = document.createElement('td');
        const tdStars = document.createElement('td');
        const tdRes = document.createElement('td');
        const thStars = document.querySelector('.gameResults thead tr th:nth-child(2)');
        thStars.textContent = 'Estrelas da Sorte';
        tdDate.textContent = formatDate(gameResult[i].date);
        tdStars.textContent = gameResult[i].stars.join(" - ");
        tdRes.textContent = gameResult[i].numbers.join(" - ");
        tr.append(tdDate, tdStars, tdRes);
        const gameResultsHTML = document.querySelector('#gameResults .gameResults > tbody');
        gameResultsHTML.append(tr);
        gamesList.push(gameResult[i].numbers);
    }
    const orderedFrequencies = countFreq(gamesList);
    orderedFrequencies.forEach((obj) => {
        const tr = document.createElement('tr');
        const tdNum = document.createElement('td');
        const tdFreq = document.createElement('td');
        tdNum.textContent = obj.number.toString();
        tdFreq.textContent = obj.frequency.toString();
        tr.append(tdNum, tdFreq);
        const frequenciesNumberHTML = document.querySelector('#gameResults .frequenciesNumber > tbody');
        frequenciesNumberHTML.append(tr);
    });
    hideLoader();
}
// Conta a frequencia dos numeros e os ordena do maior para o menor.
function countFreq(array) {
    const frequencies = {};
    // Conta a frequência de cada número
    array.forEach(innerArray => {
        innerArray.forEach(num => {
            frequencies[num] = (frequencies[num] || 0) + 1;
        });
    });
    // Converte o objeto de frequências em um array de pares [número, frequência]
    const listFrequencies = Object.entries(frequencies).map(([num, freq]) => [Number(num), freq]);
    // Ordena os números pela frequência, do mais frequente para o menos frequente
    listFrequencies.sort((a, b) => b[1] - a[1]);
    // Formata o resultado
    const resultado = listFrequencies.map(([num, freq]) => ({ number: num, frequency: freq }));
    return resultado;
}
// Formata a data
function formatDate(data) {
    const dateString = data;
    // Converta a string em um objeto Date
    const date = new Date(dateString);
    // Obtenha o dia, mês e ano
    const day = String(date.getDate()).padStart(2, '0'); // Dia com dois dígitos
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Mês com dois dígitos (0-11, por isso o +1)
    const year = date.getFullYear(); // Ano com 4 dígitos
    // Formate a data como "DD/MM/AAAA"
    const formattedDate = `${day}/${month}/${year}`;
    return formattedDate;
}
// Rendereriza a estrutura basica das tabelas
function renderResultsStructure(typeGame) {
    // Div geral
    const gameResultsDiv = document.getElementById('gameResults');
    // Tabela do Tipo de jogo
    const tableTypeGame = document.createElement('table');
    tableTypeGame.classList.add('typeGame');
    const theadTypeGame = renderThead('Tipo de Jogo');
    const tbodyTypeGame = document.createElement('tbody');
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.textContent = typeGame;
    tr.append(td);
    tbodyTypeGame.append(tr);
    tableTypeGame.append(theadTypeGame, tbodyTypeGame);
    // Tabela do Resultado
    const tableGameResults = document.createElement('table');
    tableGameResults.classList.add('gameResults');
    const tbodyGameResults = document.createElement('tbody');
    if (typeGame === 'euromilhao') {
        const theadGameResults = renderThead('Data', 'Estrelas da Sorte', 'Resultado');
        tableGameResults.append(theadGameResults, tbodyGameResults);
    }
    else {
        const theadGameResults = renderThead('Data', 'Concurso', 'Resultado');
        tableGameResults.append(theadGameResults, tbodyGameResults);
    }
    // Tabela da Frequencia dos Numeros
    const tableFrequenciesNumber = document.createElement('table');
    tableFrequenciesNumber.classList.add('frequenciesNumber');
    const theadFreq = renderThead('Número', 'Frequência');
    const tbodyFreq = document.createElement('tbody');
    tableFrequenciesNumber.append(theadFreq, tbodyFreq);
    gameResultsDiv.append(tableTypeGame, tableGameResults, tableFrequenciesNumber);
}
// Renderiza o Header das tabelas
function renderThead(...titleHead) {
    const THead = document.createElement('thead');
    const tr = document.createElement('tr');
    titleHead.forEach((item) => {
        const th = document.createElement('th');
        th.textContent = item;
        tr.append(th);
    });
    THead.append(tr);
    return THead;
}
// Limpa os resultados ao fazer uma nova busca.
function clearAll() {
    const gameResults = document.getElementById('gameResults');
    while (gameResults.firstChild) {
        gameResults.removeChild(gameResults.firstChild);
    }
}
// Mostra o Loader
function showLoader() {
    const loaderContainer = document.getElementById('loader-container');
    if (loaderContainer) {
        loaderContainer.style.display = 'flex';
    }
}
// Esconde o Loader
function hideLoader() {
    const loaderContainer = document.getElementById('loader-container');
    const content = document.getElementById('content');
    if (loaderContainer) {
        loaderContainer.style.display = 'none';
    }
    if (content) {
        content.style.display = 'block'; // Exibe o conteúdo da página
    }
}
document.querySelector('form').addEventListener('submit', (ev) => {
    ev.preventDefault();
    clearAll();
    gamesList = [];
    const select = document.getElementById('gameType');
    const selectValue = select.value;
    const range = document.getElementById('range');
    const rangeValue = Number(range.value);
    if (selectValue !== '' && rangeValue > 0) {
        renderResultsStructure(selectValue);
        if (selectValue === 'euromilhao') {
            showGamesEU(rangeValue);
        }
        else {
            showGamesBR(selectValue, rangeValue);
        }
    }
    else {
        alert('Escolha um tipo de jogo e seu alcance sendo maior que 0.');
    }
});
