import React, { useEffect, useState } from 'react';
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, TextField, MenuItem, Select, InputAdornment, Chip, Fade,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, Stack
} from '@mui/material';
import {
  ArrowBack, ArrowForward, ArrowDownward, ArrowUpward, Search
} from '@mui/icons-material';
import axios from 'axios';

const ROWS_PER_PAGE = 5;

const WorkoutTable = () => {
  const [workouts, setWorkouts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [sortField, setSortField] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [timeframe, setTimeframe] = useState('this_week');
  const [animate, setAnimate] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [newWorkout, setNewWorkout] = useState({
    date: '',
    exercise: '',
    sets: '',
    reps: '',
    weight: ''
  });

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const res = await axios.get('http://localhost:8000/workout');
        const sorted = res.data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setWorkouts(sorted);
        applyFilters(search, timeframe, sortField, sortOrder, sorted);
      } catch (err) {
        console.error('Error fetching workouts:', err);
      }
    };
    fetchWorkouts();
  }, []);

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

  const applyFilters = (searchVal, timeframeVal, sortFieldVal, sortOrderVal, baseList = workouts) => {
    let filteredData = [...baseList];
    if (timeframeVal === 'this_week') filteredData = filteredData.filter(w => isThisWeek(w.date));
    if (timeframeVal === 'last_week') filteredData = filteredData.filter(w => isLastWeek(w.date));
    if (searchVal) filteredData = filteredData.filter(w => w.exercise.toLowerCase().includes(searchVal));
    filteredData.sort((a, b) => {
      const valA = a[sortFieldVal];
      const valB = b[sortFieldVal];
      return sortOrderVal === 'asc' ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
    });
    setFiltered(filteredData);
    setPage(0);
  };

  const handleSearch = (e) => {
    const val = e.target.value.toLowerCase();
    setSearch(val);
    applyFilters(val, timeframe, sortField, sortOrder);
  };

  const handleTimeframeChange = (val) => {
    setTimeframe(val);
    applyFilters(search, val, sortField, sortOrder);
  };

  const handleSort = (field) => {
    const isAsc = sortField === field && sortOrder === 'asc';
    const newOrder = isAsc ? 'desc' : 'asc';
    setSortOrder(newOrder);
    setSortField(field);
    applyFilters(search, timeframe, field, newOrder);
  };

  const handlePageChange = (newPage) => {
    setAnimate(false);
    setTimeout(() => {
      setPage(newPage);
      setAnimate(true);
    }, 50);
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      await axios.post('http://localhost:8000/workout', json);
      const updated = await axios.get('http://localhost:8000/workout');
      const sorted = updated.data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setWorkouts(sorted);
      applyFilters(search, timeframe, sortField, sortOrder, sorted);
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  const handleFormSubmit = async () => {
    const today = new Date().toISOString().split('T')[0];
    const entryDate = new Date(newWorkout.date).toISOString().split('T')[0];
    const status = entryDate < today ? 'complete' : 'in_progress';

    const newEntry = {
      ...newWorkout,
      sets: parseInt(newWorkout.sets),
      reps: parseInt(newWorkout.reps),
      weight: parseInt(newWorkout.weight),
      status
    };

    try {
      await axios.post('http://localhost:8000/workout', [newEntry]);
      const updated = await axios.get('http://localhost:8000/workout');
      const sorted = updated.data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setWorkouts(sorted);
      applyFilters(search, timeframe, sortField, sortOrder, sorted);
      setFormOpen(false);
      setNewWorkout({ date: '', exercise: '', sets: '', reps: '', weight: '' });
    } catch (err) {
      console.error('Failed to submit workout', err);
    }
  };

  const getSortIcon = (field) =>
    sortField === field ? (sortOrder === 'asc' ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />) : null;

  const getStatusChip = (dateStr) => {
    const workoutDate = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isPast = workoutDate < today;

    return (
      <Chip
        label={isPast ? "Completed" : "Upcoming"}
        variant="outlined"
        color={isPast ? "success" : "warning"}
        size="small"
        sx={{
          fontWeight: 500,
          bgcolor: isPast ? '#ecfdf5' : '#fef9c3',
          color: isPast ? '#059669' : '#92400e',
          boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
        }}
      />
    );
  };

  const pageData = filtered.slice(page * ROWS_PER_PAGE, (page + 1) * ROWS_PER_PAGE);

  return (
    <Box sx={{ p: 3, borderRadius: 4, background: '#fff', boxShadow: '0 8px 24px rgba(0,0,0,0.03)' }}>
      {/* Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <TextField
          placeholder="Search exercise..."
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
      <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: 'hidden'}}>
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
              {['date', 'exercise', 'sets', 'reps', 'weight'].map((field) => (
                <TableCell
                  key={field}
                  onClick={() => handleSort(field)}
                  sx={{ cursor: 'pointer' }}
                  align={['sets', 'reps', 'weight'].includes(field) ? 'center' : 'left'}
                >
                  {field.charAt(0).toUpperCase() + field.slice(1)} {getSortIcon(field)}
                </TableCell>
              ))}
              <TableCell align="center">Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pageData.map((w, idx) => (
              <Fade in={animate} timeout={300} key={idx}>
                <TableRow
                  hover
                  sx={{
                    height: 55,
                    transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
                    '&:hover': {
                      backgroundColor: '#f9fafb',
                      boxShadow: 'inset 0 0 0 9999px rgba(0, 0, 0, 0.02)'
                    }
                  }}
                >
                  <TableCell sx={{ py: 1.5, px: 2 }}>
                    {new Date(w.date + 'T00:00:00').toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric'
                    })}
                  </TableCell>
                  <TableCell>{w.exercise}</TableCell>
                  <TableCell sx={{ py: 1.5, px: 2 }} align="center">{w.sets}</TableCell>
                  <TableCell sx={{ py: 1.5, px: 2 }} align="center">{w.reps}</TableCell>
                  <TableCell sx={{ py: 1.5, px: 2 }} align="center">{w.weight} lbs</TableCell>
                  <TableCell sx={{ py: 1.5, px: 2 }} align="center">{getStatusChip(w.date)}</TableCell>
                </TableRow>
              </Fade>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
        <IconButton onClick={() => handlePageChange(page - 1)} disabled={page === 0}>
          <ArrowBack />
        </IconButton>
        <IconButton onClick={() => handlePageChange(page + 1)} disabled={(page + 1) * ROWS_PER_PAGE >= filtered.length}>
          <ArrowForward />
        </IconButton>
      </Box>

      {/* Manual Entry Form Dialog */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)}>
        <DialogTitle>Add Workout Entry</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField label="Date" type="date" value={newWorkout.date} onChange={(e) => setNewWorkout({ ...newWorkout, date: e.target.value })} InputLabelProps={{ shrink: true }} fullWidth />
            <TextField label="Exercise" value={newWorkout.exercise} onChange={(e) => setNewWorkout({ ...newWorkout, exercise: e.target.value })} fullWidth />
            <TextField label="Sets" type="number" value={newWorkout.sets} onChange={(e) => setNewWorkout({ ...newWorkout, sets: e.target.value })} fullWidth />
            <TextField label="Reps" type="number" value={newWorkout.reps} onChange={(e) => setNewWorkout({ ...newWorkout, reps: e.target.value })} fullWidth />
            <TextField label="Weight (lbs)" type="number" value={newWorkout.weight} onChange={(e) => setNewWorkout({ ...newWorkout, weight: e.target.value })} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormOpen(false)}>Cancel</Button>
          <Button onClick={handleFormSubmit} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WorkoutTable;
