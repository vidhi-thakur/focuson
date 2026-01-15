import { ChangeEvent, FC, lazy, Suspense } from "react";
// import SettingsIcon from "@mui/icons-material/Settings";
import AddTaskRoundedIcon from "@mui/icons-material/AddTaskRounded";
import "./Todo.css";
import { Button, LinearProgress } from "@mui/material";
import { useLocalStorage } from "../customHooks/useLocalStorage";
import { clearBadge } from "../helpers/badgeControl";
const FocusTask = lazy(() => import("./FocusTask"));
const TextField = lazy(() => import("@mui/material/TextField"));
const ArrowBackRoundedIcon = lazy(
  () => import("@mui/icons-material/ArrowBackRounded")
);
const NavigateNextTwoToneIcon = lazy(
  () => import("@mui/icons-material/NavigateNextTwoTone")
);

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
  const addModeOpen = (): void => {
    setAddMode(true);
  };

  const addModeClose = (): void => {
    setInput("");
    setAddMode(false);
  };
  const handleCardSubmit = (): void => {
    if (input.trim() !== "") {
      setTodoList([
        ...todoList,
        {
          id: todoList.length,
          name: input,
          isCompleted: false,
        },
      ]);
      addModeClose();
    }
  };

  // focus-task functions
  const handleNext = (task: Task): void => {
    setFocusTask(task);
    setIsFocusOn(true);
  };

  const handleBack = (): void => {
    setIsFocusOn(false);
    clearBadge();
  };

  const handleDelete = (id: number): void => {
    setIsFocusOn(false);
    setTodoList(todoList.filter((val) => id !== val.id));
    clearBadge();
  };

  const handleComplete = (id: number): void => {
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
        <FocusTask
          handleDelete={handleDelete}
          handleComplete={handleComplete}
          handleBack={handleBack}
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
          <small>Stay on top of your goals - add your tasks here</small>
        </div>
        {/* <span title="Block sites">
                    <SettingsIcon onClick={redirectToSetting} className="icon" color="primary" />
                </span> */}
      </header>

      {/* add new task */}
      <section className="addTask">
        {!addMode ? (
          <Button
            variant="contained"
            size="small"
            startIcon={<AddTaskRoundedIcon />}
            fullWidth
            className="btn"
            onClick={addModeOpen}
          >
            Create new task
          </Button>
        ) : (
          <section>
            <ArrowBackRoundedIcon
              fontSize="small"
              className="customIcon"
              onClick={addModeClose}
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
              onClick={handleCardSubmit}
              className="btn btn2"
            >
              Add
            </Button>
          </section>
        )}
      </section>

      {/* display todolist */}
      <section className="todoList">
        <ul>
          {todoList.map(({ name, id, isCompleted }) => {
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
                <span
                  title="Begin focus mode"
                  className="customIconBox"
                  onClick={() => handleNext({ name, id, isCompleted })}
                >
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
