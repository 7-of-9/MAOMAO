import { EventEmitter } from 'fbemitter'
import logger from './logger'

const layoutEmitter = new EventEmitter()

layoutEmitter.addListener('layout', (args) => {
  logger.warn('layoutEmitter layout', args)
})

export default layoutEmitter
