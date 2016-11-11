import React, { Component, PropTypes } from 'react';
import {
  Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn,
} from 'material-ui/Table';
import SearchInput, { createFilter } from 'react-search-input';

const KEYS_TO_FILTERS = ['name', 'email'];

class GoogleContactPresenter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchTerm: '',
    };
    this.renderContact = this.renderContact.bind(this);
    this.selectRowItem = this.selectRowItem.bind(this);
    this.searchUpdated = this.searchUpdated.bind(this);
  }

  selectRowItem(rows) {
    this.props.selectRecipient(rows);
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
      </Table>
    );
  }
}

GoogleContactPresenter.propTypes = {
  contacts: PropTypes.array.isRequired,
  selectRecipient: PropTypes.func.isRequired,
};

export default GoogleContactPresenter;
