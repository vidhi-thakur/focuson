import { FC } from "react";
import "./FocusTask.css";
import PomodoroTimer from "./PomodoroTimer";
import { Button } from "@mui/material";
import DoneRoundedIcon from "@mui/icons-material/DoneRounded";
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';

interface FocusTaskProps {
    handleDelete: (id: number) => void,
    handleComplete: (id: number) => void,
    handleBack: () => void,
    name?: string,
    id?: number,
    isCompleted?: boolean
}

const FocusTask: FC<FocusTaskProps> = ({
    handleDelete,
    handleComplete,
    handleBack,
    name,
    id,
    isCompleted
}) => {
    return (
        <div className="focusTask">
            {/* header section: task name, back option, delete task */}
            <header>
                <nav>
                    <ArrowBackRoundedIcon fontSize="small" className="customIcon" onClick={handleBack} />
                    <DeleteRoundedIcon fontSize="small" className="customIcon" onClick={(): void => {
                        id !== undefined && handleDelete(id);
                    }} />
                </nav>
                <div>
                    <h2>{name}</h2>
                    <small>Stay focused - you're one step closer to finishing this!</small>
                </div>
            </header>

            {/* display pomodoro */}
            <section className="pomodoro">
                <PomodoroTimer />
            </section>

            {/* btn to mark task as complete */}
            <Button
                size="small"
                variant="outlined"
                fullWidth
                startIcon={<DoneRoundedIcon />}
                className="completeBtn"
                onClick={(): void => {
                    id !== undefined && handleComplete(id);
                }}
                disabled={isCompleted}
            >
                Mark complete
            </Button>
        </div>
    );
};

export default FocusTask;
