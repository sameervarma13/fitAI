// src/components/NutritionTable.jsx
import React, { useEffect, useState } from 'react';
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, TextField, MenuItem, Select, InputAdornment, Fade,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, Stack
} from '@mui/material';
import {
  ArrowBack, ArrowForward, Search
} from '@mui/icons-material';
import axios from 'axios';

const ROWS_PER_PAGE = 5;

const COLUMNS = [
  { key: 'date', label: 'Date' },
  { key: 'calories', label: 'Calories' },
  { key: 'protein', label: 'Protein (g)' },
  { key: 'carbs', label: 'Carbs (g)' },
  { key: 'fat', label: 'Fat (g)' },
  { key: 'sugar', label: 'Sugar (g)' },
  { key: 'fiber', label: 'Fiber (g)' },
  { key: 'sodium', label: 'Sodium (mg)' },
  { key: 'cholesterol', label: 'Cholesterol (mg)' }
];
const COLUMNS_PER_PAGE = 5;

const NutritionTable = () => {
  const [nutritionData, setNutritionData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [timeframe, setTimeframe] = useState('this_week');
  const [animate, setAnimate] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [columnPage, setColumnPage] = useState(0);

  const totalColumnPages = Math.ceil(COLUMNS.length / COLUMNS_PER_PAGE);
  const visibleColumns = COLUMNS.slice(columnPage * COLUMNS_PER_PAGE, (columnPage + 1) * COLUMNS_PER_PAGE);

  const [newEntry, setNewEntry] = useState({
    date: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: ''
  });

  useEffect(() => {
    fetchNutrition();
  }, []);

  const fetchNutrition = async () => {
    try {
      const res = await axios.get('http://localhost:8000/nutrition');
      const sorted = res.data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setNutritionData(sorted);
      applyFilters(search, timeframe, sorted);
    } catch (err) {
      console.error('Error fetching nutrition:', err);
    }
  };

  const formatDate = (dateStr) =>
    new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });

  const isThisWeek = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay());
    const end = new Date(start);
    end.setDate(start.getDate() + 7);
    return date >= start && date < end;
  };

  const isLastWeek = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay() - 7);
    const end = new Date(start);
    end.setDate(start.getDate() + 7);
    return date >= start && date < end;
  };

  const applyFilters = (searchVal, timeframeVal, baseList = nutritionData) => {
    let filteredData = [...baseList];
    if (timeframeVal === 'this_week') filteredData = filteredData.filter(w => isThisWeek(w.date));
    if (timeframeVal === 'last_week') filteredData = filteredData.filter(w => isLastWeek(w.date));
    if (searchVal) filteredData = filteredData.filter(w => formatDate(w.date).toLowerCase().includes(searchVal));
    setFiltered(filteredData);
    setPage(0);
  };

  const handleSearch = (e) => {
    const val = e.target.value.toLowerCase();
    setSearch(val);
    applyFilters(val, timeframe);
  };

  const handlePageChange = (newPage) => {
    setAnimate(false);
    setTimeout(() => {
      setPage(newPage);
      setAnimate(true);
    }, 50);
  };

  const handleTimeframeChange = (val) => {
    setTimeframe(val);
    applyFilters(search, val);
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      await axios.post('http://localhost:8000/nutrition', json);
      fetchNutrition();
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  const handleFormSubmit = async () => {
    try {
      await axios.post('http://localhost:8000/nutrition', [newEntry]);
      fetchNutrition();
      setFormOpen(false);
      setNewEntry({ date: '', calories: '', protein: '', carbs: '', fat: '' });
    } catch (err) {
      console.error('Failed to submit nutrition entry', err);
    }
  };

  const pageData = filtered.slice(page * ROWS_PER_PAGE, (page + 1) * ROWS_PER_PAGE);

  return (
    <Box sx={{ p: 3, borderRadius: 4, background: '#fff', boxShadow: '0 8px 24px rgba(0,0,0,0.03)' }}>
      {/* Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <TextField
          placeholder="Search date..."
          value={search}
          onChange={handleSearch}
          size="small"
          variant="outlined"
          sx={{ bgcolor: '#fff', borderRadius: 2, minWidth: 220, flex: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            )
          }}
        />
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Select
            size="small"
            value={timeframe}
            onChange={(e) => handleTimeframeChange(e.target.value)}
            sx={{ bgcolor: '#fff', borderRadius: 2, minWidth: 130 }}
          >
            <MenuItem value="this_week">This Week</MenuItem>
            <MenuItem value="last_week">Last Week</MenuItem>
            <MenuItem value="all">All Time</MenuItem>
          </Select>
          <Button variant="contained" component="label" size="small" sx={{ borderRadius: 2, bgcolor: '#3b82f6' }}>
            Upload File
            <input hidden accept=".json" type="file" onChange={handleUpload} />
          </Button>
          <Button variant="outlined" size="small" onClick={() => setFormOpen(true)} sx={{ borderRadius: 2 }}>
            Add Manually
          </Button>
        </Box>
      </Box>

      {/* Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Table size="small">
          <TableHead>
            <TableRow
              sx={{
                background: 'linear-gradient(to right, #3b82f6, #9333ea)',
                '& th': {
                  color: '#fff',
                  fontWeight: 'bold',
                  py: 1.5,
                  px: 2
                }
              }}
            >
              {visibleColumns.map((col) => (
                <TableCell key={col.key}>{col.label}</TableCell>
              ))}
              <TableCell align="right">
                <IconButton
                  size="small"
                  sx={{ color: '#fff' }}
                  disabled={columnPage === 0}
                  onClick={() => setColumnPage((prev) => Math.max(0, prev - 1))}
                >
                  <ArrowBack fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  sx={{ color: '#fff' }}
                  disabled={columnPage >= totalColumnPages - 1}
                  onClick={() => setColumnPage((prev) => Math.min(totalColumnPages - 1, prev + 1))}
                >
                  <ArrowForward fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pageData.map((row, idx) => (
              <Fade in={animate} timeout={300} key={idx}>
                <TableRow
                  hover
                  sx={{
                    height: 56,
                    transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
                    '&:hover': {
                      backgroundColor: '#f9fafb',
                      boxShadow: 'inset 0 0 0 9999px rgba(0, 0, 0, 0.02)'
                    }
                  }}
                >
                  {visibleColumns.map((col) => (
                    <TableCell key={col.key} sx={{ py: 1.5, px: 2 }}>
                      {col.key === 'date' ? formatDate(row[col.key]) : row[col.key]}
                    </TableCell>
                  ))}
                  <TableCell />
                </TableRow>
              </Fade>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Row Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
        <IconButton onClick={() => handlePageChange(page - 1)} disabled={page === 0}>
          <ArrowBack />
        </IconButton>
        <IconButton onClick={() => handlePageChange(page + 1)} disabled={(page + 1) * ROWS_PER_PAGE >= filtered.length}>
          <ArrowForward />
        </IconButton>
      </Box>

      {/* Manual Entry Form */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)}>
        <DialogTitle>Add Nutrition Entry</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField label="Date" type="date" value={newEntry.date} onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })} InputLabelProps={{ shrink: true }} fullWidth />
            <TextField label="Calories" type="number" value={newEntry.calories} onChange={(e) => setNewEntry({ ...newEntry, calories: e.target.value })} fullWidth />
            <TextField label="Protein (g)" type="number" value={newEntry.protein} onChange={(e) => setNewEntry({ ...newEntry, protein: e.target.value })} fullWidth />
            <TextField label="Carbs (g)" type="number" value={newEntry.carbs} onChange={(e) => setNewEntry({ ...newEntry, carbs: e.target.value })} fullWidth />
            <TextField label="Fat (g)" type="number" value={newEntry.fat} onChange={(e) => setNewEntry({ ...newEntry, fat: e.target.value })} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleFormSubmit}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NutritionTable;
