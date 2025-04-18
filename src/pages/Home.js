import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import VisitasList from '../components/VisitasList';

const Home = () => {
  const [visitas, setVisitas] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/visitas');
      setVisitas(response.data);
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
    navigate(`/visitas/${visita.id}`);
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
    </Container>
  );
};

export default Home; 