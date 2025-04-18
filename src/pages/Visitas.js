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
  Grid,
  Checkbox,
  FormControlLabel,
  CircularProgress
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import api from '../services/api';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import VisitasList from '../components/VisitasList';

const formatDateForDisplay = (dateString) => {
  if (!dateString) return '-';
  try {
    // A data já vem no formato YYYY-MM-DD do backend
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  } catch (error) {
    console.error('Erro ao formatar data:', error, 'Data recebida:', dateString);
    return '-';
  }
};

const parseDate = (dateString) => {
  if (!dateString) return new Date();
  try {
    // A data vem no formato YYYY-MM-DD do backend
    return new Date(dateString);
  } catch (error) {
    console.error('Erro ao fazer parse da data:', error);
    return new Date();
  }
};

const Visitas = () => {
  const location = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [visitas, setVisitas] = useState([]);
  const [lojas, setLojas] = useState([]);
  const [graus, setGraus] = useState([]);
  const [ritos, setRitos] = useState([]);
  const [potencias, setPotencias] = useState([]);
  const [sessoes, setSessoes] = useState([]);
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

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('Iniciando carregamento de dados...');
      
      const [visitasResponse, lojasResponse, sessoesResponse, grausResponse, ritosResponse, potenciasResponse] = await Promise.all([
        api.get('/visitas'),
        api.get('/lojas'),
        api.get('/sessoes'),
        api.get('/graus'),
        api.get('/ritos'),
        api.get('/potencias')
      ]);

      console.log('Dados das visitas recebidos:', visitasResponse.data);
      
      setVisitas(visitasResponse.data);
      setLojas(lojasResponse.data);
      setSessoes(sessoesResponse.data);
      setGraus(grausResponse.data);
      setRitos(ritosResponse.data);
      setPotencias(potenciasResponse.data);

      // Se houver um ID na URL, carrega os dados da visita específica
      if (id) {
        const visitaToEdit = visitasResponse.data.find(v => v.id === parseInt(id));
        if (visitaToEdit) {
          handleOpenDialog(visitaToEdit);
        }
      }
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleOpenDialog = (visita = null) => {
    console.log('Abrindo diálogo com visita:', visita);
    if (visita) {
      try {
        setEditingVisita(visita);
        setFormData({
          ...visita,
          data_visita: new Date(visita.data_visita),
          data_entrega_certificado: visita.data_entrega_certificado ? new Date(visita.data_entrega_certificado) : null,
          prancha_presenca: Boolean(visita.prancha_presenca),
          possui_certificado: Boolean(visita.possui_certificado),
          registro_loja: Boolean(visita.registro_loja),
          certificado_scaniado: Boolean(visita.certificado_scaniado)
        });
      } catch (error) {
        console.error('Erro ao preparar dados para edição:', error);
      }
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
  };

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
    // Se estiver editando (tem ID na URL), volta para a lista de visitas
    if (id) {
      navigate('/visitas');
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      console.log('Submetendo formulário:', formData);
      
      const data = {
        ...formData,
        data_visita: formData.data_visita.toISOString().split('T')[0],
        data_entrega_certificado: formData.data_entrega_certificado ? formData.data_entrega_certificado.toISOString().split('T')[0] : null
      };

      console.log('Dados formatados para envio:', data);

      if (editingVisita) {
        console.log('Atualizando visita:', editingVisita.id);
        await api.put(`/visitas/${editingVisita.id}`, data);
      } else {
        console.log('Criando nova visita');
        await api.post('/visitas', data);
      }

      await loadData();
      handleCloseDialog();
    } catch (error) {
      console.error('Erro ao salvar visita:', error);
      console.error('Detalhes do erro:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta visita?')) {
      try {
        await api.delete(`/visitas/${id}`);
        loadData();
      } catch (error) {
        console.error('Erro ao excluir visita:', error);
      }
    }
  };

  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">{location.pathname === '/visitas/lista' ? 'Lista de Visitas' : 'Registrar Visita'}</Typography>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => handleOpenDialog()}
        >
          {location.pathname === '/visitas/lista' ? 'Nova Visita' : 'Registrar Visita'}
        </Button>
      </Box>

      {location.pathname === '/visitas/lista' && (
        <VisitasList 
          visitas={visitas}
          onEdit={handleOpenDialog}
          onDelete={handleDelete}
        />
      )}

      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        disableEscapeKeyDown
      >
        <DialogTitle>
          {editingVisita ? 'Editar Visita' : 'Nova Visita'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                    <DatePicker
                      label="Data da Visita"
                      value={formData.data_visita}
                      onChange={(date) => setFormData({ ...formData, data_visita: date })}
                      slotProps={{ textField: { fullWidth: true } }}
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
                      slotProps={{ textField: { fullWidth: true } }}
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
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Visitas; 