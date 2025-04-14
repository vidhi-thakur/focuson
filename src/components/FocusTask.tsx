import { FC, useEffect, useState } from "react";
import "./FocusTask.css";
import PomodoroTimer from "./PomodoroTimer";
import { Button } from "@mui/material";
import DoneRoundedIcon from "@mui/icons-material/DoneRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import CloseFullscreenRoundedIcon from "@mui/icons-material/CloseFullscreenRounded";
import OpenInFullRoundedIcon from "@mui/icons-material/OpenInFullRounded";

interface FocusTaskProps {
    handleDelete: (id: number) => void;
    handleComplete: (id: number) => void;
    handleBack: () => void;
    name?: string;
    id?: number;
    isCompleted?: boolean;
}

const FocusTask: FC<FocusTaskProps> = ({
    handleDelete,
    handleComplete,
    handleBack,
    name,
    id,
    isCompleted,
}) => {
    const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
    useEffect(() => {
        const root = document.getElementById("root");
        if (!isCollapsed || !root) return;

        root.className = "collapsed";
        return () => {
            root.className = "expanded";
        };
    }, [isCollapsed]);

    return (
        <div className="focusTask">
            {/* header section: task name, back option, delete task */}
            {!isCollapsed && <header>
                <nav>
                    <ArrowBackRoundedIcon
                        fontSize="small"
                        className="customIcon"
                        onClick={handleBack}
                    />
                    <CloseFullscreenRoundedIcon
                        fontSize="small"
                        className="customIcon"
                        onClick={() => setIsCollapsed(true)}
                    />
                </nav>
                <div className="content">
                    <div>
                        <h2>{name}</h2>
                        <small>
                            Stay focused - you're one step closer to finishing this!
                        </small>
                    </div>
                    <DeleteRoundedIcon
                        fontSize="small"
                        className="customIcon"
                        onClick={(): void => {
                            id !== undefined && handleDelete(id);
                        }}
                    />
                </div>
            </header>}

            {/* display pomodoro */}
            <section className={isCollapsed ? '' : "pomodoro"}>
                {isCollapsed && <div className="collapseIconBg">
                    <span className="customIconBox">
                        <OpenInFullRoundedIcon
                            fontSize="small"
                            onClick={() => setIsCollapsed(false)}
                        />
                    </span>
                </div>}
                <PomodoroTimer isCollapsed={isCollapsed} taskId={id} />
            </section>

            {/* btn to mark task as complete */}
            {!isCollapsed && <Button
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
            </Button>}
        </div>
    );
};

export default FocusTask;
