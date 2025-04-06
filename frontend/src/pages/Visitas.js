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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Checkbox,
  FormControlLabel,
  Snackbar,
  Alert,
  DialogContentText,
  TablePagination
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import api from '../services/api';
import { useLocation } from 'react-router-dom';
import useRequest from '../hooks/useRequest';

const Visitas = () => {
  const location = useLocation();
  const [visitas, setVisitas] = useState([]);
  const [lojas, setLojas] = useState([]);
  const [graus, setGraus] = useState([]);
  const [ritos, setRitos] = useState([]);
  const [potencias, setPotencias] = useState([]);
  const [sessoes, setSessoes] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingVisita, setEditingVisita] = useState(null);
  const [formData, setFormData] = useState({
    data_visita: new Date(),
    loja_id: '',
    sessao_id: '',
    grau_id: '',
    rito_id: '',
    potencia_id: '',
    prancha_presenca: false,
    possui_certificado: false,
    registro_loja: false,
    data_entrega_certificado: null,
    certificado_scaniado: false,
    observacoes: ''
  });
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [visitaToDelete, setVisitaToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [filteredVisitas, setFilteredVisitas] = useState([]);
  const [filters, setFilters] = useState({
    data_inicio: null,
    data_fim: null,
    loja_id: '',
    sessao_id: '',
    grau_id: '',
    rito_id: '',
    potencia_id: '',
    prancha_presenca: null,
    possui_certificado: null
  });
  const { error } = useRequest();

  const handleOpenDialog = useCallback((visita = null) => {
    if (visita) {
      setEditingVisita(visita);
      setFormData({
        data_visita: new Date(visita.data_visita),
        loja_id: visita.loja_id,
        sessao_id: visita.sessao_id,
        grau_id: visita.grau_id,
        rito_id: visita.rito_id,
        potencia_id: visita.potencia_id,
        prancha_presenca: visita.prancha_presenca,
        possui_certificado: visita.possui_certificado,
        registro_loja: visita.registro_loja,
        data_entrega_certificado: visita.data_entrega_certificado ? new Date(visita.data_entrega_certificado) : null,
        certificado_scaniado: visita.certificado_scaniado,
        observacoes: visita.observacoes
      });
    } else {
      setEditingVisita(null);
      setFormData({
        data_visita: new Date(),
        loja_id: '',
        sessao_id: '',
        grau_id: '',
        rito_id: '',
        potencia_id: '',
        prancha_presenca: false,
        possui_certificado: false,
        registro_loja: false,
        data_entrega_certificado: null,
        certificado_scaniado: false,
        observacoes: ''
      });
    }
    setOpenDialog(true);
  }, []);

  const loadData = useCallback(async () => {
    try {
      const [visitasResponse, lojasResponse, sessoesResponse, grausResponse, ritosResponse, potenciasResponse] = await Promise.all([
        api.get('/visitas'),
        api.get('/lojas'),
        api.get('/sessoes'),
        api.get('/graus'),
        api.get('/ritos'),
        api.get('/potencias')
      ]);
      
      setVisitas(visitasResponse.data);
      setLojas(lojasResponse.data);
      setSessoes(sessoesResponse.data);
      setGraus(grausResponse.data);
      setRitos(ritosResponse.data);
      setPotencias(potenciasResponse.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const shouldOpenDialog = location.pathname === '/visitas/novo';
    if (shouldOpenDialog && !openDialog) {
      handleOpenDialog();
    }
  }, [location.pathname]);

  useEffect(() => {
    const filtered = visitas.filter(visita => {
      const matchDataInicio = !filters.data_inicio || new Date(visita.data_visita) >= filters.data_inicio;
      const matchDataFim = !filters.data_fim || new Date(visita.data_visita) <= filters.data_fim;
      const matchLoja = !filters.loja_id || visita.loja_id === filters.loja_id;
      const matchSessao = !filters.sessao_id || visita.sessao_id === filters.sessao_id;
      const matchGrau = !filters.grau_id || visita.grau_id === filters.grau_id;
      const matchRito = !filters.rito_id || visita.rito_id === filters.rito_id;
      const matchPotencia = !filters.potencia_id || visita.potencia_id === filters.potencia_id;
      const matchPrancha = filters.prancha_presenca === null || visita.prancha_presenca === filters.prancha_presenca;
      const matchCertificado = filters.possui_certificado === null || visita.possui_certificado === filters.possui_certificado;

      return matchDataInicio && matchDataFim && matchLoja && matchSessao && matchGrau && 
             matchRito && matchPotencia && matchPrancha && matchCertificado;
    });
    setFilteredVisitas(filtered);
    setPage(0);
  }, [filters, visitas]);

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingVisita(null);
    setFormData({
      data_visita: new Date(),
      loja_id: '',
      sessao_id: '',
      grau_id: '',
      rito_id: '',
      potencia_id: '',
      prancha_presenca: false,
      possui_certificado: false,
      registro_loja: false,
      data_entrega_certificado: null,
      certificado_scaniado: false,
      observacoes: ''
    });
  };

  const handleDelete = async (id) => {
    setVisitaToDelete(id);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/visitas/${visitaToDelete}`);
      loadData();
      setSnackbar({
        open: true,
        message: 'Visita excluída com sucesso!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Erro ao excluir visita:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao excluir visita. Tente novamente.',
        severity: 'error'
      });
    } finally {
      setOpenDeleteDialog(false);
      setVisitaToDelete(null);
    }
  };

  const handleSubmit = async () => {
    try {
      const data = {
        ...formData,
        data_visita: formData.data_visita.toISOString().split('T')[0],
        data_entrega_certificado: formData.data_entrega_certificado ? formData.data_entrega_certificado.toISOString().split('T')[0] : null
      };

      if (editingVisita) {
        await api.put(`/visitas/${editingVisita.id}`, data);
        setSnackbar({
          open: true,
          message: 'Visita atualizada com sucesso!',
          severity: 'success'
        });
      } else {
        await api.post('/visitas', data);
        setSnackbar({
          open: true,
          message: 'Visita registrada com sucesso!',
          severity: 'success'
        });
      }
      handleCloseDialog();
      loadData();
    } catch (error) {
      console.error('Erro ao salvar visita:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao salvar visita. Tente novamente.',
        severity: 'error'
      });
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

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      data_inicio: null,
      data_fim: null,
      loja_id: '',
      sessao_id: '',
      grau_id: '',
      rito_id: '',
      potencia_id: '',
      prancha_presenca: null,
      possui_certificado: null
    });
  };

  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Visitas</Typography>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => handleOpenDialog()}
        >
          Nova Visita
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Data Início"
              type="date"
              value={filters.data_inicio || ''}
              onChange={(e) => handleFilterChange('data_inicio', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Data Fim"
              type="date"
              value={filters.data_fim || ''}
              onChange={(e) => handleFilterChange('data_fim', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Loja</InputLabel>
              <Select
                value={filters.loja_id || ''}
                onChange={(e) => handleFilterChange('loja_id', e.target.value)}
                label="Loja"
              >
                <MenuItem value="">Todas</MenuItem>
                {lojas.map((loja) => (
                  <MenuItem key={loja.id} value={loja.id}>
                    {loja.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Sessão</InputLabel>
              <Select
                value={filters.sessao_id || ''}
                onChange={(e) => handleFilterChange('sessao_id', e.target.value)}
                label="Sessão"
              >
                <MenuItem value="">Todas</MenuItem>
                {sessoes.map((sessao) => (
                  <MenuItem key={sessao.id} value={sessao.id}>
                    {sessao.descricao}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Grau</InputLabel>
              <Select
                value={filters.grau_id || ''}
                onChange={(e) => handleFilterChange('grau_id', e.target.value)}
                label="Grau"
              >
                <MenuItem value="">Todos</MenuItem>
                {graus.map((grau) => (
                  <MenuItem key={grau.id} value={grau.id}>
                    {grau.numero} - {grau.descricao}
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
              <InputLabel>Prancha de Presença</InputLabel>
              <Select
                value={filters.prancha_presenca || ''}
                onChange={(e) => handleFilterChange('prancha_presenca', e.target.value)}
                label="Prancha de Presença"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="true">Sim</MenuItem>
                <MenuItem value="false">Não</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Certificado</InputLabel>
              <Select
                value={filters.possui_certificado || ''}
                onChange={(e) => handleFilterChange('possui_certificado', e.target.value)}
                label="Certificado"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="true">Sim</MenuItem>
                <MenuItem value="false">Não</MenuItem>
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
              <TableCell>Data</TableCell>
              <TableCell>Loja</TableCell>
              <TableCell>Sessão</TableCell>
              <TableCell>Grau</TableCell>
              <TableCell>Rito</TableCell>
              <TableCell>Potência</TableCell>
              <TableCell>Prancha</TableCell>
              <TableCell>Certificado</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredVisitas
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((visita) => (
              <TableRow key={visita.id}>
                <TableCell>{new Date(visita.data_visita).toLocaleDateString('pt-BR')}</TableCell>
                <TableCell>{visita.loja?.nome}</TableCell>
                <TableCell>{visita.sessao?.descricao}</TableCell>
                <TableCell>{visita.grau?.descricao}</TableCell>
                <TableCell>{visita.rito?.nome}</TableCell>
                <TableCell>{visita.potencia?.nome}</TableCell>
                <TableCell>{visita.prancha_presenca ? 'Sim' : 'Não'}</TableCell>
                <TableCell>{visita.possui_certificado ? 'Sim' : 'Não'}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleOpenDialog(visita)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(visita.id)}>
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
          count={filteredVisitas.length}
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
          {editingVisita ? 'Editar Visita' : 'Nova Visita'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                  <DatePicker
                    label="Data da Visita"
                    value={formData.data_visita}
                    onChange={(date) => setFormData({ ...formData, data_visita: date })}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Loja</InputLabel>
                  <Select
                    value={formData.loja_id}
                    onChange={(e) => setFormData({ ...formData, loja_id: e.target.value })}
                    label="Loja"
                  >
                    {lojas.map((loja) => (
                      <MenuItem key={loja.id} value={loja.id}>
                        {loja.nome}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Sessão</InputLabel>
                  <Select
                    value={formData.sessao_id}
                    onChange={(e) => setFormData({ ...formData, sessao_id: e.target.value })}
                    label="Sessão"
                  >
                    {sessoes.map((sessao) => (
                      <MenuItem key={sessao.id} value={sessao.id}>
                        {sessao.descricao}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Grau</InputLabel>
                  <Select
                    value={formData.grau_id}
                    onChange={(e) => setFormData({ ...formData, grau_id: e.target.value })}
                    label="Grau"
                  >
                    {graus.map((grau) => (
                      <MenuItem key={grau.id} value={grau.id}>
                        {grau.descricao}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
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
                <FormControl fullWidth>
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
              <Grid item xs={12} md={4}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.prancha_presenca}
                      onChange={(e) => setFormData({ ...formData, prancha_presenca: e.target.checked })}
                    />
                  }
                  label="Prancha de Presença"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.possui_certificado}
                      onChange={(e) => setFormData({ ...formData, possui_certificado: e.target.checked })}
                    />
                  }
                  label="Possui Certificado"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.registro_loja}
                      onChange={(e) => setFormData({ ...formData, registro_loja: e.target.checked })}
                    />
                  }
                  label="Registro na Loja"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                  <DatePicker
                    label="Data de Entrega do Certificado"
                    value={formData.data_entrega_certificado}
                    onChange={(date) => setFormData({ ...formData, data_entrega_certificado: date })}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.certificado_scaniado}
                      onChange={(e) => setFormData({ ...formData, certificado_scaniado: e.target.checked })}
                    />
                  }
                  label="Certificado Scaniado"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Observações"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  fullWidth
                  multiline
                  rows={4}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de confirmação de exclusão */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir esta visita? Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancelar</Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Visitas; 