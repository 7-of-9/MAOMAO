import React from 'react';
import { shallow } from 'enzyme';

import GraphKnowledge from '../index';

describe('<GraphKnowledge />', () => {
  it('renders <GraphKnowledge>', () => {
    const renderedComponent = shallow(
      <GraphKnowledge />
    );
    expect(renderedComponent).toBeDefined();
  });
});
