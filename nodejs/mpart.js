var M = {
    v: 'v',
    f: function(){
        console.log(this.v);
    }
}

// module.exports : M 객체를 이 모듈 밖에서 쓸 수 있도록 하겠다는 명령어. 
module.exports = M;