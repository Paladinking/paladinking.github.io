

const data = await fetch('data.json').then((res) => res.json());
const choice = document.getElementById('characterChoice');
const input = document.getElementById("myInput");
const colorblind = document.getElementById("colorblindMode");

function mulberry32(seed) {
  let t = seed += 0x6D2B79F5;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function getDailyIndex() {
    const now = new Date();
    const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();

    const r = mulberry32(seed);
    return Math.floor(r * data.length);
}

let target = data[getDailyIndex()];
let guesses = 0;
console.log(target);

function makeGuess(row) {
    const el = document.createElement("tr");
    const cb = colorblind.checked ? "-colorblind" : "";

    const nameClass = row.name === target.name ? "correct" : "icon";
    let s = `<td class="${nameClass + cb}"><img src=${row.icon} width="96px" height="96px"></img></td>`;
    const typeClass = row.type === target.type ? "correct" : "incorrect";
    s += `<td class="${typeClass + cb}">${row.type}</td>`;


    const scriptClass = row.script === target.script ? "correct" : "incorrect";
    s += `<td class="${scriptClass + cb}">${row.script}</td>`;

    let orderClass = row.first_night_order === target.first_night_order ? "correct" : "incorrect";
    let orderText = "";
    if (row.first_night_order === target.first_night_order) {
        if (row.first_night_order === "-") {
            orderText = "Does not wake";
        } else if (row.first_night_order === "?") {
            orderText = "Unpredictable";
        }  else {
            orderText = "Equal";
        }
    } else if (row.first_night_order !== "-" && row.first_night_order !== "?" &&
              target.first_night_order !== "-" && target.first_night_order !== '?') {
        orderClass = "partCorrect";
        orderText = row.first_night_order > target.first_night_order ? "Too late" : "Too early";
    } else {
        orderText = "Not comparable";
    }
    s += `<td class="${orderClass + cb}">${orderText}</td>`;
    orderClass = row.night_order === target.night_order ? "correct" : "incorrect";

    if (row.night_order === target.night_order) {
        if (row.night_order === "-") {
            orderText = "Does not wake";
        } else if (row.night_order === "?") {
            orderText = "Unpredictable";
        }  else {
            orderText = "Equal";
        }
    } else if (row.night_order !== "-" && row.night_order !== "?" &&
              target.night_order !== "-" && target.night_order !== '?') {
        orderClass = "partCorrect";
        orderText = row.night_order > target.night_order ? "Too late" : "Too early";
    } else {
        orderText = "Not comparable";
    }
    s += `<td class="${orderClass + cb}">${orderText}</td>`;
    let matches = 0;
    for (const a of row.ability) {
        if (target.ability.find(e => e === a) !== undefined) {
            matches += 1;
        }
    }
    let abilityClass = "incorrect";
    if (matches > 0) {
        if (matches === target.ability.length && matches === row.ability.length) {
            abilityClass = "correct";
        } else {
            abilityClass = "partCorrect";
        }
    }
    s += `<td class="${abilityClass + cb}">${row.ability.join('<br>')}</td>`;
    el.innerHTML = s;

    const root = document.querySelector("#guesses tbody");
    root.appendChild(el);

    guesses += 1;
    
    if (row.name === target.name) {
        input.disabled = true;
        if (guesses === 1) {
            window.alert(`You got it 1 guess!`);
        } else {
            window.alert(`You got it in ${guesses} guesses!`);
        }
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
        };

        const onBlur = () => {
            el.classList.remove("focus");
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

    guesses = 0;
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

colorblind.checked = localStorage.getItem("colorblind-mode") === "true";

colorblind.addEventListener("change", () => {
    if (colorblind.checked) {
        localStorage.setItem("colorblind-mode", "true");
    } else {
        localStorage.setItem("colorblind-mode", "false");
    }
    const root = document.querySelector("#guesses tbody");
    for (const child of root.getElementsByTagName("td")) {
        if (colorblind.checked) {
            child.classList.replace("correct", "correct-colorblind");
            child.classList.replace("incorrect", "incorrect-colorblind");
            child.classList.replace("partCorrect", "partCorrect-colorblind");
        } else {
            child.classList.replace("correct-colorblind", "correct");
            child.classList.replace("incorrect-colorblind", "incorrect");
            child.classList.replace("partCorrect-colorblind", "partCorrect");
        }
    }
})
