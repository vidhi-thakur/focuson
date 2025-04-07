import { Button } from "@mui/material";
import React, { useEffect, useState } from "react";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import "./PomodoroTimer.css";

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

const PomodoroTimer: React.FC = () => {
  const [currActionIndex, setCurrActionIndex] = useState<number>(0);
  const [isTimerOn, setIsTimerOn] = useState<boolean>(false);
  const [currTime, setCurrTime] = useState<Time>({
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
        <section className="timerControls">
          <Button disabled={isTimerOn} onClick={startTimer} variant="contained">
            Start
          </Button>
          <Button disabled={!isTimerOn} onClick={stopTimer} variant="contained">
            Stop
          </Button>
        </section>

        {/* click and change options */}
        <section className="timerActions">
          <Button
            className="btn"
            startIcon={<UnfoldMoreIcon />}
            onClick={changeAction}
          >
            {OPTIONS[currActionIndex].name}
          </Button>
        </section>
      </div>
    </div>
  );
};

export default PomodoroTimer;
