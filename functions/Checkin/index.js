let azure = require("azure-storage");
let table = require("../utils/async-tables");

module.exports = async function(context, req) {
    const venueKey = req.body.venueKey;
    const userKeys = req.body.userKeys;
    const date = req.body.date;

    var entGen = azure.TableUtilities.entityGenerator;

    // For each of the given user keys, insert a new 'visit' entry
    // with the user key, venue key, and date
    userKeys.forEach(async userKey => {
        let key = venueKey + userKey + new Date().getTime(); // Create a unique key
        let newUser = {
            PartitionKey: entGen.String("k"),
            RowKey: entGen.String(key),
            venueKey: entGen.String(venueKey),
            userKey: entGen.String(userKey),
            date: entGen.DateTime(date)
        };

        await table.insertEntity("visits", newUser);
    });

    context.res = {
        body: {}
    };
};
