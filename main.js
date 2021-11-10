var http = require('http');
var fs = require('fs');
// url이라는 모듈을 사용할 것이라고 node.js에게 선언.
var url = require('url');
// querystring이라는 nodejs의 모듈.
var qs = require('querystring')

// 본문 렌더링 함수
function templateHTML(title, list, body){
  return `
          <!doctype html>
          <html>
          <head>
            <title>WEB1 - ${title}</title>
            <meta charset="utf-8">
          </head>
          <body>
            <h1><a href="/">WEB</a></h1>
            ${list}
            <a href="/create">create</a>
            ${body}
          </body>
          </html>      
        `
}

// 파일리스트 가져오는 함수
function templateList(filelist){
  // while 문으로 리스트 자동생성. filelist 배열을 가져옴
  var list = '<ul>'
  var i = 0;
  while(i < filelist.length){
    list = list + `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`
    i = i + 1;
  }

  list = list + '</ul>';
  return list;
}

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
          // 파일리스트 가져오고 렌더링파트(var template) 삽입.
          var title = 'Welcome';
          var description = 'Hello, Node.js';

          // templateList 함수. 가져온 filelist 배열을 인자로 사용. 파일리스트 가져오기.
          var list = templateList(filelist);

          // templateHTML 이란 함수를 사용해서 본문을 렌더링.
          var template = templateHTML(title, list, `<h2>${title}</h2><p>${description}</p>`);
          response.writeHead(200);
          response.end(template);
        })

      } else {
        // 여기부턴 쿼리스트링에 값이 있는 사이드 페이지들.
        fs.readdir('./data', function(error, filelist){

          // templateList 함수. 가져온 filelist 배열을 인자로 사용. 파일리스트 가져오기.
          var list = templateList(filelist);
          
          // 파일 읽어오기. data 폴더의 파일을 fs.readFile로 읽어옴. 쿼리스트링에 따라 파일명이 생성됨. utf8로 인코딩.
          fs.readFile(`data/${queryData.id}`, 'utf8', function(err, description){
            var title = queryData.id
            // templateHTML 이란 함수를 사용해서 본문을 렌더링.
            var template = templateHTML(title, list, `<h2>${title}</h2><p>${description}</p>`);
            response.writeHead(200);
            response.end(template);
          });
        });
      }
      // 글 작성 페이지
    } else if(pathname === '/create'){
      fs.readdir('./data', function(error, filelist){
        // 파일리스트 가져오고 렌더링파트(var template) 삽입.
        var title = 'WEB - create';

        // templateList 함수. 가져온 filelist 배열을 인자로 사용. 파일리스트 가져오기.
        var list = templateList(filelist);

        // templateHTML 이란 함수를 사용해서 본문을 렌더링.
        var template = templateHTML(title, list, `
          <!-- 아래 주소의 서버로 인풋값들을 전송함. 그러기 위해 name 속성이 필요. -->
          <form action="http://localhost:3000/create_process" method="post">
              <p><input type="text" name="title" placeholder="title"></p>
              <p>
                  <!-- 여러줄 입력하는 태그 - textarea -->
                  <textarea name="description" placeholder="description" id="" cols="30" rows="10"></textarea>
              </p>
              <p>
                  <input type="submit">
              </p>
          </form>
        `);
        response.writeHead(200);
        response.end(template);
      });
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
        // 데이터 중 title
        var title = post.title;
        // 데이터 중 description
        var description = post.description;
        // 받아온 데이터를 pm2 log에서 확인 가능.
        console.log(post.title);

        //    받아온 데이터로 파일생성하기.
        // fs.writeFile('message.txt', 'Hello Node.js', 'utf8', callback);
        // fs.writeFile(data 디렉토리/파일 이름으로 사용할 title, 파일내용으로 사용할 description, 'utf8', 콜백함수)
        fs.writeFile(`data/${title}`, description, 'utf8', function(err){
          // "writeHead"는 response 객체의 메소드에서 헤더 정보를 응답에 작성해서 내보내는 것이다. 첫번째 인자는 상태 코드를 지정하고 두번째인수에 헤더 정보를 연관 배열로 정리한 것이다.
          // 302는 다른 곳으로 리다이렉션 시킨다. 두번째 인자는 리다이렉션 시킬 위치.
          response.writeHead(302, {Location: `/?id=${title}`});
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