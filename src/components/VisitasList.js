import React from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TablePagination
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

const formatDateForDisplay = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  } catch (error) {
    console.error('Erro ao formatar data:', error, 'Data recebida:', dateString);
    return '-';
  }
};

const VisitasList = ({ visitas, onEdit, onDelete }) => {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <>
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
            {visitas
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((visita) => (
                <TableRow key={visita.id}>
                  <TableCell>{formatDateForDisplay(visita.data_visita)}</TableCell>
                  <TableCell>{visita.loja?.nome || '-'}</TableCell>
                  <TableCell>{visita.sessao?.descricao || '-'}</TableCell>
                  <TableCell>{visita.grau?.descricao || '-'}</TableCell>
                  <TableCell>{visita.rito?.nome || '-'}</TableCell>
                  <TableCell>{visita.potencia?.nome || '-'}</TableCell>
                  <TableCell>{visita.prancha_presenca ? 'Sim' : 'Não'}</TableCell>
                  <TableCell>{visita.possui_certificado ? 'Sim' : 'Não'}</TableCell>
                  <TableCell align="right">
                    <IconButton 
                      onClick={() => onEdit(visita)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      onClick={() => onDelete(visita.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={visitas.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Linhas por página:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
      />
    </>
  );
};

export default VisitasList; 