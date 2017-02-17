'use strict'
const PORT = 5555
const Koa = require('koa')
const g = require('./wechat/g')
const ejs = require('ejs')
const WechatAPI = require('wechat-api')
const opts = require('./config').wechat
const api = new WechatAPI(opts.appID, opts.appSecret)

// 初始化菜单
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

const app = new Koa()
const Router = require('koa-router')
const router = new Router()
const game = require('./app/controllers/game')
const wechat = require('./app/controllers/wechat')

router.get('/movie', game.movie)
router.get('/wx', wechat.hear)
router.post('/wx', wechat.hear)

app.use(router.routes())
app.use(router.allowedMethods())

app.listen(PORT, function() {
  console.log('listening: ' + PORT)
})
