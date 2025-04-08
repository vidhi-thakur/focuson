import { FC } from "react";
import "./FocusTask.css";
import PomodoroTimer from "./PomodoroTimer";
import { Button } from "@mui/material";
import DoneRoundedIcon from "@mui/icons-material/DoneRounded";

const FocusTask: FC = () => {
    return (
        <div className="focusTask">
            {/* header section: task name, back option, delete task */}
            <header></header>

            {/* display pomodoro */}
            <PomodoroTimer />

            {/* btn to mark task as complete */}
            <Button
                size="small"
                variant="outlined"
                fullWidth
                startIcon={<DoneRoundedIcon />}
                className="completeBtn"
            >
                Mark complete
            </Button>
        </div>
    );
};

export default FocusTask;
