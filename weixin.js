'use strict'

const Promise = require('bluebird')
const WechatAPI = require('wechat-api')
const V100 = require('./config/V100')
const path = require('path')
const opts = require('./config').wechat
const api = new WechatAPI(opts.appID, opts.appSecret)

new Promise((resolve, reject) => {
  api.removeMenu((err, result) => {
    if(err) {
      reject(err)
    } else {
      resolve()
    }
  })
})
.then(() => {
  api.createMenu(require('./config/menu'), function(err, result) {
    if (err) {
      console.error(err)
    } else {}
  })
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
      if(content === '1') {
        api.sendText(message.FromUserName, '你好', function(err, result) {
            if (err) {
                console.log(err)
            } else {}
        })
      } else if(content === '2') {
        api.sendNews(message.FromUserName, V100.articles, function(err, result) {
            if (err) {
                console.log(err)
            } else {}
        })
      } else if(content === '3') {
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
      } else if(content === '4') {
        api.uploadMedia(path.join(__dirname, './', 'video/aa.mp4'), 'video', (err, result) => {
          if(err) {
            console.log(err)
          } else {
            api.sendVideo(message.FromUserName, result.media_id, '', (err, result) => {
              if(err) {
                console.log(err)
              } else {}
            })
          }
        })
      } else if(content === '5') {
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
      } else if(content === '6') {
        api.createGroup('我的好友', (err, result) => {
          if(err) {
            new Error(err)
          } else {
            console.log('新建列表：' + result)
          }
        })
        api.getWhichGroup(message.FromUserName, (err, result) => {
          if(err) {
            new Error(err)
          } else {
            console.log('用户所在列表' + result)
          }
        })
        api.moveUserToGroup(message.FromUserName, 2, (err, result) => {
          if(err) {
            new Error(err)
          } else {
            console.log('move列表：' + result)
          }
        })
        api.removeGroup(100, (err, result) => {
          if(err) {
            new Error(err)
          } else {
            console.log('删除列表：' + result)
          }
        })
        api.getGroups((err, result) => {
          if(err) {
            new Error(err)
          } else {
            console.log('所有列表:')
            console.log(result)
          }
        })
      } else if(content === '7') {
        new Promise((resolve, reject) => {
          api.getUser({openid: message.FromUserName, lang: 'en'}, (err, result) => {
            if(err) {
              new Error(err)
            } else {
              resolve(result)
            }
          })
        })
        .then((value) => {
          api.sendText(message.FromUserName, JSON.stringify(value), function(err, result) {
              if (err) {
                  console.log(err)
              } else {}
          })
        })
        new Promise((resolve, reject) => {
          api.updateRemark(message.FromUserName, 'achenjs', (err, result) => {
            if(err) {
              reject(err)
            } else {
              resolve(result)
            }
          })
        })
        .then((value) => {
          api.sendText(message.FromUserName, "备注为：" + JSON.stringify(value), function(err, result) {
              if (err) {
                  console.log(err)
              } else {}
          })
        })
      } else if(content === '8') {
        new Promise((resolve, reject) => {
          api.createLimitQRCode(100, function(err, result) {
            if (err) {
              reject(err)
            } else {
              resolve(result)
            }
          })
        })
        .then((value) => {
          const ticket = value.ticket
          return api.showQRCodeURL(ticket)
        })
        .then((value) => {
          api.sendText(message.FromUserName, value, (err, result) => {
            if(err) {
              new Error(err)
            } else {
              console.log(result)
            }
          })
        })
      }
    }
    yield next
}
