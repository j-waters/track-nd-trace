import { users } from "./users.js";

/*
The application can be in 2 states: There's the initial state, where the bottom
section has a button to display infected users. There's also the checkin state,
where the bottom section displays various controls for the checkin process.
 */

/**
 * Hides and shows the appropriate element
 * @param {string} name the name of the state to switch to
 */
function setState(name) {
    document.querySelectorAll(".control-state").forEach(elem => {
        elem.classList.add("is-hidden");
    });

    document.getElementById(`${name}-controls`).classList.remove("is-hidden");
}

/*
 When there is a change in the number of selected users, update
 the checkin count
*/
document.addEventListener("doneLoading", () => {
    let elem = document.getElementById("checkin-count");
    document.addEventListener("select-user", () => {
        elem.innerHTML = `${
            users.filter(user => user.selected).length
        } users selected`;
    });
});

/*
Switch to checkin state
 */
export function setCheckinState() {
    setState("checkin");

    document.dispatchEvent(new Event("start-checkin"));

    let elem = document.getElementById("checkin-count");
    elem.innerHTML = `0 users selected`;

    // Set date to current
    const now = new Date();
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const day = now
        .getDate()
        .toString()
        .padStart(2, "0");

    document.getElementById(
        "checkin-date"
    ).value = `${now.getFullYear()}-${month}-${day}`;
}

/*
Switch to initial state
 */
export function setInitialState() {
    setState("initial");
    document.dispatchEvent(new Event("stop-checkin"));
}

window.setInitialState = setInitialState;
