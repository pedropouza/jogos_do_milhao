type TypeGame = "megasena" | "quina" | "lotofacil" | "lotomania" | "duplasena" | "timemania" | "diadesorte" | "federal" | "loteca" | "supersete" | "maismilionaria" | "euromilhao"

type NumberGame = "ultimo" | number

interface Result {
    dezenasSorteadasOrdemSorteio: string[]
    listaDezenas: string[]
    acumulado: boolean
    numero: number
    tipoJogo: string
    dataApuracao: string
}

interface gameResultEuro {
    date: string
    numbers: string[]
    stars: string[]
    length:any
    id: number
}

// Lista com os jogos que foram procurados.
let gamesList = []
let starList = []


// Procura pelo jogo, salva na lista e retorna os dados formatados.
async function fetchGamesBR(game:TypeGame, numberGame: NumberGame) {
    const response = await fetch(`https://api.guidi.dev.br/loteria/${game}/${numberGame}`)
    const gameResult:Result = await response.json()
    
    gamesList.push(gameResult.listaDezenas)
    
    const tr = document.createElement('tr')
    const tdDate = document.createElement('td')
    const tdNum = document.createElement('td')
    const tdRes = document.createElement('td')

    tdDate.textContent = gameResult.dataApuracao
    tdNum.textContent = gameResult.numero.toString()
    tdRes.textContent = gameResult.listaDezenas.join(" • ")

    tr.append(tdDate, tdNum, tdRes)
    const gameResultsHTML = document.querySelector('#gameResults .gameResults > tbody')
    gameResultsHTML.append(tr)
}

// Mostra os jogos Brasileiro, ordenados da distancia escolhida até o ultimo.
async function showGamesBR(game:any, range:number) {
    showLoader()
    const response = await fetch(`https://api.guidi.dev.br/loteria/${game}/ultimo`)
    const gameResult:Result = await response.json()
    
    const lastNumber = gameResult.numero
    const rangeFor = lastNumber - range
    
    for (let i = lastNumber; i > rangeFor; i--) {
        await fetchGamesBR(game, i)
    }

    const orderedFrequencies = countFreq(gamesList);

    orderedFrequencies.forEach((obj) => {
        const tr = document.createElement('tr')
        const tdNum = document.createElement('td')
        const tdFreq = document.createElement('td')

        tdNum.textContent = obj.number.toString()
        tdFreq.textContent = obj.frequency.toString()

        tr.append(tdNum, tdFreq)
        const frequenciesNumberHTML = document.querySelector('#gameResults .frequenciesNumber > tbody')
        frequenciesNumberHTML.append(tr)
    })

    hideLoader()
}

// Mostra os jogos Europeu, ordenados da distania escolhida ate o ultimo.
async function showGamesEU(range:number) {
    showLoader()
    const response = await fetch('https://euromillions.api.pedromealha.dev/draws')
    const gameResult:gameResultEuro = await response.json()

    const allGames = gameResult.length - 1
    const rangeGame = gameResult.length - range


    for (let i = allGames; i >= rangeGame; i--) {
        const tr = document.createElement('tr')
        const tdDate = document.createElement('td')
        const tdStars = document.createElement('td')
        const tdRes = document.createElement('td')

        const thStars = document.querySelector('.gameResults thead tr th:nth-child(2)')
        thStars.textContent = 'Estrelas da Sorte'

        
        tdDate.textContent = formatDate(gameResult[i].date)
        tdStars.textContent = gameResult[i].stars.join(" • ")
        tdRes.textContent = gameResult[i].numbers.join(" • ")
        
        tr.append(tdDate, tdStars, tdRes)
        const gameResultsHTML = document.querySelector('#gameResults .gameResults > tbody')
        gameResultsHTML.append(tr)
        
        gamesList.push(gameResult[i].numbers);
        starList.push(gameResult[i].stars)
    }
    const orderedFrequencies = countFreq(gamesList);
    const orderedStarFrequencies = countFreq(starList)

    orderedFrequencies.forEach((obj) => {
        const tr = document.createElement('tr')
        const tdNum = document.createElement('td')
        const tdFreq = document.createElement('td')

        tdNum.textContent = obj.number.toString()
        tdFreq.textContent = obj.frequency.toString()

        tr.append(tdNum, tdFreq)
        const frequenciesNumberHTML = document.querySelector('#gameResults .frequenciesNumber > tbody')
        frequenciesNumberHTML.append(tr)
    })

    orderedStarFrequencies.forEach((obj) => {
        const tr = document.createElement('tr')
        const tdNum = document.createElement('td')
        const tdFreq = document.createElement('td')

        tdNum.textContent = obj.number.toString()
        tdFreq.textContent = obj.frequency.toString()

        tr.append(tdNum, tdFreq)
        const frequenciesStarNumberHTML = document.querySelector('#gameResults .frequenciesStarNumber > tbody')
        frequenciesStarNumberHTML.append(tr)
    })


    hideLoader()
}

