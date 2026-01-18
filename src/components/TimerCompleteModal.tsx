import { FC, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import "./TimerCompleteModal.css";

interface TimerCompleteModalProps {
  open: boolean;
  onClose: () => void;
  timerType?: string;
}

const TimerCompleteModal: FC<TimerCompleteModalProps> = ({ open, onClose, timerType }) => {
  // Auto-close after 10 seconds
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        onClose();
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [open, onClose]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          textAlign: 'center',
          padding: 2
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <CheckCircleIcon sx={{ fontSize: 64, color: '#4caf50' }} />
        <Typography variant="h5" component="div" fontWeight="bold">
          {timerType || 'Timer'} Complete!
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" color="text.secondary">
          Time to take a break or move to the next task!
        </Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', padding: 2 }}>
        <Button
          variant="contained"
          onClick={onClose}
          size="large"
          sx={{ minWidth: 120 }}
        >
          Got it!
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TimerCompleteModal;
