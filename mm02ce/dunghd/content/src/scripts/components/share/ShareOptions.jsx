import React from 'react';
import { onlyUpdateForKeys, compose } from 'recompose';
import styled from 'styled-components';
import ToggleButton from 'react-toggle-button';
import guid from '../utils/guid';

/* eslint-disable no-confusing-arrow */
const Option = styled(ToggleButton)`
  &:hover {
    cursor: pointer;
    background: #dedede;
  }
`;

const style = {
  margin: '0 auto',
  width: '100%',
  height: '100%',
  textAlign: 'center',
  overflow: 'hidden',
};

const enhance = compose(
  onlyUpdateForKeys(['topic', 'active']),
);

const ShareOptions = enhance(({ topics, active, onChange }) => {
  const tld = topics.find(item => item.id.indexOf('tld') !== -1);
  const experimentalTopics = topics.filter(item => item.id.indexOf('beta') !== -1);
  const isToggleTopic = !!topics.find(item => item.id === active);
  return (<div style={style} className="share-topic">
    <div className="switch-list">
      <span className="share-topic-title"> Single URL: </span>
      <div className="checkbox__content">
        <div className="switch-select">
          <Option key={guid()} value={active === 'site'} onToggle={() => { onChange('site'); }} />
          <span className="type-name">just this page</span>
        </div>
      </div>
    </div>
    <div className="switch-list">
      <div className="checkbox__content">
        <span className="share-topic-title"> Topics (Multiple URLs):</span>
        <div key={guid()} className="switch-select">
          <Option
            key={guid()}
            value={isToggleTopic}
            onToggle={() => { onChange(tld.id || experimentalTopics[0].id); }}
          />
        </div>
      </div>
      {isToggleTopic && tld &&
      <div className="radio__row">
        <div className="radio__regular">
          <input
            id={tld.id}
            type="radio"
            onChange={() => { onChange(tld.id); }}
            value={tld.id}
            checked={active === tld.id}
            className="radio__regular__input"
            name="topics"
          />
          <label className="radio__regular__label" htmlFor={tld.id} >
            {tld.name}
          </label>
        </div>
      </div>
      }
      {isToggleTopic && experimentalTopics &&
        <div>
          <p>Experimental:</p>
          <div className="radio__row">
              {experimentalTopics.map(topic =>
                <div key={guid()} className="radio__regular">
                  <input
                    type="radio"
                    onChange={() => { onChange(topic.id); }}
                    value={topic.id}
                    id={topic.id}
                    checked={active === topic.id}
                    className="radio__regular__input"
                    name="topics"
                  />
                  <label className="radio__regular__label" htmlFor={topic.id}>
                    {topic.name}
                  </label>
                </div>,
              )
            }
          </div>
        </div>
    }
    </div>
    <div className="switch-list mb0">
      <span className="share-topic-title"> All URLs: </span>
      <div className="switch-select">
        <Option key={guid()} value={active === 'all'} onToggle={() => { onChange('all'); }} />
        <span className="type-name">My browsing history</span>
      </div>
    </div>
  </div>);
 });
export default ShareOptions;
