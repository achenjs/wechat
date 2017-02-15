'use strict'

var Koa = require('koa')

var sha1 = require('sha1')

var config = {
    wechat: {
        appID:'wx57d0df72024a6b29',
        appsecret:'117fe533bde88acf88e7050e57a2a145',
        token:'achenjs'
    }
}

var app = new Koa();

app.use(function *(next) {
    console.log(this.query)

    var token = config.wechat.token
    var signature = this.query.signature
    var nonce = this.query.nonce
    var timestamp = this.query.timestamp
    var echostr = this.query.echostr
    var str = [token, timestamp, nonce].sort().join('')
    var sha = sha1(str)
    if (sha === signature) {
        this.body = echostr + ''
    } else {
        this.body = 'wrong'
    }
})

app.listen(4555)

console.log('Listening 5555')
