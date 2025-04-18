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

const Ritos = () => {
  const [ritos, setRitos] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingRito, setEditingRito] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: ''
  });

  useEffect(() => {
    loadRitos();
  }, []);

  const loadRitos = async () => {
    try {
      const response = await api.get('/ritos');
      setRitos(response.data);
    } catch (error) {
      console.error('Erro ao carregar ritos:', error);
    }
  };

  const handleOpenDialog = (rito = null) => {
    if (rito) {
      setEditingRito(rito);
      setFormData({
        nome: rito.nome,
        descricao: rito.descricao
      });
    } else {
      setEditingRito(null);
      setFormData({
        nome: '',
        descricao: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingRito(null);
    setFormData({
      nome: '',
      descricao: ''
    });
  };

  const handleSubmit = async () => {
    try {
      if (editingRito) {
        await api.put(`/ritos/${editingRito.id}`, formData);
      } else {
        await api.post('/ritos', formData);
      }
      handleCloseDialog();
      loadRitos();
    } catch (error) {
      console.error('Erro ao salvar rito:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este rito?')) {
      try {
        await api.delete(`/ritos/${id}`);
        loadRitos();
      } catch (error) {
        console.error('Erro ao excluir rito:', error);
      }
    }
  };

  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Ritos</Typography>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => handleOpenDialog()}
        >
          Novo Rito
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Descrição</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ritos.map((rito) => (
              <TableRow key={rito.id}>
                <TableCell>{rito.nome}</TableCell>
                <TableCell>{rito.descricao}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleOpenDialog(rito)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(rito.id)}>
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
          {editingRito ? 'Editar Rito' : 'Novo Rito'}
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
              label="Descrição"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              fullWidth
              multiline
              rows={4}
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

export default Ritos; 