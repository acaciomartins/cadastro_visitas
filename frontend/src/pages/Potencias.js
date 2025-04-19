import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, 
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  DialogContentText,
  TablePagination,
  Grid
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import api from '../services/api';
import useRequest from '../hooks/useRequest';

const Potencias = () => {
  const [potencias, setPotencias] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPotencia, setEditingPotencia] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    sigla: ''
  });
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({
    nome: '',
    sigla: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [potenciaToDelete, setPotenciaToDelete] = useState(null);
  const [filteredPotencias, setFilteredPotencias] = useState([]);
  const [filters, setFilters] = useState({
    nome: '',
    sigla: ''
  });
  const { execute } = useRequest();

  const loadPotencias = useCallback(async (retryCount = 0) => {
    try {
      const response = await execute(() => api.get('/potencias'));
      setPotencias(response.data);
      setError(null);
    } catch (err) {
      console.error('Erro ao carregar potências:', err);
      
      // Tenta novamente em caso de erro de rede (máximo de 3 tentativas)
      if ((err.isNetworkError || err.response?.status === 0) && retryCount < 3) {
        console.log(`Tentativa ${retryCount + 1} de 3 para carregar potências...`);
        setTimeout(() => {
          loadPotencias(retryCount + 1);
        }, 1000 * (retryCount + 1)); // Aumenta o tempo entre tentativas
        return;
      }
      
      let errorMessage = 'Erro ao carregar potências. ';
      if (err.isNetworkError || err.response?.status === 0) {
        errorMessage += 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.';
      } else if (err.response?.status === 401) {
        errorMessage += 'Sua sessão expirou. Por favor, faça login novamente.';
      } else if (err.response?.data?.error) {
        errorMessage += err.response.data.error;
      } else {
        errorMessage += 'Por favor, tente novamente mais tarde.';
      }
      
      setError(errorMessage);
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
      
      if (err.response?.status === 401 && !window.location.pathname.includes('/login')) {
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
    }
  }, [execute]);

  // Adiciona um efeito para recarregar os dados quando houver erro de rede
  useEffect(() => {
    const handleOnline = () => {
      if (error?.includes('conexão')) {
        loadPotencias();
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [error, loadPotencias]);

  useEffect(() => {
    loadPotencias();
  }, [loadPotencias]);

  useEffect(() => {
    const filtered = potencias.filter(potencia => {
      const matchNome = !filters.nome || potencia.nome.toLowerCase().includes(filters.nome.toLowerCase());
      const matchSigla = !filters.sigla || potencia.sigla.toLowerCase().includes(filters.sigla.toLowerCase());
      return matchNome && matchSigla;
    });
    setFilteredPotencias(filtered);
    setPage(0);
  }, [filters, potencias]);

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    if (!formData.nome.trim()) {
      errors.nome = 'O nome é obrigatório';
      isValid = false;
    } else if (formData.nome.length > 100) {
      errors.nome = 'O nome deve ter no máximo 100 caracteres';
      isValid = false;
    }

    if (!formData.sigla.trim()) {
      errors.sigla = 'A sigla é obrigatória';
      isValid = false;
    } else if (formData.sigla.length > 10) {
      errors.sigla = 'A sigla deve ter no máximo 10 caracteres';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleOpenDialog = (potencia = null) => {
    setError(null);
    setFormErrors({ nome: '', sigla: '' });
    if (potencia) {
      setEditingPotencia(potencia);
      setFormData({
        nome: potencia.nome,
        sigla: potencia.sigla
      });
    } else {
      setEditingPotencia(null);
      setFormData({
        nome: '',
        sigla: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPotencia(null);
    setFormData({
      nome: '',
      sigla: ''
    });
    setError(null);
    setFormErrors({ nome: '', sigla: '' });
  };

  const handleDelete = async (id) => {
    setPotenciaToDelete(id);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await execute(() => api.delete(`/potencias/${potenciaToDelete}`));
      setSnackbar({
        open: true,
        message: 'Potência excluída com sucesso!',
        severity: 'success'
      });
      loadPotencias();
    } catch (err) {
      console.error('Erro ao excluir potência:', err);
      setSnackbar({
        open: true,
        message: 'Erro ao excluir potência. Por favor, tente novamente.',
        severity: 'error'
      });
    }
    setOpenDeleteDialog(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      setFormErrors({ nome: '', sigla: '' });

      if (!validateForm()) {
        return;
      }

      const data = {
        nome: formData.nome.trim(),
        sigla: formData.sigla.trim()
      };

      if (editingPotencia) {
        await execute(() => api.put(`/potencias/${editingPotencia.id}`, data));
        setSnackbar({
          open: true,
          message: 'Potência atualizada com sucesso!',
          severity: 'success'
        });
      } else {
        await execute(() => api.post('/potencias', data));
        setSnackbar({
          open: true,
          message: 'Potência registrada com sucesso!',
          severity: 'success'
        });
      }
      handleCloseDialog();
      loadPotencias();
    } catch (err) {
      console.error('Erro ao salvar potência:', err);
      setSnackbar({
        open: true,
        message: 'Erro ao salvar potência. Por favor, tente novamente.',
        severity: 'error'
      });
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      nome: '',
      sigla: ''
    });
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Potências
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => handleOpenDialog()}
          >
            Nova Potência
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Nome"
                value={filters.nome || ''}
                onChange={(e) => handleFilterChange('nome', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Sigla"
                value={filters.sigla || ''}
                onChange={(e) => handleFilterChange('sigla', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                onClick={clearFilters}
                sx={{ height: '56px' }}
              >
                Limpar Filtros
              </Button>
            </Grid>
          </Grid>
        </Paper>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Sigla</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPotencias
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((potencia) => (
                  <TableRow key={potencia.id}>
                    <TableCell>{potencia.nome}</TableCell>
                    <TableCell>{potencia.sigla}</TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => handleOpenDialog(potencia)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(potencia.id)}>
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
            count={filteredPotencias.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Linhas por página:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
          />
        </TableContainer>

        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>
            {editingPotencia ? 'Editar Potência' : 'Nova Potência'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                error={!!formErrors.nome}
                helperText={formErrors.nome}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Sigla"
                value={formData.sigla}
                onChange={(e) => setFormData({ ...formData, sigla: e.target.value })}
                error={!!formErrors.sigla}
                helperText={formErrors.sigla}
                margin="normal"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button onClick={handleSubmit} variant="contained" color="primary">
              Salvar
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={openDeleteDialog}
          onClose={() => setOpenDeleteDialog(false)}
        >
          <DialogTitle>Confirmar Exclusão</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Tem certeza que deseja excluir esta potência? Esta ação não pode ser desfeita.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDeleteDialog(false)}>Cancelar</Button>
            <Button onClick={handleConfirmDelete} color="error" autoFocus>
              Excluir
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert 
            onClose={() => setSnackbar({ ...snackbar, open: false })} 
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export default Potencias; 