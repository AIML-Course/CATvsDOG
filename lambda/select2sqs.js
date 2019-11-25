var QUEUE_URL = 'https://sqs.ap-northeast-1.amazonaws.com/621149070359/CatvsDog';
var AWS = require('aws-sdk');
var sqs = new AWS.SQS();

exports.handler = function(event, context, callback) {
    var params = {
        MessageBody: event.body,
        QueueUrl: QUEUE_URL
    };
    sqs.sendMessage(params, function(err, data){
        if(err) {
            console.log('error:', "Fail Send Message" + err);
            // context.done('error', "ERROR Put SQS");  // ERROR with message
            callback(null, {
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Headers': '*',
                    'Access-Control-Allow-Methods': '*',
                    "Access-Control-Allow-Origin": '*'
                },
                body: "[ERROR] Fail Send Message" + err
            });
        } else {
            console.log('data:', data.MessageId);
            // context.done(null,'');  // SUCCESS 
            callback(null, {
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Headers': '*',
                    'Access-Control-Allow-Methods': '*',
                    "Access-Control-Allow-Origin": '*'
                },
                body: data.MessageId
            });
        }
    });
};
