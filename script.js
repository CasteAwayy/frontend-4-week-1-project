const cryptoContainer = document.querySelector("#table_crypto-body");
const inputSearch = document.querySelector(".search_input");
const sortByCap = document.querySelector("#sortBy-cap");
const sortByPercentage = document.querySelector("#sortBy-percentage");

// since I was facing the rate limit error many times and in
// description of project no error handling is adviced so I added a error message to notify no data is received
const no_data_received = document.querySelector(".no-data-received");

// event listeners for different events
sortByCap.addEventListener("click", handlesortByCap);
sortByPercentage.addEventListener("click", handlesortByPercentage);
inputSearch.addEventListener("input", handleChangeInInput);

// prettier-ignore
const API_LINK ="https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false";

let cryptoCurrencyData = null;
let filteredArray = null;
let isIncCap = 1;
let isIncPercentage = 1;

// handling fetch promise with then and catch and can check it
//after removing below comments and commenting async function part

/*

function getCryptoCurrencyData() {
  fetch(API_LINK)
    .then((response) => response.json())
    .then((cryptoData) => {
      cryptoCurrencyData = filteredArray = cryptoData;
      insertDataInContainer(cryptoCurrencyData);
      no_data_received.classList.add("hidden");
    })
    .catch((err) => {
      console.log(err);
      no_data_received.classList.remove("hidden");
    });
}

*/

//     handling fetch promise using async await

async function getCryptoCurrencyData() {
    try {
        const response = await fetch(API_LINK);

        // checking response of fetch request
        if (!response.ok)
            throw new Error(
                "Error in retrieving data from API link. Rate limit error."
            );

        const cryptoData = await response.json();

        //data received is put into global array cryptoCurrencyData
        cryptoCurrencyData = filteredArray = cryptoData;

        // function to insert fetched data into the container and displaying it
        insertDataInContainer(cryptoCurrencyData);

        // if data is received we remove error message from screen
        no_data_received.classList.add("hidden");
    } catch (err) {
        // display any error occured during fetch
        console.log(err.message);

        // if data is not received we display error message on screen
        no_data_received.classList.remove("hidden");
    }
}

// function to insert data in container
function insertDataInContainer(cryptoData) {
    cryptoContainer.innerHTML = "";
    cryptoData.map((crypto) => {
        const row = insertInRow(crypto);
        cryptoContainer.insertAdjacentElement("beforeend", row);
    });
}

// function to insert data in table row
function insertInRow(crypto) {
    const {
        id,
        image,
        name,
        symbol,
        current_price,
        total_volume,
        price_change_percentage_24h: price_change,
        market_cap,
    } = crypto;

    const tr = document.createElement("tr");
    const markup = `<td>
                <div class="col-1">
                  <img
                    class="logo_img"
                    src=${image}
                    alt="${id}"
                  />
                  <span class="logo__name">${name.split("-").join(" ")}</span>
                </div>
              </td>
              <td>
                <span class="col-2">${symbol}</span>
              </td>
              <td>
                <span class="col-3">$${current_price}</span>
              </td>
              <td>
                <span class="col-4">$${formatCurrency(total_volume)}</span>
              </td>
              <td>
                <span class='col-5 ${
                    price_change < 0 ? "neg" : "pos"
                }' >${price_change.toFixed(2)}%</span>
              </td>
              <td>
                <span class="col-6">Mkt Cap : $${formatCurrency(
                    market_cap
                )}</span>
              </td>
              `;
    tr.insertAdjacentHTML("beforeend", markup);
    return tr;
}

// function to format currency depending upon the locale of the user
function formatCurrency(currency) {
    return currency.toLocaleString();
}

// sort the data based on type(increasing or decreasing) and value(market cap or percentage)
const sortBy = function (type, value) {
    const modifier = type === "inc" ? 1 : -1;
    filteredArray.sort((a, b) => (a[value] - b[value]) * modifier);
};

// function to handle the sort by market cap functionality
function handlesortByCap() {
    isIncCap ? sortBy("inc", "market_cap") : sortBy("dec", "market_cap");

    // when user repeatedly click on sort button the data is sorted in ascending or descending order on adjacent clicks
    isIncCap = !isIncCap;
    insertDataInContainer(filteredArray);
}

// function to handle the sort by percentage functionality
function handlesortByPercentage() {
    isIncPercentage
        ? sortBy("inc", "price_change_percentage_24h")
        : sortBy("dec", "price_change_percentage_24h");

    // when user repeatedly click on sort button the data is sorted in ascending or descending order on adjacent clicks
    isIncPercentage = !isIncPercentage;
    insertDataInContainer(filteredArray);
}

// function to handle the search functionality
function handleChangeInInput() {
    const nameOrsymbol = this.value.toLowerCase();
    filteredArray = cryptoCurrencyData.filter((crypto) => {
        return (
            crypto.name.toLowerCase().includes(nameOrsymbol) ||
            crypto.symbol.toLowerCase().includes(nameOrsymbol)
        );
    });

    insertDataInContainer(filteredArray);
}

// on load we call getCryptoCurrencyData function to make a fetch request and get the data from api.
window.onload = getCryptoCurrencyData();
