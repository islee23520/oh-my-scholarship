import { createStore } from 'zustand/vanilla'

import type { ApplicantProfile } from './gks-schema'

export const PROFILE_SCHEMA_VERSION = 1
export const PROFILE_PRIVACY_NOTE = 'Your data stays only in memory for this browser tab. Refreshing will start a new session.'

const createEmptyProfile = (): ApplicantProfile => ({})

type ProfileState = {
  profile: ApplicantProfile
}

const profileStateStore = createStore<ProfileState>(() => ({
  profile: createEmptyProfile(),
}))

export class ProfileStore {
  save(profile: ApplicantProfile) {
    profileStateStore.setState({ profile })
  }

  load(): ApplicantProfile {
    return profileStateStore.getState().profile
  }

  reset() {
    profileStateStore.setState({ profile: createEmptyProfile() })
  }

  exportJSON(): string {
    return JSON.stringify(
      {
        _version: PROFILE_SCHEMA_VERSION,
        profile: this.load(),
      },
      null,
      2,
    )
  }

  getSchemaVersion() {
    return PROFILE_SCHEMA_VERSION
  }
}
