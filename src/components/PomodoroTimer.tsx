import { Button, ButtonGroup } from "@mui/material";
import { FC, useEffect, useRef, useState } from "react";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import "./PomodoroTimer.css";
import { useLocalStorage } from "../customHooks/useLocalStorage";
import { clearBadge, updateBadge } from "../helpers/badgeControl";
import { notifyTimerComplete } from "../helpers/notifications";
import TimerCompleteModal from "./TimerCompleteModal";

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
  const [showCompleteModal, setShowCompleteModal] = useState<boolean>(false);
  
  // Use ref to track current action index for use in timer callback
  const currActionIndexRef = useRef(currActionIndex);
  useEffect(() => {
    currActionIndexRef.current = currActionIndex;
  }, [currActionIndex]);

  // Listen for timer completion messages from background script
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
      const messageListener = (message: any) => {
        if (message.type === 'TIMER_COMPLETE') {
          setShowCompleteModal((prev) => {
            if (!prev) {
              const timerType = OPTIONS[currActionIndexRef.current].name;
              notifyTimerComplete(timerType);
              return true;
            }
            return prev;
          });
        }
      };
      
      chrome.runtime.onMessage.addListener(messageListener);
      // Note: Chrome extension message listeners persist for the extension context lifetime
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only add listener once on mount

  // Update badge whenever timer state or time changes (including on mount)
  useEffect(() => {
    if (isTimerOn) {
      updateBadge(currTime.min, currTime.sec, true);
    } else {
      clearBadge();
    }
  }, [isTimerOn, currTime.min, currTime.sec]);

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
            const timerType = OPTIONS[currActionIndexRef.current].name;
            notifyTimerComplete(timerType);
            setShowCompleteModal(true);
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

  const startTimer = (): void => {
    setIsTimerOn(true);
    updateBadge(currTime.min, currTime.sec, true);
  };
  const stopTimer = (): void => {
    setIsTimerOn(false);
    clearBadge();
  };

  const changeAction = (): void => {
    const index = (currActionIndex + 1) % OPTIONS.length;
    setCurrActionIndex(index);
    const newTime = { min: OPTIONS[index].duration, sec: 0 };
    setCurrTime(newTime);
    // Update badge if timer is running
    if (isTimerOn) {
      updateBadge(newTime.min, newTime.sec, true);
    }
  };

  return (
    <>
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
      
      {/* Timer Complete Modal */}
      <TimerCompleteModal
        open={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        timerType={OPTIONS[currActionIndex].name}
      />
    </>
  );
};

export default PomodoroTimer;
