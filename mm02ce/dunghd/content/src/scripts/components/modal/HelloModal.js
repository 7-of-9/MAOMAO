import React, {Component} from 'react';
import Modal from 'react-modal';
import {connect} from 'react-redux';

const customStyles = {
    content : {
        top                   : '30%',
        left                  : '70%',
        right                 : 'auto',
        bottom                : 'auto',
        transform             : 'translate(-50%, -50%)'
    }
};


var HelloModal = React.createClass({

    openModal: function() {
       console.log('props', this.props);
       this.setState({modalIsOpen: true});
       this.props.dispatch({
           type: 'OPEN_MODAL'
       });
    },

    afterOpenModal: function() {
        // references are now sync'd and can be accessed.
        this.refs.subtitle.style.color = '#f00';
    },

    closeModal: function() {
        console.log('props', this.props);
        this.setState({modalIsOpen: false});
        this.props.dispatch({
            type: 'CLOSE_MODAL'
        });
    },

    render: function() {
        return (
          <div>
        <button onClick={this.openModal}>Open Modal</button>
        <Modal
          isOpen={this.props.modalIsOpen}
          onAfterOpen={this.afterOpenModal}
          onRequestClose={this.closeModal}
          style={customStyles} >

          <h2 ref="subtitle">Click #{this.props.count}</h2>
          <button onClick={this.closeModal}>close</button>
          <div>I am a modal</div>
        </Modal>
      </div>
    );
}
});

const mapStateToProps = (state) => {
    return {
        modalIsOpen: state.modal,
        count: state.count
    };
};

export default connect(mapStateToProps)(HelloModal);