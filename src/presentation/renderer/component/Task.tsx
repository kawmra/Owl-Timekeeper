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
    <div className="item">
      <div className="aligned content">
        {props.task.name}
        <div className="right floated item">
          <i className="edit link icon"></i>
          <i className="trash link icon"></i>
        </div>
      </div>
    </div>
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
        <div className="ui fluid action input">
          <input
            type="text"
            value={this.state.tempTaskName}
            placeholder="Task Name"
            onChange={(element) => { this.setState({ tempTaskName: element.target.value }) }} />
          <button onClick={this.handleAddTask.bind(this)} className="ui button">Add Task</button>
        </div>
        <div className="ui divided items">
          {
            this.state.tasks.map((task: Task) => {
              return (
                <TaskItem key={task.name} task={task} />
              )
            })
          }
        </div>
      </div>
    );
  }
}