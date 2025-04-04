import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Store,
  People,
  Event,
  School,
  LocalActivity,
  Settings,
  Logout
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Navigation = () => {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    signOut();
    navigate('/login');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/' },
    { text: 'Visitas', icon: <Store />, path: '/visitas' },
    { text: 'Sessões', icon: <Event />, path: '/sessoes' },
    { text: 'Ritos', icon: <LocalActivity />, path: '/ritos' },
    { text: 'Graus', icon: <School />, path: '/graus' },
    { text: 'Potências', icon: <People />, path: '/potencias' },
    { text: 'Lojas', icon: <Store />, path: '/lojas' }
  ];

  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
          onClick={handleMenu}
        >
          <MenuIcon />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          {menuItems.map((item) => (
            <MenuItem
              key={item.text}
              onClick={() => {
                handleClose();
                navigate(item.path);
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </MenuItem>
          ))}
        </Menu>

        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Cadastro de Visitas
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="body1" sx={{ mr: 2 }}>
            {user?.name}
          </Typography>
          <IconButton
            color="inherit"
            onClick={() => navigate('/change-password')}
            title="Alterar Senha"
          >
            <Settings />
          </IconButton>
          <IconButton
            color="inherit"
            onClick={handleLogout}
            title="Sair"
          >
            <Logout />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation; 