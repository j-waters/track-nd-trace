import { postFunc, getFunc } from "../functions.js";
import Visit from "./visit.js";

const TEMPLATE = `<div class="level user-$KEY">
        <div class="leven-left">
            <h5 class="title is-5 level-item">$NAME</h5>
        </div>
        <div class="level-right">
            <div class="field is-grouped level-item">
                <p class="control">
                    $TEST-BUTTON
                </p>
                <p class="control">
                    <button class="button view-checkins-button">
                        <span class="icon is-small">
                            <i class="fas fa-list"></i>
                        </span>
                        <span>View check-ins</span>
                    </button>
                </p>
                $CHECKBOX
            </div>
        </div>
    </div>`;

const TEST_BUTTON_TEMPLATE = `<button class="button positive-test-button">
                        <span class="icon is-small">
                            <i class="fas fa-vial"></i>
                        </span>
                        <span>Report positive test</span>
                    </button>`;

const POSTIVE_BUTTON_TEMPLATE = `<button class="button positive-test-button is-success is-outlined" disabled="">
                        <span class="icon is-small">
                            <i class="fas fa-vial"></i>
                        </span>
                        <span>Positive $DATE</span>
                    </button>`;

const CHECKBOX_TEMPLATE = `<label class="checkbox">
                  <input type="checkbox" class="user-checkin-checkbox">
                </label>`;

export class User {
    constructor(data) {
        this.data = data;
        this.showCheckbox = false;
        this.selected = false;
        document.addEventListener("start-checkin", () => {
            this.showCheckbox = true;
            this.selected = false;
            this.updateElement();
        });
        document.addEventListener("stop-checkin", () => {
            this.showCheckbox = false;
            this.selected = false;
            this.updateElement();
        });

        this.element = document.createElement("div");
        this.updateElement();
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
    Updates the DOM element with the user's data
     */
    updateElement() {
        let html = TEMPLATE.replace("$NAME", this.name).replace(
            "$KEY",
            this.key
        );

        if (!this.testedPositiveAt) {
            html = html.replace("$TEST-BUTTON", TEST_BUTTON_TEMPLATE);
        } else {
            html = html.replace(
                "$TEST-BUTTON",
                POSTIVE_BUTTON_TEMPLATE.replace(
                    "$DATE",
                    `${this.testedPositiveAt.getFullYear()}-${this.testedPositiveAt.getMonth()}-${this.testedPositiveAt.getDate()}`
                )
            );
        }

        if (this.showCheckbox) {
            html = html.replace("$CHECKBOX", CHECKBOX_TEMPLATE);
        } else {
            html = html.replace("$CHECKBOX", "");
        }

        this.element.innerHTML = html;

        if (!this.testedPositiveAt) {
            this.element.querySelector(".positive-test-button").onclick = () =>
                this.reportPositiveTest();
        }
        if (this.showCheckbox) {
            let checkbox = this.element.querySelector(".user-checkin-checkbox");
            checkbox.addEventListener("change", () => {
                this.selected = checkbox.checked;
                document.dispatchEvent(new Event("select-user"));
            });
        }

        this.element.querySelector(".view-checkins-button").onclick = () =>
            this.viewCheckins();
    }

    async reportPositiveTest() {
        this.data.testedPositiveAt = (
            await postFunc("ReportPositiveTest", {
                key: this.key
            })
        ).date;
        this.updateElement();
    }

    /*
    Fetch the checkins associated with the user and display them in a modal
     */
    async viewCheckins() {
        let visits = (await getFunc("GetCheckins", { userKey: this.key })).map(
            visit => {
                return new Visit(visit);
            }
        );
        window.openModal("visitModal");
        document.getElementById(
            "visit-title"
        ).innerHTML = `<b>${this.name}</b> checkins`;
        let elem = document.getElementById("visit-list");
        elem.innerHTML = "";
        visits.forEach(visit => {
            elem.appendChild(visit.checkinElement());
        });
    }
}
