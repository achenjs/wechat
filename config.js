'use strict'

const path = require('path')
const util = require('./libs/util')
const wechat_file = path.join(__dirname, './', 'config/wechat.txt')

module.exports = {
    wechat: {
        appID: 'wx57d0df72024a6b29',
        appSecret: '117fe533bde88acf88e7050e57a2a145',
        token: 'achenjs',
        getAccessToken: function() {
            return util.readFileAsync(wechat_file)
        },
        saveAccessToken: function(data) {
            data = JSON.stringify(data)
            console.log(data)
            return util.writeFileAsync(wechat_file, data)
        }
    }
}
