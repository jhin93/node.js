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
        // 파일 읽어오기. data 폴더의 파일을 fs.readFile로 읽어옴. 쿼리스트링에 따라 파일명이 생성됨. utf8로 인코딩.
        fs.readFile(`data/${queryData.id}`, 'utf8', function(err, description){
          var title = 'Welcome';
          var description = 'Hello, Node.js';
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
                <ul>
                  <li><a href="/?id=HTML">HTML</a></li>
                  <li><a href="/?id=CSS">CSS</a></li>
                  <li><a href="/?id=Javascript">JavaScript</a></li>
                </ul>
                <h2>${title}</h2>
                <p>${description}</p>
              </body>
              </html>      
            `
            response.writeHead(200);
            response.end(template);
        });
      } else {
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
              <ul>
                <li><a href="/?id=HTML">HTML</a></li>
                <li><a href="/?id=CSS">CSS</a></li>
                <li><a href="/?id=Javascript">JavaScript</a></li>
              </ul>
              <h2>${title}</h2>
              <p>${description}</p>
            </body>
            </html>      
          `
          response.writeHead(200);
          response.end(template);
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