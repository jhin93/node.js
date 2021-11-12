// 필요한 모듈은 삽입해줄것.
var db = require('./db');
var template = require('./template.js');
var url = require('url');
var qs = require('querystring');

// request, response를 인자로 넣어줘야 마지막 줄에 response가 정의된다.
exports.home = function(request, response){
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
    });
}

exports.page = function(request, response){
    // 변수모음
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    // mysql 대체
    // 글 리스트에서 글을 선택할 시 상세 보기
    // 글 목록 먼저 가져오기
    db.query(`SELECT * FROM topic`, function(error, topics){
        // 에러발생 처리 (ex 데이터를 못받아왔을 때)
        if(error){
            throw error; // 여기서 nodejs가 이후의 코드진행을 중지하고 콘솔에 에러를 던짐.
        }
        // id 값에 따라 각 칼럼의 데이터를 가져오기. ex) id값이 3인 결과를 가져오는 sql문 - SELECT * FROM topic WHERE id = 3;
        // 들어오는 id는 queryData.id 처리하는 콜백함수에서 결과물은 topic에 담기.
        // 익명의 누군가로부터 받은 입력값으로부터 db 보호를 위해 id=? 처리를 하고 두번째 인자로 배열에 데이터를 담는다.

        // topic과 author의 JOIN
        // SELECT * FROM topic 를 왼쪽에 두고(LEFT) author 를 합친다(JOIN). 다음과 같은 조건으로 (topic.author_id=author.id)
        // 다만 WHERE id=? 일때, topic의 id인지, author의 id인지 알 수가 없다. 그래서 topic의 id값이다(topic.id=?)라고 작성.
        db.query(`SELECT * FROM topic LEFT JOIN author ON topic.author_id=author.id WHERE topic.id=?`, [queryData.id] , function(error2, topic){
            if(error2){
            throw error; // 여기서 nodejs가 이후의 코드진행을 중지하고 콘솔에 에러를 던짐.
            }
            // join된 데이터 확인.
            console.log(topic);
            // topic은 배열에 클릭한 아이디(프라이머리 키)에 해당하는 1개의 객체가 배열에 담겨서 옴. 그래서 topic[0]으로 해야 내용물을 사용할 수 있음.
            var title = topic[0].title; // 타이틀
            var description = topic[0].description; // 본문
            // 가져온 filelist 배열을 인자로 사용. template.js 모듈에서 list 함수 가져와서 데이터(topics)대입.
            var list = template.list(topics);
            // template.html에 각 인자들이 ,로 구분되어 대입되고, 그 결과물을 변수(html)에 담음. control엔 ui 요소담음(ex a 태그)
            var html = template.html(title, list, 
            // JOIN한 테이블에서 topic[0].name의 이름으로 저자를 추가한다.
            `<h2>${title}</h2>${description}<p>by ${topic[0].name}</p>`,
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


exports.create = function(request, response){
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
}

exports.create_process = function(request, response){
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
}





























