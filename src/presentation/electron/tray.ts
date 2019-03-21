import { MenuBarRestriction } from './../../domain/settings';
import { Tray, nativeImage, Menu, dialog } from "electron"
import * as path from "path"
import { Task, ActiveTask, compareTask } from "../../domain/task"
import { setActiveTask, getActiveTask, addTimeRecord, clearActiveTask, getTasks, getTimeRecords, existsTask, observeTasks, observeActiveTask, observeMenuBarRestriction } from "../../domain/useCases";
import { TimeRecord } from "../../domain/timeRecord";
import { focusMainWindow } from './main';

let tray: Tray = null
let restriction: MenuBarRestriction | undefined

export function createTray() {
    if (tray != null) {
        return
    }
    const icon = nativeImage.createFromPath(path.join(__dirname, "../../../res/trayTemplate.png"))
    tray = new Tray(icon)
    tray.setToolTip('This is my application.')
    observeTasks(tasks => {
        updateWithTasks(tasks)
    })
    observeActiveTask(activeTask => {
        updateWithActiveTask(activeTask)
    })
    observeMenuBarRestriction(_restriction => {
        restriction = _restriction
        updateWith()
    })
}

function mapToMenuItem(task: Task): Electron.MenuItemConstructorOptions {
    return {
        label: task.name,
        type: 'checkbox',
    }
}

async function switchTask(task: Task | null) {
    const oldActiveTask = await getActiveTask()
    if (oldActiveTask !== null && await existsTask(oldActiveTask.task.id)) {
        // No need to `addTimeRecord` if oldActiveTask already deleted,
        // because it makes no sense to record time for that task
        const now = new Date().getTime()
        await addTimeRecord(oldActiveTask.task, oldActiveTask.startTime, now)
        console.log(`Saved TimeRecord of ${oldActiveTask.task.name}`)
    }
    let newActiveTask = null
    if (task === null || (oldActiveTask !== null && oldActiveTask.task.id === task.id)) {
        await clearActiveTask()
        console.log('Cleared activeTask')
    } else {
        newActiveTask = await setActiveTask(task)
        console.log(`Switch task to '${task.name} (${task.id})'`)
    }
    updateWithActiveTask(newActiveTask)
}

export function createMenu(tasks: Array<Task>, activeTask: ActiveTask = null): Menu {
    const taskItems: Electron.MenuItemConstructorOptions[] = tasks.map(task => {
        const checked = activeTask !== null && task.id === activeTask.task.id
        return {
            ...mapToMenuItem(task),
            checked,
            click: () => { switchTask(task) }
        }
    })
    let template: Electron.MenuItemConstructorOptions[] = []
    if (activeTask !== null) {
        template = template.concat([
            {
                type: 'normal',
                label: 'Stop Recording',
                click: () => { switchTask(null) }
            },
            {
                type: 'separator'
            }
        ])
    }
    template.push({
        type: 'normal',
        label: 'Tasks',
        enabled: false
    })
    template.push(...taskItems)
    template = template.concat([
        { type: 'separator' },
        { label: 'Open Main Window…', click: () => { focusMainWindow() } },
        { type: 'separator' },
        { label: 'Quit', role: 'quit' }
    ])
    return Menu.buildFromTemplate(template)
}

async function updateWithTasks(_tasks: Task[]) {
    updateWith(_tasks, undefined)
}

async function updateWithActiveTask(_activeTask: ActiveTask | null) {
    updateWith(undefined, _activeTask)
}

async function updateWith(_tasks?: Task[], _activeTask?: ActiveTask | null) {
    if (tray === null) {
        return
    }
    const tasks = _tasks || await getTasks()
    tasks.sort(compareTask)
    const activeTask = _activeTask || await getActiveTask()
    const menu = createMenu(tasks, activeTask)
    const activeTaskExists = activeTask && await existsTask(activeTask.task.id)
    const title = activeTaskExists
        ? restriction && restriction.restricted
            ? restrictedTitle(activeTask.task.name, restriction.maxCharacters)
            : activeTask.task.name
        : ''
    tray.setTitle(title)
    tray.setToolTip(activeTaskExists ? activeTask.task.name : 'Owl Timekeeper')
    tray.setContextMenu(menu)
}

function restrictedTitle(title: string, maxCharacters: number) {
    if (maxCharacters <= 0) { return '' }
    if (maxCharacters >= title.length) { return title }
    return title.substring(0, maxCharacters) + '…'
}
