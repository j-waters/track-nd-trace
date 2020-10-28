let table = require("../utils/async-tables");
let azure = require("azure-storage");

const WEEK = 1000 * 60 * 60 * 24 * 7;

/*
Takes a visit and returns a list of users that visited the same place on the
same day, excluding the user from the given visit
*/
async function getFellowVisitors(visit) {
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

function formatDate(str) {
    return new Date(str).toDateString();
}

module.exports = async function(context, req) {
    let users = await table.getEntities("users");
    let infected = [];
    for (const user of users) {
        if (user.testedPositiveAt) {
            let positiveDate = new Date(user.testedPositiveAt);
            // If the user has tested positive in the last week they are infected
            if (new Date().getTime() - positiveDate.getTime() < WEEK) {
                user.reason = "Tested positive";
                infected.push(user);
            }
            // If they've tested positive more than a week ago they are immune
            continue;
        }

        // Get all the check-ins for the user
        let visits = await table.getEntities(
            "visits",
            table.columnFilter("userKey", user.RowKey)
        );
        for (const visit of visits) {
            let fellowVisitors = await getFellowVisitors(visit);
            let visitDate = new Date(visit.date);
            // Out of all the people who visited the same venue on the same day,
            // see if we can find someone who tested positive within a week of that visit day
            let positiveVisitor = fellowVisitors.find(user => {
                let positiveDate = new Date(user.testedPositiveAt);
                return (
                    Math.abs(visitDate.getTime() - positiveDate.getTime()) <
                    WEEK
                );
            });
            // If we could find someone, then the user is infected
            if (positiveVisitor) {
                let venue = await table.fetchEntity("venues", visit.venueKey);
                user.reason = `Visited '${venue.name}' on ${formatDate(
                    visit.date
                )}, 
                    the same day that '${positiveVisitor.name}' did, 
                    who tested positive on ${formatDate(
                        positiveVisitor.testedPositiveAt
                    )}`;
                infected.push(user);
                break;
            }
        }
    }
    context.res = {
        body: infected
    };
};
