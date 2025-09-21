import * as React from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import {
  AppBar, Avatar, Badge, Box, Button, Card, CardContent, CardHeader, Chip,
  Container, CssBaseline, Dialog, DialogActions, DialogContent, DialogTitle, FormControl,
  Grid, IconButton, InputLabel, MenuItem, Select, Snackbar, Stack, Table, TableBody,
  TableCell, TableHead, TableRow, TextField, Toolbar, Tooltip, Typography, Paper,
  Drawer, Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Tabs, Tab, useTheme, useMediaQuery, alpha, CircularProgress, Backdrop
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PaymentsIcon from "@mui/icons-material/Payments";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import CampaignIcon from "@mui/icons-material/Campaign";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import TodayIcon from "@mui/icons-material/Today";
import EventIcon from "@mui/icons-material/Event";
import { loadStripe } from '@stripe/stripe-js';

import { useNavigate } from "react-router-dom";
import ProfileManagementModal from "./ProfileManagementModal";

const stripePromise = loadStripe('pk_test_51S4brZ8HfEknvOjMj4WwaAEOi6PY2W3hVsXGMPbRPrM5sGCeXnWzqZDDTwoqPfQEO5korL6wbFMpr0z4tJH9lLEI00xbweJrXN'); // Replace with your Stripe key

const drawerWidth = 280;

// ---------- axios instance with auth header ----------
const api = axios.create({ baseURL: "http://localhost:5000/api" });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers["x-auth-token"] = token;
  return config;
});

// ---------- small shared UI ----------
const SearchField = ({ placeholder = "Search…", onChange, sx = {} }) => (
  <TextField
    size="small"
    placeholder={placeholder}
    onChange={onChange}
    sx={{
      minWidth: 200,
      '& .MuiOutlinedInput-root': {
        borderRadius: 2,
        ...sx
      }
    }}
    InputProps={{
      startAdornment: (
        <IconButton size="small" sx={{ mr: 1 }}>
          <SearchIcon />
        </IconButton>
      ),
    }}
  />
);

