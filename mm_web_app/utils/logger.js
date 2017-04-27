const dev = process.env.NODE_ENV !== 'production'
const logger = require('loglevel')
logger.setLevel(dev ? 'info' : 'error')

export default logger
