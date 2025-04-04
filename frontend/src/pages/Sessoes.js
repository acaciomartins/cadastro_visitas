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
  InputAdornment,
  Grid
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon, ArrowUpward as ArrowUpwardIcon, ArrowDownward as ArrowDownwardIcon } from '@mui/icons-material';
import api from '../services/api';
import { LoadingButton } from '@mui/lab';
import useRequest from '../hooks/useRequest';

const Sessoes = () => {
  const [sessoes, setSessoes] = useState([]);
  const [filteredSessoes, setFilteredSessoes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSessao, setEditingSessao] = useState(null);
  const [formData, setFormData] = useState({
    descricao: ''
  });
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [sessaoToDelete, setSessaoToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [orderBy, setOrderBy] = useState('id');
  const [order, setOrder] = useState('asc');
  const [loading, setLoading] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [filters, setFilters] = useState({
    descricao: ''
  });
  const { execute, error } = useRequest();

  useEffect(() => {
    loadSessoes();
  }, []);

  useEffect(() => {
    const filtered = sessoes.filter(sessao => {
      const matchDescricao = !filters.descricao || sessao.descricao.toLowerCase().includes(filters.descricao.toLowerCase());
      return matchDescricao;
    });
    setFilteredSessoes(filtered);
    setPage(0);
  }, [filters, sessoes]);

  const loadSessoes = async () => {
    setLoading(true);
    try {
      const response = await execute(() => api.get('/sessoes'));
      setSessoes(response.data);
    } catch (err) {
      console.error('Erro ao carregar sessões:', err);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar sessões. Por favor, tente novamente.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (sessao = null) => {
    if (sessao) {
      setEditingSessao(sessao);
      setFormData({
        descricao: sessao.descricao
      });
    } else {
      setEditingSessao(null);
      setFormData({
        descricao: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingSessao(null);
    setFormData({
      descricao: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingSessao) {
        await execute(() => api.put(`/sessoes/${editingSessao.id}`, formData));
        setSnackbar({
          open: true,
          message: 'Sessão atualizada com sucesso!',
          severity: 'success'
        });
      } else {
        await execute(() => api.post('/sessoes', formData));
        setSnackbar({
          open: true,
          message: 'Sessão registrada com sucesso!',
          severity: 'success'
        });
      }
      handleCloseDialog();
      loadSessoes();
    } catch (err) {
      console.error('Erro ao salvar sessão:', err);
      setSnackbar({
        open: true,
        message: 'Erro ao salvar sessão. Por favor, tente novamente.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    setSessaoToDelete(id);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    setLoadingDelete(true);
    try {
      await execute(() => api.delete(`/sessoes/${sessaoToDelete}`));
      setSnackbar({
        open: true,
        message: 'Sessão excluída com sucesso!',
        severity: 'success'
      });
      loadSessoes();
    } catch (err) {
      console.error('Erro ao excluir sessão:', err);
      setSnackbar({
        open: true,
        message: 'Erro ao excluir sessão. Por favor, tente novamente.',
        severity: 'error'
      });
    } finally {
      setLoadingDelete(false);
      setOpenDeleteDialog(false);
      setSessaoToDelete(null);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSort = (field) => {
    const isAsc = orderBy === field && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(field);
  };

  const getSortedSessoes = () => {
    return [...filteredSessoes].sort((a, b) => {
      if (orderBy === 'id') {
        return order === 'asc' ? a.id - b.id : b.id - a.id;
      }
      if (orderBy === 'descricao') {
        return order === 'asc' 
          ? a.descricao.localeCompare(b.descricao)
          : b.descricao.localeCompare(a.descricao);
      }
      if (orderBy === 'created_at' || orderBy === 'updated_at') {
        return order === 'asc'
          ? new Date(a[orderBy]) - new Date(b[orderBy])
          : new Date(b[orderBy]) - new Date(a[orderBy]);
      }
      return 0;
    });
  };

  const renderSortIcon = (field) => {
    if (orderBy !== field) return null;
    return order === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />;
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      descricao: ''
    });
  };

  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Sessões</Typography>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => handleOpenDialog()}
        >
          Nova Sessão
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Descrição"
              value={filters.descricao}
              onChange={(e) => handleFilterChange('descricao', e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="outlined" 
                onClick={clearFilters}
                sx={{ mr: 1 }}
              >
                Limpar Filtros
              </Button>
            </Box>
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
              <TableCell 
                onClick={() => handleSort('id')}
                sx={{ cursor: 'pointer' }}
              >
                ID {renderSortIcon('id')}
              </TableCell>
              <TableCell 
                onClick={() => handleSort('descricao')}
                sx={{ cursor: 'pointer' }}
              >
                Descrição {renderSortIcon('descricao')}
              </TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getSortedSessoes()
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((sessao) => (
                <TableRow key={sessao.id}>
                  <TableCell>{sessao.id}</TableCell>
                  <TableCell>{sessao.descricao}</TableCell>
                  <TableCell align="right">
                    <IconButton 
                      onClick={() => handleOpenDialog(sessao)}
                      color="primary"
                      title="Editar"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleDelete(sessao.id)}
                      color="error"
                      title="Excluir"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            {filteredSessoes.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  Nenhuma sessão encontrada
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredSessoes.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Linhas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingSessao ? 'Editar Sessão' : 'Nova Sessão'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Descrição"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              fullWidth
              required
              error={!formData.descricao}
              helperText={!formData.descricao ? 'A descrição é obrigatória' : ''}
              autoFocus
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={loading}>
            Cancelar
          </Button>
          <LoadingButton 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            loading={loading}
            disabled={!formData.descricao}
          >
            {editingSessao ? 'Salvar Alterações' : 'Criar Sessão'}
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openDeleteDialog}
        onClose={() => !loadingDelete && setOpenDeleteDialog(false)}
      >
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir a sessão "{sessoes.find(s => s.id === sessaoToDelete)?.descricao}"?
            Esta ação não pode ser desfeita e afetará todas as visitas associadas a esta sessão.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} disabled={loadingDelete}>
            Cancelar
          </Button>
          <LoadingButton 
            onClick={handleConfirmDelete} 
            color="error" 
            variant="contained"
            loading={loadingDelete}
          >
            Excluir
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Sessoes; 