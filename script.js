import { search_for_word, sort_by_score, eval_word } from "./guesser.js";
import { potential_answers } from "./answers.js";

const validGuesses = potential_answers

let guessCounter = 6;
let guessWord = [];

let grayChars = []
let yellowWordHistory = []
let greenWord = ['.', '.', '.', '.', '.']
let clearedLetters = []
let curYellowWord = []

let correctGuess = false
let noBestGuesses = false
let GameOver = false

const tiers = ['gray', 'yellow', 'green'];
const alphaBet = "QWERTYUIOPASDFGHJKLZXCVBNM";
const alertLog = document.getElementsByClassName("alertLogs")[0];
const canvas = document.getElementById('help')
const ctx = canvas.getContext('2d')

function clickOnCellColour(cell, row)
{
    const cellRow = ( row - (row%5) )/5
    if (cell.className === "empty" || (6-cellRow) != guessCounter)
    {
        return
    }
    let id = tiers.indexOf(cell.className)
    id = (id + 1) % 3
    const nextColour = tiers[id]
    cell.className = nextColour
}

function initialize()
{
    ctx.fillStyle = "#3a3a3c"
    ctx.fillRect(0, 0, 200, 300)
    const wordleGameBoard = document.getElementsByClassName("wordleBoard")[0];
    const cells = wordleGameBoard.getElementsByTagName('td');

    for (let i = 0; i < cells.length; i++)
    {
        cells[i].innerHTML = "";
        cells[i].className = "empty";
        cells[i].addEventListener("click", () => {
            clickOnCellColour(cells[i], i)
        })
    };
    
    for (let m = 0; m < alphaBet.length; m++)
    {
        document.getElementById(alphaBet[m]).className = "";
    };
}

function updateCell()
{
    const row = document.getElementById(`${6 - guessCounter}`);
    const cells = row.getElementsByTagName('td');

    for (let letters = 0; letters < cells.length; letters++)
    {   
        if (guessWord[letters])
        {
            cells[letters].innerHTML = guessWord[letters];
            if (cells[letters].className == 'empty')
            {
                cells[letters].className = 'gray'
            }
        }
        else
        {
            cells[letters].innerHTML = "";
            cells[letters].className = "empty"
        };
    };
};

function convertRow()
{
    let yellowWord = ['.', '.', '.', '.', '.']
    const row = document.getElementById(`${6 - guessCounter}`);
    const cells = row.getElementsByTagName('td');
    let greenCounter = 0
    for (let letters = 0; letters < cells.length; letters++)
    {
        const cell = cells[letters]
        const colour = cell.className
        const letter = cell.innerHTML
        if (colour == "green")
        {
            greenCounter += 1
            greenWord[letters] = letter
            clearedLetters.push(letter)
        }
        else if (colour == "yellow")
        {
            yellowWord[letters] = letter
            clearedLetters.push(letter)
        }
    }
    for (let letters = 0; letters < cells.length; letters++)
    {
        const cell = cells[letters]
        const colour = cell.className
        const letter = cell.innerHTML
        if (colour == "gray" && !clearedLetters.includes(letter))
        {
            grayChars.push(letter)
        }
    }
    yellowWordHistory.push(yellowWord)
    curYellowWord = yellowWord
    if (greenCounter == 5)
    {
        correctGuess = true
    }
}

function removeLastAlert()
{
    const latest = alertLog.childNodes[0];
    alertLog.removeChild(latest);
}

function addLetter(char)
{
    if (guessWord.length < 5 && !GameOver)
    {
        guessWord.push(char);
        updateCell();
    };
};

function backSpace()
{
    if (!GameOver)
    {
        guessWord.pop();
        updateCell();
    }
    
};

function updateKeyboard()
{
    for (let gray in grayChars)
    {
        document.getElementById(grayChars[gray]).className = 'gray'
    }

    for (let yel in curYellowWord)
    {
        if (curYellowWord[yel] != ".")
        {
            document.getElementById(curYellowWord[yel]).className = 'yellow'
        }
    }

    for (let gre in greenWord)
    {
        if (greenWord[gre] != ".")
        {
            document.getElementById(greenWord[gre]).className = 'green'
        }
    }
};

function updateBestWord()
{
    ctx.clearRect(0, 0, 200, 300)
    ctx.fillStyle = "#3a3a3c"
    ctx.fillRect(0, 0, 200, 300)
    
    ctx.font = "15px arial"

    const bestWords = sort_by_score(search_for_word(grayChars, yellowWordHistory, greenWord))
    console.log(bestWords)
    if (bestWords.length == 0)
    {
        noBestGuesses = true
    }
    let topLen = 10
    if (bestWords.length < topLen)
    {
        topLen = bestWords.length
    }
    for (let i = 1; i <= topLen; i++)
    {
        ctx.fillStyle = "#FFFFFF"
        const y = i*27 + 10
        const x = 10
        const score = eval_word(bestWords[i-1])
        ctx.fillText(`${i}. ${bestWords[i-1]}`, x, y)
        ctx.fillText(`${score}`, x + 90, y)
        ctx.fillStyle = "#6ca965"
        ctx.fillRect(x + 120, y, score, -10)
    }
}

function enterButton()
{
    const lowerCaseGuessWord = guessWord.join('').toLowerCase();
    let alertText = "";

    if (noBestGuesses)
    {
        alertText = "We cannot find the next best guess"
    }
    else if (guessWord.length != 5)
    {
        alertText = "Not enough letters";
    }
    else if (validGuesses.includes(lowerCaseGuessWord))
    {
        convertRow()
        updateBestWord()
        updateKeyboard()
        guessCounter -= 1;
        guessWord = [];
        GameOver = (correctGuess || noBestGuesses)
        return;
    }
    else
    {
        alertText = "Not in word list";
    };

    if (alertLog.children.length < 6)
    {
        const alertDiv = document.createElement("div");
        alertDiv.className = "warning";
        alertDiv.innerText = alertText;

        alertLog.appendChild(alertDiv);
        setTimeout(removeLastAlert, 2000);
    };
    
};

function main()
{
    initialize();

    for (let letters in alphaBet)
    {
        const letter = alphaBet[letters];
        const letterKey = document.getElementById(letter);
        letterKey.addEventListener('click', (event) =>{
            addLetter(letter);
        });
    };

    document.getElementById("ENTER").addEventListener('click', (event) =>{
        enterButton();
    });

    document.getElementById("BACKSPACE").addEventListener('click', (event) =>{
        backSpace();
    });

    document.addEventListener('keyup', (event) =>{
        const key = event.key.toUpperCase()

        if (alphaBet.includes(key))
        {
            addLetter(key);
        }
        else if (key == 'BACKSPACE')
        {
            backSpace();
        }
        else if (key == 'ENTER')
        {
            enterButton();
        };
    });
};

window.onload = () => {
    main();

}

