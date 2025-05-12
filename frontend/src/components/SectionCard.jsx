// src/components/SectionCard.jsx
import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import CardHeaderAccent from './CardHeaderAccent';

const SectionCard = ({ title, icon, children, gradient, sx = {} }) => (
  <Card
    sx={{
      borderRadius: 3,
      boxShadow: '0 6px 16px rgba(0,0,0,0.05)',
      background: '#fff',
      display: 'flex',
      flexDirection: 'column',
      height: '100%', // ✅ Fill parent height
      ...sx             // ✅ Allow overrides like height
    }}
  >
    {/* Optional gradient accent header */}
    {gradient && <CardHeaderAccent gradient={gradient} />}

    <CardContent
      sx={{
        flexGrow: 1, // ✅ Ensure content expands to fill available space
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {title && (
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h6" fontWeight={600}>
            {icon && <span style={{ marginRight: 6 }}>{icon}</span>}
            {title}
          </Typography>

          {/* If child component provides a right-aligned action */}
          {sx?.headerAction && sx.headerAction}
        </Box>
      )}
      {children}
    </CardContent>
  </Card>
);

export default SectionCard;
