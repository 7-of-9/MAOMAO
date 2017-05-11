import Pusher from 'pusher-js';
import logger from './logger';

const PUSHER_KEY = '056a3bc19f7b681fd6fb';
const dev = process.env.NODE_ENV !== 'production';
Pusher.logToConsole = !!dev;

/**
 * Receives realtime browsing history from friends
 * @param array friends
 */
export default function realtimeStream(friends = []) {
  if (friends.length > 0) {
    const pusher = new Pusher(PUSHER_KEY, {
      cluster: 'ap1',
      encrypted: true,
    });
    friends.forEach((friend) => {
      // TODO: Sucscrible to all and all friend's stream
      const channel = pusher.subscribe(`my-friend-stream-${friend.user_id}`);
      channel.bind('process-url', (data) => {
        // TODO: notify to users
        logger.warn('pushser data', data);
      });
    });
  }
}

