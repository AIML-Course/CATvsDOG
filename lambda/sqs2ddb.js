const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

function setScore(catdog, id, winner, callback) {
    var win = 0;
    if(catdog == winner) win = 1;
    const params = {
        TableName: "CatvsDog",
        Key: {
            "catdog": catdog,
            "id": id
        },
        UpdateExpression: "add cnt :x, win :w",
        ExpressionAttributeValues: {
            ":x": 1,
            ":w": win
        }
    };
    docClient.update(params, function(err, data) {
        if (err) {
            console.log(err);
            callback(err);
        } else {
            console.log(data);
            callback(null, data);
        }
    });
};

const sqs = new AWS.SQS();
const queueUrl = "https://sqs.ap-northeast-1.amazonaws.com/621149070359/CatvsDog";
const params = {
    QueueUrl: queueUrl,
    MaxNumberOfMessages: 1,
    VisibilityTimeout: 0,
    WaitTimeSeconds: 0
};

exports.handler = function(event, context, callback) {
    const msg = JSON.parse(event.Records[0].body);
    console.log('Order received', msg);
    setScore("cat", msg.cat, msg.winner, (err, catRes) => {
        if(err) {
            console.log("[ERROR] " + err);
            callback("[ERROR] " + err);
        } else {
            setScore("dog", msg.dog, msg.winner, (err, dogRes) => {
                if(err) {
                    console.log("[ERROR] " + err);
                    callback("[ERROR] " + err);
                } else {
                    const deleteParams = {
                        QueueUrl: queueUrl,
                        ReceiptHandle: event.Records[0].receiptHandle
                    };
                    sqs.deleteMessage(deleteParams, (err, data) => {
                        if (err) {
                            console.log(err, err.stack);
                            callback("[ERROR] " + err);
                        } else {
                            console.log('Successfully deleted message from queue');
                            callback(null, "success");
                        }
                    });
                }
            });
        }
    });
}