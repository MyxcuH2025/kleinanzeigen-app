import { Box, Typography } from '@mui/material';
import type { ReactNode } from 'react';

export const Section = ({ title, children }: { title: string, children: ReactNode }) => (
  <Box sx={{ mb: 4 }}>
    <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>{title}</Typography>
    {children}
  </Box>
); 
