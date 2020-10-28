let table = require("../utils/async-tables");

module.exports = async function(context, req) {
    let venueKey = req.query.venueKey;

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: await table.getEntities(
            "visits",
            table.columnFilter("venueKey", venueKey)
        )
    };
};
