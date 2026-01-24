import { FC, lazy, useState, useEffect, ChangeEvent } from "react";
import { Button, TextField } from "@mui/material";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import "./Setting.css";
import { useLocalStorage } from "../customHooks/useLocalStorage";
import { syncBlockedUrls } from "../helpers/badgeControl";
import { NoData } from "./NoData";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import CloseIcon from "@mui/icons-material/Close";
const KeyboardBackspaceOutlinedIcon = lazy(
  () => import("@mui/icons-material/KeyboardBackspaceOutlined"),
);

interface SettingProps {
  handleBack: () => void;
}

const Setting: FC<SettingProps> = ({ handleBack }) => {
  const [input, setInput] = useState<string>("");
  const [urls, setUrls] = useLocalStorage<string[]>("blockedUrls", []);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [error, setError] = useState<string>("");
  // Sync blocked URLs with background script
  useEffect(() => {
    syncBlockedUrls(urls);
  }, [urls]);

  const normalizeUrl = (url: string): string => {
    let normalized = url.trim().toLowerCase();
    // Remove protocol if present
    normalized = normalized.replace(/^https?:\/\//, "");
    // Remove www. if present
    normalized = normalized.replace(/^www\./, "");
    // Remove trailing slash
    normalized = normalized.replace(/\/$/, "");
    return normalized;
  };

  const validateUrl = (url: string): boolean => {
    const normalized = normalizeUrl(url);
    // Basic validation - should contain at least a dot (for domain)
    return normalized.length > 0 && normalized.includes(".");
  };

  const updateURL = (): void => {
    if (input.trim() === "") {
      setError("Add a URL");
      return;
    }

    const normalized = normalizeUrl(input);
    if (!validateUrl(normalized)) {
      setError("Invalid URL");
      return;
    }

    // Check for duplicates
    if (urls.includes(normalized)) {
      setError("URL exists in the blocked list");
      setInput("");
      return;
    }

    setUrls((val) => [...val, normalized]);
    setInput("");
  };

  const handleDelete = (link: string): void => {
    setUrls((val) => val.filter((v) => v !== link));
  };

  const handleEdit = (index: number, currentUrl: string): void => {
    setEditingIndex(index);
    setEditValue(currentUrl);
  };

  const handleSaveEdit = (): void => {
    if (editingIndex === null) return;

    const normalized = normalizeUrl(editValue);
    if (!validateUrl(normalized)) {
      setError("Invalid URL");
      return;
    }

    // Check for duplicates (excluding current item)
    if (urls.some((url, idx) => url === normalized && idx !== editingIndex)) {
      setError("URL exists in the blocked list");
      return;
    }

    setUrls((val) => {
      const newUrls = [...val];
      newUrls[editingIndex] = normalized;
      return newUrls;
    });
    setEditingIndex(null);
    setEditValue("");
  };

  const handleCancelEdit = (): void => {
    setEditingIndex(null);
    setEditValue("");
  };

  return (
    <div className="setting">
      {/* heading, icon to go back */}
      <header>
        <KeyboardBackspaceOutlinedIcon
          fontSize="small"
          className="customIcon"
          onClick={handleBack}
        />
        <h2>Block websites</h2>
      </header>

      {/* input to add new icons */}

      <section className="form">
        <TextField
          fullWidth
          error={!!error}
          helperText={error}
          variant="outlined"
          size="small"
          value={input}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setInput(e.target.value);
            setError("");
          }}
          onKeyPress={(e) => {
            if (e.key === "Enter") updateURL();
          }}
          placeholder="example.com"
        />
        <Button
          variant="contained"
          size="small"
          onClick={updateURL}
          className="btn"
          disableElevation
        >
          Add
        </Button>
      </section>

      {/* display list of added url with delete and edit icons */}
      <section className="urlList">
        <ul>
          {urls.length === 0 ? (
            <NoData message="No blocked URLs." />
          ) : (
            urls.map((val, index) => {
              return (
                <li key={index}>
                  {editingIndex === index ? (
                    <div className="urlItem-edit">
                      <TextField
                        size="small"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") handleSaveEdit();
                          if (e.key === "Escape") handleCancelEdit();
                        }}
                        autoFocus
                        style={{ flex: 1 }}
                      />
                      <div className="iconBox">
                        <span onClick={handleSaveEdit}>
                          <CheckOutlinedIcon fontSize="small" />
                        </span>
                        <span onClick={handleCancelEdit}>
                          <CloseIcon fontSize="small" />
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="urlItem">
                      {/* a div to display content, add ellipsis  */}
                      <p>{val}</p>

                      {/* edit and delete icons */}
                      <div className="iconBox">
                        <span onClick={() => handleEdit(index, val)}>
                          <EditOutlinedIcon fontSize="small" />
                        </span>
                        <span onClick={() => handleDelete(val)}>
                          <DeleteOutlineOutlinedIcon fontSize="small" />
                        </span>
                      </div>
                    </div>
                  )}
                </li>
              );
            })
          )}
        </ul>
      </section>
    </div>
  );
};

export default Setting;
