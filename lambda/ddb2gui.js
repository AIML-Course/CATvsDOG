var AWS = require("aws-sdk");
var docClient = new AWS.DynamoDB.DocumentClient();

var params = {TableName: "CatvsDog"};

exports.handler = function(event, context, callback) {
    docClient.scan(params, (err, data) => {
        if (err) {
            console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Scan succeeded.");
            callback(null, {
                "statusCode": 200,
                "headers": {
                    "Access-Control-Allow-Origin": "*"
                },
                "body": JSON.stringify(data.Items)
            })
        }
    });
};

