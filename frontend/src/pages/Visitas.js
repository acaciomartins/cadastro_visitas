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
  FormControlLabel
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import api from '../services/api';
import { useLocation } from 'react-router-dom';

const Visitas = () => {
  const location = useLocation();
  const isListMode = location.pathname === '/visitas/lista';
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
      console.log('Iniciando carregamento de dados...');
      console.log('Modo de visualização:', isListMode ? 'Lista' : 'Cadastro');
      
      const [visitasResponse, lojasResponse, sessoesResponse, grausResponse, ritosResponse, potenciasResponse] = await Promise.all([
        api.get('/visitas'),
        api.get('/lojas'),
        api.get('/sessoes'),
        api.get('/graus'),
        api.get('/ritos'),
        api.get('/potencias')
      ]);

      console.log('Resposta da API de visitas:', visitasResponse.data);
      console.log('Número de visitas carregadas:', visitasResponse.data.length);
      
      setVisitas(visitasResponse.data);
      setLojas(lojasResponse.data);
      setSessoes(sessoesResponse.data);
      setGraus(grausResponse.data);
      setRitos(ritosResponse.data);
      setPotencias(potenciasResponse.data);
      
      console.log('Dados carregados com sucesso');
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      console.error('Detalhes do erro:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
    }
  };

  useEffect(() => {
    loadData();
  }, [isListMode]);

  const handleOpenDialog = (visita = null) => {
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
      } else {
        await api.post('/visitas', data);
      }
      handleCloseDialog();
      loadData();
    } catch (error) {
      console.error('Erro ao salvar visita:', error);
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
        <Typography variant="h5">{isListMode ? 'Lista de Visitas' : 'Registrar Visita'}</Typography>
        {!isListMode && (
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => handleOpenDialog()}
          >
            Nova Visita
          </Button>
        )}
      </Box>

      {isListMode ? (
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
              {visitas.map((visita) => (
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
        </TableContainer>
      ) : (
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
      )}
    </Container>
  );
};

export default Visitas; 