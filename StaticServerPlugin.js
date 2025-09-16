const http = require('http')
const handler = require('serve-handler')
const PLUGIN_NAME = 'StaticServerPlugin'
const path = require('path')
module.exports = class StaticServerPlugin {
    constructor(options = {}) {
        const {
            host = '0.0.0.0',
            port = 38003,
            // 相对于webpack的输出目录, 默认值为输出目录
            public: publicPath = 'auto'
        } = options

        this.options = {
            host,
            port,
            publicPath
        }
    }
    apply(compiler) {
        const server = new http.Server()
        const { options } = this

        let publicPath = options.publicPath
        if (publicPath === 'auto') {
            publicPath = compiler.options.output.path
        } else if (!path.isAbsolute(publicPath)) {
            publicPath = path.resolve(compiler.options.output.path, publicPath)
        }
        server.on('request', (req, res) => {
            handler(req, res, {
                public: publicPath
            })
        })

        server.listen({
            host: options.host,
            port: options.port
        }, err => {
            if (err) {
                console.error(err)
            } else {
                console.log('static server is started')
            }
        })
    }
}
