const screen = document.querySelector(".screen");
const historyPanel = document.querySelector(".history-panel");
const historyList = document.querySelector(".history-list");
const btnHistory = document.querySelector(".history-btn");
const btnsActions = document.querySelectorAll(".actions");
const btns = document.querySelectorAll(".digit");
var expressao = "";

function addToHistory(exp, duringLoading = false) {
    const li = document.createElement("li");

    const expression = document.createElement("span");
    expression.textContent = exp.expression;

    const result = document.createElement("span");
    result.textContent = exp.result;

    li.append(expression, result);

    li.addEventListener("click", () => {
        li.classList.toggle("expanded");
    });

    if (duringLoading) {
        fragment.prepend(li);
    } else {
        historyList.append(li);
    }
}

const history = JSON.parse(localStorage.getItem("history")) || [];

const fragment = document.createDocumentFragment();

for(item of history){
    addToHistory(item, true);
}
historyList.append(fragment)


btnHistory.addEventListener("click", () => {
     historyPanel.classList.toggle("open");
})

btnsActions.forEach((btn, i) => {
    btn.addEventListener("click", () => {
        switch (i) {
        case 0:
            screen.value = "";
            break;

        case 1: 
            screen.value = screen.value.slice(0, -1);
            break;
        
        case 2:
            history.push({expression: screen.value});
            screen.value = calculaExpressao(screen.value);
            history.at(-1).result = screen.value;
            addToHistory(history.at(-1))
            localStorage.setItem("history",JSON.stringify(history));
            break;
    }
    })
    
});

btns.forEach(btn => {
    btn.addEventListener("click", () => {
        if((/[\^√*\/%+\-.]/.test(screen.value.at(-1)) && /[\^√*\/%+\-.]/.test(btn.textContent)) || (screen.value === "" && /[\^√*\/%+.]/.test(btn.textContent)) || (screen.value.at(-1) === "(" && /[\^√*\/%+.]/.test(btn.textContent))){ 
            
        }else if(btn.textContent === "( )" && (/[\^√*\/%+\-.]/.test(screen.value.at(-1)) || screen.value === "" || screen.value.at(-1) === "(") && screen.value.at(-1) !== "."){
            screen.value += "("

        }else if(btn.textContent === "( )" && (!Number.isNaN(Number(screen.value.at(-1))) || screen.value.at(-1) === ")") && (screen.value.split(")").length - 1) < (screen.value.split("(").length - 1) && screen.value.at(-1) !== "."){
            screen.value += ")"

        }else if(btn.textContent !== "( )"){
            screen.value += btn.textContent;
        }

        screen.scrollLeft = screen.scrollWidth;
    })
});

const opcoesOperadores = {
        "^": (a, b) => Number(a) ** Number(b),
        "*": (a, b) => Number(a) * Number(b),
        "/": (a, b) => Number(a) / Number(b),
        "%": (a, b) => Number(a) % Number(b),
        "+": (a, b) => Number(a) + Number(b),
        "-": (a, b) => Number(a) - Number(b)
    }

const prioridades = [["^"], ["*", "/", "%"], ["+", "-"]];

function calculaExpressao(expressao){

    while(!/^[\+\-]?\d+(\.\d+)?$/.test(expressao)){

         let operacoes = expressao.includes("(")? expressao.match(/\([\+\-]?\d+(\.\d+)?(.\d+(\.\d+)?)*\)/g) : [expressao];
         console.log(operacoes)

    for(let operacao of operacoes){

        let numeros = operacao.split(/[^\d.]/).filter(n => n !== "");
        let operadores = operacao.split(/\d+\.?|\(|\)/).filter(n => n !== "");

        if(numeros.length === operadores.length) numeros.unshift("0");

        operadores.forEach((o, i) => {
            if(o.length === 2){
                operadores[i] = o[0];
                numeros[i + 1] = "-"+numeros[i + 1];
            }
        })

        for(let prioridade of prioridades){

            operadores.forEach((o, indice) => {
                if(prioridade.includes(o)) {
                    let calculo = opcoesOperadores[o](numeros[indice], numeros[indice + 1]);
                    numeros.splice(indice, 2, "x", calculo)
                }
            })
            numeros = numeros.filter(n => n !== "x")
            operadores = operadores.filter(o => !prioridade.includes(o))

        }

        expressao = expressao.replace(operacao, numeros[0]);

    }
}
    return expressao

    }

    