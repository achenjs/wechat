'use strict'
const port = 4545
const Koa = require('koa')
const g = require('./wechat/g')
const config = require('./config')
const weixin = require('./weixin')
const app = new Koa()

app.use(g(config.wechat, weixin)).listen(port)

console.log('listening: ' + port)
