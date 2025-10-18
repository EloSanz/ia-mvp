import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Typography
} from '@mui/material';
import {
  Sort as SortIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon
} from '@mui/icons-material';

const DeckSorting = ({
  sortBy,
  sortOrder,
  onSortChange,
  showLabel = true
}) => {
  const sortOptions = [
    { value: 'name', label: 'Nombre' },
    { value: 'createdAt', label: 'Fecha de creación' },
    { value: 'updatedAt', label: 'Última actualización' },
    { value: 'description', label: 'Descripción' }
  ];

  const handleSortFieldChange = (event) => {
    onSortChange(event.target.value, sortOrder);
  };

  const handleSortOrderChange = () => {
    onSortChange(sortBy, sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const getSortIcon = () => {
    return sortOrder === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />;
  };

  return (
    <Box sx={{ mb: 0.5 }}>
      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
        {showLabel && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.25, fontSize: '0.7rem' }}>
            <SortIcon fontSize="small" />
            Ordenar:
          </Typography>
        )}
        
        <FormControl size="small" sx={{ minWidth: 150, '& .MuiInputBase-root': { height: '28px' } }}>
          <InputLabel sx={{ fontSize: '0.8rem' }}>Campo</InputLabel>
          <Select
            value={sortBy}
            label="Campo"
            onChange={handleSortFieldChange}
            sx={{ fontSize: '0.8rem' }}
          >
            {sortOptions.map((option) => (
              <MenuItem key={option.value} value={option.value} sx={{ fontSize: '0.8rem' }}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Chip
          icon={getSortIcon()}
          label={sortOrder === 'asc' ? 'Asc' : 'Desc'}
          onClick={handleSortOrderChange}
          variant="outlined"
          clickable
          size="small"
          sx={{ 
            cursor: 'pointer',
            fontSize: '0.7rem',
            height: '26px',
            '&:hover': {
              backgroundColor: 'action.hover'
            }
          }}
        />
      </Stack>
    </Box>
  );
};

export default DeckSorting;
