let azure = require("azure-storage");
let table = require("../utils/async-tables");

module.exports = async function(context, req) {
    const name = req.body.name;

    var entGen = azure.TableUtilities.entityGenerator;

    let key = name + new Date().getTime(); // Create a unique key

    let newUser = {
        PartitionKey: entGen.String("k"),
        RowKey: entGen.String(key),
        name: entGen.String(name),
        testedPositiveAt: entGen.DateTime(null)
    };

    newUser = await table.insertEntity('users', newUser);

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: newUser
    };
};
