/*
A very basic homemade framework to handle the splitting up of HTML.
This will search for all `rep` tags, get the value stored in the `name`
attribute of that tag, fetch the contents of the HTML file with that name,
and insert that HTML into the tag. For example:
`<rep name="test"></rep>` where `test.html` contains `<p>hi there</p>` would
become `<rep name="test"><p>hi there</p></rep>`.

Once a component has been loaded, the process runs again to see if there were
any new tags within that new component.

Once all the components have been loaded, the `doneLoading` event will be
dispatched.
 */

let pendingElements = 0;

/**
 * Fetches and inserts HTML
 * @param {Element} element the element to replace
 */
function replaceHTML(element) {
    let name = element.getAttribute("name");
    element.setAttribute("fetched", true);
    pendingElements++;
    fetch(`./html/${name}.html`)
        .then(response => {
            return response.text();
        })
        .then(data => {
            element.innerHTML = data;
            pendingElements--;
            findAll();
        });
}

/*
Finds all `<rep>` tags that aren't already being replaced and starts replacing
them
 */
function findAll() {
    document.querySelectorAll("rep:not([fetched])").forEach(node => {
        replaceHTML(node);
    });
    if (pendingElements === 0) {
        document.dispatchEvent(new Event("doneLoading"));
    }
}

findAll();
