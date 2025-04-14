import { Button, ButtonGroup } from "@mui/material";
import { FC, useEffect } from "react";
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
    id: 2,
    name: "Long Break: 15 min",
    duration: 15,
  },
];

const PomodoroTimer: FC = () => {
  const [currActionIndex, setCurrActionIndex] = useLocalStorage<number>("currActionIndex", 0);
  const [isTimerOn, setIsTimerOn] = useLocalStorage<boolean>("isTimerOn", false);
  const [currTime, setCurrTime] = useLocalStorage<Time>("currTime", {
    min: OPTIONS[currActionIndex].duration,
    sec: 0,
  });

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTimerOn]);

  const startTimer = (): void => setIsTimerOn(true);
  const stopTimer = (): void => setIsTimerOn(false);

  const changeAction = (): void => {
    const index = (currActionIndex + 1) % OPTIONS.length;
    setCurrActionIndex(index);
    setCurrTime({ min: OPTIONS[index].duration, sec: 0 });
  };

  return (
    <div className="pomodoro">
      <div className="container">
        {/* count down time */}
        <section className="countdownTimer">
          <h2>
            {currTime.min > 9 ? currTime.min : `0${currTime.min}`}:
            {currTime.sec > 9 ? currTime.sec : `0${currTime.sec}`}
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
