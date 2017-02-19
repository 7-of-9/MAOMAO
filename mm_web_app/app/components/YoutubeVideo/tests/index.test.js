import React from 'react';
import { shallow } from 'enzyme';

import YoutubeVideo from '../index';

describe('<YoutubeVideo />', () => {
  it('renders <YoutubeVideo>', () => {
    const renderedComponent = shallow(
      <YoutubeVideo />
    );
    expect(renderedComponent).toBeDefined();
  });
});
