import {
  Button,
  ButtonGroup,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { FC, useEffect, useState } from "react";
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
    OPTIONS[0].name
  );
  const [isTimerOn, setIsTimerOn] = useLocalStorage<boolean>(
    "isTimerOn",
    false
  );
  const [currTime, setCurrTime] = useLocalStorage<Time>("currTime", {
    min: OPTIONS[OPTIONS.findIndex((option) => option.name === currAction)]
      .duration,
    sec: 0,
  });

  // Tracks whether we've finished syncing from background on mount.
  // When true, we can safely push to the badge (avoids overwriting background with stale localStorage).
  const [isSyncComplete, setSyncComplete] = useState(false);

  // On mount: if timer was running while popup was closed, sync from background (source of truth).
  // This prevents overwriting the badge with stale localStorage when we first open the popup.
  useEffect(() => {
    if (!isTimerOn) {
      setSyncComplete(true);
      return;
    }
    if (typeof chrome === "undefined" || !chrome.runtime?.sendMessage) {
      setSyncComplete(true);
      return;
    }
    chrome.runtime
      .sendMessage({ type: "SYNC_STATE" })
      .then(
        (
          state:
            | {
                min?: number;
                sec?: number;
                isRunning?: boolean;
                actionIndex?: number;
              }
            | undefined
        ) => {
          if (!state) return;
          if (state.isRunning === false) {
            setIsTimerOn(false);
            const idx = state.actionIndex ?? 0;
            setCurrTime({ min: OPTIONS[idx].duration, sec: 0 });
          } else if (state.min !== undefined && state.sec !== undefined) {
            setCurrTime({ min: state.min, sec: state.sec });
            if (state.actionIndex !== undefined && OPTIONS[state.actionIndex]) {
              setCurrAction(OPTIONS[state.actionIndex].name);
            }
          }
        }
      )
      .catch(() => {})
      .finally(() => setSyncComplete(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run only on mount; isTimerOn is read from first render
  }, []);

  // Update badge whenever timer state or time changes. Skip pushing until sync completes
  // so we don't overwrite the background's correct countdown with stale localStorage on popup open.
  useEffect(() => {
    if (isTimerOn && !isSyncComplete) return;
    if (isTimerOn) {
      updateBadge(
        currTime.min,
        currTime.sec,
        true,
        OPTIONS.findIndex((option) => option.name === currAction)
      );
    } else {
      clearBadge();
    }
  }, [isTimerOn, isSyncComplete, currTime.min, currTime.sec, currAction]);

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
      OPTIONS.findIndex((option) => option.name === currAction)
    );
  };
  const stopTimer = (): void => {
    setIsTimerOn(false);
    clearBadge();
  };

  const changeAction = (
    event: React.MouseEvent<HTMLElement>,
    newVal: string | null
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
        OPTIONS.findIndex((option) => option.name === newVal)
      );
    }
  };

  const progress =
    ((currTime.min * 60 + currTime.sec) /
      ((OPTIONS.find((option) => option.name === currAction)?.duration || 0) *
        60)) *
    100;

  return (
    <div className="focusTask">
      {/* header section: task name, back option, delete task */}
      <header>
        <nav>
          <KeyboardBackspaceOutlinedIcon
            fontSize="small"
            className="customIcon"
            onClick={() => {
              handleBack();
              clearBadge();
            }}
          />

          <h2>Focus Session</h2>

          <DeleteOutlineIcon
            fontSize="small"
            className="customIcon"
            onClick={(): void => {
              id !== undefined && handleDelete(id);
              clearBadge();
            }}
          />
        </nav>
        <h3>{name}</h3>
      </header>

      {/* display pomodoro */}
      <section className="pomodoro">
        {/* count down time */}
        <section className="countdownTimer">
          <GradientCircularProgress value={progress} />
          <h4>
            {currTime.min > 9 ? currTime.min : `0${currTime.min}`}:
            {currTime.sec > 9 ? currTime.sec : `0${currTime.sec}`}
          </h4>
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
          endIcon={
            isTimerOn ? (
              <PauseIcon fontSize="small" />
            ) : (
              <PlayArrowIcon fontSize="small" />
            )
          }
          onClick={isTimerOn ? stopTimer : startTimer}
          disableElevation
          disableRipple
          disabled={isCompleted}
          className="startStopBtn"
        >
          {isTimerOn ? "Stop" : "Start"}
        </Button>

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
      </section>
    </div>
  );
};

function GradientCircularProgress({ value }: { value: number }) {
  return (
    <>
      <svg width={0} height={0}>
        <defs>
          <linearGradient id="my_gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgb(255, 175, 190)" />
            <stop offset="100%" stopColor="#1976d2" />
          </linearGradient>
        </defs>
      </svg>
      <CircularProgress
        enableTrackSlot
        variant="determinate"
        value={value}
        size={200}
        thickness={2}
        sx={{ "svg circle": { stroke: "url(#my_gradient)" } }}
      />
    </>
  );
}

export default PomodoroTimer;
