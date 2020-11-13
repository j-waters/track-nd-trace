let table = require("../utils/async-tables");
let getFellowVisitors = require("../utils/fellow-visitors")

const WEEK = 1000 * 60 * 60 * 24 * 7;

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
            let visitDate = new Date(visit.date);
            // If we visited over a week ago, ignore
            if (new Date().getTime() - visitDate.getTime() > WEEK) {
                continue;
            }
            let fellowVisitors = await getFellowVisitors(visit);
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
