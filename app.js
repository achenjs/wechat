'use strict'
const PORT = 5555
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
    <div id="director"></div>
    <div id="year"></div>
    <div id="poster"></div>
    <script src="//cdn.bootcss.com/jquery/2.1.0/jquery.min.js" charset="utf-8"></script>
    <script src="http://res.wx.qq.com/open/js/jweixin-1.0.0.js" charset="utf-8"></script>
    <script>
      wx.config({
        debug: <%= debug%>,
        appId: '<%= appId%>',
        timestamp: '<%= timestamp%>',
        nonceStr: '<%= nonceStr%>',
        signature: '<%= signature%>',
        jsApiList: ['startRecord', 'stopRecord', 'onVoiceRecordEnd', 'translateVoice','onMenuShareAppMessage']
      })


      wx.ready(function() {
        wx.checkJsApi({
          jsApiList: ['onVoiceRecordEnd'],
          success: function(res) {

          }
        })
        $('#title').on('click', function(){
            wx.closeWindow();
        })
        var isRecording = false
        $('h1').on('click', function() {
          if(!isRecording) {
              isRecording = true
              wx.startRecord({
                  cancel: function() {
                    window.alert('那就不能搜索了！')
                  }
              })
              return
          }
          isRecording = false
          wx.stopRecord({
              success: function (res) {
                  var localId = res.localId
                  wx.translateVoice({
                      localId: localId,
                      isShowProgressTips: 1,
                      success: function (res) {
                          var result = res.translateResult
                          $.ajax({
                            type: 'get',
                            url: 'https://api.douban.com/v2/movie/search?q=' + result,
                            dataType: 'jsonp',
                            jsonp: 'callback',
                            success: function(result) {
                                var data = result.subjects[0]
                                $('#title').html(data.title)
                                $('#director').html(data.directors[0].name)
                                $('#year').html(data.year)
                                $('#poster').html('<img src="'+ data.images.large +'">')

                                shareContent = {
                                  title: data.title,
                                  desc: '我搜出来了：'+ data.title,
                                  link: 'https://github.achenjs.com',
                                  imgUrl: data.images.large,
                                  success: function () {
                                      window.alert('分享成功')
                                  },
                                  cancel: function () {
                                      window.alert('分享失败')
                                  }
                                }

                                wx.onMenuShareAppMessage(shareContent)
                            }
                          })
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
  api.getTicket((err, result) => {
    if(err) {
      new Error(err)
    } else {
      console.log(result)
    }
  })
  if(this.url.indexOf('/movie') > -1) {
    var param = {
     debug: false,
     jsApiList: [],
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
      console.log(value)
      this.body = ejs.render(tpl, value)
    })
    .catch((err) => {
      new Error(err)
    })
    return next
  }

  yield next
})

app.use(g(config.wechat, weixin)).listen(PORT, function() {
  console.log('listening: ' + PORT)
})
