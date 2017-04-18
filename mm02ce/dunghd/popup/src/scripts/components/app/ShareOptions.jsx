import React from 'react';
import { onlyUpdateForKeys, compose } from 'recompose';
import styled from 'styled-components';
import ToggleButton from 'react-toggle-button'; // https://gdowens.github.io/react-toggle-button/
import { guid } from './utils';

/* eslint-disable no-confusing-arrow */
const Option = styled(ToggleButton)`
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

const ShareOptions = enhance(({ topics, active, onChange }) =>
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
    <div className="switch-list">
      {
        /*topics.map(topic =>
          topic.id &&
          <div key={guid()} className="switch-select">
            <Option key={guid()} value={active === topic.id} onToggle={() => { onChange(topic.id); }} />
            <span className="type-name">{topic.name}</span>
          </div>,
        )*/
      }
      <div className="checkbox__content">
        <span className="share-topic-title"> Topics (Multiple URLs):</span>
        <div key={guid()} className="switch-select">
          <Option key={guid()} value={active === 'topic'} onToggle={() => { onChange('topic'); }} />
          <span className="type-name">Topics name</span>
        </div>
      </div>
      <div className="radio__row">
        <div className="radio__regular">
          <input type="radio" className="radio__regular__input" id="radio_1" name="radio" />
          <label className="radio__regular__label" tabindex="1" htmlFor="radio_1">Smashingmagazine.com</label>
        </div>
      </div>
      <div className="radio__row">
        <div className="radio__regular">
          <input type="radio" className="radio__regular__input" id="radio_2" name="radio" />
          <label className="radio__regular__label" tabindex="2" htmlFor="radio_2">JavaScript</label>
        </div>
        <div className="radio__regular">
          <input type="radio" className="radio__regular__input" id="radio_3" name="radio" />
          <label className="radio__regular__label" tabindex="3" htmlFor="radio_3">Computing</label>
        </div>
        <div className="radio__regular">
          <input type="radio" className="radio__regular__input" id="radio_4" name="radio" />
          <label className="radio__regular__label" tabindex="4" htmlFor="radio_4">Technology</label>
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
  </div>,
);
export default ShareOptions;
