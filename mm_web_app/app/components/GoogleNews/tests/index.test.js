import React from 'react';
import { shallow } from 'enzyme';

import GoogleNews from '../index';

describe('<GoogleNews />', () => {
  it('renders <GoogleNews>', () => {
    const renderedComponent = shallow(
      <GoogleNews />
    );
    expect(renderedComponent).toBeDefined();
  });
});
