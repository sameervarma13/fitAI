// src/pages/Insights.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Divider,
  CircularProgress,
} from '@mui/material';
import Sidebar from '../layout/Sidebar';
import Header from '../layout/Header';
import axios from 'axios';

// Utils
const parseLLMResponse = (text) => {
  const sections = {
    good: '',
    improve: '',
    progress: '',
    recommend: '',
  };

  const regexMap = {
    good: /### ✅ What's Going Well([\s\S]*?)(?=###|$)/,
    improve: /### ⚠️ What Could Be Improved([\s\S]*?)(?=###|$)/,
    progress: /### 📊 Progress Summary([\s\S]*?)(?=###|$)/,
    recommend: /### 🎯 Recommendations for Next Week([\s\S]*?)(?=###|$)/,
  };

  for (const [key, regex] of Object.entries(regexMap)) {
    const match = text.match(regex);
    sections[key] = match ? match[1].trim() : '';
  }

  return sections;
};

const GradientCard = ({ title, content, emoji, borderColor }) => (
  <Paper
    elevation={3}
    sx={{
      borderRadius: 3,
      p: 3,
      height: '100%',
      borderTop: `5px solid ${borderColor}`,
      background: '#fff',
    }}
  >
    <Typography variant="h6" fontWeight={700} gutterBottom>
      {emoji} {title}
    </Typography>
    <Divider sx={{ my: 1 }} />
    {content.split(/\n+/).map((line, idx) => (
      <Typography key={idx} variant="body1" sx={{ fontSize: '1.05rem', mb: 1 }}>
        {line.startsWith('-') ? <>&bull; {line.slice(1).trim()}</> : line.trim()}
      </Typography>
    ))}
  </Paper>
);

const Insights = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  // Load latest report on mount
  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await axios.get('http://localhost:8000/report/latest');
        if (res.data?.report) {
          const parsed = parseLLMResponse(res.data.report);
          setReport(parsed);
        } else {
          setError(res.data.error || 'No report available');
        }
      } catch (err) {
        console.error('Error fetching latest report:', err);
        setError('Failed to load report.');
      } finally {
        setLoading(false);
      }
    };
    fetchLatest();
  }, []);

  const generateReport = async () => {
    setGenerating(true);
    try {
      const res = await axios.get('http://localhost:8000/report');
      if (res.data?.report) {
        const parsed = parseLLMResponse(res.data.report);
        setReport(parsed);
      } else {
        setError(res.data.error || 'Failed to generate report');
      }
    } catch (err) {
      console.error('Failed to generate report:', err);
      setError('Failed to generate report.');
    } finally {
      setGenerating(false);
    }
  };

  console.log('Component state:', { loading, error, report, generating });

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f8f9fc' }}>
      <Sidebar />
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 4, bgcolor: '#f8f9fc', minHeight: '100vh' }}
      >
        <Header />

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Typography variant="h4" fontWeight="bold">
            📋 Weekly Insights
          </Typography>
          <Button
            onClick={generateReport}
            variant="outlined"
            sx={{ borderRadius: 2, px: 3 }}
          >
            {generating ? 'Generating...' : 'Generate New Report'}
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ textAlign: 'center', mt: 8 }}>
            <CircularProgress />
            <Typography variant="body1" mt={2}>
              Loading your latest report...
            </Typography>
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : report ? (
        <Grid container columnSpacing={1} rowSpacing={8} sx={{ mt: -5 }}>
            <Grid item xs={12} md={6}>
              <GradientCard
                title="What's Going Well"
                emoji="✅"
                content={report.good}
                borderColor="#22c55e"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <GradientCard
                title="What Could Be Improved"
                emoji="⚠️"
                content={report.improve}
                borderColor="#facc15"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <GradientCard
                title="Progress Summary"
                emoji="📊"
                content={report.progress}
                borderColor="#3b82f6"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <GradientCard
                title="Recommendations for Next Week"
                emoji="🎯"
                content={report.recommend}
                borderColor="#ec4899"
              />
            </Grid>
          </Grid>
        ) : (
          <Typography>No report found. Click "Generate Report" to begin.</Typography>
        )}
      </Box>
    </Box>
  );
};

export default Insights;
