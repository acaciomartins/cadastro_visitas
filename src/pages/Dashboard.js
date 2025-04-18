import React from 'react';
import { 
  Grid, 
  Paper, 
  Typography, 
  Box,
  Button
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h5" gutterBottom>
              Bem-vindo ao Sistema de Cadastro de Visitas Maçônicas
            </Typography>
            <Typography variant="body1" paragraph>
              Utilize o menu abaixo para acessar as funcionalidades do sistema.
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Cadastros
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button 
                variant="contained" 
                onClick={() => navigate('/potencias')}
              >
                Potências
              </Button>
              <Button 
                variant="contained" 
                onClick={() => navigate('/ritos')}
              >
                Ritos
              </Button>
              <Button 
                variant="contained" 
                onClick={() => navigate('/graus')}
              >
                Graus
              </Button>
              <Button 
                variant="contained" 
                onClick={() => navigate('/lojas')}
              >
                Lojas
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Visitas
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button 
                variant="contained" 
                onClick={() => navigate('/visitas')}
              >
                Registrar Visita
              </Button>
              <Button 
                variant="contained" 
                onClick={() => navigate('/visitas/lista')}
              >
                Listar Visitas
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 