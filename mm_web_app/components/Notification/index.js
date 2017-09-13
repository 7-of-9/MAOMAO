/*
 *
 * Notification
 *
 */

import React from 'react'
import { inject, observer } from 'mobx-react'
import { NotificationStack } from 'react-notification'
import logger from '../../utils/logger'

@inject('store')
@inject('ui')
@observer
class Notification extends React.PureComponent {
  removeNotification = (uuid) => {
    this.props.ui.removeNotification(uuid)
  }

  componentWillReact () {
    logger.info('Notification componentWillReact')
  }

  componentWillUnmount () {
    logger.info('Notification componentWillUnmount')
    this.props.ui.clearNotifications()
  }

  render () {
    return (
      <NotificationStack
        notifications={this.props.ui.notifications.slice()}
        dismissAfter={5000}
        onDismiss={this.removeNotification}
        />)
  }
}

export default Notification
