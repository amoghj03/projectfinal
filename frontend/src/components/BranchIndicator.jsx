import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { Business } from '@mui/icons-material';
import { useBranch } from '../contexts/BranchContext';

const BranchIndicator = ({ showChip = true, color = "text.secondary" }) => {
  const { getEffectiveBranch, isSuperAdmin } = useBranch();

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Business fontSize="small" color="primary" />
      <Typography variant="body2" color={color}>
        Viewing: {getEffectiveBranch()}
      </Typography>
      {showChip && !isSuperAdmin && (
        <Chip 
          label="Branch Admin" 
          size="small" 
          color="primary" 
          variant="outlined"
        />
      )}
    </Box>
  );
};

export default BranchIndicator;