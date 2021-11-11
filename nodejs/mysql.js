// mysql모듈 선언.
var mysql      = require('mysql');
// .createConnection() 메소드 호출. 인자로 객체를 줌. connection 변수에 대입.
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'wlsrud20',
  database : 'opentutorials'
});
 
// connection에 담긴 값에 .connect()메소드로 접속
connection.connect();

connection.query('SELECT * FROM topic', function (error, results, fields) {
  if (error) {
    console.log(error);
  } 
  console.log(results);
});
 
connection.end();