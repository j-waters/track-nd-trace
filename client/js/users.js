import { getFunc, postFunc } from "./functions.js";
import { User } from "./models/user.js";

export let users = [];
let filterableListElement;
let filterElement;
let listElement;

/*
Once the document is fully loaded (see `html-framework.js`), find the necessary
elements and fetch the list of users
 */
document.addEventListener("doneLoading", async () => {
    filterableListElement = document.querySelector(
        `rep[name="filterable-list"][type="users"]`
    );
    filterElement = filterableListElement.querySelector(".tt-filter-field");
    listElement = filterableListElement.querySelector(".tt-list");

    filterElement.addEventListener("input", () => updateUserList());

    users = (await getFunc("GetUsers")).map(user => {
        return new User(user);
    });

    updateUserList();
});

/*
Sorts users in alphabetical name order
 */
function sortUsers() {
    users.sort((a, b) => {
        if (a.name < b.name) {
            return -1;
        }
        if (a.name > b.name) {
            return 1;
        }
        return 0;
    });
}

/*
Takes the stored list of users and adds them to the HTML
 */
function updateUserList() {
    sortUsers();
    listElement.innerHTML = "";
    users.forEach(user => {
        addToUserList(user);
    });
}

/**
 * Adds a user to the user list
 * @param {User} user the user to add to the UI
 */
function addToUserList(user) {
    let filter = filterElement.value;
    if (filter && !user.name.includes(filter)) {
        return;
    }
    listElement.appendChild(user.element);
}

/*
Gets the name of the new user, calls the `AddUser` function, and adds the
created user to the users list.
 */
window.saveUser = async function() {
    let name = document.getElementById("new-user-name").value;
    document.getElementById("new-user-name").value = "";
    let newUser = new User(await postFunc("AddUser", { name: name }));
    users.push(newUser);
    updateUserList();
    window.closeModal("userCreateModal");
};
