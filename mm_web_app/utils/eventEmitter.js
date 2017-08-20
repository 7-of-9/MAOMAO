import { EventEmitter } from 'fbemitter'
import logger from './logger'

const eventEmitter = new EventEmitter()

eventEmitter.addListener('layout', (args) => {
  logger.warn('eventEmitter layout', args)
})

eventEmitter.addListener('carousel', (args) => {
  logger.warn('eventEmitter carousel', args)
})

export default eventEmitter
