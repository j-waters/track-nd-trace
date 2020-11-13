let table = require("../utils/async-tables");
let azure = require("azure-storage");


/*
Takes a visit and returns a list of users that visited the same place on the
same day, excluding the user from the given visit
*/
module.exports = async function getFellowVisitors(visit) {
    // Gets all the other visits to the venue that day
    let query = new azure.TableQuery()
        .where(
            "venueKey eq ? && date eq ? && userKey ne ?",
            visit.venueKey,
            new Date(visit.date),
            visit.userKey
        )
        .top(1000);
    let fellowVisits = await table.getEntities("visits", query);

    // Gets the users associated with the fetched visits
    // The `map` produces an array of promises. `Promise.all` combines them into
    // one promise, that we wait to be completed
    return await Promise.all(
        fellowVisits.map(async fVisit => {
            return await table.fetchEntity("users", fVisit.userKey);
        })
    );
}