var http = require('http');
var url = require('url');
var qs = require('querystring');
// 템플릿 모듈
var template = require('./lib/template.js');
// db 모듈
var db = require('./lib/db');
// topic 테이블 모듈
var topic = require('./lib/topic');

const host = "127.0.0.1"
const port = 3000

// .createServer() 메소드. 공식문서에서 확인할 수 있음. 인자로 함수를 받음.
// http.server를 리턴함. 그걸 app에 대입한 것. 그리고 server.listen()메소드를 쓰고 3000을 port로 사용.
// server.listen([port][, host][, backlog][, callback]). 대괄호는 생략가능한 인자.
var app = http.createServer(function(request,response){

    // 변수모음
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;

    // 접속한 곳이 루트(/)라면, 정상 렌더링.
    if(pathname === '/'){
      // 하지만 pathname만으로는 메인페이지와 사이드페이지들을 구분할 수 없기에 .id로 쿼리스트링이 undefined일 때 즉, 메인페이지를 조건으로 새롭게 렌더링.
      if(queryData.id === undefined){
        topic.home(request, response);
      } else {
        topic.page(request, response);
      }

      // 글 작성(create) 로직.
    } else if(pathname === '/create'){
        topic.create(request, response);

      // 글 작성 제출(create_process)  로직.
    } else if(pathname === '/create_process'){
        topic.create_process(request, response);

      // 글 수정(update) 로직
    } else if(pathname === '/update'){
        topic.update(request,response);

      // 글 수정 제출(update_process) 로직
    } else if (pathname === '/update_process'){
        topic.update_process(request, response);

      // 글 삭제(delete) 로직. 
    } else if (pathname === '/delete_process'){
        topic.delete_process(request, response);
    } else {
      response.writeHead(404);
      response.end('Not found');
    }
});

app.listen(port, host, () => {
  console.log(`Application running at http://${host}:${port}/`)
});

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