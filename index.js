module.exports = (api, options) => {
    const {
        publicPath = '',
        devProtocol = 'http',
        devHost = 'useLocalIp',
        devPort = 8080,
        outputPath, // 相对于webpack的输出目录
        filename
    } = options.pluginOptions?.cdn ?? {}

    api.chainWebpack(chain => {
        const isProduction = chain.get('mode') === 'production'
        let cdnPublicPath

        if (isProduction) {
            cdnPublicPath = publicPath
        } else if (devHost) {
            const urlInstances = new URL(`${devProtocol}://${devHost}/`)

            if (devHost === 'useLocalIp') {
                const ip = require('internal-ip')
                urlInstances.hostname = ip.v4.sync()
            }

            if (devPort) urlInstances.port = devPort.toString()

            cdnPublicPath = urlInstances.href

            const StaticServerPlugin = require('./StaticServerPlugin')

            chain.plugin('StaticServerPlugin').use(StaticServerPlugin, [{
                devPort,
                host: urlInstances.hostname,
                public: outputPath
            }])
        }

        for (const ruleName of ['images', 'svg', 'media', 'fonts']) {
            const rule = chain.module.rule(ruleName)
            const options = {
                limit: -1,
                publicPath: cdnPublicPath,
                name: filename,
                outputPath: outputPath
            }
            let useName
            if (rule.uses.has('url-loader')) {
                useName = 'url-loader'
            } else {
                delete options.limit
                useName = 'file-loader'
            }
            rule.use(useName).tap(() => options)
        }
    })
}
