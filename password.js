// path에 ?id=../password.js 라고 입력하면 해당 내용이 화면에 노출됨.

// path.parse() - path를 분석하는 메소드.

/* path.parse() 사용예시.
    > var path = require('path');
    undefined
    > path.parse('../password.js')
    {
    root: '',
    dir: '..',
    base: 'password.js',
    ext: '.js',
    name: 'password'
    }
*/

module.exports = {
    id: 'egoing',
    password: '111111'
}