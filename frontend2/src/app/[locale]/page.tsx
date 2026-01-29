'use client';
import { Box, Typography, Button, Container, Grid, Paper } from '@mui/material';
import { EnhancedModal } from '@/components/common/EnhancedModal';
import { useState } from 'react';
import SecurityIcon from '@mui/icons-material/Security';
import DashboardIcon from '@mui/icons-material/Dashboard';

export default function Home() {
  const [open, setOpen] = useState(false);

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box sx={{ textAlign: 'center', mb: 8 }}>
        <Typography variant="h2" component="h1" gutterBottom color="primary">
          Secure School Dashboard
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Premium, Secure, and Responsive Interface for School Management
        </Typography>
        <Button variant="contained" size="large" onClick={() => setOpen(true)} startIcon={<DashboardIcon />}>
          Open Enhanced Modal
        </Button>
      </Box>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 4, height: '100%', textAlign: 'center' }}>
            <SecurityIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>Secure By Design</Typography>
            <Typography color="text.secondary">
              Strict TypeScript, secure API handling, and optimized state management.
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <EnhancedModal
        open={open}
        onClose={() => setOpen(false)}
        title="Enhanced Feature"
        actions={<Button onClick={() => setOpen(false)}>Close</Button>}
      >
        <Typography paragraph>
          This is a draggable, resizable, and maximizable modal running in the new secure frontend.
        </Typography>
        <Typography>
          Try dragging it by the title or resizing it from the edges!
        </Typography>
      </EnhancedModal>
    </Container>
  );
}
