import React = require('react');
import { Task } from '../../../domain/task';

interface Props {
    task: Task
    onEdit: (newTask: Task) => void
    onDelete: (task: Task) => void
}

interface State {
    editMode: boolean
    editingTaskName: string
}

export class TaskView extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props)
        this.state = {
            editMode: false,
            editingTaskName: props.task.name
        }
    }

    renderEditor() {
        return (
            <div className="content">
                <div className="ui small fluid action input">
                    <input type="text" placeholder={this.props.task.name} onChange={(e) => this.setState({ editingTaskName: e.target.value })} value={this.state.editingTaskName} />
                    <button className="ui teal button" onClick={() => { this.props.onEdit({ ...this.props.task, name: this.state.editingTaskName }); this.setState({ editMode: false }) }}>Complete</button>
                    <button className="ui icon button" onClick={() => this.setState({ editMode: false, editingTaskName: this.props.task.name })}>
                        <i className="close icon"></i>
                    </button>
                </div>
            </div>
        )
    }

    renderNormal() {
        return (
            <div className="aligned content">
                {this.props.task.name}
                <div className="right floated item">
                    <i className="edit link icon" onClick={() => this.setState({ editMode: true })} />
                    <i className="trash link icon" onClick={() => this.props.onDelete(this.props.task)} />
                </div>
            </div>
        )
    }

    render() {
        return (
            <div className="item">
                {
                    this.state.editMode
                        ? this.renderEditor.call(this)
                        : this.renderNormal.call(this)
                }
            </div>
        )
    }
}
