import { getFunc, postFunc } from "./functions.js";
import { Venue } from "./models/venue.js";

export let venues = [];
let filterableListElement;
let filterElement;
let listElement;

/*
Once the document is fully loaded (see `html-framework.js`), find the necessary
elements and fetch the list of venues
 */
document.addEventListener("doneLoading", async () => {
    filterableListElement = document.querySelector(
        `rep[name="filterable-list"][type="venues"]`
    );
    filterElement = filterableListElement.querySelector(".tt-filter-field");
    listElement = filterableListElement.querySelector(".tt-list");

    filterElement.addEventListener("input", () => updateVenueList());

    venues = (await getFunc("GetVenues")).map(venue => {
        return new Venue(venue);
    });

    updateVenueList();
});

/*
Sorts venues in alphabetical name order
 */
function sortVenues() {
    venues.sort((a, b) => {
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
Takes the stored list of venues and adds them to the HTML
 */
function updateVenueList() {
    sortVenues();
    listElement.innerHTML = "";
    venues.forEach(venue => {
        addToVenueList(venue);
    });
}

/**
 * Adds a venue to the user list
 * @param {Venue} venue the venue to add to the UI
 */
function addToVenueList(venue) {
    let filter = filterElement.value;
    if (filter && !venue.name.includes(filter)) {
        return;
    }
    listElement.appendChild(venue.element);
}

/*
Gets the name of the new venue, calls the `AddVenue` function, and adds the
created venue to the venue list.
 */
window.saveVenue = async function() {
    let name = document.getElementById("new-venue-name").value;
    document.getElementById("new-venue-name").value = "";
    let newVenue = new Venue(await postFunc("AddVenue", { name: name }));
    venues.push(newVenue);
    updateVenueList();
    window.closeModal("venueCreateModal");
};
