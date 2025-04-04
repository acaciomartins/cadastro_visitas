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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  DialogContentText,
  TablePagination,
  Grid
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import api from '../services/api';
import useRequest from '../hooks/useRequest';

const estados = [
  { uf: 'AC', nome: 'Acre' },
  { uf: 'AL', nome: 'Alagoas' },
  { uf: 'AP', nome: 'Amapá' },
  { uf: 'AM', nome: 'Amazonas' },
  { uf: 'BA', nome: 'Bahia' },
  { uf: 'CE', nome: 'Ceará' },
  { uf: 'DF', nome: 'Distrito Federal' },
  { uf: 'ES', nome: 'Espírito Santo' },
  { uf: 'GO', nome: 'Goiás' },
  { uf: 'MA', nome: 'Maranhão' },
  { uf: 'MT', nome: 'Mato Grosso' },
  { uf: 'MS', nome: 'Mato Grosso do Sul' },
  { uf: 'MG', nome: 'Minas Gerais' },
  { uf: 'PA', nome: 'Pará' },
  { uf: 'PB', nome: 'Paraíba' },
  { uf: 'PR', nome: 'Paraná' },
  { uf: 'PE', nome: 'Pernambuco' },
  { uf: 'PI', nome: 'Piauí' },
  { uf: 'RJ', nome: 'Rio de Janeiro' },
  { uf: 'RN', nome: 'Rio Grande do Norte' },
  { uf: 'RS', nome: 'Rio Grande do Sul' },
  { uf: 'RO', nome: 'Rondônia' },
  { uf: 'RR', nome: 'Roraima' },
  { uf: 'SC', nome: 'Santa Catarina' },
  { uf: 'SP', nome: 'São Paulo' },
  { uf: 'SE', nome: 'Sergipe' },
  { uf: 'TO', nome: 'Tocantins' }
];

