let table = require("../utils/async-tables");
let getFellowVisitors = require("../utils/fellow-visitors")

const WEEK = 1000 * 60 * 60 * 24 * 7;

function formatDate(str) {
    return new Date(str).toDateString();
}

function sameDay(d1, d2) {
    if (d1 && d2) {
        return d1.toDateString() === d2.toDateString()
    }
    return false
}

module.exports = async function (context, req) {
    let date = new Date(req.query.date);
    let users = await table.getEntities("users");
    let infected = [];
    for (const user of users) {
        let testedPositive = new Date(user.testedPositiveAt)
        if (sameDay(testedPositive, date)) {
            user.reason = "Tested positive";
            infected.push(user);
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

            let positiveVisitor;
            for (const fellowVisitor of fellowVisitors) {
                let positiveDate = new Date(fellowVisitor.testedPositiveAt);
                // If this person visited on the date we're looking at, and tested positive in the week before
                // OR
                // If this person tested positive on the day we're looking at, and visited the venue in the past week
                let positiveDiff = visitDate.getTime() - positiveDate.getTime()
                if ((sameDay(visitDate, date) && positiveDiff < WEEK && positiveDiff > 0) ||
                    (sameDay(positiveDate, date) && positiveDate.getTime() - visitDate.getTime() < WEEK)) {
                    positiveVisitor = fellowVisitor;
                    break;
                }
            }
            // If we could find someone, then an alert for this user was created today
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
        body: infected.length
    };
};