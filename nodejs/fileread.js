// node.js의 모듈 중 파일시스템을 사용.
// fs라는 변수를 통해 node.js의 파일시스템을 사용.
var fs = require('fs');
fs.readFile('sample.txt', 'utf8', function(err, data){
    console.log(data);
})













