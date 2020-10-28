import "./html-framework.js";
import "./users.js";
import "./venues.js";
import { getFunc } from "./functions.js";
import InfectedUser from "./models/infectedUser.js";

/*
Opens a modal
 */
window.openModal = function(id) {
    let elem = document.getElementById(id);
    elem.classList.add("is-active");
    return elem;
};

/*
Closes a modal
 */
window.closeModal = function(id) {
    let elem = document.getElementById(id);
    elem.classList.remove("is-active");
    return elem;
};

/*
Gets a list of infected users and displays them in a modal
*/
window.showInfected = async function() {
    let infected = (await getFunc("GetInfected")).map(
        user => new InfectedUser(user)
    );
    window.openModal("infectedModal");
    let elem = document.getElementById("infected-list");
    elem.innerHTML = "";
    infected.forEach(user => {
        elem.appendChild(user.element);
    });
};
