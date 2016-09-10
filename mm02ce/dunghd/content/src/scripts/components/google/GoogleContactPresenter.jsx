import React, { Component, PropTypes } from 'react';
import {
  Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn,
} from 'material-ui/Table';

class GoogleContactPresenter extends Component {
  constructor(props) {
    super(props);
    this.renderContact = this.renderContact.bind(this);
    this.selectRowItem = this.selectRowItem.bind(this);
  }

  selectRowItem(rows) {
    this.props.selectRecipient(rows);
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
    return (
      <Table selectable multiSelectable onRowSelection={this.selectRowItem}>
        <TableHeader displaySelectAll enableSelectAll>
          <TableRow>
            <TableHeaderColumn tooltip="Name">Name</TableHeaderColumn>
            <TableHeaderColumn tooltip="Email">Email</TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody showRowHover displayRowCheckbox>
          {this.props.contacts.map(this.renderContact) }
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
