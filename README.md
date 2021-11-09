# node.js

블록체인 4기 첫번째 프로젝트,  
Genesis Function을 위해 공부한 node.js 레퍼지토리입니다.  

추후 커리큘럼에 따라 내용이 추가될 수 있습니다.

<!-- 노드 실행 -->
터미널에서 'node 파일이름.js' 입력하여 서버를 실행.
ctrl + c로 서버 종료

<!-- URL 구성요소 -->

프로토콜://host(domain).어쩌구:port/path?query string
query string은 '?'로 시작. 그리고 값과 값은 &로 구분됨.  값의이름=값
ex) http://opentutorials.org:3000/main?id=HTML&page=12

<!-- 모듈 -->
node.js가 가지고 있는 많은 기능들을 비슷한 것 끼리 그루핑한 것을 모듈 이라고 함. ex) http, fs, url

main.js가 수정되면 노드를 껐다 켜야 되지만, 읽어오는 데이터가 수정되는 건 그냥 창 새로고침만 하면 된다.
