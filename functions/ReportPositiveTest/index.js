let table = require("../utils/async-tables");

module.exports = async function(context, req) {
    const key = req.body.key;

    let date = new Date();

    let updatedUser = {
        RowKey: key,
        PartitionKey: "k",
        testedPositiveAt: date
    };

    await table.mergeEntity("users", updatedUser);

    context.res = {
        body: { date }
    };
};
