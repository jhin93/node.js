

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
    list: function (filelist){
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
  }
