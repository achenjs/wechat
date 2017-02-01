'use strict'

const sha1 = require('sha1')
const Wechat = require('./wechat')
const getRawBody = require('raw-body')
const util = require('./util')
module.exports = function(opts) {
  // const wechat = new Wechat(opts)

  return function *(next) {
    var that = this
    var token = opts.token
    var signature = this.query.signature
    var timestamp = this.query.timestamp
    var echostr = this.query.echostr
    var nonce = this.query.nonce
    var str = [token, timestamp, nonce].sort().join('')
    var sha = sha1(str)

    if(this.method === 'GET') {
      if(sha === signature) {
        this.body = echostr + ''
      } else {
        this.body = 'wrong'
      }
    } else if (this.method === 'POST') {
      if(sha !== signature) {
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

      if(message.MsgType === 'event') {
        if(message.Event === 'subscribe') {
          const now = new Date().getTime()

          that.status = 200
          that.type = 'application/xml'
          that.body = '<xml>' +
                      '<ToUserName><![CDATA['+ message.FromUserName +']]></ToUserName>' +
                      '<FromUserName><![CDATA['+ message.ToUserName +']]></FromUserName>' +
                      '<CreateTime>'+ now +'</CreateTime>' +
                      '<MsgType><![CDATA[text]]></MsgType>' +
                      '<Content><![CDATA[Hi, Imooc 同学！]]></Content>' +
                      '</xml>'
          return true
        }
      }
    }
  }
}
