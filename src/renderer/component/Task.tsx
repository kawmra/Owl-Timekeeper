import React = require("react");
import { Task } from "../../task";

interface Props {
  task: Task
}

export const TaskItem = (props: Props) => {
  return (
    <li>{props.task.name}</li>
  )
}