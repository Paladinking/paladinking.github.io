const data = await fetch('data.json').then((res) => res.json());
const choice = document.getElementById('characterChoice');
const input = document.getElementById("myInput");

function getDailyIndex() {
    const now = new Date();
    const localMidnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
    );
    const day = Math.floor(localMidnight.getTime() / (1000 * 60 * 60 * 24));
    const ix = ((day * 12345) % 54321) * 987653;
    return ix % data.length;
}

let target = data[getDailyIndex()];

function makeGuess(row) {
    const el = document.createElement("tr");

    const nameClass = row.name === target.name ? "correct" : "icon";
    let s = `<td class="${nameClass}"><img src=${row.icon} width="96px" height="96px"></img></td>`;
    const typeClass = row.type === target.type ? "correct" : "incorrect";
    s += `<td class="${typeClass}">${row.type}</td>`;


    const scriptClass = row.script === target.script ? "correct" : "incorrect";
    s += `<td class="${scriptClass}">${row.script}</td>`;

    let orderClass = row.first_night_order === target.first_night_order ? "correct" : "incorrect";
    let orderText = "";
    if (row.first_night_order === target.first_night_order) {
        orderText = "Equal";
    } else if (row.first_night_order !== "-" && row.first_night_order !== "?" &&
              target.first_night_order !== "-" && target.first_night_order !== '?') {
        orderClass = "partCorrect";
        orderText = row.first_night_order > target.first_night_order ? "Too late" : "Too early";
    } else {
        orderText = "Not comparable";
    }
    s += `<td class="${orderClass}">${orderText}</td>`;
    orderClass = row.night_order === target.night_order ? "correct" : "incorrect";

    if (row.night_order === target.night_order) {
        orderText = "Equal";
    } else if (row.night_order !== "-" && row.night_order !== "?" &&
              target.night_order !== "-" && target.night_order !== '?') {
        orderClass = "partCorrect";
        orderText = row.night_order > target.night_order ? "Too late" : "Too early";
    } else {
        orderText = "Not comparable";
    }
    s += `<td class="${orderClass}">${orderText}</td>`;
    let matches = 0;
    for (const a of row.ability) {
        if (target.ability.find(e => e === a) !== undefined) {
            matches += 1;
        }
    }
    let abilityClass = "incorrect";
    if (matches > 0) {
        console.log(matches, target.ability.length, row.ability.length);
        if (matches === target.ability.length && matches === row.ability.length) {
            abilityClass = "correct";
        } else {
            abilityClass = "partCorrect";
        }
    }
    s += `<td class="${abilityClass}">${row.ability.join('<br>')}</td>`;
    el.innerHTML = s;

    const root = document.querySelector("#guesses tbody");
    root.appendChild(el);
    
    if (row.name === target.name) {
        input.disabled = true;
        window.alert("You got it!");
    }
}

function setup() {
    while (choice.children.length > 1) {
        choice.removeChild(choice.lastElementChild);
    }
    const root = document.querySelector("#guesses tbody");
    root.replaceChildren();

    for (const row of data) {
        const el = document.createElement('div');
        el.className = "choiceBtn";
        el.innerHTML = `<img src="${row.icon}" width="64px" height="64px"></img><p style="margin-left: 10px;">${row.name}</p>`;
        el.tabIndex  = 0;
        choice.appendChild(el);

        const onFocus = () => {
            el.classList.add("focus");
            console.log(el.className, el.classList);
        };

        const onBlur = () => {
            el.classList.remove("focus");
            console.log(el.className, el.classList);
        };

        const onClick = () => {
            const root = document.getElementById('guesses');
            choice.removeChild(el);
            makeGuess(row);


            input.focus();
            input.value = '';

            filterFunction();
        };

        const onKey = (e) => {
            if (e.key === "Enter") {
                onClick();
            } 
        }


        el.addEventListener('click', onClick);
        el.addEventListener('focus', onFocus);
        el.addEventListener('blur', onBlur);
        el.addEventListener('keydown', onKey);
    }

    input.value = '';
    input.disabled = false;
    input.focus();
    filterFunction();
}

function filterFunction() {
    const filter = input.value.toUpperCase();
    const opts = choice.getElementsByTagName("div");
    for (let i = 0; i < opts.length; i++) {
        const txtValue = opts[i].textContent || opts[i].innerText;
        opts[i].classList.remove("searchTarget");
        if (filter.length > 0 && txtValue.toUpperCase().indexOf(filter) > -1) {
            opts[i].style.display = "flex";
        } else {
            opts[i].style.display = "none";
        }
    }
    for (const el of opts) {
        if (el.style.display !== "none") {
            el.classList.add("searchTarget");
            break;
        }
    }
}

input.addEventListener('keydown', e => {
    if (e.key === "Enter") {
        let opts = choice.getElementsByTagName("div");
        for (const el of opts) {
            if (el.classList.contains("searchTarget")) {
                el.click();
                break;
            }
        }
    }
})
input.addEventListener('keyup', filterFunction);
input.addEventListener('focus', () => {
    const opts = choice.getElementsByTagName("div");
    for (const el of opts) {
        if (el.style.display !== "none") {
            el.classList.add("searchTarget");
            break;
        }
    }
});
input.addEventListener('blur', () => {
    const opts = choice.getElementsByTagName("div");
    for (const el of opts) {
        el.classList.remove("searchTarget");
    }
});


filterFunction();
setup();

document.getElementById("newPuzzle").addEventListener("click", () => {
    const index = Math.floor(Math.random() * data.length);
    target = data[index];
    console.log(target);
    setup();
});
