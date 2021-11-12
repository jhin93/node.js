// 필요한 모듈은 삽입해줄것.
var db = require('./db');
var template = require('./template.js');
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

































