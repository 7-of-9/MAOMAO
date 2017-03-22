import React from 'react';
import Fuse from 'fuse.js';
import Autosuggest from 'react-autosuggest';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import { pure, onlyUpdateForKeys, withState, withHandlers, compose } from 'recompose';
import noImage from './images/no-image.png';

function getSuggestionValue(suggestion) {
  return `${suggestion.name} suggestion.email`;
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

function renderSuggestion(suggestion, { query }) {
  const suggestionText = `${suggestion.name} ${suggestion.email}`;
  const matches = match(suggestionText, query);
  const parts = parse(suggestionText, matches);
  return (
    <span className="suggestion-content">
      <span className="photo">
        <img onError={(ev) => { ev.target.src = noImage; }} src={suggestion.image} alt={suggestion.name || suggestion.email} height="40" width="40" />
      </span>
      <span className="name">
        {
          parts.map((part) => {
            const className = part.highlight ? 'highlight' : null;
            return (
              <span className={className} key={suggestion.uuid}>{part.text}</span>
            );
          })
        }
      </span>
    </span>
  );
}

const GoogleShare = ({ value, onChange, suggestions, onSuggestionsFetchRequested, onSuggestionsClearRequested }) => <div><Autosuggest
  suggestions={suggestions}
  onSuggestionsFetchRequested={onSuggestionsFetchRequested}
  onSuggestionsClearRequested={onSuggestionsClearRequested}
  getSuggestionValue={getSuggestionValue}
  renderSuggestion={renderSuggestion}
  inputProps={{
      placeholder: 'To: type name to search...',
      value,
      onChange,
    }}
/></div>;

const enhance = compose(
  withState('suggestions', 'changeSuggestions', []),
  withState('value', 'changeValue', ''),
  withHandlers({
    onSuggestionsFetchRequested: props => () => {
      props.changeSuggestions(getSuggestions(props.contacts, props.value));
    },
    onSuggestionsClearRequested: props => () => {
      props.changeSuggestions([]);
    },
    onChange: props => (event, { newValue }) => {
      props.changeValue(newValue);
    },
  }),
  onlyUpdateForKeys(['value']),
  pure,
);

export default enhance(GoogleShare);
