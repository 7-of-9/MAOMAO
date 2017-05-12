import * as logger from 'loglevel';

if (process.env.NODE_ENV === 'production') {
  logger.setLevel('error');
} else {
  logger.setLevel('debug');
}

export default logger;
