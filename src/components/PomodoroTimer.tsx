import { Button, ButtonGroup } from "@mui/material";
import { FC, useCallback, useEffect } from "react";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import "./PomodoroTimer.css";
import { useLocalStorage } from "../customHooks/useLocalStorage";

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
    name: "Pomodoro: 25 min",
    duration: 25,
  },
  {
    id: 1,
    name: "Short Break: 5 min",
    duration: 5,
  },
  {
    id: 0,
    name: "Pomodoro: 25 min",
    duration: 25,
  },
  {
    id: 1,
    name: "Short Break: 5 min",
    duration: 5,
  },
  {
    id: 2,
    name: "Long Break: 15 min",
    duration: 15,
  },
];

interface PomodoroProps {
  isCollapsed: boolean,
  taskId?: number
}


const formatTime = (min: number, sec: number) =>
  `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;

const PomodoroTimer: FC<PomodoroProps> = ({ isCollapsed, taskId }) => {
  const [currActionIndex, setCurrActionIndex] = useLocalStorage<number>("currActionIndex", 0);
  const [isTimerOn, setIsTimerOn] = useLocalStorage<boolean>("isTimerOn", false);
  const [currTime, setCurrTime] = useLocalStorage<Time>("currTime", {
    min: OPTIONS[currActionIndex].duration,
    sec: 0,
  });

  useEffect(() => {
    let intervalId: NodeJS.Timeout | number | undefined;

    if (isTimerOn) {
      intervalId = setInterval(() => {
        setCurrTime((prev) => {
          if (prev.min === 0 && prev.sec === 0) {
            clearInterval(intervalId);
            setIsTimerOn(false);
            return prev;
          }
          if (prev.sec === 0) {
            return { min: prev.min - 1, sec: 59 };
          }
          return { ...prev, sec: prev.sec - 1 };
        });
      }, 1000);
    }

    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTimerOn]);

  useEffect(() => {
    // this use effect resets the timer and current action if different task is selected
    resetTimer(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId])

  const resetTimer = (index: number) => {
    setCurrActionIndex(index);
    setCurrTime({ min: OPTIONS[index].duration, sec: 0 });
  }

  const startTimer = (): void => setIsTimerOn(true);
  const stopTimer = (): void => setIsTimerOn(false);

  const changeAction = (): void => {
    resetTimer((currActionIndex + 1) % OPTIONS.length)
  };

  const formattedTime = formatTime(currTime.min, currTime.sec);

  if (isCollapsed) {
    return <div className="pomodoro_collapsed">
      <section className="countdownTimer">
        <h2>
          {formattedTime}
        </h2>
      </section>
    </div>
  }

  return (
    <div className="pomodoro">
      <div className="container">
        {/* count down time */}
        <section className="countdownTimer">
          <h2>
            {formattedTime}
          </h2>
        </section>

        {/* start/stop timer CTA */}
        <ButtonGroup
          className="timerControls"
          disableElevation
          variant="contained"
          fullWidth
        >
          <Button disabled={isTimerOn} onClick={startTimer}>
            Start
          </Button>
          <Button disabled={!isTimerOn} onClick={stopTimer}>
            Stop
          </Button>
        </ButtonGroup>

        {/* click and change options */}
        <section className="timerActions">
          <Button
            className="btn"
            fullWidth
            startIcon={<UnfoldMoreIcon />}
            onClick={changeAction}
            variant="contained"
            disableElevation
            disabled={isTimerOn}
          >
            {OPTIONS[currActionIndex].name}
          </Button>
        </section>
      </div>
    </div>
  );
};

export default PomodoroTimer;
