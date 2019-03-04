import electron = require("electron");

export const useCases = electron.remote.require('../../domain/useCases')
export const remoteDay = electron.remote.require('../../domain/day')
export const tray = electron.remote.require('./tray')
export const dialog: electron.Dialog = electron.remote.dialog
export const getCurrentWindow: () => electron.BrowserWindow = electron.remote.getCurrentWindow
export function relaunch() {
    electron.remote.app.relaunch()
    electron.remote.app.exit()
}