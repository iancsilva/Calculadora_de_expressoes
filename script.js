const screen = document.querySelector(".screen");
const historyPanel = document.querySelector(".history-panel");
const historyList = document.querySelector(".history-list");
const historyButton = document.querySelector(".history-btn");
const actionButtons = document.querySelectorAll(".actions");
const digitButtons = document.querySelectorAll(".digit");

const NUMBER_REGEX = /^[\+\-]?\d+(\.\d+)?$/;
const OPERATOR_REGEX = /[\^*\/%+\-.]/;
const NON_LEADING_OPERATOR_REGEX = /[\^*\/%+.]/;
const PARENTHESIZED_OPERATION_REGEX = /\([\+\-]?\d+(\.\d+)?(.\d+(\.\d+)?)*\)/g;

function addToHistory(exp) {
    const li = document.createElement("li");

    const expression = document.createElement("span");
    expression.textContent = exp.expression;

    const result = document.createElement("span");
    result.textContent = exp.result;

    li.append(expression, result);

    li.addEventListener("click", () => {
        li.classList.toggle("expanded");
    });

    return li;
}

const history = JSON.parse(localStorage.getItem("history")) || [];

const fragment = document.createDocumentFragment();

for (const item of history) {
    fragment.prepend(addToHistory(item));
}

historyList.append(fragment);

historyButton.addEventListener("click", () => {
    historyPanel.classList.toggle("open");

    if (historyPanel.classList.contains("open")) {
        historyList.scrollTop = historyList.scrollHeight;
    }
});

actionButtons.forEach(button => {
    button.addEventListener("click", () => {
        const action = button.dataset.action;

        switch (action) {
            case "clear":
                screen.value = "";
                break;

            case "backspace":
                screen.value = screen.value.slice(0, -1);
                break;

            case "calculate":
                history.push({ expression: screen.value });
                screen.value = calculateExpression(screen.value);
                history.at(-1).result = screen.value;
                historyList.append(addToHistory(history.at(-1)));
                historyList.scrollTop = historyList.scrollHeight;
                localStorage.setItem("history", JSON.stringify(history));
                break;
        }
    });
});

digitButtons.forEach(button => {
    button.addEventListener("click", () => {
        const buttonText = button.textContent;
        const lastCharacter = screen.value.at(-1);
        const lastIsOperator = OPERATOR_REGEX.test(lastCharacter);
        const pressedIsOperator = OPERATOR_REGEX.test(buttonText);
        const pressedCannotStartExpression = NON_LEADING_OPERATOR_REGEX.test(buttonText);
        const isParenthesisButton = buttonText === "( )";
        const openParenthesesCount = screen.value.split("(").length - 1;
        const closeParenthesesCount = screen.value.split(")").length - 1;

        if ((lastIsOperator && pressedIsOperator) || (screen.value === "" && pressedCannotStartExpression) || (lastCharacter === "(" && pressedCannotStartExpression)) {
            
        } else if (isParenthesisButton && (lastIsOperator || screen.value === "" || lastCharacter === "(") && lastCharacter !== ".") {
            screen.value += "(";

        } else if (isParenthesisButton && (!Number.isNaN(Number(lastCharacter)) || lastCharacter === ")") && closeParenthesesCount < openParenthesesCount && lastCharacter !== ".") {
            screen.value += ")";

        } else if (!isParenthesisButton) {
            screen.value += buttonText;
        }

        screen.scrollLeft = screen.scrollWidth;
    });
});

const operatorOptions = {
    "^": (a, b) => Number(a) ** Number(b),
    "*": (a, b) => Number(a) * Number(b),
    "/": (a, b) => Number(a) / Number(b),
    "%": (a, b) => Number(a) % Number(b),
    "+": (a, b) => Number(a) + Number(b),
    "-": (a, b) => Number(a) - Number(b)
};

const priorities = [["^"], ["*", "/", "%"], ["+", "-"]];

function calculateExpression(expression) {
    while (!NUMBER_REGEX.test(expression)) {
        let operations = expression.includes("(")? expression.match(PARENTHESIZED_OPERATION_REGEX) : [expression];

        for (const operation of operations) {
            let numbers = operation.split(/[^\d.]/).filter(n => n !== "");
            let operators = operation.split(/\d+\.?|\(|\)/).filter(n => n !== "");

            if (numbers.length === operators.length) numbers.unshift("0");

            operators.forEach((operator, index) => {
                if (operator.length === 2) {
                    operators[index] = operator[0];
                    numbers[index + 1] = "-" + numbers[index + 1];
                }
            });

            for (const priority of priorities) {
                operators.forEach((operator, index) => {
                    if (priority.includes(operator)) {
                        let calculation = operatorOptions[operator](numbers[index], numbers[index + 1]);
                        numbers.splice(index, 2, "x", calculation);
                    }
                });

                numbers = numbers.filter(n => n !== "x");
                operators = operators.filter(operator => !priority.includes(operator));
            }

            expression = expression.replace(operation, numbers[0]);
        }
    }

    return expression;
}