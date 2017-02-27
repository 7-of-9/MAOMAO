import React from 'react';
import { shallow } from 'enzyme';

import GoogleResult from '../index';

describe('<GoogleResult />', () => {
  it('renders <GoogleResult>', () => {
    const renderedComponent = shallow(
      <GoogleResult />
    );
    expect(renderedComponent).toBeDefined();
  });
});
