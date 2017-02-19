import React from 'react';
import { shallow } from 'enzyme';

import Block from '../index';

describe('<Block />', () => {
  it('renders a <Block>', () => {
    const renderedComponent = shallow(
      <Block></Block>
    );
    expect(renderedComponent).toBeDefined();
  });

  it('renders a text', () => {
    const text = 'This is a text';
    const renderedComponent = shallow(
      <Block>{text}</Block>
    );
    expect(renderedComponent.contains(text)).toEqual(true);
  });
});
