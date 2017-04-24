/* global it, expect, describe */

import { CoreStore } from '../stores/core'

describe('CoreStore', () => {
  it('is false when init new core store', () => {
    const store = new CoreStore()
    expect(store.isLogin).toBe(false)
  })
})
