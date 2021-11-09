var testFolder = '../data';
var fs = require('fs');

fs.readdir(testFolder, function(error, filelist){
    // node.js는 특정 폴더의 파일 목록을 배열의 형태로 보여준다.
    // 이 배열을 반복문으로 어딘가에 자동적으로 적용할 수 있다.
    console.log(filelist);
})