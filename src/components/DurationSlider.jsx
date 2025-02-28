import React from 'react';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';

const DurationSlider = ({ 
  durationIndex, 
  setDurationIndex, 
  durationOptions, 
  aprs, 
  disabled 
}) => {
  return (
    <Box sx={{ width: '100%', padding: '20px 10px' }}>
      <Slider
        aria-label="Staking Duration"
        value={durationIndex}
        onChange={(_, newValue) => setDurationIndex(Number(newValue))}
        step={null}
        marks={durationOptions.map((option, index) => ({
          value: index,
          label: `${option.days} Days`
        }))}
        min={0}
        max={durationOptions.length - 1}
        valueLabelDisplay="on"
        valueLabelFormat={(value) => {
          const option = durationOptions[value];
          return aprs[option.seconds] !== undefined ? `${aprs[option.seconds]}% APR` : '';
        }}
        disabled={disabled}
        sx={{
          '& .MuiSlider-markLabel': {
            whiteSpace: 'pre-line',
            textAlign: 'center',
          },
          '.MuiSlider-valueLabel': {
            backgroundColor: 'primary.main',
          }
        }}
      />
    </Box>
  );
};

export default DurationSlider; 