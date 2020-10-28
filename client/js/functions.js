const URL = "http://localhost:7071/api"; //"https://trackndtrace.azurewebsites.net/api";
const KEY = "wmXtNeIiPpFCnTb9aFRp60XdP1b9GtTbd1jju7r3Hg5oajJ1I5SmkA==";

/*
Function to abstract calls to Azure Functions
 */

/**
 * Calls a function using a `GET` request
 * @param {string} func the name of the function to run
 * @param {Object.<string>} [query] optional query parameters
 * @returns {Promise.<Object>}
 */
export async function getFunc(func, query) {
    let q = "";
    if (query) {
        q =
            "&" +
            Object.entries(query)
                .map(elem => `${elem[0]}=${elem[1]}`)
                .join("&");
    }

    const response = await fetch(
        `${URL}/${func}?code=${KEY}&clientId=default${q}`
    );
    return await response.json();
}

/**
 * Calls a function using a `POST` request
 * @param {string} func the name of the function to run
 * @param {Object.<string>} body the request body
 * @returns {Promise.<Object>}
 */
export async function postFunc(func, body) {
    const response = await fetch(
        `${URL}/${func}?code=${KEY}&clientId=default`,
        {
            method: "POST",
            body: JSON.stringify(body)
        }
    );
    return await response.json();
}
