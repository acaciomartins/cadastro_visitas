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

const Graus = () => {
  const [graus, setGraus] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingGrau, setEditingGrau] = useState(null);
  const [formData, setFormData] = useState({
    numero: '',
    descricao: ''
  });
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [grauToDelete, setGrauToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredGraus, setFilteredGraus] = useState([]);
  const [filters, setFilters] = useState({
    numero: '',
    descricao: ''
  });
  const { execute, error } = useRequest();

  useEffect(() => {
    loadGraus();
  }, []);

  useEffect(() => {
    const filtered = graus.filter(grau => {
      const matchNumero = !filters.numero || grau.numero.toString().includes(filters.numero);
      const matchDescricao = !filters.descricao || grau.descricao.toLowerCase().includes(filters.descricao.toLowerCase());
      return matchNumero && matchDescricao;
    });
    setFilteredGraus(filtered);
    setPage(0);
  }, [filters, graus]);

  const loadGraus = async () => {
    try {
      const response = await execute(() => api.get('/graus'));
      setGraus(response.data);
    } catch (err) {
      console.error('Erro ao carregar graus:', err);
    }
  };

  const handleOpenDialog = (grau = null) => {
    if (grau) {
      setEditingGrau(grau);
      setFormData({
        numero: grau.numero,
        descricao: grau.descricao
      });
    } else {
      setEditingGrau(null);
      setFormData({
        numero: '',
        descricao: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingGrau(null);
    setFormData({
      numero: '',
      descricao: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingGrau) {
        await execute(() => api.put(`/graus/${editingGrau.id}`, formData));
        setSnackbar({
          open: true,
          message: 'Grau atualizado com sucesso!',
          severity: 'success'
        });
      } else {
        await execute(() => api.post('/graus', formData));
        setSnackbar({
          open: true,
          message: 'Grau registrado com sucesso!',
          severity: 'success'
        });
      }
      handleCloseDialog();
      loadGraus();
    } catch (err) {
      console.error('Erro ao salvar grau:', err);
      setSnackbar({
        open: true,
        message: 'Erro ao salvar grau. Por favor, tente novamente.',
        severity: 'error'
      });
    }
  };

  const handleDelete = (id) => {
    setGrauToDelete(id);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await execute(() => api.delete(`/graus/${grauToDelete}`));
      setSnackbar({
        open: true,
        message: 'Grau excluído com sucesso!',
        severity: 'success'
      });
      loadGraus();
    } catch (err) {
      console.error('Erro ao excluir grau:', err);
      setSnackbar({
        open: true,
        message: 'Erro ao excluir grau. Por favor, tente novamente.',
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
      numero: '',
      descricao: ''
    });
  };

  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Graus</Typography>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => handleOpenDialog()}
        >
          Novo Grau
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Número"
              value={filters.numero || ''}
              onChange={(e) => handleFilterChange('numero', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Descrição"
              value={filters.descricao || ''}
              onChange={(e) => handleFilterChange('descricao', e.target.value)}
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
              <TableCell>Número</TableCell>
              <TableCell>Descrição</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredGraus
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((grau) => (
                <TableRow key={grau.id}>
                  <TableCell>{grau.numero}</TableCell>
                  <TableCell>{grau.descricao}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpenDialog(grau)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(grau.id)}>
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
          count={filteredGraus.length}
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
          {editingGrau ? 'Editar Grau' : 'Novo Grau'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Número"
              value={formData.numero}
              onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Descrição"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              fullWidth
              required
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
            Tem certeza que deseja excluir este grau? Esta ação não pode ser desfeita.
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

export default Graus; 