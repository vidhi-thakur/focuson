import { FC, useState } from "react";
import SettingsIcon from "@mui/icons-material/Settings";
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import "./Todo.css";
import { Button } from "@mui/material";
import NavigateNextTwoToneIcon from "@mui/icons-material/NavigateNextTwoTone";


interface Task {
    isCompleted: boolean,
    name: string,
    id: number
}

const Todo: FC = () => {
    const [list, setList] = useState<Task[]>([]);
    const [isCardOpen, setIsCardOpen] = useState<boolean>(false);

    const handleCardOpen = (): void => {
        setIsCardOpen(true);
    }

    const handleCardClose = (): void => {
        setIsCardOpen(false);
    }
    const handleCardSubmit = (): void => {
        setList(l => [...l, {
            id: l.length,
            name: "dummy",
            isCompleted: false
        }]);
        // setIsCardOpen(false);
    }

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
                onClick={handleCardSubmit}
            >
                Add task
            </Button>


            {/* display list */}
            <section>
                <ul>
                    {list.map(({ name, id, isCompleted }) => {
                        return <li>
                            {/* a div to display content, add ellipsis  */}
                            <p>{name}</p>

                            {/* next icon to select task */}
                            <span title="click to continue" className="nextIcon">
                                <NavigateNextTwoToneIcon color="inherit" />
                            </span>
                        </li>
                    })}
                </ul>
            </section>
        </div>
    );
};

export default Todo;
