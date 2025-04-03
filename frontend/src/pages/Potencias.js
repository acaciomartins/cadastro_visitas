import React, { useState, useEffect } from 'react';
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
  Snackbar
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import api from '../services/api';

const Potencias = () => {
  const [potencias, setPotencias] = useState([]);
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
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    loadPotencias();
  }, []);

  const loadPotencias = async () => {
    try {
      const response = await api.get('/potencias');
      setPotencias(response.data);
    } catch (error) {
      console.error('Erro ao carregar potências:', error);
      setError('Erro ao carregar potências');
      setSnackbarOpen(true);
    }
  };

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

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const handleSubmit = async () => {
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

      console.log('Dados a serem enviados:', data);
      console.log('Token:', localStorage.getItem('token'));

      if (editingPotencia) {
        await api.put(`/potencias/${editingPotencia.id}`, data);
      } else {
        await api.post('/potencias', data);
      }
      handleCloseDialog();
      loadPotencias();
    } catch (error) {
      console.error('Erro ao salvar potência:', error);
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError('Erro ao salvar potência. Verifique os dados e tente novamente.');
      }
      setSnackbarOpen(true);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta potência?')) {
      try {
        await api.delete(`/potencias/${id}`);
        loadPotencias();
      } catch (error) {
        console.error('Erro ao excluir potência:', error);
        setError('Erro ao excluir potência');
        setSnackbarOpen(true);
      }
    }
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
              {potencias.map((potencia) => (
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

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={handleSnackbarClose} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export default Potencias; 