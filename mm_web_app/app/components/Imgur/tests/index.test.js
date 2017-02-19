import React from 'react';
import { shallow } from 'enzyme';

import Imgur from '../index';

describe('<Imgur />', () => {
  it('renders <Imgur>', () => {
    const renderedComponent = shallow(
      <Imgur />
    );
    expect(renderedComponent).toBeDefined();
  });
});
