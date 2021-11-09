var http = require('http');
var fs = require('fs');
// url이라는 모듈을 사용할 것이라고 node.js에게 선언. url이라는 모듈은 url이라는 변수를 통해 사용할 것.
var url = require('url');

var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;

    // 접속한 곳이 루트(/)라면, 정상 렌더링.
    if(pathname === '/'){
      // 하지만 pathname만으로는 메인페이지와 사이드페이지들을 구분할 수 없기에 .id로 쿼리스트링이 undefined일 때 즉, 메인페이지를 조건으로 새롭게 렌더링.
      if(queryData.id === undefined){

        // 파일 목록을 가져오는 코드로 감싸기. data 폴더의 내용물을 가져오면 콜백함수 실행.
        fs.readdir('./data', function(error, filelist){
          // 파일리스트 가져오기.
          console.log(filelist);
          // 파일리스트 가져오고 렌더링파트(var template) 삽입.
          var title = 'Welcome';
          var description = 'Hello, Node.js';

          // while 문으로 리스트 자동생성. filelist 배열을 가져옴
          var list = '<ul>'
          var i = 0;
          while(i < filelist.length){
            list = list + `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`
            i = i + 1;
          }

          list = list + '</ul>';

          // 1.html을 복사해와서 백쿼테이션 사이에 삽입.
          // 2. a href를 '/?id='를 사용해서 대입. 이를 node.js의 var url = require('url');에서 query string으로 가져옴.
            var template = `
              <!doctype html>
              <html>
              <head>
                <title>WEB1 - ${title}</title>
                <meta charset="utf-8">
              </head>
              <body>
                <h1><a href="/">WEB</a></h1>
                ${list}
                <h2>${title}</h2>
                <p>${description}</p>
              </body>
              </html>      
            `
            response.writeHead(200);
            response.end(template);
        })

      } else {
        fs.readdir('./data', function(error, filelist){

          // while 문으로 리스트 자동생성. filelist 배열을 가져옴
          var list = '<ul>'
          var i = 0;
          while(i < filelist.length){
            list = list + `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`
            i = i + 1;
          }

        list = list + '</ul>';
          // 여기부턴 쿼리스트링에 값이 있는 사이드 페이지들.
          // 파일 읽어오기. data 폴더의 파일을 fs.readFile로 읽어옴. 쿼리스트링에 따라 파일명이 생성됨. utf8로 인코딩.
          fs.readFile(`data/${queryData.id}`, 'utf8', function(err, description){
            var title = queryData.id
            // 1.html을 복사해와서 백쿼테이션 사이에 삽입.
            // 2. a href를 '/?id='를 사용해서 대입. 이를 node.js의 var url = require('url');에서 query string으로 가져옴.
            var template = `
              <!doctype html>
              <html>
              <head>
                <title>WEB1 - ${title}</title>
                <meta charset="utf-8">
              </head>
              <body>
                <h1><a href="/">WEB</a></h1>
                ${list}
                <h2>${title}</h2>
                <p>${description}</p>
              </body>
              </html>      
            `
            response.writeHead(200);
            response.end(template);
          });
        });
      }
    } else {
      response.writeHead(404);
      response.end('Not found');
    }
});
app.listen(3000);

// node main.js 뭐뭐. 이렇게 터미널에서 실행 시 
// 1) 노드의 런타임이 돌아가는 위치 
// 2) 현재 파일의 위치 
// 3) 추가로 입력한 값 이 순서가 배열에 담겨 나타난다.
// var args = process.argv
// console.log(args);
// console.log(args[2]);

// if(args[2] === '1'){
//   console.log('same');
// } else {
//   console.log('not same');
// }