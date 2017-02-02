'use strict'

const sha1 = require('sha1')
const Wechat = require('./wechat')
const getRawBody = require('raw-body')
const util = require('./util')
const WechatAPI = require('wechat-api')
const V100 = require('../config/V100')
const path = require('path')

module.exports = function(opts) {
    new Wechat(opts)
    const api = new WechatAPI(opts.appID, opts.appSecret)
    api.createMenu(require('../config/menu'), function(err, result) {
        if (err) {
            console.error(err)
        } else {}
    })
    api.createLimitQRCode(100, function(err, result) {
        if (err) {
            console.log(err)
        } else {
            const ticket = result.ticket
            console.log(api.showQRCodeURL(ticket))
        }
    });

    return function * (next) {
        var that = this
        var token = opts.token
        var signature = this.query.signature
        var timestamp = this.query.timestamp
        var echostr = this.query.echostr
        var nonce = this.query.nonce
        var str = [token, timestamp, nonce].sort().join('')
        var sha = sha1(str)

        if (this.method === 'GET') {
            if (sha === signature) {
                this.body = echostr + ''
            } else {
                this.body = 'wrong'
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

            if (message.MsgType === 'event') {
                if (message.Event === 'subscribe') {
                    const now = new Date().getTime()

                    that.status = 200
                    that.type = 'application/xml'
                    that.body = xml
                    return true
                }
                // 点击菜单
                if (message.Event === 'CLICK') {
                    const EventKey = message.EventKey
                    switch (EventKey) {
                        case 'V100_001':
                            api.sendText(message.FromUserName, '不给红包你咬我！', function(err, result) {
                                if (err) {
                                    console.log(err)
                                } else {}
                            }) break;
                        case 'V100_002':
                            api.uploadMedia(path.join(__dirname, '../', 'images/qrcode.jpg'), 'image', function(err, result) {
                                if (err) {
                                    console.log(err)
                                } else {
                                    api.sendImage(message.FromUserName, result.media_id, function(err, result01) {
                                        if (err) {
                                            console.log(err)
                                        } else {}
                                    });
                                }
                            }) break;
                        case 'V100_003':
                            api.sendNews(message.FromUserName, V100.articles, function(err, result) {
                                if (err) {
                                    console.log(err)
                                } else {}
                            }) break;
                    }
                }
            }
            // 用户发送消息
            if (message.MsgType === 'text') {
                api.sendText(message.FromUserName, 'Hello！', function(err, result) {
                    if (err) {
                        console.log(err)
                    } else {}
                })
            }
        }
    }
}
