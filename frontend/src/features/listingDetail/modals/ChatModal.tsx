import React from 'react';
import { Dialog, DialogTitle, DialogContent, Typography } from '@mui/material';
import { ChatModalProps } from '../types';

const ChatModal: React.FC<ChatModalProps> = ({ open, onClose, conversation, onSendMessage, loading }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Chat</DialogTitle>
      <DialogContent>
        <Typography>Chat Modal - Coming Soon</Typography>
      </DialogContent>
    </Dialog>
  );
};

export default ChatModal;
