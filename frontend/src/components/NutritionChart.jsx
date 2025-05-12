import React, { useEffect, useState } from 'react';
import { Box, Typography, ToggleButton, ToggleButtonGroup } from '@mui/material';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import axios from 'axios';

const macroOptions = [
  { key: 'calories', label: 'Calories', color: '#3f51b5' },
  { key: 'protein', label: 'Protein (g)', color: '#4caf50' },
  { key: 'carbs', label: 'Carbs (g)', color: '#ff9800' },
  { key: 'fat', label: 'Fat (g)', color: '#f44336' },
];

const NutritionChart = () => {
  const [data, setData] = useState([]);
  const [selected, setSelected] = useState('calories');

  useEffect(() => {
    axios
      .get('http://localhost:8000/nutrition/trends?days=7')
      .then(res => setData(res.data))
      .catch(err => console.error("Error fetching trends", err));
  }, []);

  const handleChange = (_, newSelection) => {
    if (newSelection !== null) setSelected(newSelection);
  };

  const selectedOption = macroOptions.find(m => m.key === selected);

  if (!data.length) {
    return (
      <Box sx={{ bgcolor: '#fefefe', p: 3, borderRadius: 2 }}>
        <Typography variant="body2" color="text.secondary">
          No nutrition data available for the past 7 days.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'white', p: 3, borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>
        Daily {selectedOption.label} Trend
      </Typography>

      <ToggleButtonGroup
        value={selected}
        exclusive
        onChange={handleChange}
        size="small"
        sx={{ mb: 2 }}
      >
        {macroOptions.map(option => (
          <ToggleButton key={option.key} value={option.key}>
            {option.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={(date) => {
                const d = new Date(date);
                return `${d.getMonth() + 1}/${d.getDate()}`; // Converts to M/D
            }}
        />
          <YAxis />
          <Tooltip
            labelFormatter={(date) => {
                const d = new Date(date);
                return `${d.getMonth() + 1}/${d.getDate()}`;
            }}
            />
          <Line
            type="monotone"
            dataKey={selected}
            stroke={selectedOption.color}
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default NutritionChart;
