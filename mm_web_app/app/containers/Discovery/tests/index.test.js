import React from 'react';
import { shallow } from 'enzyme';

import { Discovery } from '../index';

describe('<Discovery />', () => {
  it('should render the page message', () => {
    const renderedComponent = shallow(
      <Discovery />
    );
    expect(renderedComponent).toBeDefined();
  });
});
