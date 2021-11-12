var http = require('http');
var fs = require('fs');
// url이라는 모듈을 사용할 것이라고 node.js에게 선언.
var url = require('url');
// querystring이라는 nodejs의 모듈.
var qs = require('querystring');
// 모듈사용
var template = require('./lib/template.js');
// 입력정보 보안
var path = require('path');
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
        // mysql.js의 로직을 여기에 적용.
        // 두번째 인자에는 첫번째 인자인 sql문이 실행된 서버가 응답된 결과를 처리할 수 있도록 콜백함수를 줌.
        // 콜백함수의 대표형식은 첫번째 인자로 실패했을 때의 error, 두번째 인자로 성공했을 떄의 topics 
        db.query(`SELECT * FROM topic`, function(error, topics){
          var title = 'Welcome';
          var description = 'Hello, Node.js';
          // 가져온 filelist 배열을 인자로 사용. template.js 모듈에서 list 함수 가져와서 데이터(topics)대입.
          var list = template.list(topics);
          // template.html에 각 인자들이 ,로 구분되어 대입되고, 그 결과물을 변수(html)에 담음. control엔 ui 요소담음(ex a 태그)
          var html = template.html(title, list, 
            `<h2>${title}</h2>${description}`,
            // 홈페이지에서 쿼리스트링이 있는 경우에만, 즉 사이드페이지에서만 update가 될 수 있도록 pathname === '/' 조건에서는 `<a href="/update">update</a>`는 뺀다.
            `<a href="/create">create</a>`
          );
          // 웹페이지 마무리 대표형식
          response.writeHead(200);
          response.end(html);
        })
      } else {
        // mysql 대체
        // 글 리스트에서 글을 선택할 시 상세 보기
          // 글 목록 먼저 가져오기
        db.query(`SELECT * FROM topic`, function(error, topics){
          // 에러발생 처리 (ex 데이터를 못받아왔을 때)
          if(error){
            throw error; // 여기서 nodejs가 이후의 코드진행을 중지하고 콘솔에 에러를 던짐.
          }
          // id 값에 따라 각 칼럼의 데이터를 가져오기. ex) id값이 3인 결과를 가져오는 sql문 - SELECT * FROM topic WHERE id = 3;
          // 들어오는 id는 queryData.id. 처리하는 콜백함수에서 결과물은 topic에 담기.
          // 익명의 누군가로부터 받은 입력값으로부터 db 보호를 위해 id=? 처리를 하고 두번째 인자로 배열에 데이터를 담는다.
          db.query(`SELECT * FROM topic WHERE id=?`, [queryData.id] , function(error2, topic){
            if(error2){
              throw error; // 여기서 nodejs가 이후의 코드진행을 중지하고 콘솔에 에러를 던짐.
            }
            console.log(topic[0].title);
            // topic은 배열에 클릭한 아이디(프라이머리 키)에 해당하는 1개의 객체가 배열에 담겨서 옴. 그래서 topic[0]으로 해야 내용물을 사용할 수 있음.
            var title = topic[0].title; // 타이틀
            var description = topic[0].description; // 본문
            // 가져온 filelist 배열을 인자로 사용. template.js 모듈에서 list 함수 가져와서 데이터(topics)대입.
            var list = template.list(topics);
            // template.html에 각 인자들이 ,로 구분되어 대입되고, 그 결과물을 변수(html)에 담음. control엔 ui 요소담음(ex a 태그)
            var html = template.html(title, list, 
              `<h2>${title}</h2>${description}`,
              // 홈페이지에서 쿼리스트링이 있는 경우에만, 즉 사이드페이지에서만 update가 될 수 있도록 pathname === '/' 조건에서는 `<a href="/update">update</a>`는 뺀다.
              ` 
                <a href="/create">create</a> 
                <a href="/update?id=${queryData.id}">update</a>
                <form action="delete_process" method="post">
                  <input type="hidden" name="id" value="${queryData.id}">
                  <input type="submit" value="delete">
                </form>
              `
            );
            // 웹페이지 마무리 대표형식
            response.writeHead(200);
            response.end(html);
          })
        })
      }

      // 글 작성(create) 로직.

    } else if(pathname === '/create'){
      // mysql.js의 로직을 여기에 적용.
      // 두번째 인자에는 첫번째 인자인 sql문이 실행된 서버가 응답된 결과를 처리할 수 있도록 콜백함수를 줌.
      // 콜백함수의 대표형식은 첫번째 인자로 실패했을 때의 error, 두번째 인자로 성공했을 떄의 topics 
      db.query(`SELECT * FROM topic`, function(error, topics){
        var title = 'Create';
        // 가져온 filelist 배열을 인자로 사용. template.js 모듈에서 list 함수 가져와서 데이터(topics)대입.
        var list = template.list(topics);
        // template.html에 각 인자들이 ,로 구분되어 대입되고, 그 결과물을 변수(html)에 담음. control엔 ui 요소담음(ex a 태그)
        var html = template.html(title, list, 
          // create를 눌렀을 때 글 목록 가져오기.
          `
            <form action="/create_process" method="post">
              <p><input type="text" name="title" placeholder="title"></p>
              <p>
                  <!-- 여러줄 입력하는 태그 - textarea -->
                  <textarea name="description" placeholder="description" id="" cols="30" rows="10"></textarea>
              </p>
              <p>
                  <input type="submit">
              </p>
            </form>
          `,
          // 홈페이지에서 쿼리스트링이 있는 경우에만, 즉 사이드페이지에서만 update가 될 수 있도록 pathname === '/' 조건에서는 `<a href="/update">update</a>`는 뺀다.
          `<a href="/create">create</a>`
        );
        // 웹페이지 마무리 대표형식
        response.writeHead(200);
        response.end(html);
      })

      // 글 작성(create) 제출 로직.

    } else if(pathname === '/create_process'){
      var body=''
      // .on 메소드로 이벤트 바인딩 사용(data라는 이벤트). submit으로 데이터가 전송되면 request로 body에 추가.
      request.on('data', function(data){
        body = body + data;
      })
      // .on 메소드로 이벤트 바인딩 사용(end라는 이벤트).바로 위 request에서 데이터를 더 받지 않으면, 아래 콜백함수를 호출.
      request.on('end',function(){
        // querystring(최상단 변수 확인)으로 받아온 데이터를 parse해서 빈 body에 대입.
        var post = qs.parse(body);
        //    받아온 데이터로 파일생성하기.

        // mysql 대체.
        // 글 작성 sql문 작성. INSERT INTO topic (title, description, created, author_id) VALUES ('제목', '본문', NOW(), author 관련부분은 일단 1);
        db.query(`INSERT INTO topic (title, description, created, author_id) VALUES (?, ?, NOW(), ?);`, [post.title, post.description, 1], function(error, result){
          if(error){
            throw error;
          }
          //  sql문이 제대로 작성되면 리다이렉션 주소로 이동. 리다이렉션 주소의 쿼리스트링은 result(콜백함수에서 인자로 받은 sql문 결과).insertId로 알아낸 해당 row의 id대입.
          response.writeHead(302, {Location: `/?id=${result.insertId}`});
          response.end('');  
        })
      })

      // 글 수정(update) 로직

    } else if(pathname === '/update'){
        // 여기부턴 쿼리스트링에 값이 있는 사이드 페이지들.
        fs.readdir('./data', function(error, filelist){
          // 가져온 filelist 배열을 인자로 사용. 파일리스트 가져오기.
          var list = template.list(filelist);
          // 보안을 위해 선언한 'path'에 parse 메소드를 쓰고 그 안에 보호대상을 삽입. 그리고 base까지만 읽도록 .base를 추가하면 그보다 상위 디렉토리는 읽을 수 없음. password.js 참고.
          var filteredId = path.parse(queryData.id).base
          // 파일 읽어오기. data 폴더의 파일을 fs.readFile로 읽어옴. 쿼리스트링에 따라 파일명이 생성됨. utf8로 인코딩.
          fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
            var title = queryData.id
            var html = template.html(title, list, 
              // 1. 글 수정 ui 삽입.
              // 2. 수정이니까 이미 삽입된 input의 value를 불러와야 함. value="${title}"
              // 3. 내용을 수정하고 어떤 파일을 수정할 것인지를 알아야 함. 기존 title을 쓰면 제목을 수정했을 때는 파일을 못찾음. 그래서 hidden 인풋으로 id 밸류 생성.
              `
              <form action="/update_process" method="post">
                <input type="hidden" name="id" value="${title}">
                <p><input type="text" name="title" placeholder="title" value="${title}"></p>
                <p>
                    <!-- 여러줄 입력하는 태그 - textarea -->
                    <textarea name="description" placeholder="description" id="" cols="30" rows="10">${description}</textarea>
                </p>
                <p>
                    <input type="submit">
                </p>
              </form>
              `,
              `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`);
            response.writeHead(200);
            response.end(html);
          });
        });

        // 글 수정(update) 제출 로직

    } else if (pathname === '/update_process'){
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
        // 받은 id 값
        var id = post.id;
        // 데이터 중 title
        var title = post.title;
        // 데이터 중 description
        var description = post.description;
        // fs.rename() 파일이름 변경하는 메소드. 히든인풋(기존 파일명)의 querystring을 업데이트 된 타이틀(새 파일명)로 수정.
        fs.rename(`data/${id}`, `data/${title}`, function(){
          //    받아온 데이터로 파일생성하기.
          // fs.writeFile('message.txt', 'Hello Node.js', 'utf8', callback);
          // fs.writeFile(data 디렉토리/파일 이름으로 사용할 title, 파일내용으로 사용할 description, 'utf8', 콜백함수)
          // 수정된 파일(`data/${title}`)에 우리가 받은 description 을 주고, id값에 업데이트된 타이틀을 주고 리다이렉션시킨다 - {Location: `/?id=${title}`})
          fs.writeFile(`data/${title}`, description, 'utf8', function(err){
            // "writeHead"는 response 객체의 메소드에서 헤더 정보를 응답에 작성해서 내보내는 것이다. 첫번째 인자는 상태 코드를 지정하고 두번째인수에 헤더 정보를 연관 배열로 정리한 것이다.
            // 302는 다른 곳으로 리다이렉션 시킨다. 두번째 인자는 리다이렉션 시킬 위치.
            response.writeHead(302, {Location: `/?id=${title}`});
            response.end('');            
          })
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
        // 받은 id 값. 지울거니까 title, description은 필요없음.
        var id = post.id;
        // 보안을 위해 선언한 'path'에 parse 메소드를 쓰고 그 안에 보호대상을 삽입. 그리고 base까지만 읽도록 .base를 추가하면 그보다 상위 디렉토리는 읽을 수 없음. password.js 참고.
        var filteredId = path.parse(id).base;
        // fs.unlink 메소드 사용.
        fs.unlink(`data/${filteredId}`, function(error){
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