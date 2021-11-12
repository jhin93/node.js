

// 그냥 module.exports 에 바로 객체를 대입할 수도 있음.
module.exports = {
    // 본문 렌더링 함수
    html: function (title, list, body, control){
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
                ${control}
                ${body}
              </body>
              </html>      
            `
    },
    // 파일리스트 가져오는 함수
    list: function (topics){
      // while 문으로 리스트 자동생성.
      var list = '<ul>'
      var i = 0;
      while(i < topics.length){
        // db에서 받아온 topics는 객체들을 담은 배열이다. topics[i]에서 보여주려는 밸류값을 추가로 작성해야함. ex) title -  topics[i].title 
        // 해당 title로 링크이동하면 쿼리스트링은 ?id=[object%20Object] 이런식으로 표시됨. topics[i]가 [object%20Object]를 나타냄. 프라이머리 키인 id로 구분해주기 위해 .id 추가.
        list = list + `<li><a href="/?id=${topics[i].id}">${topics[i].title}</a></li>`
        i = i + 1;
      }
    
      list = list + '</ul>';
      return list;
    }
  }
