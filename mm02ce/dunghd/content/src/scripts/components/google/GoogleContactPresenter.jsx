import React, { Component, PropTypes } from 'react';
import {
  Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn, TableFooter,
} from 'material-ui/Table';
import SearchInput, { createFilter } from 'react-search-input';
import GoogleContactPagination from './GoogleContactPagination';

const KEYS_TO_FILTERS = ['name'];

class GoogleContactPresenter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchTerm: '',
      recipients: [],
    };
    this.renderContact = this.renderContact.bind(this);
    this.selectRowItem = this.selectRowItem.bind(this);
    this.searchUpdated = this.searchUpdated.bind(this);
    this.onPageChangeFromPagination = this.onPageChangeFromPagination.bind(this);
  }

  onPageChangeFromPagination(newPage) {
    this.props.loadMore(newPage);
  }

  selectRowItem(rows) {
    console.log('selectRowItem', rows);
    const filteredEmails = this.props.contacts.filter(
      createFilter(this.state.searchTerm, KEYS_TO_FILTERS)
    );
    let recipients = [];
    if (rows === 'all') {
      recipients = [].concat(filteredEmails.map(item => item.email));
    } else {
      recipients = [].concat(filteredEmails
        .filter((item, index) => rows.indexOf(index) !== -1)
        .map(item => item.email)
      );
      // keep old state if we are filtering
      if (this.state.searchTerm && this.state.searchTerm.length) {
        const emails = filteredEmails.map(item => item.email);
        recipients = recipients.concat(this.state.recipients.filter(item => emails.indexOf(item) === -1));
      }
    }

    this.setState({
      recipients,
    });
    this.props.selectRecipient(recipients);
  }

  searchUpdated(term) {
    this.setState({ searchTerm: term });
  }

  renderContact(contact) {
    return (
      <TableRow key={contact.key} selected={this.state.recipients.indexOf(contact.email) !== -1}>
        <TableRowColumn>{contact.name}</TableRowColumn>
        <TableRowColumn>{contact.email}</TableRowColumn>
      </TableRow>
    );
  }

  render() {
    const filteredEmails = this.props.contacts.filter(
      createFilter(this.state.searchTerm, KEYS_TO_FILTERS)
    );
    console.log('render', filteredEmails);
    return (
      <Table multiSelectable onRowSelection={this.selectRowItem}>
        <TableHeader displaySelectAll enableSelectAll>
          <TableRow>
            <TableHeaderColumn tooltip="Name">
              Name <SearchInput className="search-input" onChange={this.searchUpdated} />
            </TableHeaderColumn>
            <TableHeaderColumn tooltip="Email">Email</TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody showRowHover displayRowCheckbox deselectOnClickaway={false}>
          {filteredEmails.map(this.renderContact)}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableRowColumn colSpan="2" style={{ textAlign: 'center' }}>
              <GoogleContactPagination totalPages={this.props.totalPages} currentPage={this.props.page} onChange={this.onPageChangeFromPagination} />
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
  totalPages: PropTypes.number.isRequired,
  loadMore: PropTypes.func.isRequired,
};

export default GoogleContactPresenter;
