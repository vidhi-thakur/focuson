import {
  Button,
  ButtonGroup,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { FC, useEffect } from "react";
import CheckIcon from "@mui/icons-material/Check";
import "./PomodoroTimer.css";
import { useLocalStorage } from "../customHooks/useLocalStorage";
import { clearBadge, updateBadge } from "../helpers/badgeControl";
import { notifyTimerComplete } from "../helpers/notificationHelper";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import KeyboardBackspaceOutlinedIcon from "@mui/icons-material/KeyboardBackspaceOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

interface Option {
  id: number;
  name: string;
  duration: number;
}

interface Time {
  min: number;
  sec: number;
}

const OPTIONS: Option[] = [
  {
    id: 0,
    name: "Pomodoro",
    duration: 25,
  },
  {
    id: 1,
    name: "Short Break",
    duration: 5,
  },
  {
    id: 2,
    name: "Long Break",
    duration: 15,
  },
];

interface PomodoroTimerProps {
  handleDelete: (id: number) => void;
  handleComplete: (id: number) => void;
  handleBack: () => void;
  name?: string;
  id?: number;
  isCompleted?: boolean;
}

const PomodoroTimer: FC<PomodoroTimerProps> = ({
  handleDelete,
  handleComplete,
  handleBack,
  name,
  id,
  isCompleted,
}) => {
  const [currAction, setCurrAction] = useLocalStorage<string>(
    "currAction",
    OPTIONS[0].name,
  );
  const [isTimerOn, setIsTimerOn] = useLocalStorage<boolean>(
    "isTimerOn",
    false,
  );
  const [currTime, setCurrTime] = useLocalStorage<Time>("currTime", {
    min: OPTIONS[OPTIONS.findIndex((option) => option.name === currAction)]
      .duration,
    sec: 0,
  });

  // Update badge whenever timer state or time changes (including on mount)
  useEffect(() => {
    if (isTimerOn) {
      updateBadge(
        currTime.min,
        currTime.sec,
        true,
        OPTIONS.findIndex((option) => option.name === currAction),
      );
    } else {
      clearBadge();
    }
  }, [isTimerOn, currTime.min, currTime.sec, currAction]);

  useEffect(() => {
    let id: NodeJS.Timer | number | undefined;
    if (isTimerOn) {
      id = setInterval(() => {
        setCurrTime((val) => {
          if (val.sec === 0 && val.min > 0) {
            return { min: val.min - 1, sec: 59 };
          }
          if (val.min === 0 && val.sec === 0) {
            clearInterval(id);
            setIsTimerOn(false);
            clearBadge();
            // Trigger notification when timer completes
            notifyTimerComplete(currAction);
            return val;
          } else {
            return { ...val, sec: val.sec - 1 };
          }
        });
      }, 1000);
    } else {
      clearInterval(id);
    }

    return () => clearInterval(id);
  }, [isTimerOn]);

  const startTimer = (): void => {
    setIsTimerOn(true);
    updateBadge(
      currTime.min,
      currTime.sec,
      true,
      OPTIONS.findIndex((option) => option.name === currAction),
    );
  };
  const stopTimer = (): void => {
    setIsTimerOn(false);
    clearBadge();
  };

  const changeAction = (
    event: React.MouseEvent<HTMLElement>,
    newVal: string | null,
  ) => {
    setCurrAction(newVal as string);
    const newTime = {
      min: OPTIONS[OPTIONS.findIndex((option) => option.name === newVal)]
        .duration,
      sec: 0,
    };
    setCurrTime(newTime);
    // Update badge if timer is running
    if (isTimerOn) {
      updateBadge(
        newTime.min,
        newTime.sec,
        true,
        OPTIONS.findIndex((option) => option.name === newVal),
      );
    }
  };

  return (
    <div className="focusTask">
      {/* header section: task name, back option, delete task */}
      <header>
        <nav>
          <KeyboardBackspaceOutlinedIcon
            fontSize="small"
            className="customIcon"
            onClick={handleBack}
          />

          <h2>Focus Session</h2>

          <DeleteOutlineIcon
            fontSize="small"
            className="customIcon"
            onClick={(): void => {
              id !== undefined && handleDelete(id);
            }}
          />
        </nav>
        <h3 style={{ marginTop: "var(--default-spacing)" }}>{name}</h3>
      </header>

      {/* display pomodoro */}
      <section className="pomodoro">
        <div className="container">
          {/* count down time */}
          <section className="countdownTimer">
            <h2>
              {currTime.min > 9 ? currTime.min : `0${currTime.min}`}:
              {currTime.sec > 9 ? currTime.sec : `0${currTime.sec}`}
            </h2>
          </section>

          {/* click and change options */}
          <section className="timerActions">
            <ToggleButtonGroup
              value={currAction}
              exclusive
              onChange={changeAction}
              color="primary"
              disabled={isTimerOn}
            >
              <ToggleButton value="Pomodoro" aria-label="pomodoro">
                Pomodoro
              </ToggleButton>
              <ToggleButton value="Short Break" aria-label="shortBreak">
                Short Break
              </ToggleButton>
              <ToggleButton value="Long Break" aria-label="longBreak">
                Long Break
              </ToggleButton>
            </ToggleButtonGroup>
          </section>

          {/* start/stop timer CTA */}
          <Button
            variant="contained"
            fullWidth
            endIcon={isTimerOn ? <PauseIcon /> : <PlayArrowIcon />}
            onClick={isTimerOn ? stopTimer : startTimer}
            disableElevation
            disableRipple
            disabled={isCompleted}
          >
            {isTimerOn ? "Stop" : "Start"}
          </Button>
        </div>
      </section>

      {/* btn to mark task as complete */}
      {!isCompleted && (
        <Button
          size="small"
          variant="outlined"
          fullWidth
          startIcon={<CheckIcon />}
          className="completeBtn"
          onClick={(): void => {
            id !== undefined && handleComplete(id);
            clearBadge();
          }}
          disabled={isCompleted}
        >
          Mark complete
        </Button>
      )}
    </div>
  );
};

export default PomodoroTimer;
