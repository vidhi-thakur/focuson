import { ChangeEvent, FC, lazy, Suspense } from "react";
import SettingsIcon from "@mui/icons-material/Settings";
import AddIcon from "@mui/icons-material/Add";
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import "./Todo.css";
import { Button, LinearProgress } from "@mui/material";
import { useLocalStorage } from "../customHooks/useLocalStorage";
import { clearBadge } from "../helpers/badgeControl";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import KeyboardBackspaceOutlinedIcon from '@mui/icons-material/KeyboardBackspaceOutlined';
import TextField from "@mui/material/TextField";
import { NoData } from "./NoData";
const PomodoroTimer = lazy(() => import("./PomodoroTimer"));

interface Task {
  isCompleted: boolean;
  name: string;
  id: number;
}

interface TodoProps {
  redirectToSetting: () => void;
}

const Todo: FC<TodoProps> = ({ redirectToSetting }) => {
  const [addMode, setAddMode] = useLocalStorage<boolean>("addMode", false);
  const [input, setInput] = useLocalStorage<string>("input", "");
  const [isFocusOn, setIsFocusOn] = useLocalStorage<boolean>(
    "isFocusOn",
    false
  );
  const [focusTask, setFocusTask] = useLocalStorage<Task | null>(
    "focusTask",
    null
  );

  const [todoList, setTodoList] = useLocalStorage<Task[]>("todos", []);

  // to-do functions
  const startAddingTask = (): void => {
    setAddMode(true);
  };

  const stopAddingTask = (): void => {
    setInput("");
    setAddMode(false);
  };
  const addTask = (): void => {
    if (input.trim() !== "") {
      setTodoList([
        ...todoList,
        {
          id: todoList.length,
          name: input,
          isCompleted: false,
        },
      ]);
      stopAddingTask();
    }
  };

  // focus-task functions
  const startFocusingTask = (task: Task): void => {
    setFocusTask(task);
    setIsFocusOn(true);
  };

  const stopFocusingTask = (): void => {
    setIsFocusOn(false);
    clearBadge();
  };

  const deleteTask = (id: number): void => {
    setIsFocusOn(false);
    setTodoList(todoList.filter((val) => id !== val.id));
    clearBadge();
  };

  const completeTask = (id: number): void => {
    setIsFocusOn(false);
    setTodoList(
      todoList.map((val) => {
        if (id !== val.id) return val;
        return {
          ...val,
          isCompleted: true,
        };
      })
    );
  };

  if (isFocusOn) {
    return (
      <Suspense fallback={<LinearProgress />}>
        <PomodoroTimer
          handleDelete={deleteTask}
          handleComplete={completeTask}
          handleBack={stopFocusingTask}
          {...focusTask}
        />
      </Suspense>
    );
  }

  return (
    <div className="todo">
      {/* header */}
      <header>
        <div>
          <h2>To-Do List</h2>
          <small>Stay on top of your goals</small>
        </div>
        <div title="Block distracting websites" className="headerIcon" onClick={redirectToSetting}>
          <ShieldOutlinedIcon className="shieldIcon" />
          <SettingsIcon fontSize="small" className="settingsIcon" />
        </div>
      </header>

      {/* add new task */}
      <section className="addTask">
        {!addMode ? (
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            fullWidth
            className="btn btn1"
            onClick={startAddingTask}
          >
            Create new task
          </Button>
        ) : (
          <section>
            <KeyboardBackspaceOutlinedIcon
              fontSize="small"
              className="customIcon"
              onClick={stopAddingTask}
            />
            <TextField
              fullWidth
              label="Write your task"
              variant="outlined"
              multiline
              rows={2}
              size="small"
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setInput(e.target.value)
              }
            />
            <Button
              variant="contained"
              size="small"
              fullWidth
              onClick={addTask}
              className="btn btn2"
              disableElevation
            >
              Add
            </Button>
          </section>
        )}
      </section>

      {/* display todolist */}
      <section className="todoList">
        <ul>
          {todoList.length > 0 ? todoList.map(({ name, id, isCompleted }) => {
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
                <Button
                  variant="contained"
                  size="small"
                  endIcon={<PlayArrowIcon color="inherit" fontSize="small" />}
                  fullWidth
                  className="btn btn3"
                  onClick={() => startFocusingTask({ name, id, isCompleted })}
                  disableElevation
                >
                  Focus
                </Button>
              </li>
            );
          }) : <NoData message="No task yet." />}
        </ul>
      </section>
    </div>
  );
};

export default Todo;
