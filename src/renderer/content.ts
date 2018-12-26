console.log('this is a content script')

const useCases = require('electron').remote.require('./useCases')
const tray = require('electron').remote.require('./tray')

const taskNameInput = <HTMLInputElement>document.getElementById('task_name')
document.getElementById('add_task').addEventListener('click', () => {
    useCases.createTask(taskNameInput.value)
    tray.updateMenu()
})
