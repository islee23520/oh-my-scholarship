import { describe, expect, it } from 'vitest'

import {
  PROFILE_PRIVACY_NOTE,
  PROFILE_SCHEMA_VERSION,
  PROFILE_STORAGE_KEY,
  ProfileStore,
  type ProfileStorageLike,
} from './profile-store'

const createStorageMock = (): ProfileStorageLike => {
  const values = new Map<string, string>()

  return {
    getItem(key) {
      return values.get(key) ?? null
    },
    setItem(key, value) {
      values.set(key, value)
    },
    removeItem(key) {
      values.delete(key)
    },
  }
}

describe('ProfileStore', () => {
  it('saves and loads the same profile data', () => {
    const storage = createStorageMock()
    const store = new ProfileStore(storage)
    const profile = {
      applicationTrack: 'embassy' as const,
      fullNameEnglish: {
        familyName: 'TEST',
        givenName: 'USER',
      },
      email: 'test@example.com',
    }

    store.save(profile)

    expect(store.load()).toEqual(profile)
  })

  it('removes the stored profile on reset', () => {
    const storage = createStorageMock()
    const store = new ProfileStore(storage)

    store.save({ phone: '010-0000-0000' })
    expect(store.load()).toEqual({ phone: '010-0000-0000' })

    store.reset()

    expect(store.load()).toEqual({})
  })

  it('returns an empty profile when stored JSON is corrupted', () => {
    const storage = createStorageMock()
    storage.setItem(PROFILE_STORAGE_KEY, '{not valid json')

    const store = new ProfileStore(storage)

    expect(store.load()).toEqual({})

    expect(() => store.exportJSON()).not.toThrow()
    expect(store.exportJSON()).toContain(`"_version": ${PROFILE_SCHEMA_VERSION}`)
  })

  it('preserves the schema version across save and export', () => {
    const store = new ProfileStore(createStorageMock())

    store.save({ dateOfBirth: '2000-01-01' })

    expect(store.getSchemaVersion()).toBe(PROFILE_SCHEMA_VERSION)
    expect(JSON.parse(store.exportJSON())).toEqual({
      _version: PROFILE_SCHEMA_VERSION,
      profile: { dateOfBirth: '2000-01-01' },
    })
  })

  it('keeps the privacy note text available for the UI', () => {
    expect(PROFILE_PRIVACY_NOTE).toBe('이 브라우저에 데이터가 로컬로 저장됩니다 (Milestone 1).')
  })
})
