// mysql 모듈.
var mysql = require('mysql');
// mysql모듈에 createConnection 메소드로 접속, 객체를 전달. 변수에 대입.
var db = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'wlsrud20',
    database:'opentutorials'
});
// 실제 접속
db.connect();

module.exports = db;




