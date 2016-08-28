import React, {Component} from 'react';
import {connect} from 'react-redux';
import HelloModal from '../modal/HelloModal';

class App extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        document.addEventListener('click', () => {
            this.props.dispatch({
                type: 'ADD_COUNT'
            });
        });
    }

    render() {
        return (
          <div>
            <HelloModal/>
            Count: {this.props.count}
            <br/>
            <pre> {JSON.stringify(this.props,null,2)} </pre>
          </div>
    );
      }
}

const mapStateToProps = (state) => {
    return {
        count: state.count,
        modalIsOpen: state.modal
    };
};

export default connect(mapStateToProps)(App);
