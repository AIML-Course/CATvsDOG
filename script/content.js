var catid = 1;
var dogid = 1;
function randomImg() {
    catid = Math.floor(Math.random() * 50) + 1;
    dogid = Math.floor(Math.random() * 50) + 1;
    document.getElementById("cat").src = "https://aiml-course.github.io/CATandDOG/cat/cat." + catid + ".jpg";
    document.getElementById("dog").src = "https://aiml-course.github.io/CATandDOG/dog/dog." + dogid + ".jpg";
}
function select(catdog) {
    var record = {
        "cat": catid,
        "dog": dogid,
        "winner": catdog
    };
    console.log(record);
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "https://seao94ng8j.execute-api.ap-northeast-1.amazonaws.com/default/pushSelect2SQS", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify(record));
    xhr.onload = function() {
        console.log(this.response);
        randomImg();
    };
    xhr.onerror = function() {
        console.log("ERROR: Server Connection");
    };
}
randomImg();