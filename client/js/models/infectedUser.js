const TEMPLATE = `<div>
        <div><h5 class="title is-5">$NAME</h5></div>
       <div class="">
            $REASON
        </div>
    </div>`;

export default class InfectedUser {
    constructor(data) {
        this.data = data;

        this.element = document.createElement("div");
        this.updateElement();
    }

    get name() {
        return this.data.name;
    }

    get reason() {
        return this.data.reason;
    }

    updateElement() {
        this.element.innerHTML = TEMPLATE.replace("$NAME", this.name).replace(
            "$REASON",
            this.reason
        );
    }
}
