import React from 'react';
import {
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
  useTheme as useMuiTheme
} from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';

const SearchBar = ({
  searchQuery,
  onSearchChange,
  onClearSearch,
  searching = false,
  disabled = false,
  placeholder = 'Buscar...',
  label = 'Buscar',
  size = 'small'
}) => {
  const muiTheme = useMuiTheme();

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  return (
    <TextField
      size={size}
      variant="outlined"
      label={label}
      placeholder={placeholder}
      value={searchQuery}
      onChange={onSearchChange}
      onKeyPress={handleKeyPress}
      disabled={disabled}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon color="action" fontSize="small" />
          </InputAdornment>
        ),
        endAdornment: searchQuery ? (
          <InputAdornment position="end">
            <IconButton size="small" onClick={onClearSearch} disabled={disabled} sx={{ mr: 0.5 }}>
              <ClearIcon fontSize="small" />
            </IconButton>
            {searching && <CircularProgress size={16} />}
          </InputAdornment>
        ) : (
          searching && <CircularProgress size={16} />
        )
      }}
      sx={{
        '& .MuiInputBase-root': {
          fontFamily: muiTheme.fontFamily,
          fontSize: '0.875rem'
        },
        '& .MuiInputLabel-root': {
          fontFamily: muiTheme.fontFamily,
          fontSize: '0.8rem'
        },
        '& .MuiFormHelperText-root': {
          fontFamily: muiTheme.fontFamily,
          fontSize: '0.75rem'
        },
        minWidth: 200,
        maxWidth: 300
      }}
    />
  );
};

export default SearchBar;
