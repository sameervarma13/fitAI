import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
import Sidebar from '../layout/Sidebar';
import Header from '../layout/Header';
import SectionCard from '../components/SectionCard';
import NutritionChart from '../components/NutritionChart';
import DailyMacroRings from '../components/DailyMacroRings';
import NutritionTable from '../components/NutritionTable';

const Nutrition = () => {
  return (
    <Box sx={{ display: 'flex', bgcolor: '#f8f9fc' }}>
      <Sidebar />

      <Box component="main" sx={{ flexGrow: 1, p: 4, bgcolor: '#f8f9fc', minHeight: '100vh' }}>
        <Header title="Nutrition" />

        <Grid container spacing={3}>
          {/* 📈 Daily Trends */}
          <Grid item xs={12} md={6}>
            <SectionCard title = " ">
              <NutritionChart />
            </SectionCard>
          </Grid>

          {/* 🍩 Daily Macro Rings (2x2 Grid) */}
          <Grid item xs={12} md={6}>
            <SectionCard title="Daily Macro Completion">
              <DailyMacroRings rowSpacing={5} colSpacing={0} />
            </SectionCard>
          </Grid>

          {/* 📅 Nutrition Table */}
          <Grid item xs={12}>
            <SectionCard title="Nutrition Log">
              <NutritionTable />
            </SectionCard>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Nutrition;
