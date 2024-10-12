type TypeGame = "megasena" | "quina" | "lotofacil" | "lotomania" | "duplasena" | "timemania" | "diadesorte" | "federal" | "loteca" | "supersete" | "maismilionaria"

type NumberGame = "ultimo" | number

interface Result {
    dezenasSorteadasOrdemSorteio: string[]
    listaDezenas: string[]
    acumulado: boolean
    numero: number
    tipoJogo: string
    dataApuracao: string
}

// Lista com os jogos que foram procurados.
const gamesList = []


// Procura pelo jogo, salva na lista e retorna os dados formatados.
async function fetchGames(game:TypeGame, numberGame: NumberGame) {
    const response = await fetch(`https://api.guidi.dev.br/loteria/${game}/${numberGame}`)
    const gameResult:Result = await response.json()
    
    gamesList.push(gameResult.listaDezenas)
    
    const tr = document.createElement('tr')
    const tdDate = document.createElement('td')
    const tdNum = document.createElement('td')
    const tdRes = document.createElement('td')

    tdDate.textContent = gameResult.dataApuracao
    tdNum.textContent = gameResult.numero.toString()
    tdRes.textContent = gameResult.listaDezenas.join(" - ")

    tr.append(tdDate, tdNum, tdRes)
    gameResultsHTML.append(tr)

}


// Mostra os jogos, ordenados da distancia escolhida até o ultimo.
async function showGames(game:TypeGame, range:number) {
    const response = await fetch(`https://api.guidi.dev.br/loteria/${game}/ultimo`)
    const gameResult:Result = await response.json()
    
    const lastNumber = gameResult.numero
    const rangeFor = lastNumber - range
    
    for (let i = lastNumber; i > rangeFor; i--) {
        await fetchGames(game, i)
    }
}


// Mostra as informações gerais do jogo em específico.
// Sem uso no momento...
async function showGameInfo(game:TypeGame, numberGame: NumberGame) {
    const response = await fetch(`https://api.guidi.dev.br/loteria/${game}/${numberGame}`)
    const gameResult:Result = await response.json()
    
    console.log(gameResult); 
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


// Executa o programa, mostrando os ultimos jogos e contando a frequencia dos numeros.
async function main(game, range:number) {
    await showGames(game, range)
    const orderedFrequencies = countFreq(gamesList);

    orderedFrequencies.forEach((obj) => {
        const tr = document.createElement('tr')
        const tdNum = document.createElement('td')
        const tdFreq = document.createElement('td')

        tdNum.textContent = obj.number.toString()
        tdFreq.textContent = obj.frequency.toString()

        tr.append(tdNum, tdFreq)
        frequenciesNumberHTML.append(tr)
    })
}



const gameResultsDiv = document.getElementById("gameResults")

const typeGameHTML = document.querySelector('#gameResults .typeGame > tbody tr td')
const gameResultsHTML = document.querySelector('#gameResults .gameResults > tbody')
const frequenciesNumberHTML = document.querySelector('#gameResults .frequenciesNumber > tbody')



document.querySelector('form').addEventListener('submit', (ev) => {
    ev.preventDefault()
    
    const select = document.getElementById('gameType') as HTMLSelectElement
    const selectValue = select.value

    const range = document.getElementById('range') as HTMLInputElement
    const rangeValue = Number(range.value)
    if (selectValue !== '' && rangeValue > 0) {
        gameResultsDiv.style.display = 'flex'

        if (selectValue === 'euromilhao') {
            euroMilhao(rangeValue)
        } else {
            main(selectValue, rangeValue)
        }

        typeGameHTML.textContent = selectValue

    } else {
        alert('Escolha um tipo de jogo e seu alcance sendo maior que 0.')
    }
})

document.querySelector('form').addEventListener('reset', (ev) => {
    ev.preventDefault()
    location.reload()
})

interface gameResultEuro {
    date: string
    numbers: string[]
    stars: string[]
    length:any
    id: number
}

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

async function euroMilhao(range:number) {
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
        tdStars.textContent = gameResult[i].stars.join(" - ")
        tdRes.textContent = gameResult[i].numbers.join(" - ")
        
        tr.append(tdDate, tdStars, tdRes)
        gameResultsHTML.append(tr)
        
        gamesList.push(gameResult[i].numbers);

    }
    const orderedFrequencies = countFreq(gamesList);

    orderedFrequencies.forEach((obj) => {
        const tr = document.createElement('tr')
        const tdNum = document.createElement('td')
        const tdFreq = document.createElement('td')

        tdNum.textContent = obj.number.toString()
        tdFreq.textContent = obj.frequency.toString()

        tr.append(tdNum, tdFreq)
        frequenciesNumberHTML.append(tr)
    })
}

