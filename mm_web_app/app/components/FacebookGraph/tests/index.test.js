import React from 'react';
import { shallow } from 'enzyme';

import FacebookGraph from '../index';

describe('<FacebookGraph />', () => {
  it('renders <FacebookGraph>', () => {
    const renderedComponent = shallow(
      <FacebookGraph />
    );
    expect(renderedComponent).toBeDefined();
  });
});
