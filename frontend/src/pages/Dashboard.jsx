// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { Box, Grid } from '@mui/material';
import axios from 'axios';

import Sidebar from '../layout/Sidebar';
import Header from '../layout/Header';
import BodyCompositionChart from '../components/BodyCompositionChart';
import SectionCard from '../components/SectionCard';
import GoalBox from '../components/GoalBox';
import WorkoutTable from '../components/WorkoutTable';
import InsightCard from '../components/InsightCard';
import NutritionTable from '../components/NutritionTable';

const Dashboard = () => {
  const [ouraScores, setOuraScores] = useState({
    sleep: null,
    readiness: null,
    activity: null,
  });

  useEffect(() => {
    const fetchOuraScores = async () => {
      try {
        const res = await axios.get('http://localhost:8000/oura/data');
        const data = res.data;
        setOuraScores({
          sleep: data.sleep?.[0]?.score ?? null,
          readiness: data.readiness?.[0]?.score ?? null,
          activity: data.activity?.[0]?.score ?? null,
        });
      } catch (error) {
        console.error('Error fetching Oura data:', error);
      }
    };

    fetchOuraScores();
  }, []);

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f8f9fc' }}>
      <Sidebar />

      <Box component="main" sx={{ flexGrow: 1, p: 4, bgcolor: '#f8f9fc', minHeight: '100vh' }}>
        {/* ✅ Pass scores to header */}
        <Header title="Dashboard" ouraScores={ouraScores} />

        <Grid container spacing={3}>
          {/* Body Composition Chart */}
          <Grid item xs={12} md={8}>
            <SectionCard title="Body Composition Progress">
              <BodyCompositionChart />
            </SectionCard>
          </Grid>

          {/* Goal & Insights */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <SectionCard title="Your Goal">
                <GoalBox />
              </SectionCard>
              <Box sx={{ height: 170 }}>
                <InsightCard />
              </Box>
            </Box>
          </Grid>

          {/* Workouts */}
          <Grid item xs={12} md={6}>
            <SectionCard title="Workouts">
              <WorkoutTable />
            </SectionCard>
          </Grid>

          {/* Nutrition */}
          <Grid item xs={12} md={6}>
            <SectionCard title="Nutrition Summary">
              <NutritionTable />
            </SectionCard>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard;
