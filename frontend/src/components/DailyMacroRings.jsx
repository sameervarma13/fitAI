import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid } from '@mui/material';
import axios from 'axios';
import {
  CircularProgressbarWithChildren,
  buildStyles
} from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const macroColors = {
  calories: '#3f51b5',
  protein: '#4caf50',
  carbs: '#ff9800',
  fat: '#f44336',
};

const MacroRing = ({ label, actual, target, color }) => {
  const percent = Math.min((actual / target) * 100, 150);

  return (
    <Box
      sx={{
        width: 130,
        height: 130,
        mx: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        borderRadius: '50%',
        background: 'linear-gradient(145deg, #ffffff, #f0f0f0)',
        p: 1.5,
        transition: 'all 0.3s',
        '&:hover': {
          boxShadow: `0 6px 20px ${color}55`,
          transform: 'scale(1.03)',
        },
      }}
    >
      <CircularProgressbarWithChildren
        value={percent}
        strokeWidth={10}
        styles={buildStyles({
          pathColor: color,
          trailColor: '#e0e0e0',
        })}
      >
        <Typography variant="subtitle2" sx={{ fontSize: '0.8rem', fontWeight: 600 }}>
          {Math.round(percent)}%
        </Typography>
      </CircularProgressbarWithChildren>
      <Typography variant="body2" mt={1} fontWeight={600}>
        {label}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {actual}{label === 'Calories' ? ' kcal' : 'g'} / {target}
      </Typography>
    </Box>
  );
};

const DailyMacroRings = ({ rowSpacing = 2, colSpacing = 2 }) => {
  const [data, setData] = useState(null);
  const today = new Date().toLocaleDateString('en-CA');

  useEffect(() => {
    axios
      .get(`http://localhost:8000/nutrition/summary/${today}`)
      .then((res) => setData(res.data))
      .catch((err) => console.error('No nutrition data found', err));
  }, [today]);

  if (!data) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="body2" color="text.secondary">
          No nutrition data logged for today.
        </Typography>
      </Box>
    );
  }

  const { macros } = data;

  return (
    <Grid container rowSpacing={rowSpacing} columnSpacing={colSpacing}>
      <Grid item xs={6}>
        <MacroRing label="Calories" {...macros.calories} color={macroColors.calories} />
      </Grid>
      <Grid item xs={6}>
        <MacroRing label="Protein" {...macros.protein} color={macroColors.protein} />
      </Grid>
      <Grid item xs={6}>
        <MacroRing label="Carbs" {...macros.carbs} color={macroColors.carbs} />
      </Grid>
      <Grid item xs={6}>
        <MacroRing label="Fat" {...macros.fat} color={macroColors.fat} />
      </Grid>
    </Grid>
  );
};

export default DailyMacroRings;
