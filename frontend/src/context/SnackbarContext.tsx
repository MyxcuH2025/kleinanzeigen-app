import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

interface SnackbarContextType {
  showSnackbar: (message: string, severity?: 'success' | 'error' | 'info' | 'warning') => void;
}

const SnackbarContext = createContext<SnackbarContextType>({
  showSnackbar: () => {},
});

export const SnackbarProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');

  const showSnackbar = (msg: string, sev: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    setMessage(msg);
    setSeverity(sev);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={2500}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = () => useContext(SnackbarContext); 
