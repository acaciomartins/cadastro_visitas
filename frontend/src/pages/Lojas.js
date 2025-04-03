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
  InputLabel
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import api from '../services/api';

const Lojas = () => {
  const [lojas, setLojas] = useState([]);
  const [potencias, setPotencias] = useState([]);
  const [ritos, setRitos] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingLoja, setEditingLoja] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    numero: '',
    potencia_id: '',
    rito_id: ''
  });

  useEffect(() => {
    loadLojas();
    loadPotencias();
    loadRitos();
  }, []);

  const loadLojas = async () => {
    try {
      const response = await api.get('/lojas');
      setLojas(response.data);
    } catch (error) {
      console.error('Erro ao carregar lojas:', error);
    }
  };

  const loadPotencias = async () => {
    try {
      const response = await api.get('/potencias');
      setPotencias(response.data);
    } catch (error) {
      console.error('Erro ao carregar potências:', error);
    }
  };

  const loadRitos = async () => {
    try {
      const response = await api.get('/ritos');
      setRitos(response.data);
    } catch (error) {
      console.error('Erro ao carregar ritos:', error);
    }
  };

  const handleOpenDialog = (loja = null) => {
    if (loja) {
      setEditingLoja(loja);
      setFormData({
        nome: loja.nome,
        numero: loja.numero,
        potencia_id: loja.potencia_id,
        rito_id: loja.rito_id
      });
    } else {
      setEditingLoja(null);
      setFormData({
        nome: '',
        numero: '',
        potencia_id: '',
        rito_id: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingLoja(null);
    setFormData({
      nome: '',
      numero: '',
      potencia_id: '',
      rito_id: ''
    });
  };

  const handleSubmit = async () => {
    try {
      if (editingLoja) {
        await api.put(`/lojas/${editingLoja.id}`, formData);
      } else {
        await api.post('/lojas', formData);
      }
      handleCloseDialog();
      loadLojas();
    } catch (error) {
      console.error('Erro ao salvar loja:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta loja?')) {
      try {
        await api.delete(`/lojas/${id}`);
        loadLojas();
      } catch (error) {
        console.error('Erro ao excluir loja:', error);
      }
    }
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

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Número</TableCell>
              <TableCell>Potência</TableCell>
              <TableCell>Rito</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lojas.map((loja) => (
              <TableRow key={loja.id}>
                <TableCell>{loja.nome}</TableCell>
                <TableCell>{loja.numero}</TableCell>
                <TableCell>{loja.potencia?.nome}</TableCell>
                <TableCell>{loja.rito?.nome}</TableCell>
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
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {editingLoja ? 'Editar Loja' : 'Nova Loja'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              fullWidth
            />
            <TextField
              label="Número"
              value={formData.numero}
              onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
              fullWidth
            />
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

export default Lojas; 