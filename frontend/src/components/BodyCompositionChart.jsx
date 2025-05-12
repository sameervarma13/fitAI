import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  ButtonGroup,
  MenuItem,
  Select
} from '@mui/material';
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';
import axios from 'axios';

const BodyCompositionChart = () => {
  const [data, setData] = useState([]);
  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState('weight');
  const [range, setRange] = useState('7d');

  const fetchData = async () => {
    try {
      const bodyRes = await axios.get('http://localhost:8000/body-composition');
      const goalRes = await axios.get('http://localhost:8000/user/goal');
      const sorted = bodyRes.data.sort((a, b) => new Date(a.date) - new Date(b.date));
      const formatted = sorted.map(entry => ({
        rawDate: new Date(entry.date),
        date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        weight: entry.weight,
        bodyFat: entry.body_fat,
        muscle: entry.muscle_mass,
        skeletal_muscle: entry.skeletal_muscle
      }));
      setData(formatted);
      setGoal(goalRes.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post('http://localhost:8000/upload/body-csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      await fetchData();
    } catch (err) {
      console.error('Failed to upload CSV:', err);
    }
  };

  const getFilteredData = () => {
    if (range === 'all') return data;
    const days = range === '7d' ? 7 : 30;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return data.filter(d => d.rawDate >= cutoff);
  };

  const chartProps = {
    weight: {
      title: 'Weight (lbs)',
      color: '#3b82f6',
      goal: goal?.target_weight
    },
    bodyFat: {
      title: 'Body Fat (%)',
      color: '#a855f7',
      goal: goal?.target_body_fat
    },
    muscle: {
      title: 'Muscle Mass (lbs)',
      color: '#10b981',
      goal: null
    },
    skeletal_muscle: {
      title: 'Skeletal Muscle (%)',
      color: '#f43f5e',
      goal: null
    }
  };

  const { title, color, goal: goalValue } = chartProps[selected];
  const filteredData = getFilteredData();
  const firstValue = filteredData[0]?.[selected];
  const lastValue = filteredData[filteredData.length - 1]?.[selected];
  const deltaPercent =
    firstValue && lastValue
      ? (((lastValue - firstValue) / firstValue) * 100).toFixed(1)
      : null;

  // Manual and dynamic Y-axis logic
  let minY, maxY, tickInterval, ticks;

  if (selected === 'weight') {
    minY = 150;
    maxY = 170;
    tickInterval = 5;
    ticks = [150, 155, 160, 165, 170];
  } else if (selected === 'bodyFat') {
    minY = 12;
    maxY = 16;
    ticks = [12, 13, 14, 15, 16];
  } else if (selected === 'muscle') {
    const values = filteredData.map(d => d.muscle).filter(Boolean);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    minY = Math.floor(minVal / 2) * 2 - 2;
    maxY = Math.ceil(maxVal / 2) * 2 + 2;
    tickInterval = 2;
    ticks = Array.from({ length: Math.ceil((maxY - minY) / tickInterval) + 1 }, (_, i) => minY + i * tickInterval);
  } else if (selected === 'skeletal_muscle') {
    const values = filteredData.map(d => d.skeletal_muscle).filter(Boolean);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    minY = Math.floor(minVal) - 1;
    maxY = Math.ceil(maxVal) + 1;
    tickInterval = 1;
    ticks = Array.from({ length: Math.ceil((maxY - minY) / tickInterval) + 1 }, (_, i) => minY + i * tickInterval);
  }

  if (loading) return <CircularProgress />;

  return (
    <Box
      sx={{
        borderRadius: 3,
        p: 3,
        background: '#f9fafb',
        boxShadow: '0 6px 16px rgba(0, 0, 0, 0.05)'
      }}
    >
      {/* Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <ButtonGroup size="small">
            <Button variant={selected === 'weight' ? 'contained' : 'outlined'} onClick={() => setSelected('weight')}>WEIGHT</Button>
            <Button variant={selected === 'bodyFat' ? 'contained' : 'outlined'} onClick={() => setSelected('bodyFat')}>BODY FAT</Button>
            <Button variant={selected === 'muscle' ? 'contained' : 'outlined'} onClick={() => setSelected('muscle')}>MUSCLE</Button>
            <Button variant={selected === 'skeletal_muscle' ? 'contained' : 'outlined'} onClick={() => setSelected('skeletal_muscle')}>SKELETAL</Button>
          </ButtonGroup>

          <Select size="small" value={range} onChange={e => setRange(e.target.value)}>
            <MenuItem value="7d">Last 7 Days</MenuItem>
            <MenuItem value="30d">Last 30 Days</MenuItem>
            <MenuItem value="all">All Time</MenuItem>
          </Select>
        </Box>

        <Button variant="outlined" component="label" size="small">
          Upload CSV
          <input type="file" accept=".csv" hidden onChange={handleFileUpload} />
        </Button>
      </Box>

      {/* Chart */}
      <Box sx={{ background: '#fff', borderRadius: 3, p: 2, boxShadow: 'inset 0 0 0 1px #e5e7eb' }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ color, mb: 1 }}>{title}</Typography>

        {deltaPercent && (
          <Typography variant="body2" color="text.secondary" mb={1}>
            {title} Change: {deltaPercent > 0 ? '+' : ''}{deltaPercent}%
          </Typography>
        )}

        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#9ca3af" />
            <YAxis
              stroke="#9ca3af"
              domain={[minY, maxY]}
              ticks={ticks}
            />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey={selected}
              stroke={color}
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              animationDuration={800}
            />
            {goalValue && (
              <Line
                type="monotone"
                dataKey={() => goalValue}
                stroke="#f97316"
                strokeDasharray="5 5"
                strokeWidth={2}
                name={`Target ${title}`}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default BodyCompositionChart;
