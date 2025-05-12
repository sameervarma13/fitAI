// src/components/CardHeaderAccent.jsx
import React from 'react';
import { Box } from '@mui/material';

const CardHeaderAccent = ({ gradient }) => (
  <Box
    sx={{
      height: 6,
      width: '100%',
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12,
      background: gradient
    }}
  />
);

export default CardHeaderAccent;
