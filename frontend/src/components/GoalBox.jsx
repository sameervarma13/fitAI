import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Stack,
  useTheme,
  useMediaQuery,
  Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import LinearProgress from '@mui/material/LinearProgress';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import axios from 'axios';

// Styled progress bar with dynamic color
const ColoredLinearProgress = styled(LinearProgress)(({ colorOverride }) => ({
  height: 16,
  borderRadius: 5,
  backgroundColor: '#e5e7eb',
  '& .MuiLinearProgress-bar': {
    backgroundColor: colorOverride,
    animation: 'pulse 1.5s infinite ease-in-out'
  }
}));

const GoalBox = () => {
  const [goal, setGoal] = useState({});
  const [currentWeight, setCurrentWeight] = useState(null);
  const [currentBodyFat, setCurrentBodyFat] = useState(null);
  const [initialWeight, setInitialWeight] = useState(null);
  const [initialBodyFat, setInitialBodyFat] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const fetchGoal = async () => {
      try {
        const res = await axios.get('http://localhost:8000/user/goal');
        setGoal(res.data);
      } catch (err) {
        console.error('Failed to fetch goal:', err);
      }
    };

    const fetchBodyComp = async () => {
      try {
        const res = await axios.get('http://localhost:8000/body-composition');
        if (!res.data || res.data.length === 0) return;
        const sorted = res.data.sort((a, b) => b.date.localeCompare(a.date));
        const latest = sorted[0];
        const first = sorted[sorted.length - 1];
        setCurrentWeight(latest.weight);
        setCurrentBodyFat(latest.body_fat);
        setInitialWeight(first.weight);
        setInitialBodyFat(first.body_fat);
      } catch (err) {
        console.error('Failed to fetch body comp:', err);
      }
    };

    fetchGoal();
    fetchBodyComp();
  }, []);

  const { target_weight, target_body_fat } = goal;

  const weightProgress = (() => {
    if (!initialWeight || !currentWeight || !target_weight) return 0;
    const totalChange = target_weight - initialWeight;
    const currentChange = currentWeight - initialWeight;
    if (totalChange === 0) return 100;
    const progress = (currentChange / totalChange) * 100;
    return Math.max(0, Math.min(progress, 100));
  })();

  const bodyFatProgress = (() => {
    if (!initialBodyFat || !currentBodyFat || !target_body_fat) return 0;
    const totalChange = target_body_fat - initialBodyFat;
    const currentChange = currentBodyFat - initialBodyFat;
    if (totalChange === 0) return 100;
    const progress = (currentChange / totalChange) * 100;
    return Math.max(0, Math.min(progress, 100));
  })();

  const getWeightBarColor = (progress) => {
    if (progress >= 100) return '#10b981'; // Green
    if (progress >= 50) return '#3b82f6';  // Blue
    return '#f59e0b';                      // Orange
  };

  const getBodyFatBarColor = (progress) => {
    if (progress <= 0) return '#10b981';   // Green (fat loss)
    if (progress <= 50) return '#a855f7';  // Purple
    return '#f43f5e';                      // Red (off track)
  };

  const getChangeText = (initial, current, type = 'weight') => {
    const diff = (initial - current).toFixed(1);
    const isPositiveChange = diff >= 0;
    const isWeight = type === 'weight';
    const label = isWeight ? 'lbs' : '% body fat';
    const color = isPositiveChange ? '#10b981' : '#ef4444'; // green or red
  
    return (
      <Typography
        variant="body2"
        fontWeight={700}
        color={color}
        sx={{ minWidth: '130px', textAlign: 'right' }}
      >
        <span style={{ color, fontWeight: 700 }}>
          {isPositiveChange ? '↓' : '↑'}
        </span>{' '}
        {isPositiveChange ? 'Down' : 'Up'} {Math.abs(diff)} {label}
      </Typography>
    );
  };
  return (
    <Box width="100%" maxWidth="900px" mx="auto">
      {/* Stat Cards */}
      <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} gap={2} mb={2}>
        <Box
          flex={1}
          borderRadius={3}
          boxShadow="0 6px 16px rgba(0,0,0,0.05)"
          p={2}
          sx={{
            background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            '&:hover': {
              transform: 'scale(1.015)',
              boxShadow: '0 8px 20px rgba(0,0,0,0.08)'
            },
            animation: 'fadeInUp 0.5s ease forwards',
            opacity: 0
          }}
        >
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Current Stats
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Weight: {currentWeight ? `${currentWeight} lbs` : 'Loading...'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Body Fat: {currentBodyFat ? `${currentBodyFat}%` : 'Loading...'}
          </Typography>
        </Box>

        <Box
          flex={1}
          borderRadius={3}
          boxShadow="0 6px 16px rgba(0,0,0,0.05)"
          p={2}
          sx={{
            background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            '&:hover': {
              transform: 'scale(1.015)',
              boxShadow: '0 8px 20px rgba(0,0,0,0.08)'
            },
            animation: 'fadeInUp 0.5s ease forwards',
            opacity: 0
          }}
        >
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Target Metrics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Target Weight: {target_weight ? `${target_weight} lbs` : 'Loading...'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Target Body Fat: {target_body_fat ? `${target_body_fat}%` : 'Loading...'}
          </Typography>
        </Box>
      </Box>

      {/* Goal Progress */}
      <Box
        border="1px solid #e5e7eb"
        borderRadius={2}
        boxShadow={1}
        p={2}
        bgcolor="#fff"
        sx={{
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          '&:hover': {
            transform: 'scale(1.01)',
            boxShadow: '0 8px 20px rgba(0,0,0,0.05)'
          },
          animation: 'fadeInUp 0.5s ease forwards',
          opacity: 0
        }}
      >
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          <Typography variant="subtitle1" fontWeight={600}>
            Goal Progress
          </Typography>
          <Tooltip title="This is your cumulative progress toward your goals.">
            <InfoOutlinedIcon fontSize="small" sx={{ color: '#9ca3af' }} />
          </Tooltip>
        </Box>

        <Stack spacing={2}>
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" fontWeight={600}>
                Weight Progress ({weightProgress.toFixed(0)}%)
              </Typography>
              {initialWeight && currentWeight && getChangeText(initialWeight, currentWeight, 'weight')}
            </Box>
            <ColoredLinearProgress
              variant="determinate"
              value={weightProgress}
              colorOverride={getWeightBarColor(weightProgress)}
            />
          </Box>

          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" fontWeight={600}>
                Body Fat Progress ({bodyFatProgress.toFixed(0)}%)
              </Typography>
              {initialBodyFat && currentBodyFat && getChangeText(initialBodyFat, currentBodyFat, 'bodyfat')}
            </Box>
            <ColoredLinearProgress
              variant="determinate"
              value={bodyFatProgress}
              colorOverride={getBodyFatBarColor(bodyFatProgress)}
            />
          </Box>
        </Stack>
      </Box>

      {/* Animations */}
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.6; }
            100% { opacity: 1; }
          }
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </Box>
  );
};

export default GoalBox;
