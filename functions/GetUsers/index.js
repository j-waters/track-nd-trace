let table = require("../utils/async-tables");


module.exports = async function(context, req) {
    context.res = {
        body: await table.getEntities("users")
    };
};
