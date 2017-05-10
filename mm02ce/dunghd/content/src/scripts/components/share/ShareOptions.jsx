import React from 'react';
import { onlyUpdateForKeys, compose } from 'recompose';
import styled from 'styled-components';
import ToggleButton from 'react-toggle-button';
import guid from '../utils/guid';

/* eslint-disable no-confusing-arrow */
const Option = styled(ToggleButton) `
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
      <div className="checkbox__content">
        <div className="switch-select">
          <div className="set-size-button">
            <Option key={guid()} value={active === 'site'} onToggle={() => { onChange('site'); }} />
          </div>
          <span className="share-topic-title">Just this page</span>
        </div>
      </div>
    </div>
    <div className="switch-list" style={{ display: topics.length > 0 ? '' : 'none' }}>
      <div className="checkbox__content">
        <div className="checkbox__content">
          <div key={guid()} className="switch-select">
            <div className="set-size-button">
              <Option
                key={guid()}
                value={isToggleTopic}
                onToggle={() => {
                  onChange((tld && tld.id) || (experimentalTopics[0] && experimentalTopics[0].id));
                }}
              />
            </div>
            <span className="share-topic-title">Topics:</span>
          </div>
        </div>
      </div>
      <div className="checkbox__content">
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
                <span className="meta">All my browsing on </span>
                {
                  window.location.host !== tld.name ? `${tld.name.toUpperCase()} (${window.location.host})` : tld.name.toUpperCase()
                }
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
                  <span className="labs">
                    <span className="meta">All my browsing on</span>  {topic.name.toUpperCase()}
                    <span className='icons-labs'></span>
                  </span>
                </label>
              </div>,
            )
          }
        </div>
      </div>
    </div>
    <div className="switch-list mb0">
      <div className="switch-select">
        <div className="set-size-button">
          <Option key={guid()} value={active === 'all'} onToggle={() => { onChange('all'); }} />
        </div>
        <span className="share-topic-title">Everything I browse, on all websites</span>
      </div>
    </div>
  </div>);
});
export default ShareOptions;
