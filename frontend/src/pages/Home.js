import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Checkbox,
  FormControlLabel,
  CircularProgress
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import api from '../services/api';
import VisitasList from '../components/VisitasList';
import { parseISO } from 'date-fns';

const Home = () => {
  const [visitas, setVisitas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingVisita, setEditingVisita] = useState(null);
  const [lojas, setLojas] = useState([]);
  const [graus, setGraus] = useState([]);
  const [ritos, setRitos] = useState([]);
  const [potencias, setPotencias] = useState([]);
  const [sessoes, setSessoes] = useState([]);
  const [formData, setFormData] = useState({
    data: new Date(),
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
      const [
        visitasResponse,
        lojasResponse,
        sessoesResponse,
        grausResponse,
        ritosResponse,
        potenciasResponse
      ] = await Promise.all([
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEdit = (visita) => {
    setEditingVisita(visita);
    setFormData({
      data: parseISO(visita.data),
      loja_id: visita.loja?.id || '',
      sessao_id: visita.sessao?.id || '',
      grau_id: visita.grau?.id || '',
      rito_id: visita.rito?.id || '',
      potencia_id: visita.potencia?.id || '',
      prancha_presenca: visita.prancha_presenca || false,
      possui_certificado: visita.possui_certificado || false,
      registro_loja: visita.registro_loja || false,
      data_entrega_certificado: visita.data_entrega_certificado ? parseISO(visita.data_entrega_certificado) : null,
      certificado_scaniado: visita.certificado_scaniado || false,
      observacoes: visita.observacoes || ''
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingVisita(null);
    setFormData({
      data: new Date(),
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
      setLoading(true);
      const data = {
        ...formData,
        data: formData.data.toISOString().split('T')[0],
        data_entrega_certificado: formData.data_entrega_certificado 
          ? formData.data_entrega_certificado.toISOString().split('T')[0] 
          : null
      };

      if (editingVisita) {
        await api.put(`/visitas/${editingVisita.id}`, data);
      }

      await loadData();
      handleCloseDialog();
    } catch (error) {
      console.error('Erro ao salvar visita:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta visita?')) {
      try {
        await api.delete(`/visitas/${id}`);
        await loadData();
      } catch (error) {
        console.error('Erro ao deletar visita:', error);
      }
    }
  };

  return (
    <Container>
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Bem-vindo ao Sistema de Cadastro de Visitas
        </Typography>
        <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>
          Últimas Visitas Registradas
        </Typography>
        <Paper sx={{ p: 2 }}>
          <VisitasList 
            visitas={visitas}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </Paper>
      </Box>

      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Editar Visita
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                  <DatePicker
                    label="Data da Visita"
                    value={formData.data_visita}
                    onChange={(newDate) => setFormData({ ...formData, data: newDate })}
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

export default Home; 