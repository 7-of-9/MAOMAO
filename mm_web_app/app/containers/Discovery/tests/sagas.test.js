/**
 * Test  sagas
 */

/* eslint-disable redux-saga/yield-effects */
import { cancel, take, put, takeLatest } from 'redux-saga/effects';
import { createMockTask } from 'redux-saga/lib/utils';
import { LOCATION_CHANGE } from 'react-router-redux';

import { googleLoaded, googleLoadingError } from 'containers/App/actions';
import { GOOGLE_SEARCH } from 'containers/App/constants';

import { getGoogleKnowledge, googleData } from '../sagas';

const terms = 'taylor swift';

describe('getGoogleKnowledge Saga', () => {
  let getGoogleKnowledgeGenerator;
  beforeEach(() => {
    getGoogleKnowledgeGenerator = getGoogleKnowledge();

    const selectDescriptor = getGoogleKnowledgeGenerator.next().value;
    expect(selectDescriptor).toMatchSnapshot();

    const callDescriptor = getGoogleKnowledgeGenerator.next(terms).value;
    expect(callDescriptor).toMatchSnapshot();
  });

  it('should dispatch the googleLoaded action if it requests the data successfully', () => {
    const response = {
      '@context': {
        '@vocab': 'http://schema.org/',
        goog: 'http://schema.googleapis.com/',
        resultScore: 'goog:resultScore',
        detailedDescription: 'goog:detailedDescription',
        EntitySearchResult: 'goog:EntitySearchResult',
        kg: 'http://g.co/kg',
      },
      '@type': 'ItemList',
      itemListElement: [
        {
          '@type': 'EntitySearchResult',
          result: {
            '@id': 'kg:/m/0dl567',
            name: 'Taylor Swift',
            '@type': [
              'Thing',
              'Person',
            ],
            description: 'Singer-songwriter',
            image: {
              contentUrl: 'https://t1.gstatic.com/images?q=tbn:ANd9GcQmVDAhjhWnN2OWys2ZMO3PGAhupp5tN2LwF_BJmiHgi19hf8Ku',
              url: 'https://en.wikipedia.org/wiki/Taylor_Swift',
              license: 'http://creativecommons.org/licenses/by-sa/2.0',
            },
            detailedDescription: {
              articleBody: 'Taylor Alison Swift is an American singer-songwriter and actress. Raised in Wyomissing, Pennsylvania, she moved to Nashville, Tennessee, at the age of 14 to pursue a career in country music. ',
              url: 'http://en.wikipedia.org/wiki/Taylor_Swift',
              license: 'https://en.wikipedia.org/wiki/Wikipedia:Text_of_Creative_Commons_Attribution-ShareAlike_3.0_Unported_License',
            },
            url: 'http://taylorswift.com/',
          },
          resultScore: 896.576599,
        },
      ],
    };
    const putDescriptor = getGoogleKnowledgeGenerator.next(response).value;
    expect(putDescriptor).toEqual(put(googleLoaded(response, terms)));
  });

  it('should call the googleLoadingError action if the response errors', () => {
    const response = new Error('Some error');
    const putDescriptor = getGoogleKnowledgeGenerator.throw(response).value;
    expect(putDescriptor).toEqual(put(googleLoadingError(response)));
  });
});

describe('googleData Saga', () => {
  const googleDataSaga = googleData();
  const mockedTask = createMockTask();

  it('should start task to watch for GOOGLE_SEARCH action', () => {
    const takeLatestDescriptor = googleDataSaga.next().value;
    expect(takeLatestDescriptor).toEqual(takeLatest(GOOGLE_SEARCH, getGoogleKnowledge));
  });

  it('should yield until LOCATION_CHANGE action', () => {
    const takeDescriptor = googleDataSaga.next(mockedTask).value;
    expect(takeDescriptor).toEqual(take(LOCATION_CHANGE));
  });

  it('should cancel the forked task when LOCATION_CHANGE happens', () => {
    const cancelDescriptor = googleDataSaga.next().value;
    expect(cancelDescriptor).toEqual(cancel(mockedTask));
  });
});
