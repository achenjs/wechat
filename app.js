'use strict'
const port = 4545
const Koa = require('koa')
const g = require('./wechat/g')
const config = require('./config')
const weixin = require('./weixin')
const app = new Koa()
const ejs = require('ejs')
const WechatAPI = require('wechat-api')
const heredoc = require('heredoc')
const opts = require('./config').wechat
const api = new WechatAPI(opts.appID, opts.appSecret)
const tpl = heredoc(function() {/*
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>搜电影</title>
  </head>
  <body>
    <h1>点击标题，开始录音翻译</h1>
    <p id="title"></p>
    <div id="doctor"></div>
    <div id="year"></div>
    <div id="poster"></div>
    <script src="http://www.zeptojs.cn/zepto.min.js" charset="utf-8"></script>
    <script src="http://res.wx.qq.com/open/js/jweixin-1.0.0.js" charset="utf-8"></script>
    <script>
      wx.config({
        debug: <%= debug%>, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
        appId: '<%= appId%>', // 必填，公众号的唯一标识
        timestamp: '<%= timestamp%>', // 必填，生成签名的时间戳
        nonceStr: '<%= nonceStr%>', // 必填，生成签名的随机串
        signature: '<%= signature%>',// 必填，签名，见附录1
        jsApiList: '<%= jsApiList%>' // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
      });

      wx.ready(function() {
        wx.checkJsApi({
          jsApiList: ['onVoiceRecordEnd'],
          success: function(res) {
            console.log(res)
          }
        })

        var isRecording = false
        $('h1').on('tap', function() {
          if(!isRecording) {
              wx.startRecord({
                  cancel: function() {
                  alert('那就不能搜索了！')
                }
              })
              return
          }
          isRecording =  false
          wx.stopRecord({
              success: function (res) {
                  var localId = res.localId
                  wx.translateVoice({
                     localId: localId, // 需要识别的音频的本地Id，由录音相关接口获得
                      isShowProgressTips: 1, // 默认为1，显示进度提示
                      success: function (res) {
                          alert(res.translateResult); // 语音识别的结果
                      }
                  })
              }
          })
        })
      })

    </script>
  </body>
  </html>
*/})



app.use(function *(next) {
  if(this.url.indexOf('/movie') > -1) {
    var param = {
     debug: false,
     jsApiList: ['startRecord', 'stopRecord', 'onVoiceRecordEnd', 'translateVoice'],
     url: this.href
    };
    new Promise((resolve, reject) => {
      api.getJsConfig(param, (err, result) => {
        if(err) {
          reject(err)
        } else {
          resolve(result)
        }
      })
    })
    .then((value) => {
      this.body = ejs.render(tpl, value)
    })
    .catch((err) => {
      new Error(err)
    })
    return next
  }

  yield next
})

app.use(g(config.wechat, weixin)).listen(port)

console.log('listening: ' + port)
