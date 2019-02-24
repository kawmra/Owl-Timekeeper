import { MenuBarRestriction, StoragePath, AppSettings } from "../../domain/settings";
import * as path from "path";
import { app } from "electron";
import fs = require('fs-extra');
import { Observable } from "../../Observable";
import { EventEmitter } from "events";

const FILE_PATH = path.join(app.getPath('userData'), 'settings.json')

const DEFAULT_SETTINGS_JSON: SettingsJson = {
    storagePath: {
        absolutePath: path.join(app.getPath('userData')),
        pendingAbsolutePath: null,
    },
    menuBarRestriction: {
        restricted: false,
        maxCharacters: 10
    }
}

const EVENT_ON_STORAGE_PATH_CHANGED = 'onStoragePathChanged'

interface SettingsJson {
    storagePath: StoragePath
    menuBarRestriction: MenuBarRestriction
}

export class AppSettingsImpl implements AppSettings {

    private emitter = new EventEmitter()
    private settingsFilePath: string
    // The file paths to be copied to new storage path.
    private dbFilePaths: string[]

    constructor(settingsFilePath?: string, dbFilePaths?: string[]) {
        this.settingsFilePath = settingsFilePath || FILE_PATH
        this.dbFilePaths = dbFilePaths || []
    }

    getStoragePathSync(): StoragePath {
        return this.getSettingsSync().storagePath
    }

    async setStoragePath(absolutePath: string, needMigration: boolean): Promise<void> {
        const settings = await this.loadJsonOrThrow().catch(() => DEFAULT_SETTINGS_JSON)
        const pending: StoragePath = {
            absolutePath: settings.storagePath.absolutePath,
            pendingAbsolutePath: absolutePath,
        }
        await this.saveJson({ ...settings, storagePath: pending })
        this.emitStoragePathChanged(pending)
        // TODO: Implements migration.
        // If the new absolute path already has db files,
        // it probably should confirm to the user to overwrite those files or not.
        const completed: StoragePath = {
            absolutePath,
            pendingAbsolutePath: null,
        }
        await this.saveJson({ ...settings, storagePath: completed })
        this.emitStoragePathChanged(completed)
    }

    getMenuBarRestriction(): Promise<MenuBarRestriction> {
        throw new Error("Method not implemented.");
    }

    observeMenuBarRestriction(): Observable<MenuBarRestriction> {
        throw new Error("Method not implemented.");
    }

    setMenuBarRestriction(restriction: MenuBarRestriction): Promise<void> {
        throw new Error("Method not implemented.");
    }

    private async loadJsonOrThrow(): Promise<SettingsJson> {
        return convertToSettings(await fs.readJson(this.settingsFilePath))
    }

    private async saveJson(settings: SettingsJson): Promise<void> {
        return fs.writeFile(this.settingsFilePath, JSON.stringify(settings))
    }

    private emitStoragePathChanged(storagePath: StoragePath) {
        this.emitter.emit(EVENT_ON_STORAGE_PATH_CHANGED, storagePath)
    }

    private getSettingsSync(): SettingsJson {
        try {
            return convertToSettings(fs.readJsonSync(FILE_PATH))
        } catch {
            return { ...DEFAULT_SETTINGS_JSON }
        }
    }
}

function convertToSettings(json: any): SettingsJson {
    console.log(`load: ${JSON.stringify(json)}`)
    if (!json.storagePath) throw new Error("The key `storagePath` is missing.")
    if (json.storagePath.absolutePath === undefined || json.storagePath.absolutePath === null)
        throw new Error("The key `storagePath.absolutePath` is migging.")
    if (json.storagePath.pendingAbsolutePath === undefined)
        throw new Error("The key `storagePath.pendingAbsolutePath` is missing.")
    if (!json.menuBarRestriction) throw new Error("The key `menuBarRestriction` is missing.")
    if (json.menuBarRestriction.restricted === undefined)
        throw new Error("The key `menuBarRestriction.restricted` is missing.")
    if (json.menuBarRestriction.maxCharacters === undefined)
        throw new Error("The key `menuBarRestriction.maxCharacters` is missing.")
    return {
        storagePath: {
            absolutePath: json.storagePath.absolutePath,
            pendingAbsolutePath: json.storagePath.pendingAbsolutePath
        },
        menuBarRestriction: {
            restricted: false,
            maxCharacters: 2
        }
    }
}
