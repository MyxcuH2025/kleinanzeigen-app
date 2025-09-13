import React from 'react';
import { Dialog, DialogTitle, DialogContent, Typography } from '@mui/material';
import { ReportModalProps } from '../types';

const ReportModal: React.FC<ReportModalProps> = ({ open, onClose, onSubmit, loading }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Anzeige melden</DialogTitle>
      <DialogContent>
        <Typography>Report Modal - Coming Soon</Typography>
      </DialogContent>
    </Dialog>
  );
};

export default ReportModal;
