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
  TextField
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import api from '../services/api';

const Graus = () => {
  const [graus, setGraus] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingGrau, setEditingGrau] = useState(null);
  const [formData, setFormData] = useState({
    numero: '',
    descricao: ''
  });

  useEffect(() => {
    loadGraus();
  }, []);

  const loadGraus = async () => {
    try {
      const response = await api.get('/graus');
      setGraus(response.data);
    } catch (error) {
      console.error('Erro ao carregar graus:', error);
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

  const handleSubmit = async () => {
    try {
      if (editingGrau) {
        await api.put(`/graus/${editingGrau.id}`, formData);
      } else {
        await api.post('/graus', formData);
      }
      handleCloseDialog();
      loadGraus();
    } catch (error) {
      console.error('Erro ao salvar grau:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este grau?')) {
      try {
        await api.delete(`/graus/${id}`);
        loadGraus();
      } catch (error) {
        console.error('Erro ao excluir grau:', error);
      }
    }
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
            {graus.map((grau) => (
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
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {editingGrau ? 'Editar Grau' : 'Novo Grau'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Número"
              type="number"
              value={formData.numero}
              onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
              fullWidth
            />
            <TextField
              label="Descrição"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              fullWidth
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
    </Container>
  );
};

export default Graus; 