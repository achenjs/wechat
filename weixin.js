'use strict'

const WechatAPI = require('wechat-api')
const opts = require('./config').wechat
const V100 = require('./config/V100')
const path = require('path')
const api = new WechatAPI(opts.appID, opts.appSecret)
api.createMenu(require('./config/menu'), function(err, result) {
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
})
module.exports = function* (next) {

    const message = this.weixinInfo

    if (message.MsgType === 'event') {
        if (message.Event === 'subscribe') {
            if(message.EventKey) {
              console.log('扫二维码进来：' + message.EventKey + ' ' + message.ticket)
            }
            api.sendText(message.FromUserName, '关注我了！', function(err, result) {
                if (err) {
                    console.log(err)
                } else {}
            })
        } else if (message.Event === 'unsubscribe') {
          console.log('取消关注！')
        } else if (message.Event === 'LOCATION') {
          api.sendText(message.FromUserName, '您上报的位置是：' + message.Latitude + '/' + message.Longitude + '-' + message.Precision, function(err, result) {
              if (err) {
                  console.log(err)
              } else {}
          })
        }
        // 点击菜单
        if (message.Event === 'CLICK') {
            const EventKey = message.EventKey
            switch (EventKey) {
                case 'V100_001':
                    api.sendText(message.FromUserName, '没有红包', function(err, result) {
                        if (err) {
                            console.log(err)
                        } else {}
                    })
                  break;
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
                    })
                  break;
                case 'V100_003':
                    api.sendNews(message.FromUserName, V100.articles, function(err, result) {
                        if (err) {
                          console.log(err)
                        } else {}
                    })
                  break;
            }
        }
    }
    // 发送消息
    else if(message.MsgType === 'text') {
      const content = message.Content
      if(content == '1') {
        api.sendText(message.FromUserName, '你好', function(err, result) {
            if (err) {
                console.log(err)
            } else {}
        })
      } else if(content == '2') {
        api.sendNews(message.FromUserName, V100.articles, function(err, result) {
            if (err) {
                console.log(err)
            } else {}
        })
      } else if(content == '3') {
        api.uploadMedia(path.join(__dirname, './', 'images/logo.jpg'), 'image', (err, result) => {
          if(err) {
            console.log(err)
          } else {
            const mediaId = result.media_id
            api.sendImage(message.FromUserName, mediaId, (err, result) => {
              if(err) {
                console.log(err)
              } else {}
            })
          }
        })
      } else if(content == '4') {
        api.uploadMedia(path.join(__dirname, './', 'video/aa.mp4'), 'video', (err, result) => {
          if(err) {
            console.log(err)
          } else {
            console.log(result)
            api.sendVideo(message.FromUserName, result.media_id, '', (err, result) => {
              if(err) {
                console.log(err)
              } else {}
            })
          }
        })
      } else if(content == '5') {
        api.uploadMedia(path.join(__dirname, './', 'music/xyy.mp3'), 'voice', (err, result) => {
          if(err) {
            console.log(err)
          } else {
            console.log(result)
            api.sendVoice(message.FromUserName, result.media_id, (err, result) => {
              if(err) {
                console.log(err)
              } else {}
            })
          }
        })
      }
    }
    yield next
}
