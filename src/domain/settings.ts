import { Observable } from "../Observable";

export interface StoragePath {
    absolutePath: string
    /**
     * If this is not null, the storage directory changing is pending.
     * That means the user has just changed the storage path and the app is preparing that path.
     * (For instance, copying files to new storage from old storage.)
     * That time, all operation to the storage should fail and report an error to the user.
     */
    pendingAbsolutePath: string | null
}

export interface MenuBarRestriction {
    restricted: boolean
    maxCharacters: number
}

export interface AppSettings {
    getStoragePathSync(): StoragePath
    setStoragePath(absolutePath: string, needMigration: boolean): Promise<void>
    getMenuBarRestriction(): Promise<MenuBarRestriction>
    observeMenuBarRestriction(): Observable<MenuBarRestriction>
    setMenuBarRestriction(restriction: MenuBarRestriction): Promise<void>
}