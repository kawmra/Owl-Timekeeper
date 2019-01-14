import { Tray, nativeImage, Menu, dialog } from "electron"
import * as path from "path"
import { Task } from "./task"
import { setActiveTask, getActiveTask, addTimeRecord, clearActiveTask, getTasks, getTimeRecords } from "./useCases";
import { TimeRecord } from "./timeRecord";
import { currentDay } from "./day";

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

export function createMenu(tasks: Array<Task>, activeTaskName: String = undefined): Menu {
    var foundActiveTask = false
    let template: Electron.MenuItemConstructorOptions[] = tasks.map(task => {
        const checked = activeTaskName !== undefined && task.name === activeTaskName
        if (checked) foundActiveTask = true
        return {
            ...mapToMenuItem(task),
            checked,
            click: () => switchTask(task)
        }
    })
    template = template.concat([
        { label: 'none', type: 'radio', checked: !foundActiveTask, click: () => switchTask(null) },
        { type: 'separator' },
        { label: 'Show records', click: () => { getTimeRecords(currentDay()).then(records => showTimeRecords(records)) } },
        { type: 'separator' },
        { label: 'Quit', role: 'quit' }
    ])
    return Menu.buildFromTemplate(template)
}

export function updateMenu() {
    if (tray == null) {
        return
    }
    async function temp() {
        const tasks = await getTasks()
        const activeTask = await getActiveTask()
        return { tasks, activeTask }
    }
    temp().then(temp => {
        const activeTaskName = temp.activeTask && temp.activeTask.task.name
        console.log(`activeTaskName: ${activeTaskName}`)
        tray.setContextMenu(createMenu(temp.tasks, activeTaskName))
    })
}

function showTimeRecords(records: TimeRecord[]) {
    dialog.showMessageBox({ message: records.map(r => `${r.taskName}\t${stringify(r)}`).join('\n') })
}

function stringify(record: TimeRecord): string {
    const seconds = (record.endTime - record.startTime) / 1000
    const h = Math.floor(seconds / 3600)
    const m = Math.floor(seconds % 3600 / 60)
    const s = Math.floor(seconds % 60)
    var str = ""
    if (h !== 0) str += `${h}h `
    if (m !== 0) str += `${m}m `
    if (s !== 0) str += `${s}s`
    return str
}
