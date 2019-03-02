import React = require('react');
import { Task } from '../../../../domain/task';

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

    handleOnEditClick() {
        this.props.onEdit({
            ...this.props.task,
            name: this.state.editingTaskName
        });
        this.setState({ editMode: false })
    }

    handleOnCancelClick() {
        this.setState({
            editMode: false,
            editingTaskName: this.props.task.name
        })
    }

    handleOnKeyPress(e: React.KeyboardEvent<HTMLInputElement>) {
        // Handling 'Enter' with onKeyPress because onKeyDown will be fired on deciding Kanji characters too.
        switch (e.key) {
            case 'Enter':
                this.handleOnEditClick()
                break
        }
    }

    handleOnKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        // Handling 'Escape' with onKeyDown because onKeyPress doesn't report 'Escape' key event.
        switch (e.key) {
            case 'Escape':
                this.handleOnCancelClick()
                break
        }
    }

    renderEditor() {
        return (
            <div className="ui small fluid action input">
                <input
                    type="text"
                    placeholder={this.props.task.name}
                    onChange={(e) => this.setState({ editingTaskName: e.target.value })}
                    onKeyPress={this.handleOnKeyPress.bind(this)}
                    onKeyDown={this.handleOnKeyDown.bind(this)}
                    value={this.state.editingTaskName}
                    autoFocus={true}
                />
                <button className="ui teal button" onClick={this.handleOnEditClick.bind(this)}>
                    Save
                </button>
                <button className="ui icon button" onClick={this.handleOnCancelClick.bind(this)}>
                    <i className="close icon"></i>
                </button>
            </div>
        )
    }

    renderNormal() {
        return (
            <div>
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
