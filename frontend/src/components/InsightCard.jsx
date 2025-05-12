import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import { useNavigate } from 'react-router-dom';

const InsightCard = () => {
  const navigate = useNavigate();
  const hoverLift = 12;

  return (
    <Box
      sx={{
        borderRadius: 3,
        boxShadow: '0 6px 16px rgba(0,0,0,0.05)',
        background: 'linear-gradient(135deg, #fef9c3, #fef08a)',
        display: 'flex',
        flexDirection: 'column',
        height: '75%',
        p: 3,
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        transform: 'translateY(10px)',
        animation: 'fadeInPop 0.6s ease-out forwards',
        '&:hover': {
          transform: `translateY(-${hoverLift}px)`,
          boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
        }
      }}
    >
      {/* Header with icon and button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <EmojiObjectsIcon sx={{ color: '#facc15', mr: 1 }} />
          <Typography variant="h6" fontWeight="bold">
            Insight of the Day
          </Typography>
        </Box>

        <Button
          onClick={() => navigate('/insights')}
          size="small"
          variant="outlined"
          startIcon={<LightbulbIcon sx={{ color: '#c2410c' }} />}
          sx={{
            fontSize: 12,
            fontWeight: 700,
            px: 1.75,
            py: 0.6,
            color: '#c2410c',
            borderColor: '#c2410c',
            borderRadius: 2,
            transition: 'all 0.25s ease',
            '&:hover': {
              backgroundColor: '#fde68a',
              boxShadow: '0 0 8px rgba(251, 191, 36, 0.4)',
              borderColor: '#c2410c',
            },
          }}
        >
          Full AI Insights
        </Button>
      </Box>

      {/* Insight text */}
      <Typography variant="body2" sx={{ color: '#444' }}>
        Eating protein within 30–60 minutes post-workout can significantly boost muscle protein synthesis, especially when paired with carbohydrates.
      </Typography>

      {/* Mount animation keyframes */}
      <style>
        {`
          @keyframes fadeInPop {
            0% {
              opacity: 0;
              transform: translateY(30px) scale(0.98);
            }
            100% {
              opacity: 1;
              transform: translateY(0px) scale(1);
            }
          }
        `}
      </style>
    </Box>
  );
};

export default InsightCard;
