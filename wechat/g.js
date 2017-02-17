'use strict'

const sha1 = require('sha1')
const Wechat = require('./reply')
const getRawBody = require('raw-body')
const util = require('./util')

module.exports = function(opts, handler) {
    new Wechat(opts)

    return function *(next) {
        var token = opts.token
        var signature = this.query.signature
        var timestamp = this.query.timestamp
        var echostr = this.query.echostr
        var nonce = this.query.nonce
        console.log("token:" + token)
        console.log("timestamp:" + timestamp)
        console.log("nonce:" + nonce)
        var str = [token, timestamp, nonce].sort().join('')
        var sha = sha1(str)

        if (this.method === 'GET') {
            if (sha === signature) {
                this.body = echostr + ''
            } else {
                this.body = '请使用微信浏览器打开!'
            }
        } else if (this.method === 'POST') {
            if (sha !== signature) {
                this.body = 'wrong'
                return false
            }

            const data = yield getRawBody(this.req, {
                length: this.length,
                limit: '1mb',
                encoding: this.charset
            })

            // console.log(data.toString());
            const content = yield util.parseXMLAsync(data)
            console.log(content)

            const message = util.formatMessage(content.xml)
            console.log(message)

            this.weixinInfo = message

            yield handler.call(this, next)

        }
    }
}
