import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Paper, 
  Typography, 
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import useRequest from '../hooks/useRequest';

const Dashboard = () => {
  const navigate = useNavigate();
  const [visitas, setVisitas] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const { execute, error } = useRequest();

  useEffect(() => {
    loadVisitas();
  }, []);

  const loadVisitas = async () => {
    try {
      const response = await execute(() => api.get('/visitas'));
      setVisitas(response.data);
    } catch (err) {
      console.error('Erro ao carregar visitas:', err);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h5" gutterBottom>
              Bem-vindo ao Sistema de Cadastro de Visitas Maçônicas
            </Typography>
            <Typography variant="body1" paragraph>
              Utilize o menu lateral para acessar as funcionalidades do sistema.
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Sessões
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Button 
                  variant="contained" 
                  fullWidth
                  onClick={() => navigate('/sessoes')}
                >
                  Gerenciar Sessões
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button 
                  variant="contained" 
                  fullWidth
                  onClick={() => navigate('/visitas')}
                >
                  Registrar Visita
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Últimas Visitas
              </Typography>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/visitas/lista')}
              >
                Ver Todas
              </Button>
            </Box>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Data</TableCell>
                    <TableCell>Loja</TableCell>
                    <TableCell>Sessão</TableCell>
                    <TableCell>Grau</TableCell>
                    <TableCell>Rito</TableCell>
                    <TableCell>Potência</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {visitas
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((visita) => (
                      <TableRow key={visita.id}>
                        <TableCell>{new Date(visita.data_visita).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell>{visita.loja?.nome}</TableCell>
                        <TableCell>{visita.sessao?.descricao}</TableCell>
                        <TableCell>{visita.grau?.descricao}</TableCell>
                        <TableCell>{visita.rito?.nome}</TableCell>
                        <TableCell>{visita.potencia?.nome}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              <TablePagination
                rowsPerPageOptions={[5, 10]}
                component="div"
                count={visitas.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Linhas por página:"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
              />
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 