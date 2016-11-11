import React, { Component, PropTypes } from 'react';
import {
  Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn, TableFooter,
} from 'material-ui/Table';
import SearchInput, { createFilter } from 'react-search-input';
import FlatButton from 'material-ui/FlatButton';
import ToggleDisplay from 'react-toggle-display';

const KEYS_TO_FILTERS = ['name'];

class GoogleContactPresenter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchTerm: '',
    };
    this.renderContact = this.renderContact.bind(this);
    this.selectRowItem = this.selectRowItem.bind(this);
    this.searchUpdated = this.searchUpdated.bind(this);
    this.loadMore = this.loadMore.bind(this);
  }

  loadMore() {
    this.props.loadMore(this.props.page + 1);
  }

  selectRowItem(rows) {
    console.log('selectRowItem', rows);
    this.props.selectRecipient(rows);

    // const filteredEmails = this.props.contacts.filter(
    //   createFilter(this.state.searchTerm, KEYS_TO_FILTERS)
    // );
    // let recipients = [];
    // if (this.selectedRow === 'all') {
    //   recipients = [].concat(filteredEmails.map(item => item.email));
    // } else {
    //   recipients = [].concat(filteredEmails
    //     .filter((item, index) => rows.indexOf(index) !== -1)
    //     .map(item => item.email)
    //   );
    // }
    // console.log('recipients', recipients);
  }

  searchUpdated(term) {
    this.setState({ searchTerm: term });
  }

  renderContact(contact) {
    return (
      <TableRow key={contact.key}>
        <TableRowColumn>{contact.name}</TableRowColumn>
        <TableRowColumn>{contact.email}</TableRowColumn>
      </TableRow>
    );
  }

  render() {
    console.log('render', this);
    const filteredEmails = this.props.contacts.filter(
      createFilter(this.state.searchTerm, KEYS_TO_FILTERS)
    );
    return (
      <Table selectable multiSelectable onRowSelection={this.selectRowItem}>
        <TableHeader displaySelectAll enableSelectAll>
          <TableRow>
            <TableHeaderColumn tooltip="Name">
              Name <SearchInput className="search-input" onChange={this.searchUpdated} />
            </TableHeaderColumn>
            <TableHeaderColumn tooltip="Email">Email</TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody showRowHover displayRowCheckbox>
          {filteredEmails.map(this.renderContact)}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableRowColumn colSpan="2" style={{ textAlign: 'center' }}>
              <ToggleDisplay show={this.props.hasMore}>
                <FlatButton
                  label="Load More"
                  primary
                  onTouchTap={this.loadMore}
                  />
              </ToggleDisplay>
            </TableRowColumn>
          </TableRow>
        </TableFooter>
      </Table>
    );
  }
}

GoogleContactPresenter.propTypes = {
  contacts: PropTypes.array.isRequired,
  selectRecipient: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  loadMore: PropTypes.func.isRequired,
  hasMore: PropTypes.bool.isRequired,
};

export default GoogleContactPresenter;
