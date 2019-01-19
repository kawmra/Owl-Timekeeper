import React = require("react");
import { Tasks } from "./Task";
import { TimeRecords } from "./TimeRecord";
import { Day } from "../../../domain/day";

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
                <TimeRecords day={Day.today()} />
            </div>
        )
    }
}