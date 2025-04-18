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

const Sessoes = () => {
  const [sessoes, setSessoes] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSessao, setEditingSessao] = useState(null);
  const [formData, setFormData] = useState({
    descricao: ''
  });

  useEffect(() => {
    loadSessoes();
  }, []);

  const loadSessoes = async () => {
    try {
      const response = await api.get('/sessoes');
      setSessoes(response.data);
    } catch (error) {
      console.error('Erro ao carregar sessões:', error);
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

  const handleSubmit = async () => {
    try {
      if (editingSessao) {
        await api.put(`/sessoes/${editingSessao.id}`, formData);
      } else {
        await api.post('/sessoes', formData);
      }
      handleCloseDialog();
      loadSessoes();
    } catch (error) {
      console.error('Erro ao salvar sessão:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta sessão?')) {
      try {
        await api.delete(`/sessoes/${id}`);
        loadSessoes();
      } catch (error) {
        console.error('Erro ao excluir sessão:', error);
      }
    }
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

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Descrição</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sessoes.map((sessao) => (
              <TableRow key={sessao.id}>
                <TableCell>{sessao.descricao}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleOpenDialog(sessao)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(sessao.id)}>
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
          {editingSessao ? 'Editar Sessão' : 'Nova Sessão'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
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
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Sessoes; 