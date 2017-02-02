'use strict'

const Promise = require('bluebird')
const request = Promise.promisify(require('request'))
const prefix = 'https://api.weixin.qq.com/cgi-bin/'
const api = {
  accessToken: prefix + 'token?grant_type=client_credential',
  createMenu: prefix + 'menu/create'
}

function Wechat(opts) {
  const that = this
  this.appID = opts.appID
  this.appSecret = opts.appSecret
  this.getAccessToken = opts.getAccessToken
  this.saveAccessToken = opts.saveAccessToken

  this.getAccessToken()
    .then(function(data) {
      try {
        data = JSON.parse(data)
      } catch (e) {
        return that.updateAccessToken(data)
      }

      if(that.isValidAccessToken(data)) {
        return Promise.resolve(data)
      } else {
        return that.updateAccessToken()
      }
    })
    .then(function(data) {
      that.access_token = data.access_token
      that.expires_in = data.expires_in
      that.saveAccessToken(data)
    })
      .catch(function(err) {
        console.info(err)
      })
}

Wechat.prototype.isValidAccessToken = function (data) {
    if(!data || !data.access_token || !data.expires_in) {
      return false
    }
    // const access_token = data.access_token
    const expires_in = data.expires_in
    const now = (new Date().getTime())

    if(now < expires_in) {
      return true
    } else {
      return false
    }
}

// 过期，请求微信服务器更新access_token
Wechat.prototype.updateAccessToken = function() {
  const appID = this.appID
  const appSecret = this.appSecret
  const url = api.accessToken + '&appid=' + appID + '&secret=' + appSecret

  return new Promise(function(resolve, reject) {
    request({url: url, json: true}).then(function(response) {
      const data = response.body
      console.log(data)
      const now = (new Date().getTime())
      const expires_in = now + (data.expires_in - 20) * 1000    // 提前20秒刷新，考虑到网络延迟

      data.expires_in = expires_in

      resolve(data)
    })
  })
}

module.exports = Wechat
