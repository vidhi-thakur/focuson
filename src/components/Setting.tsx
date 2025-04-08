import { FC, lazy, useState } from 'react';
import { Button, TextField } from '@mui/material';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import './Setting.css';
const ArrowBackRoundedIcon = lazy(() => import('@mui/icons-material/ArrowBackRounded'));

interface SettingProps {
    handleBack: () => void
}

const Setting: FC<SettingProps> = ({ handleBack }) => {
    const [input, setInput] = useState<string>("");
    const [urls, setUrls] = useState<string[]>([]);

    const updateURL = (): void => {
        setUrls(val => [...val, input]);
        setInput("");
    }

    const handleDelete = (link: string): void => {
        setUrls(val => val.filter(v => v !== link));
    }

    return (
        <div className='setting'>
            {/* heading, icon to go back */}
            <header>
                <ArrowBackRoundedIcon fontSize="small" className="customIcon" onClick={handleBack} />
                <h2>Add URLs to block</h2>
            </header>

            {/* display list of added url with delete icon */}
            <section className="urlList">
                <ul>
                    {urls.map((val, index) => {
                        return (
                            <li
                                key={index}
                            >
                                {/* a div to display content, add ellipsis  */}
                                <p>{val}</p>

                                {/* next icon to select task */}
                                <span className="customIconBox" onClick={() => handleDelete(val)}>
                                    <DeleteRoundedIcon fontSize="small" />
                                </span>
                            </li>
                        );
                    })}
                </ul>
            </section>

            {/* input to add new icons */}

            <section className='form'>
                <TextField
                    fullWidth
                    label="Add URL"
                    variant="outlined"
                    size="small"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
                <Button
                    variant="contained"
                    size="small"
                    onClick={updateURL}
                >
                    Add
                </Button>
            </section>
        </div>
    )
}

export default Setting