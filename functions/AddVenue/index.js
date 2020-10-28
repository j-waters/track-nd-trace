let azure = require("azure-storage");
let table = require("../utils/async-tables");

module.exports = async function(context, req) {
    const name = req.body.name;

    var entGen = azure.TableUtilities.entityGenerator;

    let key = name + new Date().getTime(); // Create a unique key

    let newVenue = {
        PartitionKey: entGen.String("k"),
        RowKey: entGen.String(key),
        name: entGen.String(name),
    };

    newVenue = await table.insertEntity('venues', newVenue);

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: newVenue
    };
};
