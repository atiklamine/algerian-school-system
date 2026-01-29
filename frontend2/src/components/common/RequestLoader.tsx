'use client';

import React from 'react';
import { Backdrop, Box, CircularProgress, Typography } from '@mui/material';

export default function RequestLoader({ open, message }: { open: boolean; message: string }) {
  return (
    <Backdrop open={open} sx={{ zIndex: (theme) => theme.zIndex.drawer + 999 }}>
      <Box sx={{ textAlign: 'center', color: 'common.white' }}>
        <CircularProgress color="inherit" />
        <Typography variant="h6" sx={{ mt: 2 }}>
          {message || 'Please wait...'}
        </Typography>
      </Box>
    </Backdrop>
  );
}
