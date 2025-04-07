import { FC, useState } from "react";
import SettingsIcon from "@mui/icons-material/Settings";
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import "./Todo.css";
import { Button } from "@mui/material";
import CheckboxList from "./CheckboxList";

interface Task {
    isCompleted: boolean;
    name: string;
}

const Todo: FC = () => {
    const [list, setList] = useState<Task[]>([]);

    return (
        <div className="todo">
            {/* header */}
            <header>
                <h2>My tasks</h2>
                <span title="Block distracting sites while working.">
                    <SettingsIcon className="icon" color="primary" />
                </span>
            </header>

            {/* Add task */}
            <Button
                variant="outlined"
                size="small"
                startIcon={<AddCircleOutlineRoundedIcon />}
                fullWidth
                className="addTaskBtn"
            >
                Add task
            </Button>

            {/* display list */}
            <CheckboxList />
        </div>
    );
};

export default Todo;
