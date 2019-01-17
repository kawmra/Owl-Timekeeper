import { Tray, nativeImage, Menu, dialog, MenuItem } from "electron"
import * as path from "path"
import { Task, ActiveTask } from "../../domain/task"
import { setActiveTask, getActiveTask, addTimeRecord, clearActiveTask, getTasks, getTimeRecords } from "../../domain/useCases";
import { TimeRecord } from "../../domain/timeRecord";
import { currentDay } from "../../domain/day";

let tray: Tray = null

export function createTray() {
    if (tray != null) {
        return
    }
    const icon = nativeImage.createFromPath(path.join(__dirname, "../../../res/starTemplate.png"))
    tray = new Tray(icon)
    tray.setToolTip('This is my application.')
    update()
}

function mapToMenuItem(task: Task): Electron.MenuItemConstructorOptions {
    return {
        label: task.name,
        type: 'checkbox',
    }
}

async function switchTask(task: Task) {
    const now = new Date().getTime()
    const oldActiveTask = await getActiveTask()
    if (oldActiveTask !== null) {
        await addTimeRecord(oldActiveTask.task, oldActiveTask.startTime, now)
        console.log(`Saved TimeRecord of ${oldActiveTask.task.name}`)
    }
    if (oldActiveTask !== null && oldActiveTask.task.name === task.name) {
        await clearActiveTask()
        console.log('Cleared activeTask')
    } else {
        await setActiveTask(task)
        console.log(`Switch task to ${task ? task.name : 'none'}!`)
    }
    update()
}

export function createMenu(tasks: Array<Task>, activeTask: ActiveTask = null): Menu {
    var foundActiveTask = false
    const taskItems: Electron.MenuItemConstructorOptions[] = tasks.map(task => {
        const checked = activeTask !== null && task.name === activeTask.task.name
        if (checked) foundActiveTask = true
        return {
            ...mapToMenuItem(task),
            checked,
            click: () => switchTask(task)
        }
    })
    let template: Electron.MenuItemConstructorOptions[] = []
    if (foundActiveTask) {
        template.push({
            type: 'normal',
            label: millisToString(new Date().getTime() - activeTask.startTime),
            enabled: false
        })
        template.push({
            type: 'separator'
        })
    }
    template.push({
        type: 'normal',
        label: 'Tasks',
        enabled: false
    })
    template.push(...taskItems)
    template = template.concat([
        { type: 'separator' },
        { label: 'Show Records', click: () => { getTimeRecords(currentDay()).then(records => showTimeRecords(records)) } },
        { type: 'separator' },
        { label: 'Quit', role: 'quit' }
    ])
    return Menu.buildFromTemplate(template)
}

export async function update() {
    if (tray == null) {
        return
    }
    console.log('update!')
    const tasks = await getTasks()
    const activeTask = await getActiveTask()
    const menu = createMenu(tasks, activeTask)
    tray.setTitle(activeTask ? activeTask.task.name : '')
    tray.setContextMenu(menu)
}

function showTimeRecords(records: TimeRecord[]) {
    dialog.showMessageBox({ message: records.map(r => `${r.task.name}\t${stringify(r)}`).join('\n') })
}

function stringify(record: TimeRecord): string {
    return millisToString(record.endTime - record.startTime)
}

function millisToString(millis: number): string {
    const seconds = millis / 1000
    const h = Math.floor(seconds / 3600)
    const m = Math.floor(seconds % 3600 / 60)
    const s = Math.floor(seconds % 60)
    var str = ""
    if (h !== 0) str += `${h}h `
    if (m !== 0) str += `${m}m `
    if (s !== 0) str += `${s}s `
    return str
}
