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
  Grid
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import api from '../services/api';

const Visitas = () => {
  const [visitas, setVisitas] = useState([]);
  const [lojas, setLojas] = useState([]);
  const [graus, setGraus] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingVisita, setEditingVisita] = useState(null);
  const [formData, setFormData] = useState({
    data: new Date(),
    loja_id: '',
    grau_id: '',
    nome_visitante: '',
    cargo: '',
    observacoes: ''
  });

  useEffect(() => {
    loadVisitas();
    loadLojas();
    loadGraus();
  }, []);

  const loadVisitas = async () => {
    try {
      const response = await api.get('/visitas');
      setVisitas(response.data);
    } catch (error) {
      console.error('Erro ao carregar visitas:', error);
    }
  };

  const loadLojas = async () => {
    try {
      const response = await api.get('/lojas');
      setLojas(response.data);
    } catch (error) {
      console.error('Erro ao carregar lojas:', error);
    }
  };

  const loadGraus = async () => {
    try {
      const response = await api.get('/graus');
      setGraus(response.data);
    } catch (error) {
      console.error('Erro ao carregar graus:', error);
    }
  };

  const handleOpenDialog = (visita = null) => {
    if (visita) {
      setEditingVisita(visita);
      setFormData({
        data: new Date(visita.data),
        loja_id: visita.loja_id,
        grau_id: visita.grau_id,
        nome_visitante: visita.nome_visitante,
        cargo: visita.cargo,
        observacoes: visita.observacoes
      });
    } else {
      setEditingVisita(null);
      setFormData({
        data: new Date(),
        loja_id: '',
        grau_id: '',
        nome_visitante: '',
        cargo: '',
        observacoes: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingVisita(null);
    setFormData({
      data: new Date(),
      loja_id: '',
      grau_id: '',
      nome_visitante: '',
      cargo: '',
      observacoes: ''
    });
  };

  const handleSubmit = async () => {
    try {
      if (editingVisita) {
        await api.put(`/visitas/${editingVisita.id}`, formData);
      } else {
        await api.post('/visitas', formData);
      }
      handleCloseDialog();
      loadVisitas();
    } catch (error) {
      console.error('Erro ao salvar visita:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta visita?')) {
      try {
        await api.delete(`/visitas/${id}`);
        loadVisitas();
      } catch (error) {
        console.error('Erro ao excluir visita:', error);
      }
    }
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

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Data</TableCell>
              <TableCell>Visitante</TableCell>
              <TableCell>Cargo</TableCell>
              <TableCell>Loja</TableCell>
              <TableCell>Grau</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visitas.map((visita) => (
              <TableRow key={visita.id}>
                <TableCell>{new Date(visita.data).toLocaleDateString('pt-BR')}</TableCell>
                <TableCell>{visita.nome_visitante}</TableCell>
                <TableCell>{visita.cargo}</TableCell>
                <TableCell>{visita.loja?.nome}</TableCell>
                <TableCell>{visita.grau?.nome}</TableCell>
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
                    label="Data"
                    value={formData.data}
                    onChange={(date) => setFormData({ ...formData, data: date })}
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
                  <InputLabel>Grau</InputLabel>
                  <Select
                    value={formData.grau_id}
                    onChange={(e) => setFormData({ ...formData, grau_id: e.target.value })}
                    label="Grau"
                  >
                    {graus.map((grau) => (
                      <MenuItem key={grau.id} value={grau.id}>
                        {grau.nome}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Nome do Visitante"
                  value={formData.nome_visitante}
                  onChange={(e) => setFormData({ ...formData, nome_visitante: e.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Cargo"
                  value={formData.cargo}
                  onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                  fullWidth
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
          <Button onClick={handleSubmit} variant="contained">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Visitas; 