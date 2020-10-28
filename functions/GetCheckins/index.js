let table = require("../utils/async-tables");


module.exports = async function(context, req) {
    let userKey = req.query.userKey;

    context.res = {
        body: await table.getEntities(
            "visits",
            table.columnFilter("userKey", userKey)
        )
    };
};
