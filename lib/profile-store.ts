import type { ApplicantProfile } from './gks-schema'

export const PROFILE_STORAGE_KEY = 'oh-my-scholarship-profile'
export const PROFILE_SCHEMA_VERSION = 1
export const PROFILE_PRIVACY_NOTE = '이 브라우저에 데이터가 로컬로 저장됩니다 (Milestone 1).'

type StoredApplicantProfile = Readonly<{
  _version: number
  profile: ApplicantProfile
}>

export interface ProfileStorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

const createEmptyProfile = (): ApplicantProfile => ({})

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const createMemoryStorage = (): ProfileStorageLike => {
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

const isStorageLike = (value: unknown): value is ProfileStorageLike =>
  isRecord(value) &&
  typeof value.getItem === 'function' &&
  typeof value.setItem === 'function' &&
  typeof value.removeItem === 'function'

const getDefaultStorage = (): ProfileStorageLike => {
  const storage = globalThis.localStorage as unknown

  return isStorageLike(storage) ? storage : createMemoryStorage()
}

export class ProfileStore {
  constructor(private readonly storage: ProfileStorageLike = getDefaultStorage()) {}

  save(profile: ApplicantProfile) {
    const payload: StoredApplicantProfile = {
      _version: PROFILE_SCHEMA_VERSION,
      profile,
    }

    this.storage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(payload))
  }

  load(): ApplicantProfile {
    const rawValue = this.storage.getItem(PROFILE_STORAGE_KEY)

    if (!rawValue) {
      return createEmptyProfile()
    }

    try {
      const parsedValue: unknown = JSON.parse(rawValue)

      if (!isRecord(parsedValue)) {
        return createEmptyProfile()
      }

      return this.loadFromStoredValue(parsedValue)
    } catch {
      return createEmptyProfile()
    }
  }

  reset() {
    this.storage.removeItem(PROFILE_STORAGE_KEY)
  }

  exportJSON(): string {
    const profile = this.load()

    return JSON.stringify(
      {
        _version: PROFILE_SCHEMA_VERSION,
        profile,
      } satisfies StoredApplicantProfile,
      null,
      2,
    )
  }

  getSchemaVersion() {
    return PROFILE_SCHEMA_VERSION
  }

  private loadFromStoredValue(storedValue: Record<string, unknown>): ApplicantProfile {
    const version = storedValue._version

    if (version !== PROFILE_SCHEMA_VERSION) {
      return this.migrateFromVersion(version, storedValue.profile)
    }

    if (!isRecord(storedValue.profile)) {
      return createEmptyProfile()
    }

    return storedValue.profile as ApplicantProfile
  }

  private migrateFromVersion(version: unknown, profile: unknown): ApplicantProfile {
    // Placeholder for future migrations. Milestone 1 only supports the current schema.
    if (version === PROFILE_SCHEMA_VERSION && isRecord(profile)) {
      return profile as ApplicantProfile
    }

    return createEmptyProfile()
  }
}