const SummaryCard = ({ title, value, icon, color = "primary" }) => (
  <Card 
    elevation={0} 
    sx={{ 
      background: (theme) => 
        `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.1)} 0%, ${alpha(theme.palette[color].main, 0.05)} 100%)`,
      border: (theme) => `1px solid ${alpha(theme.palette[color].main, 0.2)}`,
      borderRadius: 3
    }}
  >
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight={700} color={`${color}.main`}>
            {value}
          </Typography>
        </Box>
        <Avatar 
          variant="rounded" 
          sx={{ 
            bgcolor: `${color}.light`, 
            color: `${color}.dark`,
            width: 48,
            height: 48
          }}
        >
          {icon}
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

// ---------- Overview ----------
function OverviewSection({ studentId, klass, section }) {
  const [totals, setTotals] = React.useState({ dueCount: 0, dueAmount: 0, notices: 0 });
  const [recentNotices, setRecentNotices] = React.useState([]);
  const [nextClass, setNextClass] = React.useState(null);
  const [snack, setSnack] = React.useState("");

  const dayShort = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][new Date().getDay()];

  const fetchAll = async () => {
    try {
      const [feesRes, notRes, ttRes] = await Promise.all([
        studentId ? api.get(`/fees`, { params: { studentId } }) : Promise.resolve({ data: [] }),
        api.get(`/notices`),
        klass ? api.get(`/timetable`, { params: { class: klass } }) : Promise.resolve({ data: [] }),
      ]);

      const due = (feesRes.data || []).filter(f => f.status !== "PAID" && f.status !== "PENDING");
      const dueAmount = due.reduce((s, f) => s + Number(f.amount || 0), 0);

      setTotals({ dueCount: due.length, dueAmount, notices: (notRes.data || []).length });

      setRecentNotices((notRes.data || [])
        .filter(n => !n.audience || n.audience === "ALL" || n.audience === "STUDENT")
        .slice(0, 5));

      const tt = ttRes.data || [];
      const todays = tt.filter(x => x.day === dayShort);
      const byTime = (arr) => arr.sort((a,b) => (a.period||"").localeCompare(b.period||""));
      setNextClass(todays.length ? byTime(todays)[0] : byTime(tt)[0] || null);
    } catch (e) {
      console.error("Overview fetch error:", e);
      setSnack("Failed to load overview");
    }
  };

  React.useEffect(() => { if (studentId) fetchAll(); }, [studentId, klass, section]);

  return (
    <Box>
      <Typography variant="h5" mb={3} fontWeight={700}>Overview</Typography>
      
      {/* Student Grade & Section Highlight */}
      <Card 
        elevation={3}
        sx={{ 
          mb: 3,
          background: (theme) => 
            `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          borderRadius: 3,
          overflow: 'hidden'
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h6" sx={{ opacity: 0.9, mb: 1 }}>
                Current Class
              </Typography>
              <Typography variant="h3" fontWeight={700} sx={{ mb: 1 }}>
                Grade {klass ? klass.match(/\d+/)?.[0] || klass : 'N/A'}
                {section && (
                  <Box component="span" sx={{ ml: 2, fontSize: '0.8em', opacity: 0.9 }}>
                    Section {section}
                  </Box>
                )}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Academic Year 2024/2025
              </Typography>
            </Box>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Avatar 
                sx={{ 
                  width: 80, 
                  height: 80, 
                  bgcolor: 'rgba(255,255,255,0.2)',
                  fontSize: '2rem',
                  fontWeight: 700
                }}
              >
                {klass ? klass.match(/\d+/)?.[0] || klass.charAt(0) : 'N/A'}
              </Avatar>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <SummaryCard 
            title="Outstanding Fees" 
            value={totals.dueCount} 
            icon={<PaymentsIcon />} 
            color="warning" 
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <SummaryCard 
            title="Amount Due (LKR)" 
            value={totals.dueAmount.toLocaleString()} 
            icon={<ReceiptLongIcon />} 
            color="error" 
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <SummaryCard 
            title="Active Notices" 
            value={totals.notices} 
            icon={<CampaignIcon />} 
            color="info" 
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} mt={1}>
        <Grid item xs={12} md={6}>
          <Card elevation={2} sx={{ borderRadius: 3 }}>
            <CardHeader title="Next Class" />
            <CardContent>
              {nextClass ? (
                <Stack spacing={1.5}>
                  <Typography variant="h6" color="primary.main">
                    {nextClass.subject}
                  </Typography>
                  <Box display="flex" alignItems="center">
                    <Typography variant="body2" sx={{ mr: 2 }}>
                      <Box component="span" fontWeight={600}>Teacher:</Box> {nextClass.teacher}
                    </Typography>
                    <Chip 
                      size="small" 
                      label={`Room: ${nextClass.room}`} 
                      variant="outlined" 
                      color="primary" 
                    />
                  </Box>
                  <Box display="flex" alignItems="center">
                    <Chip 
                      size="small" 
                      label={nextClass.day} 
                      sx={{ mr: 1 }} 
                      color="primary" 
                      variant="filled"
                    />
                    <Chip 
                      size="small" 
                      label={`Period: ${nextClass.period}`} 
                      variant="outlined" 
                    />
                  </Box>
                </Stack>
              ) : (
                <Typography color="text.secondary">No upcoming class found.</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={2} sx={{ borderRadius: 3 }}>
            <CardHeader title="Recent Notices" />
            <CardContent sx={{ maxHeight: 300, overflow: 'auto' }}>
              {recentNotices.length > 0 ? (
                <Stack spacing={2}>
                  {recentNotices.map(n => (
                    <Paper key={n._id || n.id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        {n.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {n.message}
                      </Typography>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption">By: {n.postedBy}</Typography>
                        <Typography variant="caption">{n.date}</Typography>
                      </Box>
                    </Paper>
                  ))}
                </Stack>
              ) : (
                <Typography color="text.secondary" align="center">
                  No notices available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar 
        open={!!snack} 
        autoHideDuration={2500} 
        onClose={() => setSnack("")} 
        message={snack} 
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}

// ---------- Calendar View for Timetable ----------
function CalendarView({ klass, events }) {
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  // Get events for selected date
  const dayEvents = events.filter(event => 
    event.day === daysOfWeek[selectedDate.getDay()]
  );

  // Generate days for the current week
  const getWeekDates = () => {
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
    
    return Array.from({ length: 7 }).map((_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return date;
    });
  };

  const weekDates = getWeekDates();

  return (
    <Box>
      <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3}>
        {/* Week view */}
        <Paper elevation={2} sx={{ p: 3, borderRadius: 3, flex: 1 }}>
          <Typography variant="h6" gutterBottom>
            This Week's Schedule
          </Typography>
          
          <Box display="flex" justifyContent="space-between" mb={2}>
            <Button 
              size="small" 
              onClick={() => {
                const prevWeek = new Date(selectedDate);
                prevWeek.setDate(prevWeek.getDate() - 7);
                setSelectedDate(prevWeek);
              }}
            >
              Previous Week
            </Button>
            <Typography variant="body2" fontWeight={500}>
              {weekDates[0].toLocaleDateString()} - {weekDates[6].toLocaleDateString()}
            </Typography>
            <Button 
              size="small" 
              onClick={() => {
                const nextWeek = new Date(selectedDate);
                nextWeek.setDate(nextWeek.getDate() + 7);
                setSelectedDate(nextWeek);
              }}
            >
              Next Week
            </Button>
          </Box>
          
          <Grid container spacing={1}>
            {weekDates.map((date, index) => {
              const dayEvents = events.filter(event => event.day === daysOfWeek[date.getDay()]);
              const isToday = date.toDateString() === new Date().toDateString();
              
              return (
                <Grid item xs={12} key={index}>
                  <Paper 
                    variant={isToday ? "elevation" : "outlined"} 
                    elevation={isToday ? 2 : 0}
                    sx={{ 
                      p: 2, 
                      borderRadius: 2,
                      bgcolor: isToday ? 'primary.light' : 'transparent',
                      borderLeft: `4px solid`,
                      borderLeftColor: dayEvents.length > 0 ? 'primary.main' : 'transparent'
                    }}
                    onClick={() => setSelectedDate(date)}
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {daysOfWeek[date.getDay()]}
                        </Typography>
                        <Typography variant="body2">
                          {date.getDate()} {date.toLocaleString('default', { month: 'short' })}
                        </Typography>
                      </Box>
                      {dayEvents.length > 0 && (
                        <Chip 
                          label={`${dayEvents.length} class${dayEvents.length > 1 ? 'es' : ''}`} 
                          size="small" 
                          color="primary" 
                          variant="outlined" 
                        />
                      )}
                    </Box>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </Paper>
        
        {/* Day view */}
        <Paper elevation={2} sx={{ p: 3, borderRadius: 3, flex: 2 }}>
          <Typography variant="h6" gutterBottom>
            Classes on {daysOfWeek[selectedDate.getDay()]}, {selectedDate.toLocaleDateString()}
          </Typography>
          
          {dayEvents.length > 0 ? (
            <Stack spacing={2}>
              {dayEvents.map((event, index) => (
                <Paper 
                  key={index} 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    borderRadius: 2,
                    borderLeft: `4px solid`,
                    borderLeftColor: 'primary.main'
                  }}
                >
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {event.subject}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {event.teacher} • {event.period}
                      </Typography>
                    </Box>
                    <Chip 
                      label={event.room} 
                      size="small" 
                      variant="outlined" 
                      color="primary" 
                    />
                  </Box>
                </Paper>
              ))}
            </Stack>
          ) : (
            <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
              No classes scheduled for this day
            </Typography>
          )}
        </Paper>
      </Box>
    </Box>
  );
}

// ---------- My Timetable ----------
function TimetableSection({ klass }) {
  const [rows, setRows] = React.useState([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [snack, setSnack] = React.useState("");
  const [view, setView] = React.useState('calendar'); // 'calendar' or 'table'

  const fetchTT = async () => {
    try {
      if (!klass) {
        setRows([]);
        return;
      }
      
      const params = { class: klass };
      if (searchTerm) params.search = searchTerm;
      
      const res = await api.get(`/timetable`, { params });
      setRows(res.data || []);
    } catch (e) {
      console.error("Timetable fetch error:", e);
      setSnack("Failed to load timetable");
    }
  };

  React.useEffect(() => { if (klass) fetchTT(); }, [klass, searchTerm]);

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>My Timetable</Typography>
        
        <Box display="flex" gap={2} alignItems="center">
          <SearchField 
            placeholder="Search subject/teacher…" 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
          
          <Button
            variant={view === 'table' ? 'contained' : 'outlined'}
            onClick={() => setView('table')}
            size="small"
            startIcon={<EventIcon />}
          >
            Table View
          </Button>
          <Button
            variant={view === 'calendar' ? 'contained' : 'outlined'}
            onClick={() => setView('calendar')}
            size="small"
            startIcon={<TodayIcon />}
          >
            Calendar View
          </Button>
        </Box>
      </Stack>
      
      {view === 'table' ? (
        <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 600 }}>Day</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Period</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Class</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Subject</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Teacher</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Room</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map(r => (
                <TableRow key={r._id || r.id} hover>
                  <TableCell>
                    <Chip label={r.day} size="small" color="primary" variant="outlined" />
                  </TableCell>
                  <TableCell>{r.period}</TableCell>
                  <TableCell>{r.class}</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>{r.subject}</TableCell>
                  <TableCell>{r.teacher}</TableCell>
                  <TableCell>{r.room}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {rows.length === 0 && !searchTerm && (
            <Box sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
              <CalendarMonthIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Timetable Found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {klass 
                  ? `No classes scheduled for ${klass}. Contact your admin to create a timetable for your class.` 
                  : "Please wait while we load your profile. If this persists, contact admin to assign you to a grade and section."
                }
              </Typography>
              {klass && (
                <Typography variant="body2" color="primary" sx={{ mt: 1, fontWeight: 500 }}>
                  Your Class: {klass}
                </Typography>
              )}
            </Box>
          )}
        </Paper>
      ) : (
        <CalendarView klass={klass} events={rows} />
      )}
      
      <Snackbar 
        open={!!snack} 
        autoHideDuration={2500} 
        onClose={() => setSnack("")} 
        message={snack} 
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}

// ---------- My Fees with Stripe Integration ----------
function FeesSection({ studentId }) {
  const [rows, setRows] = React.useState([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [snack, setSnack] = React.useState("");
  const [paying, setPaying] = React.useState(null);
  const [payMethod, setPayMethod] = React.useState("CARD");
  const [uploadFile, setUploadFile] = React.useState(null);
  const [uploading, setUploading] = React.useState(false);

  const fetchFees = async () => {
    try {
      if (!studentId) {
        setRows([]);
        return;
      }
      
      const params = { studentId };
      if (searchTerm) params.search = searchTerm;
      
      const res = await api.get(`/fees`, { params });
      setRows(res.data || []);
    } catch (e) {
      console.error("Fees fetch error:", e);
      setSnack("Failed to load fees");
    }
  };

  React.useEffect(() => { if (studentId) fetchFees(); }, [studentId, searchTerm]);

  const handleStripePayment = async (fee) => {
    try {
      // Create a payment session with the server
      const sessionRes = await api.post('/create-payment-session', {
        feeId: fee._id || fee.id,
        amount: fee.amount,
        description: `Payment for ${fee.term} term fees`,
        studentId: studentId,
        userType: 'student'
      });
      const stripe = await stripePromise;
      const { error } = await stripe.redirectToCheckout({
        sessionId: sessionRes.data.id,
      });
      if (error) {
        alert("Payment failed: " + error.message);
        // Optionally update payment status in DB as failed
        await api.post(`/fees/${fee._id || fee.id}/pay`, { method: "CARD", status: "FAILED" });
        window.location.href = "/student/dashboard";
      }
      // On success, Stripe will redirect back, so handle in useEffect below
    } catch (err) {
      console.error("Stripe payment error:", err);
      alert("Payment initialization failed");
    }
  };

  // Remove payment redirect handling since it's now handled in PaymentResult component

  const startPay = (row) => {
    setPaying(row);
    setPayMethod("CARD");
  };

  const confirmPay = async () => {
    try {
      if (payMethod === "CARD") {
        // Stripe payment: redirect to gateway
        await handleStripePayment(paying);
        // Do not setPaying(null) here, let redirect happen
        return; // Don't continue after redirect
      } else if (payMethod === "BANK") {
        if (!uploadFile) {
          setSnack("Please upload your bank transfer slip.");
          return;
        }
        
        setUploading(true);
        const formData = new FormData();
        formData.append("file", uploadFile);
        formData.append("method", "BANK");
        formData.append("feeId", paying._id || paying.id);
        formData.append("studentId", studentId);
        
        const response = await api.post(`/fees/${paying._id || paying.id}/pay`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        setSnack("Bank transfer slip uploaded. Payment will be verified soon.");
        setUploading(false);
        setPaying(null);
        setUploadFile(null);
        fetchFees();
      }
      // Removed CASH payment logic - students should visit office directly
    } catch (e) {
      setUploading(false);
      console.error("Payment upload error:", e);
      
      // Extract error message from response
      const errorMessage = e.response?.data?.error || e.response?.data?.msg || e.message || "Payment failed";
      setSnack(`Payment failed: ${errorMessage}`);
    }
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>My Fees</Typography>
        <SearchField placeholder="Search term/invoice…" onChange={(e) => setSearchTerm(e.target.value)} />
      </Stack>
      
      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell sx={{ fontWeight: 600 }}>Invoice</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Term</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Amount (LKR)</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(r => (
              <TableRow key={r._id || r.id} hover>
                <TableCell>#{r._id?.substring(0, 8) || r.id}</TableCell>
                <TableCell>{r.term}</TableCell>
                <TableCell sx={{ fontWeight: 500 }}>{Number(r.amount || 0).toLocaleString()}</TableCell>
                <TableCell>
                  <Chip 
                    size="small" 
                    label={r.status} 
                    color={
                      r.status === "PAID" ? "success" : 
                      r.status === "PENDING" ? "warning" : "error"
                    } 
                    variant={r.status === "PAID" ? "filled" : "outlined"}
                  />
                </TableCell>
                <TableCell>{r.date || "-"}</TableCell>
                <TableCell align="right">
                  {r.status !== "PAID" && r.status !== "PENDING" && (
                    <Button 
                      size="small" 
                      variant="contained" 
                      startIcon={<ReceiptLongIcon />} 
                      onClick={() => startPay(r)}
                      sx={{ borderRadius: 2 }}
                    >
                      Pay Now
                    </Button>
                  )}
                  {r.status === "PENDING" && (
                    <Chip 
                      label="Payment Processing" 
                      size="small" 
                      color="warning" 
                      variant="outlined"
                    />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Pay dialog */}
      <Dialog open={!!paying} onClose={() => setPaying(null)} fullWidth maxWidth="sm">
        <DialogTitle>
          <Typography variant="h6">Pay Invoice #{paying?._id?.substring(0, 8) || paying?.id}</Typography>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'grey.50' }}>
              <Typography variant="body2" color="text.secondary">Term</Typography>
              <Typography variant="h6">{paying?.term}</Typography>
            </Paper>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'grey.50' }}>
              <Typography variant="body2" color="text.secondary">Amount</Typography>
              <Typography variant="h5" color="primary.main">
                LKR {Number(paying?.amount || 0).toLocaleString()}
              </Typography>
            </Paper>
            <FormControl fullWidth>
              <InputLabel>Payment Method</InputLabel>
              <Select 
                label="Payment Method" 
                value={payMethod} 
                onChange={(e) => setPayMethod(e.target.value)}
              >
                <MenuItem value="CARD">Credit/Debit Card</MenuItem>
                <MenuItem value="BANK">Bank Transfer</MenuItem>
                <MenuItem value="CASH">Cash at Office</MenuItem>
              </Select>
            </FormControl>
            {payMethod === "CARD" && (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                You will be redirected to a secure payment page to complete your transaction.
              </Typography>
            )}
            {payMethod === "BANK" && (
              <Box>
                <Typography variant="subtitle2" color="primary.main" gutterBottom>Bank Transfer Details</Typography>
                <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                  <Typography variant="body2"><b>Bank Name:</b> Sampath Bank PLC</Typography>
                  <Typography variant="body2"><b>Branch:</b> Colombo Main</Typography>
                  <Typography variant="body2"><b>Account Name:</b> EduLink Lanka School</Typography>
                  <Typography variant="body2"><b>Account Number:</b> 1234567890</Typography>
                  <Typography variant="body2"><b>Reference:</b> Student ID {studentId} / Invoice #{paying?._id?.substring(0, 8) || paying?.id}</Typography>
                </Paper>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Please upload your bank transfer slip below. Payment will be verified within 1-2 working days.
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  sx={{ borderRadius: 2, mb: 1 }}
                  disabled={uploading}
                >
                  {uploadFile ? uploadFile.name : "Upload Bank Slip"}
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    hidden
                    onChange={e => {
                      const file = e.target.files[0];
                      if (file) {
                        // Validate file size (5MB limit)
                        if (file.size > 5 * 1024 * 1024) {
                          setSnack("File size must be less than 5MB");
                          return;
                        }
                        
                        // Validate file type
                        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
                        if (!allowedTypes.includes(file.type)) {
                          setSnack("Only images (JPG, PNG, GIF) and PDF files are allowed");
                          return;
                        }
                        
                        setUploadFile(file);
                      }
                    }}
                  />
                </Button>
                {uploadFile && (
                  <Typography variant="caption" color="text.secondary">{uploadFile.name}</Typography>
                )}
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  <b>Payment Estimate:</b> 1-2 working days after slip upload.<br/>
                  <b>Support:</b> Call 011-1234567 for help.
                </Typography>
              </Box>
            )}
            {payMethod === "CASH" && (
              <Box>
                <Typography variant="subtitle2" color="primary.main" gutterBottom>Pay at School Office</Typography>
                <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                  <Typography variant="body2"><b>Counter Opening Hours:</b> Mon-Fri 8:30am - 3:30pm</Typography>
                  <Typography variant="body2"><b>Location:</b> School Admin Office, Ground Floor</Typography>
                  <Typography variant="body2"><b>Payment Estimate:</b> Instant upon payment at counter</Typography>
                </Paper>
                <Typography variant="body2" color="text.secondary">
                  Please bring your Student ID and Invoice number for reference. No advance submission required - just visit the office during opening hours.
                </Typography>
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setPaying(null)} sx={{ borderRadius: 2 }} disabled={uploading}>Cancel</Button>
          {payMethod !== "CASH" && (
            <Button variant="contained" onClick={confirmPay} sx={{ borderRadius: 2 }} disabled={uploading}>
              {payMethod === "CARD" ? "Proceed to Payment" : payMethod === "BANK" ? (uploading ? "Uploading..." : "Submit Slip") : "Submit"}
            </Button>
          )}
          {payMethod === "CASH" && (
            <Button variant="outlined" onClick={() => setPaying(null)} sx={{ borderRadius: 2 }}>
              Got It
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={!!snack} 
        autoHideDuration={2500} 
        onClose={() => setSnack("")} 
        message={snack} 
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}

// ---------- My Results ----------
function ResultsSection({ studentId }) {
  const [rows, setRows] = React.useState([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [snack, setSnack] = React.useState("");

  const fetchResults = async () => {
    try {
      if (!studentId) {
        setRows([]);
        return;
      }
      
      const params = { studentId };
      if (searchTerm) params.search = searchTerm;
      
      const res = await api.get(`/results`, { params });
      setRows(res.data || []);
    } catch (e) {
      console.error("Results fetch error:", e);
      setSnack("Failed to load results");
    }
  };

  React.useEffect(() => { if (studentId) fetchResults(); }, [studentId, searchTerm]);

  const downloadSlip = async () => {
    try {
      const res = await api.get(`/reports/result-slip/${studentId}`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url; a.download = `result-slip-${studentId}.pdf`;
      document.body.appendChild(a); a.click(); a.remove();
      setSnack("Result slip downloaded");
    } catch (e) {
      console.error(e);
      setSnack("Failed to download result slip");
    }
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>My Results</Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <SearchField placeholder="Search subject/exam…" onChange={(e) => setSearchTerm(e.target.value)} />
          <Button 
            variant="contained" 
            onClick={downloadSlip}
            sx={{ borderRadius: 2 }}
          >
            Download Result Slip
          </Button>
        </Stack>
      </Stack>
      
      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell sx={{ fontWeight: 600 }}>Subject</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Exam</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Score</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Grade</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(r => (
              <TableRow key={r._id || r.id} hover>
                <TableCell sx={{ fontWeight: 500 }}>{r.subject}</TableCell>
                <TableCell>{r.exam}</TableCell>
                <TableCell>
                  <Chip 
                    label={r.score} 
                    color={
                      r.score >= 80 ? "success" : 
                      r.score >= 60 ? "primary" : 
                      r.score >= 40 ? "warning" : "error"
                    } 
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={r.grade} 
                    color={
                      r.grade === 'A' ? "success" : 
                      r.grade === 'B' ? "primary" : 
                      r.grade === 'C' ? "warning" : "default"
                    } 
                    variant="outlined"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {rows.length === 0 && !searchTerm && (
          <Box sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
            <AssignmentTurnedInIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Results Found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {studentId ? "You don't have any exam results in the system yet." : "Please wait while we load your profile."}
            </Typography>
          </Box>
        )}
      </Paper>
      
      <Snackbar 
        open={!!snack} 
        autoHideDuration={2500} 
        onClose={() => setSnack("")} 
        message={snack} 
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}

// ---------- Notices ----------
function NoticesSection() {
  const [rows, setRows] = React.useState([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [snack, setSnack] = React.useState("");

  const fetchNotices = async () => {
    try {
      const res = await api.get(`/notices`, { params: { search: searchTerm } });
      const data = (res.data || []).filter(n => !n.audience || n.audience === "ALL" || n.audience === "STUDENT");
      setRows(data);
    } catch (e) {
      console.error(e);
      setSnack("Failed to load notices");
    }
  };

  React.useEffect(() => { fetchNotices(); }, [searchTerm]);

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>Notices</Typography>
        <SearchField placeholder="Search notices…" onChange={(e) => setSearchTerm(e.target.value)} />
      </Stack>
      
      {rows.length > 0 ? (
        <Stack spacing={2}>
          {rows.map(r => (
            <Paper 
              key={r._id || r.id} 
              elevation={1} 
              sx={{ 
                p: 3, 
                borderRadius: 3,
                borderLeft: `4px solid`,
                borderLeftColor: 'primary.main'
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                <Typography variant="h6">{r.title}</Typography>
                <Chip 
                  label={r.date} 
                  size="small" 
                  variant="outlined" 
                  color="primary" 
                />
              </Box>
              
              <Typography variant="body1" paragraph>
                {r.message}
              </Typography>
              
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="caption" color="text.secondary">
                  Posted by: {r.postedBy}
                </Typography>
                {r.important && (
                  <Chip 
                    label="Important" 
                    size="small" 
                    color="error" 
                    variant="outlined" 
                  />
                )}
              </Box>
            </Paper>
          ))}
        </Stack>
      ) : (
        <Paper variant="outlined" sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
          <CampaignIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No notices available
          </Typography>
        </Paper>
      )}
      
      <Snackbar 
        open={!!snack} 
        autoHideDuration={2500} 
        onClose={() => setSnack("")} 
        message={snack} 
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}

// ---------- Drawer Navigation ----------
const NAV_ITEMS = [
  { key: "Overview", label: "Overview", icon: <DashboardIcon /> },
  { key: "Timetable", label: "My Timetable", icon: <CalendarMonthIcon /> },
  { key: "Fees", label: "My Fees", icon: <PaymentsIcon /> },
  { key: "Results", label: "My Results", icon: <AssignmentTurnedInIcon /> },
  { key: "Notices", label: "Notices", icon: <CampaignIcon /> },
];

const StudentDashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [section, setSection] = React.useState("Overview");
  const [currentUserProfile, setCurrentUserProfile] = React.useState(null);
  const [profileModalOpen, setProfileModalOpen] = React.useState(false);
  const [studentDetails, setStudentDetails] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  const [studentId, setStudentId] = React.useState(null);
  const [klass, setKlass] = React.useState("");
  const [sectionName, setSectionName] = React.useState("");

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return;
      const decoded = jwtDecode(token);

      const profileRes = await api.get(`/users/profile`);
      setCurrentUserProfile(profileRes.data);

      // resolve linked student record
      let student = null;
      const userId = decoded.user?.id;
      
      try {
        // Try to get student info from /students/me endpoint
        const meRes = await api.get(`/students/me`);
        student = meRes.data;
      } catch (_) {
        try {
          // If user has grade and section in User model, use that
          if (profileRes.data && profileRes.data.role === 'Student' && profileRes.data.grade) {
            student = {
              _id: profileRes.data._id,
              id: profileRes.data._id,
              name: profileRes.data.name,
              email: profileRes.data.email,
              grade: profileRes.data.grade,
              section: profileRes.data.section,
              class: profileRes.data.grade && profileRes.data.section ? 
                `${profileRes.data.grade}${profileRes.data.section}` : '',
              className: profileRes.data.grade && profileRes.data.section ? 
                `${profileRes.data.grade}${profileRes.data.section}` : ''
            };
          } else {
            // Fallback to search by email in Student model
            const emailRes = await api.get(`/students`, { params: { email: profileRes.data.email } });
            student = Array.isArray(emailRes.data) ? emailRes.data[0] : emailRes.data;
          }
        } catch (__) {
          console.warn("Could not find student record");
        }
      }
      
      if (student) {
        setStudentId(student._id || student.id);
        setStudentDetails(student);
        const c = student.class || student.className || 
          (student.grade && student.section ? `${student.grade}${student.section}` : "");
        setKlass(c || "");
        setSectionName(student.section || "");
      } else {
        console.warn("No student record found for user");
      }
    } catch (e) {
      console.error("Error fetching student profile:", e);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { fetchUserProfile(); }, []);

  const handleSignOut = () => {
    localStorage.clear();
    navigate("/");
  };

  const SectionView = React.useMemo(() => {
    switch (section) {
      case "Overview": return <OverviewSection studentId={studentId} klass={klass} section={sectionName} />;
      case "Timetable": return <TimetableSection klass={klass} />;
      case "Fees": return <FeesSection studentId={studentId} />;
      case "Results": return <ResultsSection studentId={studentId} />;
      case "Notices": return <NoticesSection />;
      default: return <OverviewSection studentId={studentId} klass={klass} section={sectionName} />;
    }
  }, [section, studentId, klass, sectionName]);

  const drawer = (
    <div>
      <Toolbar>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ width: '100%' }}>
          <Avatar 
            src={currentUserProfile?.profileImage} 
            sx={{ width: 48, height: 48 }}
          >
            {currentUserProfile?.name?.[0] || "S"}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" fontWeight={700} noWrap>
              {currentUserProfile?.name || "Student"}
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              {studentDetails?.grade && (
                <Chip 
                  label={`Grade ${studentDetails.grade}`}
                  size="small"
                  color="primary"
                  variant="filled"
                  sx={{ 
                    height: 18, 
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    '& .MuiChip-label': { px: 1 }
                  }}
                />
              )}
              {studentDetails?.section && (
                <Chip 
                  label={`Sec ${studentDetails.section}`}
                  size="small"
                  color="secondary"
                  variant="outlined"
                  sx={{ 
                    height: 18, 
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    '& .MuiChip-label': { px: 1 }
                  }}
                />
              )}
              {!studentDetails?.grade && !studentDetails?.section && (
                <Typography variant="caption" color="text.secondary">
                  STUDENT
                </Typography>
              )}
            </Box>
          </Box>
        </Stack>
      </Toolbar>
      <Divider />
      <List>
        {NAV_ITEMS.map((item) => (
          <ListItem key={item.key} disablePadding>
            <ListItemButton 
              selected={section === item.key} 
              onClick={() => { setSection(item.key); setMobileOpen(false); }}
              sx={{ 
                borderRadius: 2, 
                mx: 1, 
                my: 0.5,
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'primary.contrastText',
                  }
                }
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (t) => t.zIndex.drawer + 1,
          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}
      >
        <Toolbar>
          <IconButton 
            color="inherit" 
            edge="start" 
            onClick={() => setMobileOpen(!mobileOpen)} 
            sx={{ mr: 2, display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap sx={{ mr: 2, fontWeight: 700 }}>
            Student Portal
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          
          <Tooltip title="Notices">
            <IconButton color="inherit">
              <Badge color="error" variant="dot">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          
          <Button 
            color="inherit" 
            onClick={handleSignOut}
            sx={{ ml: 1 }}
          >
            Sign Out
          </Button>
          
          <IconButton 
            onClick={() => setProfileModalOpen(true)} 
            sx={{ ml: 1 }}
          >
            <Avatar 
              src={currentUserProfile?.profileImage} 
              alt={currentUserProfile?.name?.[0] || "S"} 
              sx={{ width: 36, height: 36 }}
            />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Side Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth, 
          flexShrink: 0,
          display: { xs: "none", md: "block" },
          '& .MuiDrawer-paper': { 
            width: drawerWidth, 
            boxSizing: "border-box",
            border: 'none',
            boxShadow: '2px 0 10px rgba(0,0,0,0.1)'
          }
        }}
      >
        {drawer}
      </Drawer>
      
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          '& .MuiDrawer-paper': { 
            width: drawerWidth, 
            boxSizing: "border-box" 
          }
        }}
      >
        {drawer}
      </Drawer>

      {/* Main */}
      <Box component="main" sx={{ flexGrow: 1, bgcolor: 'grey.50', minHeight: '100vh' }}>
        <Toolbar />
        <Container maxWidth="xl" sx={{ py: 3 }}>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
              <Stack alignItems="center" spacing={2}>
                <CircularProgress size={48} />
                <Typography variant="h6" color="text.secondary">
                  Loading student dashboard...
                </Typography>
              </Stack>
            </Box>
          ) : !studentId ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
              <Paper variant="outlined" sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
                <Typography variant="h5" color="error" gutterBottom>
                  Student Profile Not Found
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Unable to load your student profile. Please contact the administrator.
                </Typography>
              </Paper>
            </Box>
          ) : (
            SectionView
          )}
        </Container>
      </Box>

      {/* Profile modal */}
      <ProfileManagementModal
        open={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        userId={currentUserProfile?._id}
        currentUserProfile={currentUserProfile}
        onPasswordChangeSuccess={() => {
          alert("Password changed successfully. Please log in again.");
          localStorage.clear();
          window.location.href = "/login";
        }}
        onDeleteAccountSuccess={() => {
          alert("Account deleted successfully.");
          localStorage.clear();
          window.location.href = "/login";
        }}
        onProfileUpdateSuccess={() => {
          (async () => {
            try { 
              const res = await api.get(`/users/profile`); 
              setCurrentUserProfile(res.data); 
            } catch {}
          })();
        }}
      />
    </Box>
  );
};

export default StudentDashboard;