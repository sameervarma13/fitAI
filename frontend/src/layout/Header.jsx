import React from 'react';
import { Box, Typography, Avatar, IconButton, Tooltip, Grid } from '@mui/material';
import { Mail, Bell, Bed, Flame, Activity } from 'lucide-react';

const Header = ({ title = "Dashboard", ouraScores = {} }) => {
  const scoreCards = [
    {
      label: 'Sleep',
      icon: <Bed size={18} />,
      value: ouraScores.sleep,
      gradient: 'linear-gradient(135deg, #dbeafe, #bfdbfe)', // blue (match current stats)
    },
    {
      label: 'Readiness',
      icon: <Activity size={18} />,
      value: ouraScores.readiness,
      gradient: 'linear-gradient(135deg, #dcfce7, #bbf7d0)', // green (match target metrics)
    },
    {
      label: 'Activity',
      icon: <Flame size={18} />,
      value: ouraScores.activity,
      gradient: 'linear-gradient(135deg, #fef9c3, #fde68a)', // yellow (match insights)
    }
  ];

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        bgcolor: '#fff',
        borderRadius: 3,
        px: 4,
        py: 2,
        mb: 4,
        boxShadow: '0 6px 12px rgba(0, 0, 0, 0.06)',
      }}
    >
      {/* Left Side - Title + Oura Scores */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <Typography variant="h6" fontWeight={600}>
          {title}
        </Typography>

        {/* Oura Scores */}
        <Grid container spacing={2}>
          {scoreCards.map(({ label, icon, value, gradient }, idx) => (
            <Grid item key={idx}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  background: gradient,
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': {
                    transform: 'scale(1.015)',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
                  },
                  animation: 'fadeInUp 0.5s ease forwards',
                  opacity: 0,
                }}
              >
                {icon}
                <Typography variant="body2" fontWeight={600}>
                  {label}: {value ?? '--'}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Right Side - Icons & Profile */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Tooltip title="Inbox">
          <IconButton>
            <Mail size={20} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Notifications">
          <IconButton>
            <Bell size={20} />
          </IconButton>
        </Tooltip>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
          <Avatar
            alt="Sameer"
            src="https://i.pravatar.cc/100?img=56"
            sx={{ width: 36, height: 36 }}
          />
          <Box>
            <Typography variant="body2" fontWeight={600}>
              Sameer
            </Typography>
            <Typography variant="caption" color="text.secondary">
              sameer@gmail.com
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Header;
