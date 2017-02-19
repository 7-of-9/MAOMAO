import React from 'react';
import { shallow } from 'enzyme';

import Instagram from '../index';

describe('<Instagram />', () => {
  it('renders <Instagram>', () => {
    const renderedComponent = shallow(
      <Instagram />
    );
    expect(renderedComponent).toBeDefined();
  });
});
