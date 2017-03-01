import React from 'react';
import { shallow } from 'enzyme';

import BlockElement from '../index';

describe('<BlockElement />', () => {
  it('renders <BlockElement>', () => {
    const renderedComponent = shallow(
      <BlockElement />
    );
    expect(renderedComponent).toBeDefined();
  });
});