// Conta a frequencia dos numeros e os ordena do maior para o menor.
function countFreq(array: number[][]): { number: number; frequency: number }[] {
    const frequencies: Record<number, number> = {};
    
    // Conta a frequência de cada número
    array.forEach(innerArray => {
        innerArray.forEach(num => {
            frequencies[num] = (frequencies[num] || 0) + 1;
        });
    });
    
    // Converte o objeto de frequências em um array de pares [número, frequência]
    const listFrequencies: [number, number][] = Object.entries(frequencies).map(([num, freq]) => [Number(num), freq]);
    
    // Ordena os números pela frequência, do mais frequente para o menos frequente
    listFrequencies.sort((a, b) => b[1] - a[1]);
    
    // Formata o resultado
    const resultado = listFrequencies.map(([num, freq]) => ({ number: num, frequency: freq }));
    
    return resultado;
}

// Formata a data
function formatDate(data:string) {
    const dateString = data;

    // Converta a string em um objeto Date
    const date = new Date(dateString);

    // Obtenha o dia, mês e ano
    const day = String(date.getDate()).padStart(2, '0');  // Dia com dois dígitos
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Mês com dois dígitos (0-11, por isso o +1)
    const year = date.getFullYear(); // Ano com 4 dígitos

    // Formate a data como "DD/MM/AAAA"
    const formattedDate = `${day}/${month}/${year}`;

    return formattedDate

}

// Rendereriza a estrutura basica das tabelas
function renderResultsStructure(typeGame) {
    // Div geral
    const gameResultsDiv = document.getElementById('gameResults')

    // Tabela do Tipo de jogo
    const tableTypeGame = document.createElement('table')
    tableTypeGame.classList.add('typeGame')
    const theadTypeGame = renderThead('Tipo de Jogo')
    const tbodyTypeGame = document.createElement('tbody')
    const tr = document.createElement('tr')
    const td = document.createElement('td')
    td.textContent = typeGame
    tr.append(td)
    tbodyTypeGame.append(tr)


    tableTypeGame.append(theadTypeGame, tbodyTypeGame)

    // Tabela do Resultado
    const tableGameResults = document.createElement('table')
    tableGameResults.id = 'gameResultsTable'
    tableGameResults.classList.add('gameResults')
    const tbodyGameResults = document.createElement('tbody')
    if (typeGame === 'euromilhao') {
        const theadGameResults = renderThead('Data', 'Estrelas da Sorte', 'Resultado')
        tableGameResults.append(theadGameResults, tbodyGameResults)
    } else {
        const theadGameResults = renderThead('Data', 'Concurso', 'Resultado')
        tableGameResults.append(theadGameResults, tbodyGameResults)
    }

    // Tabela da Frequencia dos Numeros
    const tableFrequenciesNumber = document.createElement('table')
    tableFrequenciesNumber.id = 'frequenciesNumber'
    tableFrequenciesNumber.classList.add('frequenciesNumber')
    const theadFreq = renderThead('Número', 'Frequência')
    const tbodyFreq = document.createElement('tbody')
    tableFrequenciesNumber.append(theadFreq, tbodyFreq)

    gameResultsDiv.append(tableTypeGame, tableGameResults, tableFrequenciesNumber)

    if (typeGame === 'euromilhao') {
        const tableFrequenciesStar = document.createElement('table')
        tableFrequenciesStar.id = 'frequenciesStarNumber'
        tableFrequenciesStar.classList.add('frequenciesStarNumber')
        const theadStar = renderThead('Nº Estrela', 'Frequência')
        const tbodyStar = document.createElement('tbody')
        tableFrequenciesStar.append(theadStar, tbodyStar)
        gameResultsDiv.append(tableFrequenciesStar)
    }

}

