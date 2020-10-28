let azure = require("azure-storage");

/*
Utility functions for interacting with Azure Tables
*/
module.exports = {
    /*
    Takes a table name and key, fetches the row and returns an object. Returns `null`
    if the key does not exist in the table
    */
    async fetchEntity(tableName, rowKey) {
        let connectionString = process.env.StorageConnection;
        let tableService = azure.createTableService(connectionString);

        let options = { payloadFormat: "application/json;odata=nometadata" };
        return new Promise((resolve, reject) => {
            tableService.retrieveEntity(
                tableName,
                "k",
                rowKey,
                options,
                function(error, result, response) {
                    if (!error) {
                        resolve(response.body);
                    } else {
                        reject(error);
                    }
                }
            );
        });
    },
    /*
    Takes a table name and object that will be inserted into the table. Object must contain a
    `RowKey` and `PartitionKey`, and the object values must be generated using `azure.TableUtilities.entityGenerator`.
    Returns the inserted object
    */
    async insertEntity(table, entity) {
        let connectionString = process.env.StorageConnection;
        let tableService = azure.createTableService(connectionString);

        let options = {
            payloadFormat: "application/json;odata=nometadata",
            echoContent: true
        };
        return new Promise((resolve, reject) => {
            tableService.insertEntity(table, entity, options, function(
                error,
                result,
                response
            ) {
                if (!error) {
                    resolve(response.body);
                } else {
                    reject(error);
                }
            });
        });
    },
    /*
    Takes a table name and optional query (`azure.TableQuery`). If no query is specified, 
    every entity will be returned. 
    */
    getEntities(table, query) {
        let connectionString = process.env.StorageConnection;
        let tableService = azure.createTableService(connectionString);

        return new Promise((resolve, reject) => {
            query = query || new azure.TableQuery().top(1000);
            var options = {
                payloadFormat: "application/json;odata=nometadata"
            };

            tableService.queryEntities(table, query, null, options, function(
                error,
                result,
                response
            ) {
                if (!error) {
                    resolve(response.body.value);
                } else {
                    reject(error);
                }
            });
        });
    },
    /*
    Takes a table name and an entity object. The object must have a RowKey and PartitionKey.
    Finds a row in the table with matching keys and adds/replaces column values.
    */
    mergeEntity(table, entity) {
        let connectionString = process.env.StorageConnection;
        let tableService = azure.createTableService(connectionString);

        return new Promise((resolve, reject) => {
            tableService.mergeEntity(table, entity, function(
                error,
                result,
                response
            ) {
                if (!error) {
                    resolve();
                } else {
                    reject(error);
                }
            });
        });
    },
    /*
    A commonly used query: returns a `TableQuery` that return rows where the given column
    equals the given filter.
    */
    columnFilter(column, filter) {
        return new azure.TableQuery().where(`${column} eq ?`, filter).top(1000);
    }
};
