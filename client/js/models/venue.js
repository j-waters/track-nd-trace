import { getFunc, postFunc } from "../functions.js";
import { setCheckinState, setInitialState } from "../states.js";
import { users } from "../users.js";
import Visit from "./visit.js";

const TEMPLATE = `<div class="level venue-$KEY">
        <div class="leven-left">
            <h5 class="title is-5 level-item">$NAME</h5>
        </div>
        <div class="level-right">
            <div class="field is-grouped level-item">
                <p class="control">
                    <button class="button checkin-button">
                        <span class="icon is-small">
                            <i class="fas fa-door-open"></i>
                        </span>
                        <span>Check users in</span>
                    </button>
                </p>
                <p class="control">
                    <button class="button view-visitors-button">
                        <span class="icon is-small">
                            <i class="fas fa-list"></i>
                        </span>
                        <span>View visitors</span>
                    </button>
                </p>
            </div>
        </div>
    </div>`;

export class Venue {
    constructor(data) {
        this.data = data;
        this.selected = false;
        this.element = document.createElement("div");

        this.updateElement();

        document.addEventListener("stop-checkin", () => {
            this.selected = false;
            this.updateElement();
        });
    }

    get key() {
        return this.data.RowKey;
    }

    get name() {
        return this.data.name;
    }

    get testedPositiveAt() {
        if (!this.data.testedPositiveAt) return null;
        return new Date(this.data.testedPositiveAt);
    }

    /*
    Updates the DOM element with the venues's data
     */
    updateElement() {
        this.element.innerHTML = TEMPLATE.replace("$NAME", this.name).replace(
            "$KEY",
            this.key
        );

        if (this.selected) {
            this.element.classList.add("selected-venue");
        } else {
            this.element.classList.remove("selected-venue");
        }

        this.element.querySelector(".checkin-button").onclick = () =>
            this.startCheckin();

        this.element.querySelector(".view-visitors-button").onclick = () =>
            this.viewVisitors();
    }

    /*
    Switch to the checkin state and set the global `completeCheckin` method to
    call this object's `completeCheckin` method
     */
    startCheckin() {
        setInitialState();
        setCheckinState();
        this.selected = true;
        window.completeCheckin = () => this.completeCheckin();
        this.updateElement();
    }

    /*
    Fetch all the users that have been selected, and call the `Checkin` with
    their keys and this venue's key. Switch back to the initial state.
     */
    async completeCheckin() {
        let selectedUsers = users.filter(user => user.selected);
        let date = document.getElementById("checkin-date").value;
        await postFunc("Checkin", {
            venueKey: this.key,
            userKeys: selectedUsers.map(user => user.key),
            date
        });
        setInitialState();
    }

    /*
    Fetch the visits associated with the venue and display them in a modal
     */
    async viewVisitors() {
        let visits = (await getFunc("GetVisitors", { venueKey: this.key })).map(
            visit => {
                return new Visit(visit);
            }
        );
        window.openModal("visitModal");
        document.getElementById(
            "visit-title"
        ).innerHTML = `<b>${this.name}</b> visitors`;
        let elem = document.getElementById("visit-list");
        elem.innerHTML = "";
        visits.forEach(visit => {
            elem.appendChild(visit.visitElement());
        });
    }
}
