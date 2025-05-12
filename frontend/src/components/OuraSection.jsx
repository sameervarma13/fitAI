// components/Oura.jsx
import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import axios from 'axios';

const OuraSection = () => {
  const [sleepData, setSleepData] = useState([]);
  const [readinessData, setReadinessData] = useState([]);
  const [activityData, setActivityData] = useState([]);
  
  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get("http://localhost:8000/oura/data");
  
      console.log("🌙 Sleep:", res.data.sleep);
      console.log("💡 Readiness:", res.data.readiness);
      console.log("🔥 Activity:", res.data.activity);
  
      setSleepData(res.data.sleep || []);
      setReadinessData(res.data.readiness || []);
      setActivityData(res.data.activity || []);
    };
    fetchData();
  }, []);

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        🌀 Oura Ring Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
  <Grid item xs={12} md={4}>
    <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
      <Typography variant="h6" gutterBottom>🛏️ Sleep Score</Typography>
      <Typography variant="h4" fontWeight="bold">
        {sleepData?.[0]?.score || '—'}
      </Typography>
    </Paper>
  </Grid>
  <Grid item xs={12} md={4}>
    <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
      <Typography variant="h6" gutterBottom>💡 Readiness Score</Typography>
      <Typography variant="h4" fontWeight="bold">
        {readinessData?.[0]?.score || '—'}
      </Typography>
    </Paper>
  </Grid>
  <Grid item xs={12} md={4}>
    <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
      <Typography variant="h6" gutterBottom>🔥 Activity Score</Typography>
      <Typography variant="h4" fontWeight="bold">
        {activityData?.[0]?.score || '—'}
      </Typography>
    </Paper>
  </Grid>
</Grid>
    </Box>
  );
};

export default OuraSection;
