import React from 'react';
import { onlyUpdateForKeys, compose } from 'recompose';
import styled from 'styled-components';
import ToggleButton from 'react-toggle-button'; // https://gdowens.github.io/react-toggle-button/
import * as logger from 'loglevel';
import { guid } from './utils';

/* eslint-disable no-confusing-arrow */
const Option = styled(ToggleButton) `
  &:hover {
    cursor: pointer;
    background: #dedede;
  }
`;

const style = {
  width: '100%',
  height: '100%',
  textAlign: 'center',
  overflow: 'hidden',
  zIndex: 1000,
};

const enhance = compose(
  onlyUpdateForKeys(['topic', 'active']),
);

const ShareOptions = enhance(({ topics, active, onChange }) => {
  const tld = topics.find(item => item.id.indexOf('tld') !== -1);
  const experimentalTopics = topics.filter(item => item.id.indexOf('beta') !== -1);
  const isToggleTopic = !!topics.find(item => item.id === active);
  logger.warn('active', active);
  logger.warn('tld', tld);
  logger.warn('experimentalTopics', experimentalTopics);
  return (
    <div style={style} className="share-topic">
      <div className="switch-list">
        <span className="share-topic-title"> Single URL: </span>
        <div className="checkbox__content">
          <div className="switch-select">
            <Option key={guid()} value={active === 'site'} onToggle={() => { onChange('site'); }} />
            <span className="type-name">just this page</span>
          </div>
        </div>
      </div>
      <div className="switch-list" style={{ display: topics.length > 0 ? '' : 'none' }}>
        <div className="checkbox__content">
          <span className="share-topic-title"> Topics (Multiple URLs):</span>
          <div key={guid()} className="switch-select">
            <Option
              key={guid()}
              value={isToggleTopic}
              onToggle={() => {
                onChange((tld && tld.id) || (experimentalTopics[0] && experimentalTopics[0].id));
              }}
            />
          </div>
          <div className="radio__row">
            {isToggleTopic && tld &&
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
            }
            {isToggleTopic && experimentalTopics.length > 0 &&
              experimentalTopics.map(topic =>
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
                    <span className="labs">{topic.name}</span>
                  </label>
                </div>,
              )
            }
          </div>
        </div>
      </div>
      <div className="switch-list mb0">
        <span className="share-topic-title"> All URLs: </span>
        <div className="checkbox__content">
          <div className="switch-select">
            <Option key={guid()} value={active === 'all'} onToggle={() => { onChange('all'); }} />
            <span className="type-name">My browsing history</span>
          </div>
        </div>
      </div>
    </div>);
});
export default ShareOptions;
