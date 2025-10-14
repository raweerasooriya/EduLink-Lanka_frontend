import * as React from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { loadStripe } from '@stripe/stripe-js';
import {
  AppBar, Avatar, Badge, Box, Button, Card, CardContent, CardHeader, Chip,
  Container, CssBaseline, Dialog, DialogActions, DialogContent, DialogTitle,
  Divider, FormControl, Grid, IconButton, InputLabel, MenuItem, Select, Snackbar, Stack,
  Table, TableBody, TableCell, TableHead, TableRow, TextField, Toolbar, Tooltip,
  Typography, Paper, Tab, Tabs, useTheme, alpha
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PaymentsIcon from "@mui/icons-material/Payments";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import CampaignIcon from "@mui/icons-material/Campaign";
import PeopleIcon from "@mui/icons-material/People";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import SearchIcon from "@mui/icons-material/Search";
import SchoolIcon from "@mui/icons-material/School";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import GroupsIcon from "@mui/icons-material/Groups";

import { useNavigate } from "react-router-dom";
import ProfileManagementModal from "./ProfileManagementModal";

// Initialize Stripe
const stripePromise = loadStripe('pk_test_51S4brZ8HfEknvOjMj4WwaAEOi6PY2W3hVsXGMPbRPrM5sGCeXnWzqZDDTwoqPfQEO5korL6wbFMpr0z4tJH9lLEI00xbweJrXN');

// ---------- axios instance with auth header ----------
const api = axios.create({ baseURL: "http://localhost:5000/api" });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers["x-auth-token"] = token;
  return config;
});

