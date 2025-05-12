import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import axios from 'axios';

const ScoreCard = ({ title, value, icon }) => (
  <Paper elevation={2} 
  
  sx={{
    background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',  // Blue
    px: 2.5,
    py: 1,
    borderRadius: 2,
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)',
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    fontWeight: 600,
    fontSize: '0.9rem',
    transition: 'transform 0.2s ease',
    '&:hover': {
      transform: 'scale(1.03)'
    }
  }}
  
  >
    <Typography variant="body1" fontWeight={600}>
      {icon} {title}
    </Typography>
    <Typography variant="h5" color={value ? 'primary' : 'text.secondary'}>
      {value !== null ? value : '—'}
    </Typography>
  </Paper>
);

const OuraScores = () => {
  const [scores, setScores] = useState({
    sleep: null,
    readiness: null,
    activity: null
  });

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const res = await axios.get('http://localhost:8000/oura/data');
        const { sleep, readiness, activity } = res.data;

        setScores({
          sleep: sleep[0]?.score || null,
          readiness: readiness[0]?.score || null,
          activity: activity[0]?.score || null
        });
      } catch (err) {
        console.error('Error fetching Oura scores:', err);
      }
    };
    fetchScores();
  }, []);

  return (
    <Box>
      <Typography variant="subtitle1" fontWeight="bold" mb={2}>
        🔮 Today’s Oura Scores
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={4}><ScoreCard title="Sleep" value={scores.sleep} icon="🛏️" /></Grid>
        <Grid item xs={4}><ScoreCard title="Readiness" value={scores.readiness} icon="💡" /></Grid>
        <Grid item xs={4}><ScoreCard title="Activity" value={scores.activity} icon="🔥" /></Grid>
      </Grid>
    </Box>
  );
};

export default OuraScores;
