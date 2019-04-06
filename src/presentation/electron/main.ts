import { app, BrowserWindow, Menu, MenuItemConstructorOptions, Notification, shell } from "electron"
import * as path from "path"
import { createTray } from "./tray"
import { isDockIconVisible, checkForUpdate } from "../../domain/useCases";
import { Release } from './../../domain/updater';

const INTERVAL_CHECK_FOR_UPDATE_MS = 1000 * 60 * 60 * 2 // 2 hours

let mainWindow: Electron.BrowserWindow
let currentDockVisibility: boolean = undefined
let lastTimeCheckedForUpdate: number = 0
let lastNotification: Notification | undefined = undefined

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        height: 400,
        width: 560,
    })

    // and load the index.html of the app.
    mainWindow.loadFile(path.join(__dirname, "../../../index.html"))

    // Emitted when the window is closed.
    mainWindow.on("closed", () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
        updateDockIconVisibility()
    })

    updateDockIconVisibility()
}

function createApplicationMenu() {
    const template: MenuItemConstructorOptions[] = [
        {
            label: app.getName(),
            submenu: [
                { role: 'about' },
                {
                    type: 'normal',
                    label: 'Check For Updates…',
                    click: () => { checkForUpdateIfNeeded(true) }
                },
                { type: 'separator' },
                { role: 'hide' },
                { role: 'hideOthers' },
                { role: 'unhide' },
                { type: 'separator' },
                { role: 'quit' }
            ]
        },
        { role: 'editMenu' },
        { role: 'windowMenu' },
    ]
    if (!app.isPackaged) {
        template.push({
            label: 'Debug',
            submenu: [
                { role: 'toggleDevTools' }
            ]
        })
    }
    Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

function shouldCheckForUpdate() {
    return new Date().getTime() >= lastTimeCheckedForUpdate + INTERVAL_CHECK_FOR_UPDATE_MS
}

async function checkForUpdateIfNeeded(forced: boolean = false) {
    if (forced || shouldCheckForUpdate()) {
        const updates = await checkForUpdate()
        if (updates && updates.canUpdate) {
            notifyUpdateFound(updates.release)
        }
        lastTimeCheckedForUpdate = new Date().getTime()
    }
}

function notifyUpdateFound(release: Release) {
    if (lastNotification) {
        lastNotification.close()
    }
    const notification = new Notification({
        title: 'Update found',
        body: 'The new Owl Timekeeper is released!'
    })
    notification.on('click', () => {
        shell.openExternal(release.url)
    })
    notification.show()
    lastNotification = notification
}

function ready() {
    createWindow()
    createTray()
    createApplicationMenu()
    checkForUpdateIfNeeded()
}

async function updateDockIconVisibility() {
    const shouldDockIconShow = mainWindow !== null || await isDockIconVisible()
    if (currentDockVisibility === undefined
        || shouldDockIconShow !== currentDockVisibility) {
        shouldDockIconShow
            ? app.dock.show()
            : app.dock.hide()
    }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", ready)

// Quit when all windows are closed.
app.on("window-all-closed", () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== "darwin") {
        app.quit()
    }
})

app.on("activate", () => {
    // On OS X it"s common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
})

export function focusMainWindow() {
    if (mainWindow === null) {
        createWindow()
    } else {
        mainWindow.focus()
    }
    checkForUpdateIfNeeded()
}
