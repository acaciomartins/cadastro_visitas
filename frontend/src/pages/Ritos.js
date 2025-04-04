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
  Snackbar,
  Alert,
  DialogContentText,
  TablePagination,
  Grid
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import api from '../services/api';
import useRequest from '../hooks/useRequest';

const Ritos = () => {
  const [ritos, setRitos] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingRito, setEditingRito] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: ''
  });
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [ritoToDelete, setRitoToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRitos, setFilteredRitos] = useState([]);
  const [filters, setFilters] = useState({
    nome: ''
  });
  const { execute, error } = useRequest();

  useEffect(() => {
    loadRitos();
  }, []);

  useEffect(() => {
    const filtered = ritos.filter(rito => {
      const matchNome = !filters.nome || rito.nome.toLowerCase().includes(filters.nome.toLowerCase());
      return matchNome;
    });
    setFilteredRitos(filtered);
    setPage(0);
  }, [filters, ritos]);

  const loadRitos = async () => {
    try {
      const response = await execute(() => api.get('/ritos'));
      setRitos(response.data);
    } catch (err) {
      console.error('Erro ao carregar ritos:', err);
    }
  };

  const handleOpenDialog = (rito = null) => {
    if (rito) {
      setEditingRito(rito);
      setFormData({
        nome: rito.nome,
        descricao: rito.descricao
      });
    } else {
      setEditingRito(null);
      setFormData({
        nome: '',
        descricao: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingRito(null);
    setFormData({
      nome: '',
      descricao: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRito) {
        await execute(() => api.put(`/ritos/${editingRito.id}`, formData));
        setSnackbar({
          open: true,
          message: 'Rito atualizado com sucesso!',
          severity: 'success'
        });
      } else {
        await execute(() => api.post('/ritos', formData));
        setSnackbar({
          open: true,
          message: 'Rito registrado com sucesso!',
          severity: 'success'
        });
      }
      handleCloseDialog();
      loadRitos();
    } catch (err) {
      console.error('Erro ao salvar rito:', err);
      setSnackbar({
        open: true,
        message: 'Erro ao salvar rito. Por favor, tente novamente.',
        severity: 'error'
      });
    }
  };

  const handleDelete = (id) => {
    setRitoToDelete(id);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await execute(() => api.delete(`/ritos/${ritoToDelete}`));
      setSnackbar({
        open: true,
        message: 'Rito excluído com sucesso!',
        severity: 'success'
      });
      loadRitos();
    } catch (err) {
      console.error('Erro ao excluir rito:', err);
      setSnackbar({
        open: true,
        message: 'Erro ao excluir rito. Por favor, tente novamente.',
        severity: 'error'
      });
    }
    setOpenDeleteDialog(false);
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
      nome: ''
    });
  };

  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Ritos</Typography>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => handleOpenDialog()}
        >
          Novo Rito
        </Button>
      </Box>

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
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRitos
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((rito) => (
                <TableRow key={rito.id}>
                  <TableCell>{rito.nome}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpenDialog(rito)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(rito.id)}>
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
          count={filteredRitos.length}
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
          {editingRito ? 'Editar Rito' : 'Novo Rito'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Descrição"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              fullWidth
              multiline
              rows={4}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
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
            Tem certeza que deseja excluir este rito? Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancelar</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Ritos; 