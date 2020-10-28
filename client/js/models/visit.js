import { users } from "../users.js";
import { venues } from "../venues.js";

const TEMPLATE = `<div class="level">
        <div class="leven-left">
            <h5 class="title is-5 level-item">$NAME</h5>
        </div>
        <div class="level-right">
            $DATE
        </div>
    </div>`;

export default class Visit {
    constructor(data) {
        this.data = data;
        this.user = users.find(user => user.key === data.userKey);
        this.venue = venues.find(venue => venue.key === data.venueKey);
    }

    get date() {
        return new Date(this.data.date);
    }

    /*
    Create and return a new 'visit' element
     */
    visitElement() {
        let element = document.createElement("div");
        element.innerHTML = TEMPLATE.replace("$NAME", this.user.name).replace(
            "$DATE",
            this.date.toDateString()
        );
        return element;
    }

    /*
    Create and return a new 'checkin' element
     */
    checkinElement() {
        let element = document.createElement("div");
        element.innerHTML = TEMPLATE.replace("$NAME", this.venue.name).replace(
            "$DATE",
            this.date.toDateString()
        );
        return element;
    }
}
