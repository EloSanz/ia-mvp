import React from 'react';
import {
  Box,
  Pagination as MuiPagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Stack
} from '@mui/material';

const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  itemsPerPageOptions = [8, 16, 24],
  showItemsPerPage = true,
  showTotalItems = true
}) => {
  const startItem = currentPage * itemsPerPage + 1;
  const endItem = Math.min((currentPage + 1) * itemsPerPage, totalItems);

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      gap: 0.75,
      mt: 1,
      mb: 0.5
    }}>
      {/* Información de elementos mostrados */}
      {showTotalItems && (
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
          Mostrando {startItem}-{endItem} de {totalItems} elementos
        </Typography>
      )}

      <Stack direction="row" spacing={1} alignItems="center">
        {/* Selector de elementos por página */}
        {showItemsPerPage && (
          <FormControl size="small" sx={{ minWidth: 90, '& .MuiInputBase-root': { height: '28px' } }}>
            <InputLabel sx={{ fontSize: '0.8rem' }}>Por página</InputLabel>
            <Select
              value={itemsPerPage}
              label="Por página"
              onChange={(e) => onItemsPerPageChange(e.target.value)}
              sx={{ fontSize: '0.8rem' }}
            >
              {itemsPerPageOptions.map((option) => (
                <MenuItem key={option} value={option} sx={{ fontSize: '0.8rem' }}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* Paginación */}
        <MuiPagination
          count={totalPages}
          page={currentPage + 1} // MUI usa 1-based indexing
          onChange={(event, page) => onPageChange(page - 1)} // Convertir a 0-based
          color="primary"
          size="small"
          showFirstButton
          showLastButton
        />
      </Stack>
    </Box>
  );
};

export default Pagination;
