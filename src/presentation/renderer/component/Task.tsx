import React = require('react');
import { Task } from '../../../domain/task';
import { useCases, tray, dialog } from '../remote';
import { ERROR_TASK_ALREADY_EXISTS } from '../../../data/task/DbTaskRepository';
import { TaskItem } from './TaskItem';

interface Props { }

interface State {
  tempTaskName: string,
  tasks: Task[]
}

export class Tasks extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      tempTaskName: '',
      tasks: [],
    };
  }

  componentDidMount() {
    this.refreshTasks()
  }

  refreshTasks() {
    useCases.getTasks().then((tasks: Task[]) => {
      this.setState({ tasks })
    })
  }

  handleDeleteTask(target: Task) {
    dialog.showMessageBox({
      message: `Are you sure you want to delete the task \`${target.name}\`?\n\nYou will not be able to undo this action.`,
      buttons: ['Yes, Delete', 'No'],
      cancelId: 1,
    }, response => {
      if (response === 0) {
        useCases.deleteTask(target.id).then(() => {
          this.refreshTasks()
          tray.update()
        })
      }
    })
  }

  handleEditTask(target: Task) {
    useCases.updateTaskName(target.id, target.name).then(() => {
      this.refreshTasks()
      tray.update()
    })
  }

  handleAddTask(element: HTMLElement) {
    this.setState({ tempTaskName: '' })
    useCases.createTask(this.state.tempTaskName)
      .then(() => {
        tray.update()
        this.refreshTasks()
      })
      .catch((err: any) => {
        if (err === ERROR_TASK_ALREADY_EXISTS) {
          dialog.showMessageBox({ message: `The task '${this.state.tempTaskName}' aready exists.` })
        } else {
          dialog.showMessageBox({ message: `Failed to add a task because: ${err}` })
        }
      })
  }

  render() {
    return (
      <div>
        <div className="ui fluid action input">
          <input
            type="text"
            value={this.state.tempTaskName}
            placeholder="Task Name"
            onChange={(element) => { this.setState({ tempTaskName: element.target.value }) }} />
          <button className="ui blue button" onClick={this.handleAddTask.bind(this)}>Add Task</button>
        </div>
        <div className="ui divided items">
          {
            this.state.tasks.map((task: Task) => {
              return (
                <TaskItem
                  key={task.id}
                  task={task}
                  onEdit={this.handleEditTask.bind(this)}
                  onDelete={this.handleDeleteTask.bind(this)} />
              )
            })
          }
        </div>
      </div>
    );
  }
}