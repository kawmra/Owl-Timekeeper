import { Tray, nativeImage, Menu, MenuItem } from "electron"
import * as path from "path"
import { Task } from "./task"
import { setActiveTask, getActiveTask, addTimeRecord, clearActiveTask, getTimeRecords, getTasks } from "./useCases";

let tray: Tray = null

export function createTray() {
    if (tray != null) {
        return
    }
    const icon = nativeImage.createFromPath(path.join(__dirname, "../res/starTemplate.png"))
    tray = new Tray(icon)
    tray.setToolTip('This is my application.')
    updateMenu()
}

function mapToMenuItem(task: Task): Electron.MenuItemConstructorOptions {
    return {
        label: task.name,
        type: 'radio',
        checked: false,
    }
}

async function switchTask(task: Task | null) {
    const now = new Date().getTime()
    const oldActiveTask = await getActiveTask()
    if (oldActiveTask != null) {
        await addTimeRecord(oldActiveTask.task, oldActiveTask.startTime, now)
        console.log(`Saved TimeRecord of ${oldActiveTask.task.name}`)
    }
    if (task == null) {
        await clearActiveTask()
        console.log('Cleared activeTask')
    } else {
        await setActiveTask(task)
        console.log(`Switch task to ${task ? task.name : 'none'}!`)
    }
}

export function createMenu(tasks: Array<Task>): Menu {
    let template: Electron.MenuItemConstructorOptions[] = tasks.map((task) => {
        return {
            ...mapToMenuItem(task),
            click: () => switchTask(task)
        }
    })
    template = template.concat([
        { label: 'none', type: 'radio', checked: true, click: () => switchTask(null) },
        { type: 'separator' },
        { label: 'Show records', click: () => { getTimeRecords().then(records => console.log(records)) } },
        { type: 'separator' },
        { label: 'Quit', role: 'quit' }
    ])
    return Menu.buildFromTemplate(template)
}

export function updateMenu() {
    if (tray == null) {
        return
    }
    getTasks().then(tasks => {
        tray.setContextMenu(createMenu(tasks))
    })
}