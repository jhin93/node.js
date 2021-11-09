var fs = require('fs');

// //readFileSync
// console.log('A')

// // syntax 폴더 바깥에서 명령 실행(syntax/파일명).
// var result = fs.readFileSync('syntax/sample.txt', 'utf8');
// console.log(result);
// console.log('C');

// 결과물
// A
// B
// C




console.log('A')

// readFileSync가 아닌 readFile은 비동기적으로 실행됨. 
// node.js가 readFile을 비동기로 했다는 것 - 비동기를 선호함.

// .readFile() 은 리턴값을 도출하지 않기에 변수에 담을 수 없음. 대신 콜백함수를 세번째 인자로 사용.
// 파일을 읽고 난 후(1번째 인자), 콜백함수 실행. 에러는 콜백함수의 1번째 인자로, 내용물은 2번째 인자로 공급하도록 약속.  
fs.readFile('syntax/sample.txt', 'utf8', function(err, result){
    console.log(result);
});
console.log('C');


// 결과물. readFile은 비동기이므로 아래가 먼저 실행됨. 즉, console.log('C');가 먼저 실행.
// A
// C
// B



