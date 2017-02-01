'use strict'

const Koa = require('koa')
const g = require('./wechat/g')
const path = require('path')
const util = require('./libs/util')
const wechat_file = path.join(__dirname, './', 'config/wechat.txt')
const config = {
  wechat: {
    appID: 'wx57d0df72024a6b29',
    appSecret: '117fe533bde88acf88e7050e57a2a145',
    token: '176204_i',
    getAccessToken: function() {
      return util.readFileAsync(wechat_file)
    },
    saveAccessToken: function(data) {
      data = JSON.stringify(data)
      return util.writeFileAsync(wechat_file, data)
    }
  }
}

const app = new Koa()

app.use(g(config.wechat)).listen(1234)

console.log('listening: 1234')
