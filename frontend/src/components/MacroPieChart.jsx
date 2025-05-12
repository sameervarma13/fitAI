import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Box, Typography } from '@mui/material';

const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

const MacroPieChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8000/nutrition')
      .then(res => {
        const entries = res.data;

        let totalProtein = 0, totalCarbs = 0, totalFat = 0;

        entries.forEach(entry => {
          totalProtein += entry.protein || 0;
          totalCarbs += entry.carbs || 0;
          totalFat += entry.fat || 0;
        });

        const caloriesFromProtein = totalProtein * 4;
        const caloriesFromCarbs = totalCarbs * 4;
        const caloriesFromFat = totalFat * 9;

        const total = caloriesFromProtein + caloriesFromCarbs + caloriesFromFat;

        setData([
          { name: 'Protein', value: caloriesFromProtein },
          { name: 'Carbs', value: caloriesFromCarbs },
          { name: 'Fat', value: caloriesFromFat },
        ]);
      })
      .catch(err => console.error('Failed to fetch nutrition:', err));
  }, []);

  return (
    <Box sx={{ bgcolor: '#fff', p: 3, borderRadius: 2, boxShadow: 1, height: '100%' }}>
      <Typography variant="h6" mb={2}>Macro Distribution (by calories)</Typography>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={50}
            outerRadius={100}
            fill="#8884d8"
            label
          >
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default MacroPieChart;
