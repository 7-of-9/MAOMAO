import React from 'react';
import { shallow } from 'enzyme';

import Reddit from '../index';

describe('<Reddit />', () => {
  it('renders <Reddit>', () => {
    const renderedComponent = shallow(
      <Reddit />
    );
    expect(renderedComponent).toBeDefined();
  });
});
