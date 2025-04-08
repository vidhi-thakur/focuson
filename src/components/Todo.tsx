import { FC, lazy, Suspense, useState } from "react";
import SettingsIcon from "@mui/icons-material/Settings";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import "./Todo.css";
import { Button, LinearProgress } from "@mui/material";
const FocusTask = lazy(() => import('./FocusTask'));
const TextField = lazy(() => import('@mui/material/TextField'));
const ArrowBackRoundedIcon = lazy(() => import('@mui/icons-material/ArrowBackRounded'));
const NavigateNextTwoToneIcon = lazy(() => import('@mui/icons-material/NavigateNextTwoTone'));

interface Task {
    isCompleted: boolean;
    name: string;
    id: number;
}

const Todo: FC = () => {
    const [list, setList] = useState<Task[]>([]);
    const [addMode, setAddMode] = useState<boolean>(false);
    const [input, setInput] = useState<string>("");
    const [isFocusOn, setIsFocusOn] = useState<boolean>(false);
    const [focusTask, setFocusTask] = useState<Task | null>(null);


    // to-do functions
    const addModeOpen = (): void => {
        setAddMode(true);
    };

    const addModeClose = (): void => {
        setInput("");
        setAddMode(false);
    };
    const handleCardSubmit = (): void => {
        setList((l) => [
            ...l,
            {
                id: l.length,
                name: input,
                isCompleted: false,
            },
        ]);
        addModeClose();
    };

    // focus-task functions
    const handleNext = (task: Task): void => {
        setFocusTask(task);
        setIsFocusOn(true);
    }

    const handleBack = (): void => {
        setIsFocusOn(false);
    }

    const handleDelete = (id: number): void => {
        setIsFocusOn(false);
        setList(l => l.filter(val => id !== val.id));

    }

    const handleComplete = (id: number): void => {
        setIsFocusOn(false);
        setList(l => l.map(val => {
            if (id !== val.id) return val;
            return {
                ...val,
                isCompleted: true
            }
        }));
    }

    if (isFocusOn) {
        return <Suspense fallback={<LinearProgress />}>
            <FocusTask
                handleDelete={handleDelete}
                handleComplete={handleComplete}
                handleBack={handleBack}
                {...focusTask}
            />
        </Suspense>
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

            {/* add new task */}
            <section className="addTask">
                {!addMode ? (
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<AddCircleOutlineRoundedIcon />}
                        fullWidth
                        className="btn"
                        onClick={addModeOpen}
                    >
                        Create new task
                    </Button>
                ) : (
                    <section>
                        <ArrowBackRoundedIcon fontSize="small" className="customIcon" onClick={addModeClose} />
                        <TextField
                            fullWidth
                            label="Write your task"
                            variant="outlined"
                            multiline
                            rows={2}
                            size="small"
                            onChange={(e) => setInput(e.target.value)}
                        />
                        <Button
                            variant="contained"
                            size="small"
                            fullWidth
                            onClick={handleCardSubmit}
                            className="btn btn2"
                        >
                            Add
                        </Button>
                    </section>
                )}
            </section>

            {/* display list */}
            <section className="todoList">
                <ul>
                    {list.map(({ name, id, isCompleted }) => {
                        return (
                            <li
                                key={id}
                                style={
                                    isCompleted
                                        ? { textDecoration: "line-through", opacity: 0.5 }
                                        : {}
                                }
                            >
                                {/* a div to display content, add ellipsis  */}
                                <p>{name}</p>

                                {/* next icon to select task */}
                                <span title="click to start" className="nextIcon" onClick={() => handleNext({ name, id, isCompleted })}>
                                    <NavigateNextTwoToneIcon color="inherit" />
                                </span>
                            </li>
                        );
                    })}
                </ul>
            </section>
        </div>
    );
};

export default Todo;
