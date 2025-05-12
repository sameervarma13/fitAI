import React, { useEffect, useState } from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';
import axios from 'axios';

// Shared macro colors (same as line chart)
const macroColors = {
  calories: '#3f51b5',
  protein: '#4caf50',
  carbs: '#ff9800',
  fat: '#f44336',
};

const MacroBar = ({ label, actual, target, percent, fill }) => {
  return (
    <Box mb={2}>
      <Typography variant="subtitle2" gutterBottom>
        {label}: {actual}{label === 'Calories' ? ' kcal' : 'g'} / {target}{label === 'Calories' ? ' kcal' : 'g'} ({percent}%)
      </Typography>
      <LinearProgress
        variant="determinate"
        value={Math.min(percent, 150)} // cap at 150% visually
        sx={{
          height: 10,
          borderRadius: 5,
          backgroundColor: '#e0e0e0',
          '& .MuiLinearProgress-bar': {
            backgroundColor: fill,
          },
        }}
      />
    </Box>
  );
};

const DailyMacroProgress = () => {
  const [data, setData] = useState(null);
  const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD

  useEffect(() => {
    axios
      .get(`http://localhost:8000/nutrition/summary/${today}`)
      .then((res) => setData(res.data))
      .catch((err) => console.error('No nutrition data found', err));
  }, [today]);

  if (!data) {
    return (
      <Box sx={{ p: 3, bgcolor: '#fefefe', borderRadius: 2 }}>
        <Typography variant="h6" mb={1}>Daily Macro Progress</Typography>
        <Typography variant="body2" color="text.secondary">
          No nutrition data logged for today.
        </Typography>
      </Box>
    );
  }

  const { macros } = data;

  return (
    <Box p={2} sx={{ background: 'white', borderRadius: 2, boxShadow: 2 }}>
      <Typography variant="h6" gutterBottom>
        Daily Macro Progress ({data.date})
      </Typography>
      <MacroBar label="Calories" fill={macroColors.calories} {...macros.calories} />
      <MacroBar label="Protein" fill={macroColors.protein} {...macros.protein} />
      <MacroBar label="Carbs" fill={macroColors.carbs} {...macros.carbs} />
      <MacroBar label="Fat" fill={macroColors.fat} {...macros.fat} />
    </Box>
  );
};

export default DailyMacroProgress;
