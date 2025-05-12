// src/components/ChatWidget.jsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  IconButton,
  TextField,
  Button,
  Paper,
  Typography,
  CircularProgress,
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import { useReport } from '../context/ReportContext';

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const [hasOpened, setHasOpened] = useState(false);
  const { report, setReportData } = useReport();

  // Toggle Chat with Intro Message
  const toggleChat = () => {
    const newOpen = !open;
    setOpen(newOpen);

    if (newOpen && !hasOpened) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: "Hey there! I'm your AI fitness coach. 💪 Ask me anything about your workouts, nutrition, or weekly progress!",
        },
      ]);
      setHasOpened(true);
    }
  };

  // Fetch latest report if not already loaded
  useEffect(() => {
    const fetchLatestReport = async () => {
      try {
        const res = await axios.get('http://localhost:8000/report/latest');
        if (res.data.report && res.data.prompt) {
          setReportData({
            full: res.data.report,
            prompt: res.data.prompt,
            parsed: {},
          });
        }
      } catch (err) {
        console.error('Failed to fetch latest report:', err);
      }
      setInitLoading(false);
    };

    if (!report) {
      fetchLatestReport();
    } else {
      setInitLoading(false);
    }
  }, [report, setReportData]);

  // Send user question to backend
  const handleSend = async () => {
    if (!input.trim()) return;
    if (!report || !report.full || !report.prompt) {
      alert('Please generate an AI report first.');
      return;
    }

    const userMessage = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:8000/report/chat', {
        question: input,
        report: report.full,
        prompt: report.prompt,
      });

      const botMessage = { sender: 'bot', text: res.data.response };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Chat Icon */}
      <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999 }}>
        <IconButton
          color="primary"
          onClick={toggleChat}
          sx={{
            bgcolor: '#6366f1',
            '&:hover': { bgcolor: '#4f46e5' },
            color: '#fff',
            boxShadow: 6,
            width: 56,
            height: 56,
          }}
        >
          {open ? <CloseIcon /> : <ChatIcon />}
        </IconButton>
      </Box>

      {/* Chat Window */}
      {open && (
        <Paper
          elevation={6}
          sx={{
            position: 'fixed',
            bottom: 90,
            right: 24,
            width: 360,
            height: 480,
            borderRadius: 3,
            display: 'flex',
            flexDirection: 'column',
            p: 2,
            bgcolor: '#ffffff',
            boxShadow: '0px 4px 20px rgba(0,0,0,0.15)',
            zIndex: 9998,
          }}
        >
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            🤖 Ask Your Coach
          </Typography>

          {initLoading ? (
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Box
                sx={{
                  flex: 1,
                  overflowY: 'auto',
                  mb: 1,
                  px: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                }}
              >
                {messages.map((msg, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                      bgcolor: msg.sender === 'user' ? '#6366f1' : '#f1f5f9',
                      color: msg.sender === 'user' ? '#fff' : '#111',
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      maxWidth: '80%',
                      boxShadow: 2,
                      fontSize: '0.95rem',
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {msg.text}
                  </Box>
                ))}
                {loading && (
                  <Box sx={{ alignSelf: 'flex-start', fontSize: '0.95rem', opacity: 0.6 }}>
                    Thinking...
                  </Box>
                )}
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Ask something..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <Button onClick={handleSend} variant="contained" disabled={loading}>
                  Send
                </Button>
              </Box>
            </>
          )}
        </Paper>
      )}
    </>
  );
};

export default ChatWidget;
