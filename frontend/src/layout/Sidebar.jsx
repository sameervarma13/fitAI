import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import DashboardIcon from '@mui/icons-material/Dashboard';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FlagIcon from '@mui/icons-material/Flag';
import InfoIcon from '@mui/icons-material/Info';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import InsightsIcon from '@mui/icons-material/Insights';

import logo from '../assets/logo.png';

const SidebarItem = ({ icon, label, onClick }) => (
  <ListItemButton
    onClick={onClick}
    sx={{
      borderRadius: 2,
      px: 2,
      py: 1.2,
      '&:hover': {
        backgroundColor: '#f0f4ff',
      },
    }}
  >
    <ListItemIcon sx={{ color: '#111' }}>{icon}</ListItemIcon>
    <ListItemText
      primary={label}
      primaryTypographyProps={{
        fontWeight: 500,
        fontSize: '1rem',
        color: '#111',
      }}
    />
  </ListItemButton>
);

const Sidebar = () => {
  const navigate = useNavigate();

  // Inside your SidebarItem component:
const SidebarItem = ({ icon, label, onClick, highlight }) => (
    <ListItemButton
      onClick={onClick}
      sx={{
        borderRadius: 2,
        px: 2,
        py: 1.2,
        bgcolor: highlight ? '#fef08a' : 'transparent',
        '&:hover': {
          backgroundColor: highlight ? '#fde047' : '#f0f4ff',
        },
      }}
    >
      <ListItemIcon sx={{ color: '#111' }}>{icon}</ListItemIcon>
      <ListItemText
        primary={label}
        primaryTypographyProps={{
          fontWeight: 600,
          fontSize: '1rem',
          color: '#111',
        }}
      />
    </ListItemButton>
  );
  

  return (
    <Box
      sx={{
        width: 280,
        minHeight: '100vh',
        bgcolor: '#fff',
        boxShadow: '2px 0 8px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
        px: 2,
        pt: 4,
      }}
    >
      {/* Logo */}
      <Box
        onClick={() => navigate('/')}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          border: '1px solid #e5e7eb',
          borderRadius: 2,
          px: 2,
          py: 1,
          cursor: 'pointer',
          mb: 3,
          alignSelf: 'center',
        }}
      >
        <img src={logo} alt="FitAI Logo" style={{ height: 32 }} />
        <Typography variant="h6" fontWeight={700} sx={{ color: '#111' }}>
          Fit<span style={{ color: '#3b82f6' }}>AI</span>
        </Typography>
      </Box>

      {/* Nav Links */}
      <Box sx={{ flexGrow: 1 }}>
        <List>
          <SidebarItem icon={<DashboardIcon />} label="Dashboard" onClick={() => navigate('/')} />
          <SidebarItem icon={<FitnessCenterIcon />} label="Workouts" />
          
          <SidebarItem 
                icon={<DirectionsRunIcon />} 
                label="Nutrition" 
                onClick={() => navigate('/Nutrition')}
                />
              
            <SidebarItem 
                icon={<DirectionsRunIcon />} 
                label="Oura" 
                onClick={() => navigate('/Oura')}
                />
          <SidebarItem icon={<CalendarTodayIcon />} label="Body Composition" />
          <SidebarItem icon={<FlagIcon />} label="Goals" />
          <SidebarItem
                icon={<InsightsIcon />}
                label="AI Insights"
                onClick={() => navigate('/insights')}
                highlight
                />
        </List>

        <Divider sx={{ my: 2 }} />

        <List>
          <SidebarItem icon={<InfoIcon />} label="Information" />
          <SidebarItem icon={<SettingsIcon />} label="Settings" />
          <SidebarItem icon={<LogoutIcon />} label="Log Out" />
        </List>
      </Box>
    </Box>
  );
};

export default Sidebar;