// Renderiza os botões que caminham até o resultado ou frequencia dos numeros
function renderButtonsToGo(europe?:boolean) {
    clearAll('buttonsGoTo')

    const buttonsDiv = document.getElementById('buttonsGoTo')

    const btnGoToResults = document.createElement('button')
    btnGoToResults.id = 'GoToResults'
    btnGoToResults.textContent = "Resultado"
    btnGoToResults.onclick = () => {
        window.location.href = '#gameResultsTable'
    }

    const btnGoToFrequencies = document.createElement('button')
    btnGoToFrequencies.id = 'GoToFrequencies'
    btnGoToFrequencies.textContent = 'Frequência'
    btnGoToFrequencies.onclick = () => {
        window.location.href = '#frequenciesNumber'
    }

    buttonsDiv.append(btnGoToResults, btnGoToFrequencies)
    
    if (europe) {
    const btnGoToStarFrequencies = document.createElement('button')
    btnGoToStarFrequencies.id = 'GoToStarFrequencies'
    btnGoToStarFrequencies.textContent = 'Frequência de Estrelas'
    btnGoToStarFrequencies.onclick = () => {
        window.location.href = '#frequenciesStarNumber'
    }
    buttonsDiv.append(btnGoToStarFrequencies)
    }

    const backToTop = document.createElement('button')
    backToTop.id = 'GoToTop'
    backToTop.innerHTML = "&uarr;"
    backToTop.onclick = () => {
        window.location.href = '#content'
    }

    buttonsDiv.append(backToTop)

}

// Renderiza o Header das tabelas
function renderThead(...titleHead: string[]) {
    const THead = document.createElement('thead')
    const tr = document.createElement('tr')

    titleHead.forEach((item) => {
        const th = document.createElement('th')
        th.textContent = item
        tr.append(th)
    })
    THead.append(tr)
    return THead
}

// Limpa os resultados ao fazer uma nova busca.
function clearAll(id:string) {
    const fatherDiv = document.getElementById(id)
    while (fatherDiv.firstChild) {
        fatherDiv.removeChild(fatherDiv.firstChild)
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
    ev.preventDefault()
    clearAll('gameResults')
    clearAll('buttonsGoTo')
    gamesList = []
    starList = []
    
    const select = document.getElementById('gameType') as HTMLSelectElement
    let selectValue = select.value

    const range = document.getElementById('range') as HTMLInputElement
    let rangeValue = Number(range.value)
    
    
    if (selectValue !== '' && rangeValue > 0) {
        renderResultsStructure(selectValue)
        if (selectValue === 'euromilhao') {
            renderButtonsToGo(true)
            showGamesEU(rangeValue)
        } else {
            renderButtonsToGo()
            showGamesBR(selectValue, rangeValue)
        }

    } else {
        alert('Escolha um tipo de jogo e seu alcance sendo maior que 0.')
    }

    const form = ev.target as HTMLFormElement
    form.reset()
})
