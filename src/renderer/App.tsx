import React = require("react");
import { Tasks } from "./component/Task";
import { TimeRecords } from "./component/TimeRecord";
import { currentDay } from "../day";

interface Props { }
interface State { }

export class App extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props)
        this.state = {}
    }

    render() {
        return (
            <div>
                <Tasks />
                <TimeRecords day={currentDay()} />
            </div>
        )
    }
}