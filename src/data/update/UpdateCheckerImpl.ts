import { UpdateChecker, Release } from './../../domain/updater';
import * as semver from 'semver'
import fetch from 'node-fetch'

const RELEASES_URL = 'https://api.github.com/repos/kawmra/Owl-Timekeeper/releases/latest'

export class UpdateCheckerImpl implements UpdateChecker {
    async getLatestRelease(): Promise<Release | null> {
        const json: any | null = await this.fetchJson()
        if (json === null) { return null }
        console.log(json)
        const url = json.html_url
        const latestVer = semver.clean(json.tag_name)
        if (!url || !latestVer) {
            return null
        }
        return {
            version: semver.parse(latestVer),
            url
        }
    }

    private async fetchJson(): Promise<any | null> {
        const response = await fetch(RELEASES_URL).catch(null)
        if (response === null) { return null }
        return await response.json()
    }
}