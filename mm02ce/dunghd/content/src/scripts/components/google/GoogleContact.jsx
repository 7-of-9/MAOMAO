import React, { Component, PropTypes } from 'react';

class GoogleContact extends Component {
  constructor(props) {
    super(props);
    console.log('GoogleContact');
  }

  render() {
    return (
      <div>
        clientId : {this.props.clientId}, clientSecret: {this.props.clientSecret}
      </div>
    );
  }
}

GoogleContact.propTypes = {
  clientId: PropTypes.string,
  clientSecret: PropTypes.string,
};

export default GoogleContact;
