import React, { Component, PropTypes } from 'react';

class GoogleContactPresenter extends Component {
  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    this.props.selectAddress(this.props.email);
  }

  render() {
    return (
      <span>
        <input type="checkbox" name="checkbox{this.props.email}" onClick={this.onClick} />
        {this.props.email} ({this.props.name})
      </span>
    );
  }
}

GoogleContactPresenter.propTypes = {
  email: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  selectAddress: PropTypes.func,
};

export default GoogleContactPresenter;