const Lojas = () => {
  const [lojas, setLojas] = useState([]);
  const [potencias, setPotencias] = useState([]);
  const [ritos, setRitos] = useState([]);
  const [orientes, setOrientes] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingLoja, setEditingLoja] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    numero: '',
    potencia_id: '',
    rito_id: '',
    oriente_nome: '',
    oriente_uf: ''
  });
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [lojaToDelete, setLojaToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredLojas, setFilteredLojas] = useState([]);
  const [filters, setFilters] = useState({
    nome: '',
    numero: '',
    potencia_id: '',
    rito_id: '',
    oriente_id: ''
  });
  const { execute, error } = useRequest();

  useEffect(() => {
    loadLojas();
    loadPotencias();
    loadRitos();
    loadOrientes();
  }, []);

  useEffect(() => {
    const filtered = lojas.filter(loja => {
      const matchNome = !filters.nome || loja.nome.toLowerCase().includes(filters.nome.toLowerCase());
      const matchNumero = !filters.numero || loja.numero.toLowerCase().includes(filters.numero.toLowerCase());
      const matchPotencia = !filters.potencia_id || loja.potencia_id === filters.potencia_id;
      const matchRito = !filters.rito_id || loja.rito_id === filters.rito_id;
      const matchOriente = !filters.oriente_id || loja.oriente_id === filters.oriente_id;

      return matchNome && matchNumero && matchPotencia && matchRito && matchOriente;
    });
    setFilteredLojas(filtered);
    setPage(0);
  }, [filters, lojas]);

  const loadLojas = async () => {
    try {
      const response = await execute(() => api.get('/lojas'));
      setLojas(response.data);
    } catch (err) {
      console.error('Erro ao carregar lojas:', err);
    }
  };

  const loadPotencias = async () => {
    try {
      const response = await execute(() => api.get('/potencias'));
      setPotencias(response.data);
    } catch (err) {
      console.error('Erro ao carregar potências:', err);
    }
  };

  const loadRitos = async () => {
    try {
      const response = await execute(() => api.get('/ritos'));
      setRitos(response.data);
    } catch (err) {
      console.error('Erro ao carregar ritos:', err);
    }
  };

  const loadOrientes = async () => {
    try {
      const response = await execute(() => api.get('/orientes'));
      setOrientes(response.data);
    } catch (err) {
      console.error('Erro ao carregar orientes:', err);
    }
  };

  const handleOpenDialog = (loja = null) => {
    if (loja) {
      setEditingLoja(loja);
      setFormData({
        nome: loja.nome,
        numero: loja.numero,
        potencia_id: loja.potencia_id,
        rito_id: loja.rito_id,
        oriente_nome: loja.oriente?.nome || '',
        oriente_uf: loja.oriente?.uf || ''
      });
    } else {
      setEditingLoja(null);
      setFormData({
        nome: '',
        numero: '',
        potencia_id: '',
        rito_id: '',
        oriente_nome: '',
        oriente_uf: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingLoja(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingLoja) {
        await execute(() => api.put(`/lojas/${editingLoja.id}`, formData));
        setSnackbar({
          open: true,
          message: 'Loja atualizada com sucesso!',
          severity: 'success'
        });
      } else {
        await execute(() => api.post('/lojas', formData));
        setSnackbar({
          open: true,
          message: 'Loja criada com sucesso!',
          severity: 'success'
        });
      }
      handleCloseDialog();
      loadLojas();
    } catch (err) {
      console.error('Erro ao salvar loja:', err);
      setSnackbar({
        open: true,
        message: 'Erro ao salvar loja. Por favor, tente novamente.',
        severity: 'error'
      });
    }
  };

  const handleDelete = (id) => {
    setLojaToDelete(id);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await execute(() => api.delete(`/lojas/${lojaToDelete}`));
      setSnackbar({
        open: true,
        message: 'Loja excluída com sucesso!',
        severity: 'success'
      });
      loadLojas();
    } catch (err) {
      console.error('Erro ao excluir loja:', err);
      setSnackbar({
        open: true,
        message: 'Erro ao excluir loja. Por favor, tente novamente.',
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
      nome: '',
      numero: '',
      potencia_id: '',
      rito_id: '',
      oriente_id: ''
    });
  };

  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Lojas</Typography>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => handleOpenDialog()}
        >
          Nova Loja
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
            <TextField
              fullWidth
              label="Número"
              value={filters.numero || ''}
              onChange={(e) => handleFilterChange('numero', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Potência</InputLabel>
              <Select
                value={filters.potencia_id || ''}
                onChange={(e) => handleFilterChange('potencia_id', e.target.value)}
                label="Potência"
              >
                <MenuItem value="">Todas</MenuItem>
                {potencias.map((potencia) => (
                  <MenuItem key={potencia.id} value={potencia.id}>
                    {potencia.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Rito</InputLabel>
              <Select
                value={filters.rito_id || ''}
                onChange={(e) => handleFilterChange('rito_id', e.target.value)}
                label="Rito"
              >
                <MenuItem value="">Todos</MenuItem>
                {ritos.map((rito) => (
                  <MenuItem key={rito.id} value={rito.id}>
                    {rito.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Oriente</InputLabel>
              <Select
                value={filters.oriente_id || ''}
                onChange={(e) => handleFilterChange('oriente_id', e.target.value)}
                label="Oriente"
              >
                <MenuItem value="">Todos</MenuItem>
                {orientes.map((oriente) => (
                  <MenuItem key={oriente.id} value={oriente.id}>
                    {oriente.nome} - {oriente.uf}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
              <TableCell>Número</TableCell>
              <TableCell>Potência</TableCell>
              <TableCell>Rito</TableCell>
              <TableCell>Oriente</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredLojas
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((loja) => (
                <TableRow key={loja.id}>
                  <TableCell>{loja.nome}</TableCell>
                  <TableCell>{loja.numero}</TableCell>
                  <TableCell>{loja.potencia?.nome}</TableCell>
                  <TableCell>{loja.rito?.nome}</TableCell>
                  <TableCell>{loja.oriente?.nome}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpenDialog(loja)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(loja.id)}>
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
          count={filteredLojas.length}
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
          {editingLoja ? 'Editar Loja' : 'Nova Loja'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Número"
                  value={formData.numero}
                  onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Potência</InputLabel>
                  <Select
                    value={formData.potencia_id}
                    onChange={(e) => setFormData({ ...formData, potencia_id: e.target.value })}
                    label="Potência"
                  >
                    {potencias.map((potencia) => (
                      <MenuItem key={potencia.id} value={potencia.id}>
                        {potencia.nome}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Rito</InputLabel>
                  <Select
                    value={formData.rito_id}
                    onChange={(e) => setFormData({ ...formData, rito_id: e.target.value })}
                    label="Rito"
                  >
                    {ritos.map((rito) => (
                      <MenuItem key={rito.id} value={rito.id}>
                        {rito.nome}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nome do Oriente"
                  value={formData.oriente_nome}
                  onChange={(e) => setFormData({ ...formData, oriente_nome: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>UF do Oriente</InputLabel>
                  <Select
                    value={formData.oriente_uf}
                    onChange={(e) => setFormData({ ...formData, oriente_uf: e.target.value })}
                    label="UF do Oriente"
                  >
                    {estados.map((estado) => (
                      <MenuItem key={estado.uf} value={estado.uf}>
                        {estado.nome}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
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
            Tem certeza que deseja excluir esta loja? Esta ação não pode ser desfeita.
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

export default Lojas; 