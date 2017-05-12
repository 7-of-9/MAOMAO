import * as logger from 'loglevel';

if (process.env.NODE_ENV === 'production') {
  // This disables all logging below the given level
  logger.setLevel('error');
} else {
  logger.setLevel('debug');
}

export default logger;
