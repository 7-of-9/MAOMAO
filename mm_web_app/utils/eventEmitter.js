import { EventEmitter } from 'fbemitter'
import logger from './logger'

const eventEmitter = new EventEmitter()

eventEmitter.addListener('layout', (args) => {
  logger.info('eventEmitter layout', args)
})

eventEmitter.addListener('carousel', (args) => {
  logger.info('eventEmitter carousel', args)
})

export default eventEmitter
