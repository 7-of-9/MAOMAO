import React from 'react';
import { shallow, mount } from 'enzyme';
import { Provider } from 'react-redux';

import LanguageProvider from 'containers/LanguageProvider';
import SearchBar from '../index';
import configureStore from '../../../store';
import { translationMessages } from '../../../i18n';

const initialState = {};
const store = configureStore(initialState);


describe('<SearchBar />', () => {
  it('renders <SearchBar>', () => {
    const renderedComponent = shallow(
      <Provider store={store}>
        <LanguageProvider>
          <SearchBar />
        </LanguageProvider>
      </Provider>
    );
    expect(renderedComponent).toBeDefined();
  });

  it('handles clicks', () => {
    const onClickSpy = jest.fn();
    const onChangeSpy = jest.fn();
    const renderedComponent = mount(
      <Provider store={store}>
        <LanguageProvider messages={translationMessages}>
          <SearchBar onSearch={onClickSpy} onChange={onChangeSpy} />
        </LanguageProvider>
      </Provider>
    );
    renderedComponent.find('button').simulate('click');
    expect(onClickSpy).toHaveBeenCalled();
  });
});
