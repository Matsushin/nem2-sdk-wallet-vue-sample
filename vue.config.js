// vue.config.js
module.exports = {
  baseUrl: process.env.NODE_ENV === 'production'
    ? '/nem2-sdk-wallet-vue-sample/'
    : '',
  outputDir: 'docs',
}