// ---------- Enhanced UI Components ----------
const SearchField = ({ placeholder = "Search…", onChange, sx = {} }) => (
  <TextField
    size="small"
    placeholder={placeholder}
    onChange={onChange}
    sx={{
      backgroundColor: 'background.paper',
      borderRadius: 2,
      minWidth: 250,
      ...sx,
      '& .MuiOutlinedInput-root': {
        borderRadius: 2,
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

const ModernCard = ({ children, gradient = false, ...props }) => {
  const theme = useTheme();
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        background: gradient 
          ? `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.secondary.main}10 100%)`
          : theme.palette.background.paper,
        backdropFilter: "blur(10px)",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.15)}`,
        }
      }}
      {...props}
    >
      {children}
    </Card>
  );
};

const StatsCard = ({ title, value, icon, trend, color = "primary" }) => {
  const theme = useTheme();
  return (
    <ModernCard>
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
          <Avatar
            sx={{
              bgcolor: alpha(theme.palette[color].main, 0.1),
              color: theme.palette[color].main,
              width: 56,
              height: 56,
            }}
          >
            {icon}
          </Avatar>
          {trend && (
            <Chip
              icon={<TrendingUpIcon />}
              label={`+${trend}%`}
              size="small"
              color="success"
              variant="outlined"
            />
          )}
        </Stack>
        <Typography variant="h3" fontWeight={800} color={color} gutterBottom>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          {title}
        </Typography>
      </CardContent>
    </ModernCard>
  );
};

const ChildSelect = ({ childrenList = [], value, onChange, label = "Child" }) => (
  <FormControl sx={{ minWidth: 220 }}>
    <InputLabel>{label}</InputLabel>
    <Select 
      label={label} 
      value={value || ""} 
      onChange={(e) => onChange(e.target.value)}
      sx={{ borderRadius: 2 }}
    >
      {childrenList.map(c => (
        <MenuItem key={c.id} value={c.id}>{c.name} {c.class ? `(${c.class})` : ""}</MenuItem>
      ))}
    </Select>
  </FormControl>
);

// ---------- Overview - IT23168190 - R A WEERASOORIYA ----------
function OverviewSection({ childrenList, activeChildId }) {
  const [totals, setTotals] = React.useState({ kids: 0, dueCount: 0, dueAmount: 0, notices: 0 });
  const [recentNotices, setRecentNotices] = React.useState([]);
  const [nextClass, setNextClass] = React.useState(null);
  const [snack, setSnack] = React.useState("");

  const dayShort = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][new Date().getDay()];

  const fetchAll = async () => {
    try {
      // Aggregate fees across kids
      const feeCalls = childrenList.map(kid => api.get(`/fees`, { params: { studentId: kid.id } }));
      const [notRes, ...feeResps] = await Promise.all([
        api.get(`/notices`),
        ...feeCalls
      ]);

      const allFees = feeResps.flatMap(r => r.data || []);
      const due = allFees.filter(f => f.status !== "PAID");
      const dueAmount = due.reduce((s, f) => s + Number(f.amount || 0), 0);

      setTotals({ kids: childrenList.length, dueCount: due.length, dueAmount, notices: (notRes.data || []).length });

      setRecentNotices((notRes.data || [])
        .filter(n => !n.audience || n.audience === "ALL" || n.audience === "PARENT")
        .slice(0, 5));

      // Next class for the active child (fallback to first child)
      const activeKid = childrenList.find(k => k.id === activeChildId) || childrenList[0];
      if (activeKid?.class) {
        const ttRes = await api.get(`/timetable`, { params: { class: activeKid.class } });
        const tt = ttRes.data || [];
        const todays = tt.filter(x => x.day === dayShort);
        const byTime = (arr) => arr.sort((a,b) => (a.period||"").localeCompare(b.period||""));
        setNextClass(todays.length ? byTime(todays)[0] : byTime(tt)[0] || null);
      } else {
        setNextClass(null);
      }
    } catch (e) {
      console.error(e);
      setSnack("Failed to load overview");
    }
  };

  React.useEffect(() => { if (childrenList.length) fetchAll(); }, [JSON.stringify(childrenList), activeChildId]);

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={3}>Dashboard Overview</Typography>
      
      {/* Hero Section */}
      <ModernCard gradient sx={{ mb: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack>
              <Typography variant="h3" fontWeight={800} gutterBottom>
                Welcome back, Parent!
              </Typography>
              <Typography variant="h6" color="primary" fontWeight={600}>
                Managing {childrenList.length} {childrenList.length === 1 ? 'Child' : 'Children'}
              </Typography>
            </Stack>
            <Avatar 
              sx={{ 
                width: 80, 
                height: 80, 
                bgcolor: 'primary.main',
                fontSize: '2.5rem',
                boxShadow: (theme) => `0 8px 25px ${alpha(theme.palette.primary.main, 0.3)}`
              }}
            >
              P
            </Avatar>
          </Stack>
        </CardContent>
      </ModernCard>

      {/* Stats Grid */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard 
            title="Children" 
            value={totals.kids} 
            icon={<PeopleIcon />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard 
            title="Outstanding Fees" 
            value={totals.dueCount} 
            icon={<PaymentsIcon />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard 
            title="Amount Due (LKR)" 
            value={totals.dueAmount.toLocaleString()} 
            icon={<ReceiptLongIcon />}
            color="error"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard 
            title="Active Notices" 
            value={totals.notices} 
            icon={<CampaignIcon />}
            color="info"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <ModernCard>
            <CardHeader 
              title={
                <Stack direction="row" alignItems="center" spacing={1}>
                  <PeopleIcon color="primary" />
                  <Typography variant="h6" fontWeight={600}>My Children</Typography>
                </Stack>
              }
            />
            <CardContent>
              {childrenList.length > 0 ? (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Class</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Grade</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Section</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {childrenList.map(child => (
                      <TableRow 
                        key={child.id} 
                        sx={{ backgroundColor: child.id === activeChildId ? alpha('#1976d2', 0.08) : 'transparent' }}
                      >
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography fontWeight={500}>{child.name}</Typography>
                            {child.id === activeChildId && (
                              <Chip size="small" label="Active" color="primary" variant="outlined" />
                            )}
                          </Stack>
                        </TableCell>
                        <TableCell>{child.class}</TableCell>
                        <TableCell>{child.grade}</TableCell>
                        <TableCell>{child.section}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Typography color="text.secondary" align="center" sx={{ py: 2 }}>
                  No children assigned to this parent account. Please contact your school administrator.
                </Typography>
              )}
            </CardContent>
          </ModernCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <ModernCard>
            <CardHeader 
              title={
                <Stack direction="row" alignItems="center" spacing={1}>
                  <CalendarMonthIcon color="primary" />
                  <Typography variant="h6" fontWeight={600}>Next Class (Active Child)</Typography>
                </Stack>
              }
            />
            <CardContent>
              {nextClass ? (
                <Box sx={{ p: 2, borderRadius: 2, bgcolor: alpha("#1976d2", 0.05), border: "1px solid", borderColor: alpha("#1976d2", 0.2) }}>
                  <Typography variant="h6" fontWeight={600} color="primary" gutterBottom>
                    {nextClass.subject}
                  </Typography>
                  <Stack spacing={1}>
                    <Typography><strong>Teacher:</strong> {nextClass.teacher}</Typography>
                    <Typography><strong>Class:</strong> {nextClass.class} • <strong>Room:</strong> {nextClass.room}</Typography>
                    <Typography><strong>Time:</strong> {nextClass.day} • {nextClass.period}</Typography>
                  </Stack>
                </Box>
              ) : (
                <Typography color="text.secondary">No upcoming class found.</Typography>
              )}
            </CardContent>
          </ModernCard>
        </Grid>
      </Grid>

      <Grid container spacing={3} mt={1}>
        <Grid item xs={12}>
          <ModernCard>
            <CardHeader 
              title={
                <Stack direction="row" alignItems="center" spacing={1}>
                  <CampaignIcon color="primary" />
                  <Typography variant="h6" fontWeight={600}>Recent Notices</Typography>
                </Stack>
              }
            />
            <CardContent>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>By</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentNotices.map(n => (
                    <TableRow key={n._id || n.id} hover>
                      <TableCell>{n.title}</TableCell>
                      <TableCell>{n.postedBy}</TableCell>
                      <TableCell>{n.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </ModernCard>
        </Grid>
      </Grid>

      <Snackbar open={!!snack} autoHideDuration={2500} onClose={() => setSnack("")} message={snack} />
    </Box>
  );
}

// ---------- Children Directory - IT23168190 - R A WEERASOORIYA ----------
function ChildrenSection({ childrenList = [], activeChildId, setActiveChildId }) {
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" mb={3} alignItems="center">
        <Typography variant="h5" fontWeight={700}>Children</Typography>
        <ChildSelect childrenList={childrenList} value={activeChildId} onChange={setActiveChildId} label="Active Child" />
      </Stack>
      <ModernCard>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Class</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Section</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Make Active</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {childrenList.map(c => (
              <TableRow key={c.id} hover selected={c.id === activeChildId}>
                <TableCell>{c.id}</TableCell>
                <TableCell>{c.name}</TableCell>
                <TableCell>{c.class || "-"}</TableCell>
                <TableCell>{c.section || "-"}</TableCell>
                <TableCell>{c.email || "-"}</TableCell>
                <TableCell align="right">
                  <Button 
                    size="small" 
                    variant={c.id === activeChildId ? "outlined" : "contained"} 
                    onClick={() => setActiveChildId(c.id)}
                    sx={{ borderRadius: 2 }}
                  >
                    {c.id === activeChildId ? "Active" : "Set Active"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ModernCard>
    </Box>
  );
}

// ---------- Timetable (per selected child) - IT23621374 - Brundhaban.J ----------
function TimetableSection({ childrenList = [], activeChildId }) {
  const child = childrenList.find(c => c.id === activeChildId);
  const [rows, setRows] = React.useState([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [snack, setSnack] = React.useState("");

  const fetchTT = async () => {
    try {
      if (!child?.class) { setRows([]); return; }
      const res = await api.get(`/timetable`, { params: { class: child.class, search: searchTerm } });
      setRows(res.data || []);
    } catch (e) {
      console.error(e);
      setSnack("Failed to load timetable");
    }
  };

  React.useEffect(() => { fetchTT(); }, [activeChildId, child?.class, searchTerm]);

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" mb={3} alignItems="center">
        <Typography variant="h5" fontWeight={700}>Timetable — {child?.name || "Select a child"}</Typography>
        <SearchField placeholder="Search subject/teacher…" onChange={(e) => setSearchTerm(e.target.value)} />
      </Stack>
      <ModernCard>
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
                <TableCell>{r.day}</TableCell>
                <TableCell>
                  <Chip label={r.period} size="small" variant="outlined" />
                </TableCell>
                <TableCell>
                  <Chip label={r.class} size="small" color="primary" />
                </TableCell>
                <TableCell fontWeight={500}>{r.subject}</TableCell>
                <TableCell>{r.teacher}</TableCell>
                <TableCell>
                  <Chip label={r.room} size="small" color="secondary" variant="outlined" />
                </TableCell>
              </TableRow>
            ))}
            {!rows.length && (
              <TableRow><TableCell colSpan={6} align="center" sx={{ py: 3, color: "text.secondary" }}>
                {child?.class ? "No timetable entries." : "Choose a child with a class assigned."}
              </TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </ModernCard>
      <Snackbar open={!!snack} autoHideDuration={2500} onClose={() => setSnack("")} message={snack} />
    </Box>
  );
}

// ---------- Fees (per selected child, with payment) - IT23337558 - Oshada W G D ----------
function FeesSection({ childrenList = [], activeChildId }) {
  const child = childrenList.find(c => c.id === activeChildId);
  const [rows, setRows] = React.useState([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [snack, setSnack] = React.useState("");
  const [paying, setPaying] = React.useState(null);
  const [payMethod, setPayMethod] = React.useState("CARD");
  const [uploadFile, setUploadFile] = React.useState(null);
  const [uploading, setUploading] = React.useState(false);

  const fetchFees = async () => {
    try {
      if (!child?.id) { setRows([]); return; }
      const res = await api.get(`/fees`, { params: { studentId: child.id, search: searchTerm } });
      setRows(res.data || []);
    } catch (e) {
      console.error(e);
      setSnack("Failed to load fees");
    }
  };

  React.useEffect(() => { fetchFees(); }, [activeChildId, searchTerm]);

  const handleStripePayment = async (fee) => {
    try {
      // Create a payment session with the server
      const sessionRes = await api.post('/create-payment-session', {
        feeId: fee._id || fee.id,
        amount: fee.amount,
        description: `Payment for ${fee.term} term fees - ${child?.name}`,
        studentId: child.id,
        userType: 'parent'
      });
      const stripe = await stripePromise;
      const { error } = await stripe.redirectToCheckout({
        sessionId: sessionRes.data.id,
      });
      if (error) {
        alert("Payment failed: " + error.message);
        await api.post(`/fees/${fee._id || fee.id}/pay`, { method: "CARD", status: "FAILED" });
        return;
      }
    } catch (err) {
      console.error("Stripe payment error:", err);
      alert("Payment initialization failed");
    }
  };

  // Remove payment redirect handling since it's now handled in PaymentResult component

  const startPay = (row) => { 
    setPaying(row); 
    setPayMethod("CARD");
    setUploadFile(null);
  };

  const confirmPay = async () => {
    try {
      if (payMethod === "CARD") {
        await handleStripePayment(paying);
        setPaying(null);
        return;
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
        formData.append("studentId", child.id);
        
        await api.post(`/fees/${paying._id || paying.id}/pay`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        setSnack("Bank transfer slip uploaded. Payment will be verified soon.");
        setUploading(false);
        setPaying(null);
        setUploadFile(null);
        fetchFees();
      } else if (payMethod === "CASH") {
        setSnack("Please visit the school office during opening hours to make payment.");
        setPaying(null);
      }
    } catch (e) {
      setUploading(false);
      console.error("Payment error:", e);
      const errorMessage = e.response?.data?.error || e.response?.data?.msg || e.message || "Payment failed";
      setSnack(`Payment failed: ${errorMessage}`);
    }
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>Child Fees — {child?.name || "Select a child"}</Typography>
        <SearchField placeholder="Search term/invoice…" onChange={(e) => setSearchTerm(e.target.value)} />
      </Stack>
      <ModernCard>
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
            {!rows.length && (
              <TableRow><TableCell colSpan={6} align="center" sx={{ py: 3, color: "text.secondary" }}>
                {child?.id ? "No invoices found." : "Choose a child to view invoices."}
              </TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </ModernCard>

      {/* Enhanced Pay dialog */}
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
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'grey.50' }}>
              <Typography variant="body2" color="text.secondary">Student</Typography>
              <Typography variant="h6">{child?.name}</Typography>
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
                  <Typography variant="body2"><b>Reference:</b> Student ID {child?.id} / Invoice #{paying?._id?.substring(0, 8) || paying?.id}</Typography>
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
                  <Typography variant="body2"><b>Student:</b> {child?.name}</Typography>
                  <Typography variant="body2"><b>Invoice:</b> #{paying?._id?.substring(0, 8) || paying?.id}</Typography>
                  <Typography variant="body2"><b>Amount:</b> LKR {Number(paying?.amount || 0).toLocaleString()}</Typography>
                  <Typography variant="body2"><b>Counter Opening Hours:</b> Mon-Fri 8:30am - 3:30pm</Typography>
                  <Typography variant="body2"><b>Location:</b> School Admin Office, Ground Floor</Typography>
                  <Typography variant="body2"><b>Payment Estimate:</b> Instant upon payment at counter</Typography>
                </Paper>
                <Typography variant="body2" color="text.secondary">
                  Please bring this invoice reference and Student ID for verification. No advance submission required - just visit the office during opening hours.
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

// ---------- Results (per selected child) - IT23646292 - Wathsana P S S ----------
function ResultsSection({ childrenList = [], activeChildId }) {
  const child = childrenList.find(c => c.id === activeChildId);
  const [rows, setRows] = React.useState([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [snack, setSnack] = React.useState("");

  const fetchResults = async () => {
    try {
      if (!child?.id) { setRows([]); return; }
      const res = await api.get(`/results`, { params: { studentId: child.id, search: searchTerm } });
      setRows(res.data || []);
    } catch (e) {
      console.error(e);
      setSnack("Failed to load results");
    }
  };

  React.useEffect(() => { fetchResults(); }, [activeChildId, searchTerm]);

  const downloadSlip = async () => {
    try {
      if (!child?.id) {
        setSnack("No child selected");
        return;
      }
      
      setSnack("Generating result slip...");
      
      // Call the correct endpoint with studentId in URL path
      const res = await api.get(`/reports/result-slip/${child.id}`, { 
        responseType: "blob" 
      });
      
      // Create blob and download
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; 
      a.download = `result-slip-${child.name || child.id}.pdf`;
      document.body.appendChild(a); 
      a.click(); 
      a.remove();
      window.URL.revokeObjectURL(url);
      
      setSnack("Result slip downloaded successfully");
    } catch (e) {
      console.error("Download result slip error:", e);
      console.error("Error response:", e.response?.data);
      console.error("Error status:", e.response?.status);
      
      if (e.response?.status === 404) {
        setSnack("No results found for this student");
      } else if (e.response?.status === 500) {
        setSnack("Server error while generating result slip");
      } else {
        setSnack("Failed to download result slip");
      }
    }
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>Results — {child?.name || "Select a child"}</Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <SearchField placeholder="Search subject/exam…" onChange={(e) => setSearchTerm(e.target.value)} />
          <Button variant="contained" onClick={downloadSlip} disabled={!child?.id} sx={{ borderRadius: 2 }}>
            Download Result Slip
          </Button>
        </Stack>
      </Stack>
      <ModernCard>
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
                <TableCell>{r.subject}</TableCell>
                <TableCell>{r.exam}</TableCell>
                <TableCell>
                  <Chip 
                    label={r.score} 
                    size="small" 
                    color={r.score >= 80 ? "success" : r.score >= 60 ? "warning" : "error"}
                  />
                </TableCell>
                <TableCell>
                  <Chip label={r.grade} size="small" variant="outlined" />
                </TableCell>
              </TableRow>
            ))}
            {!rows.length && (
              <TableRow><TableCell colSpan={4} align="center" sx={{ py: 3, color: "text.secondary" }}>
                {child?.id ? "No results found." : "Choose a child to view results."}
              </TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </ModernCard>
      <Snackbar open={!!snack} autoHideDuration={2500} onClose={() => setSnack("")} message={snack} />
    </Box>
  );
}

// ---------- Notices - IT23569454 - De Silva K.S.D ----------
function NoticesSection() {
  const [rows, setRows] = React.useState([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [snack, setSnack] = React.useState("");

  const fetchNotices = async () => {
    try {
      const res = await api.get(`/notices`, { params: { search: searchTerm } });
      const data = (res.data || []).filter(n => !n.audience || ["ALL","PARENT"].includes(n.audience));
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
      <ModernCard>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Message</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>By</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(r => (
              <TableRow key={r._id || r.id} hover>
                <TableCell>{r.title}</TableCell>
                <TableCell>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      maxWidth: 300, 
                      overflow: "hidden", 
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    }}
                  >
                    {r.message}
                  </Typography>
                </TableCell>
                <TableCell>{r.postedBy}</TableCell>
                <TableCell>{r.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ModernCard>
      <Snackbar open={!!snack} autoHideDuration={2500} onClose={() => setSnack("")} message={snack} />
    </Box>
  );
}

// ---------- Navigation Items IT23168190 - R A WEERASOORIYA ----------
const NAV_ITEMS = [
  { key: "Overview", label: "Overview", icon: <DashboardIcon /> },
  { key: "Children", label: "Children", icon: <PeopleIcon /> },
  { key: "Timetable", label: "Timetable", icon: <CalendarMonthIcon /> },
  { key: "Fees", label: "Fees", icon: <PaymentsIcon /> },
  { key: "Results", label: "Results", icon: <AssignmentTurnedInIcon /> },
  { key: "Notices", label: "Notices", icon: <CampaignIcon /> },
];

// ---------- Root Parent Dashboard IT23168190 - R A WEERASOORIYA----------
export default function ParentDashboard() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [section, setSection] = React.useState("Overview");
  const [currentUserProfile, setCurrentUserProfile] = React.useState(null);
  const [profileModalOpen, setProfileModalOpen] = React.useState(false);

  const [childrenList, setChildrenList] = React.useState([]);
  const [activeChildId, setActiveChildId] = React.useState("");

  const fetchParentAndChildren = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return;
      }
      
      // Get current user profile
      const profileRes = await api.get(`/users/profile`);
      setCurrentUserProfile(profileRes.data);

      // Check if the current user is actually a parent
      if (profileRes.data?.role !== 'Parent') {
        console.warn("Current user is not a parent:", profileRes.data?.role);
        setChildrenList([]);
        return;
      }

      // Get children for this parent
      const childrenRes = await api.get(`/users/children`);
      
      const children = Array.isArray(childrenRes.data) ? childrenRes.data : [];
      
      // Normalize children data
      const normalizedChildren = children.map(child => ({
        id: child.id || child._id,
        name: child.name || 'Unknown',
        class: child.class || (child.grade && child.section ? `${child.grade}${child.section}` : 'N/A'),
        section: child.section || 'N/A',
        email: child.email || 'N/A',
        grade: child.grade || 'N/A'
      }));

      setChildrenList(normalizedChildren);
      
      if (normalizedChildren.length > 0) {
        setActiveChildId(normalizedChildren[0].id);
      }
    } catch (e) {
      console.error("Error fetching parent/children profile:", e);
      setChildrenList([]);
    }
  };

  React.useEffect(() => { fetchParentAndChildren(); }, []);

  const handleSignOut = () => {
    localStorage.clear();
    navigate("/");
  };

  const SectionView = React.useMemo(() => {
    switch (section) {
      case "Overview": return <OverviewSection childrenList={childrenList} activeChildId={activeChildId} />;
      case "Children": return <ChildrenSection childrenList={childrenList} activeChildId={activeChildId} setActiveChildId={setActiveChildId} />;
      case "Timetable": return <TimetableSection childrenList={childrenList} activeChildId={activeChildId} />;
      case "Fees": return <FeesSection childrenList={childrenList} activeChildId={activeChildId} />;
      case "Results": return <ResultsSection childrenList={childrenList} activeChildId={activeChildId} />;
      case "Notices": return <NoticesSection />;
      default: return <OverviewSection childrenList={childrenList} activeChildId={activeChildId} />;
    }
  }, [section, JSON.stringify(childrenList), activeChildId]);

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      <CssBaseline />
      
      {/* Header with Navigation */}
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{ 
          backgroundColor: "white",
          borderBottom: `1px solid ${theme.palette.divider}`,
          backdropFilter: "blur(10px)",
        }}
      >
        <Toolbar sx={{ px: { xs: 2, sm: 3 }, py: 1 }}>
          {/* Logo/Brand */}
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mr: 4 }}>
            <Avatar 
              sx={{ 
                bgcolor: theme.palette.primary.main,
                width: 40,
                height: 40,
              }}
            >
              <SchoolIcon />
            </Avatar>
            <Stack>
              <Typography variant="h6" fontWeight={700} color="text.primary">
                Parent Portal
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {childrenList.length} {childrenList.length === 1 ? 'Child' : 'Children'} Enrolled
              </Typography>
            </Stack>
          </Stack>

          {/* Navigation Tabs */}
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "block" } }}>
            <Tabs 
              value={section} 
              onChange={(e, newValue) => setSection(newValue)}
              sx={{
                "& .MuiTab-root": {
                  minHeight: 48,
                  textTransform: "none",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "text.secondary",
                  "&.Mui-selected": {
                    color: "primary.main",
                    fontWeight: 600,
                  }
                },
                "& .MuiTabs-indicator": {
                  height: 3,
                  borderRadius: "3px 3px 0 0",
                }
              }}
            >
              {NAV_ITEMS.map((item) => (
                <Tab 
                  key={item.key} 
                  label={item.label} 
                  value={item.key}
                  icon={item.icon}
                  iconPosition="start"
                />
              ))}
            </Tabs>
          </Box>

          {/* Right Side Actions */}
          <Stack direction="row" alignItems="center" spacing={1}>
            <Tooltip title="Notifications">
              <IconButton>
                <Badge color="error" variant="dot">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

            <Button 
              color="inherit" 
              onClick={handleSignOut}
              sx={{ 
                color: "text.secondary",
                fontWeight: 500,
                display: { xs: "none", sm: "inline-flex" }
              }}
            >
              Sign Out
            </Button>

            <IconButton 
              onClick={() => setProfileModalOpen(true)}
              sx={{ ml: 1 }}
            >
              <Avatar 
                src={currentUserProfile?.profileImage} 
                sx={{ width: 36, height: 36 }}
              >
                {currentUserProfile?.name?.[0] || "P"}
              </Avatar>
            </IconButton>
          </Stack>
        </Toolbar>

        {/* Mobile Navigation */}
        <Box sx={{ display: { xs: "block", md: "none" }, px: 2, pb: 1 }}>
          <Tabs 
            value={section} 
            onChange={(e, newValue) => setSection(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              "& .MuiTab-root": {
                minHeight: 40,
                minWidth: 80,
                textTransform: "none",
                fontSize: "0.75rem",
                fontWeight: 500,
                color: "text.secondary",
                "&.Mui-selected": {
                  color: "primary.main",
                  fontWeight: 600,
                }
              },
              "& .MuiTabs-indicator": {
                height: 2,
              }
            }}
          >
            {NAV_ITEMS.map((item) => (
              <Tab 
                key={item.key} 
                label={item.label} 
                value={item.key}
              />
            ))}
          </Tabs>
        </Box>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 4 } }}>
        {SectionView}
      </Container>

      {/* Profile Modal */}
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
            try { const res = await api.get(`/users/profile`); setCurrentUserProfile(res.data); } catch {}
          })();
        }}
      />
    </Box>
  );
}