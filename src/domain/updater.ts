import { SemVer } from 'semver'

export interface UpdateChecker {
    getLatestRelease(): Promise<Release | null>
}

export interface Release {
    version: SemVer
    url: string
}

export interface Update {
    canUpdate: boolean
    release: Release
}
