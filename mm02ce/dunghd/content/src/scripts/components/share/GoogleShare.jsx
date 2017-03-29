import React, { PropTypes } from 'react';
import Fuse from 'fuse.js';
import Autosuggest from 'react-autosuggest';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import { pure, onlyUpdateForKeys, withState, withHandlers, compose } from 'recompose';
import noImage from './images/no-image.png';
import Contact from './Contact';
import guid from '../utils/guid';

function getSuggestionValue(suggestion) {
  return suggestion.email;
}

function getSuggestions(contacts, value) {
  if (value === '') {
    return [];
  }

  const options = {
    include: ['matches', 'score'],
    shouldSort: true,
    tokenize: true,
    matchAllTokens: true,
    findAllMatches: true,
    threshold: 0.1,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 1,
    keys: [
      'name',
      'email',
    ],
  };
  const fuse = new Fuse(contacts, options);
  const result = fuse.search(value);
  return result.slice(0, 5).map(item => item && item.item);
}

/* eslint-disable no-param-reassign */
function renderSuggestion(suggestion, { query }) {
  const suggestionText = `${suggestion.name} ${suggestion.email}`;
  const matches = match(suggestionText, query);
  const parts = parse(suggestionText, matches);
  return (
    <span className="suggestion-content">
      <span className="photo">
        <img
          onError={(ev) => { ev.target.src = noImage; }}
          src={suggestion.image}
          alt={suggestion.name || suggestion.email}
          height="40"
          width="40"
        />
      </span>
      <span className="name">
        {
          parts.map((part) => {
            const className = part.highlight ? 'highlight' : null;
            return (
              <span className={className} key={guid()}>{part.text}</span>
            );
          })
        }
      </span>
    </span>
  );
}

const GoogleShare = ({ value, contacts, selectedContacts, addContact, removeContact, onChange,
   suggestions, onSuggestionsFetchRequested, onSuggestionsClearRequested }) => <div>
     <div style={{ display: 'inline-block', width: '100%' }}>
       {
      contacts.slice(0, 3).map((contact) => {
        if (!selectedContacts.map(item => item.email).includes(contact.email)) {
          return (
            <Contact
              onClick={() => { addContact(contact); }} key={`MRC-${contact.key}`} name={contact.name} email={contact.email} image={contact.image}
            />
           );
        }
        return '';
      })
    }
     </div>
     <Autosuggest
       suggestions={suggestions}
       onSuggestionsFetchRequested={onSuggestionsFetchRequested}
       onSuggestionsClearRequested={onSuggestionsClearRequested}
       getSuggestionValue={getSuggestionValue}
       renderSuggestion={renderSuggestion}
       highlightFirstSuggestion
       inputProps={{
      placeholder: 'To: type name to search...',
      value,
      onChange,
    }}
     />
     <div style={{ display: 'inline-block', width: '100%' }}>
       {
      selectedContacts.map(contact => (
        <Contact isEdit onRemove={() => { removeContact(contact); }} key={`SC-${contact.key}`} name={contact.name} email={contact.email} image={contact.image} />
        ))
    }
     </div>
   </div>;

GoogleShare.propTypes = {
  value: PropTypes.string,
  contacts: PropTypes.array,
  selectedContacts: PropTypes.array,
  suggestions: PropTypes.array,
  addContact: PropTypes.func,
  removeContact: PropTypes.func,
  onChange: PropTypes.func,
  onSuggestionsFetchRequested: PropTypes.func,
  onSuggestionsClearRequested: PropTypes.func,
  handleChange: PropTypes.func,
};

GoogleShare.defaultProps = {
  value: '',
  contacts: [],
  selectedContacts: [],
  suggestions: [],
  addContact: () => {},
  removeContact: () => {},
  onChange: () => {},
  onSuggestionsFetchRequested: () => {},
  onSuggestionsClearRequested: () => {},
  handleChange: () => {},
};


const enhance = compose(
  withState('suggestions', 'changeSuggestions', []),
  withState('selectedContacts', 'changeSelectedContacts', []),
  withState('value', 'changeValue', ''),
  withHandlers({
    onSuggestionsFetchRequested: props => () => {
      const emails = props.selectedContacts.map(item => item.email);
      const sources = props.contacts.filter(item => emails.indexOf(item.email) === -1);
      props.changeSuggestions(getSuggestions(sources, props.value));
    },
    onSuggestionsClearRequested: props => () => {
      props.changeSuggestions([]);
    },
    addContact: props => (contact) => {
      const emails = props.selectedContacts.map(item => item.email);
      if (!emails.includes(contact.email)) {
          props.changeSelectedContacts([].concat(props.selectedContacts, contact));
          props.handleChange([].concat(props.selectedContacts, contact));
      }
    },
    removeContact: props => (contact) => {
      const sources = props.selectedContacts.filter(item => item.email !== contact.email);
      props.handleChange(sources);
      props.changeSelectedContacts(sources);
    },
    onChange: props => (event, { newValue, method }) => {
      if (method === 'click' || method === 'enter') {
        const selected = getSuggestions(props.suggestions, newValue);
        const result = [].concat(props.selectedContacts, (selected && selected[0]) || []);
        props.handleChange(result);
        props.changeSelectedContacts(result);
        props.changeValue('');
      } else {
        props.changeValue(newValue);
      }
    },
  }),
  pure,
  onlyUpdateForKeys(['value', 'selectedContacts']),
);

export default enhance(GoogleShare);
