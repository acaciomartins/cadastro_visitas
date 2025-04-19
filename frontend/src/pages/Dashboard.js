import React, { useState, useEffect, useCallback } from 'react';
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
  Alert,
  TablePagination
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import api from '../services/api';
import { useRequest } from '../hooks/useRequest';

const Dashboard = () => {
  const navigate = useNavigate();
  const [visitas, setVisitas] = useState([]);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const { execute } = useRequest();

  const formatDateForDisplay = (dateString) => {
    console.log('Data recebida:', dateString); // Debug
    if (!dateString) return '-';
    try {
      // Tentar diferentes formatos
      let date;
      
      // Se a data vier com timezone (formato ISO)
      if (dateString.includes('T')) {
        date = new Date(dateString);
      } 
      // Se vier no formato YYYY-MM-DD
      else if (dateString.includes('-')) {
        const [year, month, day] = dateString.split('-');
        date = new Date(year, month - 1, day);
      }
      // Se vier no formato DD/MM/YYYY
      else if (dateString.includes('/')) {
        const [day, month, year] = dateString.split('/');
        date = new Date(year, month - 1, day);
      }
      // Outros formatos
      else {
        date = new Date(dateString);
      }

      // Verificar se a data é válida
      if (isNaN(date.getTime())) {
        console.error('Data inválida:', dateString);
        return '-';
      }

      // Formatar no padrão brasileiro
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();

      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error('Erro ao formatar data:', error, 'Data recebida:', dateString);
      return '-';
    }
  };

  const loadVisitas = useCallback(async () => {
    try {
      const response = await execute(() => api.get('/visitas'));
      console.log('Dados recebidos:', response.data); // Debug
      setVisitas(response.data);
    } catch (error) {
      setError('Erro ao carregar visitas');
      console.error('Erro ao carregar visitas:', error);
    }
  }, [execute]);

  useEffect(() => {
    loadVisitas();
  }, [loadVisitas]);

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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard!
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
                    {visitas
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((visita) => (
                        <TableRow key={visita.id}>
                          <TableCell>{visita.loja?.nome || '-'}</TableCell>
                          <TableCell>{formatDateForDisplay(visita.data_visita)}</TableCell>
                          <TableCell>{visita.rito?.nome || '-'}</TableCell>
                          <TableCell>{visita.grau?.descricao || '-'}</TableCell>
                          <TableCell>{visita.potencia?.nome || '-'}</TableCell>
                          <TableCell>
                            <IconButton
                              color="primary"
                              onClick={() => navigate(`/visitas/editar/${visita.id}`)}
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
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
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
    </Container>
  );
};

export default Dashboard; 