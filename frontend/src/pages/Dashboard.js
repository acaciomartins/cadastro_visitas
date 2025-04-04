import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { useRequest } from '../hooks/useRequest';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [visitas, setVisitas] = useState([]);
  const [error, setError] = useState(null);
  const { execute } = useRequest();

  const loadVisitas = async () => {
    try {
      const response = await execute(() => api.get('/visitas'));
      setVisitas(response.data);
    } catch (error) {
      setError('Erro ao carregar visitas');
      console.error('Erro ao carregar visitas:', error);
    }
  };

  useEffect(() => {
    loadVisitas();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta visita?')) {
      try {
        await api.delete(`/visitas/${id}`);
        loadVisitas();
      } catch (error) {
        console.error('Erro ao excluir visita:', error);
      }
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">Registrar Visita</Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/visitas/novo')}
                >
                  Nova Visita
                </Button>
              </Box>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Loja</TableCell>
                      <TableCell>Data</TableCell>
                      <TableCell>Rito</TableCell>
                      <TableCell>Grau</TableCell>
                      <TableCell>Potência</TableCell>
                      <TableCell>Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {visitas.map((visita) => (
                      <TableRow key={visita.id}>
                        <TableCell>{visita.loja?.nome}</TableCell>
                        <TableCell>{new Date(visita.data).toLocaleDateString()}</TableCell>
                        <TableCell>{visita.rito?.nome}</TableCell>
                        <TableCell>{visita.grau?.nome}</TableCell>
                        <TableCell>{visita.potencia?.nome}</TableCell>
                        <TableCell>
                          <IconButton
                            color="primary"
                            onClick={() => navigate(`/visitas/${visita.id}`)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleDelete(visita.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Dashboard; 