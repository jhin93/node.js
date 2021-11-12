var http = require('http');
// url이라는 모듈을 사용할 것이라고 node.js에게 선언.
var url = require('url');
// querystring이라는 nodejs의 모듈.
var qs = require('querystring');
// 템플릿 모듈
var template = require('./lib/template.js');
// db 모듈
var db = require('./lib/db');
// topic 테이블 모듈
var topic = require('./lib/topic');

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
        // mysql 대체
        db.query('SELECT * FROM topic', function(error, topics){
          if(error){
            throw error;
          }
        // 여기부턴 쿼리스트링에 값이 있는 사이드 페이지들.
          // 수정할 글 가져오기. 선택한 아이디로 가져오기
          db.query(`SELECT * FROM topic WHERE id=?`, [queryData.id] , function(error2, topic){
            if(error2){
              throw error2;
            }
            // 업데이트할 컨텐츠 가져오기. db.query로 가져온 topics. 우클릭 페이지 소스보기 - 수정하려고 하는 데이터의 id값이 1이라는 걸 input hidden으로 작성.
            var list = template.list(topics);
            // 타이틀은 topic[0].title
            var html = template.html(topic[0].title, list, 
              // 수정하려는 행에 대한 식별자 - topic[0].id
              // 기존의 제목 - topic[0].title, 본문 - topic[0].description
              // 수정하고 나서 쓸 쿼리스트링 - topic[0].id
              `
              <form action="/update_process" method="post">
                <input type="hidden" name="id" value="${topic[0].id}">
                <p><input type="text" name="title" placeholder="title" value="${topic[0].title}"></p>
                <p>
                    <!-- 여러줄 입력하는 태그 - textarea -->
                    <textarea name="description" placeholder="description" id="" cols="30" rows="10">${topic[0].description}</textarea>
                </p>
                <p>
                    <input type="submit">
                </p>
              </form>
              `,
              `<a href="/create">create</a> <a href="/update?id=${topic[0].id}">update</a>`);
            response.writeHead(200);
            response.end(html);
          });
        });

        // 글 수정 제출(update_process) 로직

    } else if (pathname === '/update_process'){
      // post 방식으로 받은 데이터를 가지고 오기.
      var body=''
      // .on 메소드로 이벤트 바인딩 사용(data라는 이벤트). submit으로 데이터가 전송되면 request로 body에 추가.
      request.on('data', function(data){
        body = body + data;
      })
      // .on 메소드로 이벤트 바인딩 사용(end라는 이벤트).바로 위 request에서 데이터를 더 받지 않으면, 아래 콜백함수를 호출.
      request.on('end',function(){
        var post = qs.parse(body);
        // mysql로 대체. 
        //테이블 수정하는 SQL문 작성. WHERE 빠지면 절대 안됨. 모든 행 수정됨
        db.query('UPDATE topic SET title=?, description=?, author_id=1 WHERE id=?', [post.title, post.description, post.id], function(error, result){
            // "writeHead"는 response 객체의 메소드에서 헤더 정보를 응답에 작성해서 내보내는 것이다. 첫번째 인자는 상태 코드를 지정하고 두번째인수에 헤더 정보를 연관 배열로 정리한 것이다.
            // 302는 다른 곳으로 리다이렉션 시킨다. 두번째 인자는 리다이렉션 시킬 위치. 여기서는 post.id를 쿼리스트링으로 받음.
            response.writeHead(302, {Location: `/?id=${post.id}`});
            response.end();  
        })
      })

      // 글 삭제(delete) 로직. 

    } else if (pathname === '/delete_process'){
      // post 방식으로 받은 데이터를 가지고 오기.
      var body=''
      // .on 메소드로 이벤트 바인딩 사용(data라는 이벤트). submit으로 데이터가 전송되면 request로 body에 추가.
      request.on('data', function(data){
        body = body + data;
      })
      // .on 메소드로 이벤트 바인딩 사용(end라는 이벤트).바로 위 request에서 데이터를 더 받지 않으면, 아래 콜백함수를 호출.
      request.on('end',function(){
        // querystring(최상단 변수 확인)으로 받아온 데이터를 parse해서 빈 body에 대입. console.log로 확인가능.
        var post = qs.parse(body);
        // mysql 대체
        // 삭제할 로우의 id - post.id
        db.query('DELETE FROM topic WHERE id=?', [post.id], function(error, result){
            if(error){
              throw error;
            }
            // "writeHead"는 response 객체의 메소드에서 헤더 정보를 응답에 작성해서 내보내는 것이다. 첫번째 인자는 상태 코드를 지정하고 두번째인수에 헤더 정보를 연관 배열로 정리한 것이다.
            // 302는 다른 곳으로 리다이렉션 시킨다. 두번째 인자는 리다이렉션 시킬 위치.
            // 글이 삭제되면 홈으로 리다이렉션.
            response.writeHead(302, {Location: `/`});
            response.end('');  
        })
      })
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