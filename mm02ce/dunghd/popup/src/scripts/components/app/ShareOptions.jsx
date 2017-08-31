import React from 'react';
import { onlyUpdateForKeys, compose } from 'recompose';
import styled from 'styled-components';
import ToggleButton from 'react-toggle-button'; // https://gdowens.github.io/react-toggle-button/
import Loading from './Loading';
import logger from './logger';
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
  onlyUpdateForKeys(['topics', 'active', 'isProcessingNlp']),
);

const ShareOptions = enhance(({ url, isProcessingNlp, topics, active, onChange }) => {
  const tld = topics.find(item => item.id.indexOf('tld') !== -1);
  const experimentalTopics = topics.filter(item => item.id.indexOf('beta') !== -1);
  const isToggleTopic = !!topics.find(item => item.id === active);
  const { host } = new URL(url);
  logger.warn('active', active);
  logger.warn('tld', tld);
  logger.warn('experimentalTopics', experimentalTopics);
  return (
    <div style={style} className="share-topic">
      <div className="switch-list">
        <div className="checkbox__content">
          <div className="switch-select">
            <div className="set-size-button">
              <Option key={guid()} value={active === 'site'} onToggle={() => { onChange('site'); }} />
            </div>
            <span className="type-name">Just this page</span>
          </div>
        </div>
      </div>
      <div className="switch-list" style={{ display: topics.length > 0 ? '' : 'none' }}>
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
            <span className="type-name">Topics:</span>
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
                  {
                    host !== tld.name ? `${tld.name.toUpperCase()} (${host})` : tld.name.toUpperCase()
                  }
                </label>
              </div>
            }
            {isProcessingNlp &&
              <div className="global-Loading" style={{ margin: '0 auto', textAlign: 'center' }}><Loading /></div>
            }
            {isToggleTopic && experimentalTopics.length > 0 &&
              experimentalTopics.map(topic =>
                (<div key={guid()} className="radio__regular">
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
                      {topic.name.toUpperCase()}
                      <span className="icons-labs" />
                      <a
                        className="icons-search"
                        href={`http://www.maomao.rocks/discovery?search=${topic.name.substr(0, topic.name.indexOf('[') !== -1 ? topic.name.indexOf('[') : topic.name.length)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    </span>
                  </label>
                </div>),
              )
            }
          </div>
        </div>
      </div>
      <div className="switch-list mb0">
        <div className="checkbox__content">
          <div className="switch-select">
            <div className="set-size-button">
              <Option key={guid()} value={active === 'all'} onToggle={() => { onChange('all'); }} />
            </div>
            <span className="type-name">Everything I browse, on all websites</span>
          </div>
        </div>
      </div>
    </div>);
});
export default ShareOptions;
