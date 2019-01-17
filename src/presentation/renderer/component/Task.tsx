import React = require('react');
import { Task } from '../../../domain/task';
import { useCases, tray, dialog } from '../remote';
import { ERROR_TASK_ALREADY_EXISTS } from '../../../data/task/DbTaskRepository';

interface Props { }

interface State {
  tempTaskName: string,
  tasks: Task[]
}

export const TaskItem = (props: { task: Task }) => {
  return (
    <li>{props.task.name}</li>
  )
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
        <label>Task Name: <input type="text" value={this.state.tempTaskName} onChange={(element) => { this.setState({ tempTaskName: element.target.value }) }} /></label>
        <button onClick={this.handleAddTask.bind(this)}>Add Task</button>
        <ul>
          {
            this.state.tasks.map((task: Task) => {
              return (
                <TaskItem key={task.name} task={task} />
              )
            })
          }
        </ul>
      </div>
    );
  }
}