const searchDiv = document.querySelector(".search-div");
const resultDiv = document.querySelector(".result-div");
const tableDiv = document.querySelector(".table-div");
const loader = document.getElementById("loader");
const errorDiv = document.getElementById("error-div");
const body = document.body;

const input = document.getElementById("input");
const searchBtn = document.getElementById("btn");


const closeModalButton = document.querySelector(".modal-close-buttton");
const modalDiv = document.getElementById("modal");
const modalTitle = document.querySelector('.modal-title');
const modalBody = document.querySelector('.modal-body');
const overlay = document.getElementById("overlay");

searchBtn.addEventListener("click", ev => {
    if (input.value.length < 2) {
        alert("Enter at least 2 characters");
        return
    }
    removeChildren(tableDiv);
    errorDiv.style.display = 'none';
    loader.style.display = 'flex';
    getData(input.value);

    input.value = "";
    input.focus();
})

async function getData(input) {
    try {
        let res = await fetch(`https://restcountries.com/v3.1/name/${input}`);
        let data = await res.json();
        console.log(data);

        if (data.status < 200 || data.status > 299) {
            errorDiv.style.display = "flex"
            return
        }
        createTable(data);
        tableSort();

    } catch (error) {
        console.log(error);
    } finally {
        loader.style.display = 'none';
    }
}

function createTable(data) {
    let columnNames =
        ['Flag', 'Name', 'Population', 'Capital', 'Area (m²)', 'Languages', 'Currencies'];
    let table = document.createElement('table');

    let thead = document.createElement('thead');
    thead.classList.add("sticky");

    let tbody = document.createElement('tbody');
    let tr = document.createElement('tr');

    for (let column of columnNames) {
        let th = document.createElement('th');
        th.textContent = column;
        tr.appendChild(th);
    }

    thead.appendChild(tr);
    table.appendChild(thead);


    for (let country of data) {
        let tableRow = document.createElement('tr');

        let td1 = document.createElement('td');
        td1.innerHTML = `<img src=${country.flags.png} alt="country-flag" height="13px"></img>`;
        tableRow.appendChild(td1);

        let td2 = document.createElement('td')
        let countryName = country.name.common;
        if (country.name.common === "North Macedonia") {
            countryName = "Macedonia";
        }
        td2.textContent = countryName;
        tableRow.appendChild(td2);

        let td3 = createTd(country.population);
        tableRow.appendChild(td3);

        let td4 = createTd(country.capital);
        tableRow.appendChild(td4);

        let td5 = createTd(country.area);
        tableRow.appendChild(td5);

        let td6 = document.createElement('td');
        let languages = Object.values(country.languages).join(', ');

        td6.textContent = languages;
        tableRow.appendChild(td6);

        let td7 = document.createElement('td');
        if (country.currencies) {
            let currencies = Object.values(country.currencies);
            let currenciesArray = [];

            for (i = 0; i < currencies.length; i++) {
                if (currencies[i].name === "denar") {
                    currencies[i].name = "Macedonian denar";
                }
                currenciesArray.push(currencies[i].name);
            }

            td7.textContent = currenciesArray.join(', ');
        } else {
            td7.textContent = "N/A";
        }

        tableRow.appendChild(td7);
        tbody.appendChild(tableRow);

        tableRow.addEventListener('click', ev => {
            let neigbors = "";
            if (!country.borders) {
                neigbors = "None";
            } else {
                neigbors = country.borders.join(', ');
            }

            openModal(modalDiv);

            modalTitle.textContent = countryName

            modalBody.innerHTML = `
            <img src=${country.flags.png} alt="country-flag"></img>
            <p><strong>ISO code:</strong> ${country.cca3}</p>
            <p><strong>Region:</strong> ${country.region}</p>
            <p><strong>Subregion:</strong> ${country.subregion}</p>
            <p><strong>Neighbors:</strong> ${neigbors}</p>
            <p><strong>Timezones:</strong> ${country.timezones.join(', ')}</p>
            <p><strong>Domain:</strong> ${country.tld[0]}</p>
            `
            closeModalButton.focus();

            closeModalButton.addEventListener("click", ev => {
                closeModal(modalDiv)
            })

            overlay.addEventListener("click", ev => {
                closeModal(modalDiv)
            })

            return;
        })
    }
    table.appendChild(tbody);
    tableDiv.appendChild(table);
}



function createTd(textContent) {
    const td = document.createElement('td');
    if (!textContent) {
        td.textContent = "N/A";
    } else if (textContent == -1) {
        td.textContent = "N/A";
    } else {
        td.textContent = textContent;
    }
    return td;
}

function tableSort() {
    const getCellValue = (tr, idx) => tr.children[idx].innerText || tr.children[idx].textContent;

    const comparer = (idx, asc) => (a, b) => ((v1, v2) =>
        v1 !== '' && v2 !== '' && !isNaN(v1) && !isNaN(v2) ? v1 - v2 : v1.toString().localeCompare(v2)
    )(getCellValue(asc ? a : b, idx), getCellValue(asc ? b : a, idx));

    let counter = 0;

    document.querySelectorAll('th').forEach(th => th.addEventListener('click', (() => {
        const table = th.closest('table');
        const tbody = table.querySelector('tbody');
        Array.from(tbody.querySelectorAll('tr'))
            .sort(comparer(Array.from(th.parentNode.children).indexOf(th), this.asc = !this.asc))
            .forEach(tr => tbody.appendChild(tr));

        counter += 1;

        if (th.children.length > 0) {
            th.removeChild(th.firstElementChild);
        }

        [...document.querySelectorAll("span")].map(span => {
            span.innerHTML = '';
        })

        if (counter % 2 == 1) {
            th.innerHTML += '<span style="color: #fa3838">&#129047;<span>';

        } else if (counter % 2 == 0) {
            th.innerHTML += '<span style="color: #86e6aa">&#129045;<span>';
        }
    })));
}

function removeChildren(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

function openModal(modal) {
    if (modal == null) return;

    modal.classList.add("active");
    overlay.classList.add("active");
}

function closeModal(modal) {
    if (modal == null) return;

    modal.classList.remove("active");
    overlay.classList.remove("active");
}
