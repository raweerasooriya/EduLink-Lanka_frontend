// AdminDashboard.jsx
// MUI v5 JSX admin dashboard with RBAC and the core modules from your proposal.
// Drop this into a React app (e.g., CRA/Vite/Next.js). Assumes @mui/material and @mui/icons-material installed.

import * as React from "react";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import {
  AppBar, Avatar, Badge, Box, Button, Chip, Container, CssBaseline, Dialog,
  DialogActions, DialogContent, DialogTitle, Divider, Drawer, FormControl,
  Grid, IconButton, InputLabel, List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, MenuItem, Select, Snackbar, Stack, TextField, Toolbar, Tooltip,
  Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, TableContainer,
  Card, CardContent, CardHeader, Switch, FormControlLabel
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import SchoolIcon from "@mui/icons-material/School";
import PeopleIcon from "@mui/icons-material/People";
import PersonIcon from "@mui/icons-material/Person";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PaymentsIcon from "@mui/icons-material/Payments";
import BarChartIcon from "@mui/icons-material/BarChart";
import CampaignIcon from "@mui/icons-material/Campaign";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import SettingsIcon from "@mui/icons-material/Settings";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SendIcon from "@mui/icons-material/Send";
import { useNavigate } from "react-router-dom";
import ProfileManagementModal from "./ProfileManagementModal";

const drawerWidth = 92;

// ---- Simple RBAC helpers ----------------------------------------------------

const Roles = {
  ADMIN: "ADMIN",
  TEACHER: "TEACHER",
  STUDENT: "STUDENT",
  PARENT: "PARENT",
};

// `permissions` describe which sections each role may access (proposal p.9).
const permissions = {
  Overview: [Roles.ADMIN, Roles.TEACHER, Roles.STUDENT, Roles.PARENT],
  Students: [Roles.ADMIN, Roles.TEACHER],
  Teachers: [Roles.ADMIN],
  ClassesTimetable: [Roles.ADMIN, Roles.TEACHER, Roles.STUDENT, Roles.PARENT],
  FeesPayments: [Roles.ADMIN, Roles.STUDENT, Roles.PARENT],
  Results: [Roles.ADMIN, Roles.TEACHER, Roles.STUDENT, Roles.PARENT],
  Notices: [Roles.ADMIN, Roles.TEACHER, Roles.STUDENT, Roles.PARENT],
  Parents: [Roles.ADMIN, Roles.TEACHER],
  Users: [Roles.ADMIN],
  Reports: [Roles.ADMIN],
  Settings: [Roles.ADMIN],
  Applications: [Roles.ADMIN],      
};

// Guarded wrapper to hide components if role not allowed
const Guard = ({ role, section, children }) => {
  if (!permissions[section]?.includes(role)) return (
    <Box p={4}>
      <Typography variant="h6">Access restricted</Typography>
      <Typography variant="body2" color="text.secondary">
        Your role doesn’t have permission to view this section.
      </Typography>
    </Box>
  );
  return children;
};


// ---- Reusable small components ---------------------------------------------

const SummaryCard = ({ title, value, icon }) => (
  <Card elevation={0} sx={{
    borderRadius: 3,
    border: '1px solid',
    borderColor: 'divider',
    background: 'linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.6) 100%)',
    backdropFilter: 'blur(8px)'
  }}>
    <CardHeader
      avatar={<Avatar variant="rounded" sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>{icon}</Avatar>}
      title={<Typography variant="subtitle2" color="text.secondary">{title}</Typography>}
    />
    <CardContent>
      <Typography variant="h4" fontWeight={800}>{value}</Typography>
    </CardContent>
  </Card>
);

const SearchField = ({ placeholder = "Search…", onChange }) => (
  <TextField
    size="small"
    placeholder={placeholder}
    onChange={onChange}
    InputProps={{
      startAdornment: (
        <IconButton size="small">
          <SearchIcon />
        </IconButton>
      ),
    }}
  />
);

// ---- Section: Overview (analytics-lite without external libs) - IT23168190 R A WEERASOORIYA ---------------

const OverviewSection = () => {
  const [totals, setTotals] = React.useState({
    students: 0,
    teachers: 0,
    feesDue: 0,
    notices: 0,
  });
  const [recentNotices, setRecentNotices] = React.useState([]);
  const [snack, setSnack] = React.useState("");

  const fetchOverviewData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [usersRes, feesRes, noticesRes] = await Promise.all([
        axios.get("http://localhost:5000/api/users", { headers: { 'x-auth-token': token } }),
        axios.get("http://localhost:5000/api/fees"),
        axios.get("http://localhost:5000/api/notices"),
      ]);

      const students = usersRes.data.filter(u => u.role === 'Student');
      const teachers = usersRes.data.filter(u => u.role === 'Teacher');

      setTotals({
        students: students.length,
        teachers: teachers.length,
        feesDue: feesRes.data.filter(f => f.status === "DUE").length,
        notices: noticesRes.data.length,
      });
      setRecentNotices(noticesRes.data.slice(0, 5)); // Displaying up to 5 recent notices
    } catch (err) {
      console.error("Error fetching overview data:", err);
      setSnack("Error fetching overview data");
    }
  };

  React.useEffect(() => {
    fetchOverviewData();
  }, []);

  return (
    <Box p={3}>
      <Typography variant="h5" mb={2}>Overview</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}><SummaryCard title="Students" value={totals.students} icon={<SchoolIcon />} /></Grid>
        <Grid item xs={12} md={3}><SummaryCard title="Teachers" value={totals.teachers} icon={<PeopleIcon />} /></Grid>
        <Grid item xs={12} md={3}><SummaryCard title="Fees (Due)" value={totals.feesDue} icon={<PaymentsIcon />} /></Grid>
        <Grid item xs={12} md={3}><SummaryCard title="Active Notices" value={totals.notices} icon={<CampaignIcon />} /></Grid>
      </Grid>

      <Box mt={3}>
        <Card>
          <CardHeader title="Recent Notices" />
          <CardContent>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Message</TableCell>
                  <TableCell>By</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentNotices.map(n => (
                  <TableRow key={n._id}>
                    <TableCell>{n.title}</TableCell>
                    <TableCell>{n.message}</TableCell>
                    <TableCell>{n.postedBy}</TableCell>
                    <TableCell>{n.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Box>
      <Snackbar open={!!snack} autoHideDuration={2000} onClose={() => setSnack("")} message={snack} />
    </Box>
  );
};

// ---- Section: Student Management (proposal p.12) - IT23168190 R A WEERASOORIYA ----------------------------

const StudentsSection = () => {
  const [rows, setRows] = React.useState([]);
  const [parents, setParents] = React.useState([]);
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState({ _id: "", name: "", username: "", email: "", mobile: "", grade: "", section: "", parent: "" });
  const [snack, setSnack] = React.useState("");
  const [searchTerm, setSearchTerm] = React.useState("");

  const grades = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13"];
  const sections = ["A", "B", "C", "D", "E"];

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/users?search=${searchTerm}`, { headers: { 'x-auth-token': token } });
      // Filter users with role 'Student'
      const students = res.data.filter(u => u.role === 'Student');
      setRows(students);
    } catch (err) {
      console.error("Error fetching students:", err);
      setSnack("Error fetching students");
    }
  };

  const fetchParents = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/users', { headers: { 'x-auth-token': token } });
      // Filter users with role 'Parent'
      const parentUsers = res.data.filter(u => u.role === 'Parent');
      setParents(parentUsers);
    } catch (err) {
      console.error("Error fetching parents:", err);
    }
  };

  React.useEffect(() => {
    fetchStudents();
    fetchParents();
  }, [searchTerm]);

  const openEdit = (row) => {
    setForm({
      _id: row._id,
      name: row.name,
      username: row.username,
      email: row.email,
      mobile: row.mobile,
      grade: row.grade || "",
      section: row.section || "",
      parent: row.parent?._id || ""
    });
    setOpen(true);
  };

  const save = async () => {
    try {
      const token = localStorage.getItem('token');
      const updateData = {
        name: form.name,
        username: form.username,
        email: form.email,
        mobile: form.mobile,
        grade: form.grade,
        section: form.section,
        parent: form.parent || null
      };
      
      await axios.put(`http://localhost:5000/api/users/${form._id}`, updateData, { headers: { 'x-auth-token': token } });
      fetchStudents();
      setOpen(false);
      setSnack("Student updated successfully");
    } catch (err) {
      console.error("Error updating student:", err);
      if (err.response && err.response.data && err.response.data.msg) {
        setSnack(err.response.data.msg);
      } else {
        setSnack("Error updating student");
      }
    }
  };

  return (
    <Box p={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Students</Typography>
        <SearchField placeholder="Search students..." onChange={(e) => setSearchTerm(e.target.value)} />
      </Stack>
      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 520 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Grade</TableCell>
              <TableCell>Section</TableCell>
              <TableCell>Parent</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(r => (
              <TableRow key={r._id}>
                <TableCell>{r._id}</TableCell>
                <TableCell>{r.name}</TableCell>
                <TableCell>{r.username}</TableCell>
                <TableCell>{r.email}</TableCell>
                <TableCell>{r.grade || '-'}</TableCell>
                <TableCell>{r.section || '-'}</TableCell>
                <TableCell>{r.parent?.name || '-'}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => openEdit(r)}><EditIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </TableContainer>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>Edit Student</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField 
              label="Full Name" 
              value={form.name} 
              onChange={e => setForm({ ...form, name: e.target.value })} 
              fullWidth
            />
            <Stack direction="row" spacing={2}>
              <TextField 
                label="Username" 
                value={form.username} 
                onChange={e => setForm({ ...form, username: e.target.value })} 
                fullWidth
              />
              <TextField 
                label="Email" 
                value={form.email} 
                onChange={e => setForm({ ...form, email: e.target.value })} 
                fullWidth
              />
            </Stack>
            <TextField 
              label="Mobile" 
              value={form.mobile} 
              onChange={e => setForm({ ...form, mobile: e.target.value })} 
              fullWidth
            />
            <Stack direction="row" spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Grade</InputLabel>
                <Select 
                  label="Grade" 
                  value={form.grade} 
                  onChange={e => setForm({ ...form, grade: e.target.value })}
                >
                  <MenuItem value="">None</MenuItem>
                  {grades.map(grade => (
                    <MenuItem key={grade} value={grade}>{grade}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Section</InputLabel>
                <Select 
                  label="Section" 
                  value={form.section} 
                  onChange={e => setForm({ ...form, section: e.target.value })}
                >
                  <MenuItem value="">None</MenuItem>
                  {sections.map(section => (
                    <MenuItem key={section} value={section}>{section}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
            <FormControl fullWidth>
              <InputLabel>Assign Parent</InputLabel>
              <Select 
                label="Assign Parent" 
                value={form.parent} 
                onChange={e => setForm({ ...form, parent: e.target.value })}
              >
                <MenuItem value="">No Parent Assigned</MenuItem>
                {parents.map(parent => (
                  <MenuItem key={parent._id} value={parent._id}>
                    {parent.name} ({parent.email})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={save}>Save Changes</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack("")} message={snack} />
    </Box>
  );
};

// ---- Section: Teacher Management (proposal p.11) - IT23168190 R A WEERASOORIYA ----------------------------

const TeachersSection = () => {
  const [rows, setRows] = React.useState([]);
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState({ _id: "", name: "", username: "", email: "", mobile: "", subject: "" });
  const [snack, setSnack] = React.useState("");
  const [searchTerm, setSearchTerm] = React.useState("");

  const subjects = ["Math", "Science", "English", "History", "ICT", "Geography", "Commerce", "Art", "Physics", "Chemistry", "Biology", "Economics", "Accounting", "Business Studies"];

  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/users?search=${searchTerm}`, { headers: { 'x-auth-token': token } });
      // Filter users with role 'Teacher'
      const teachers = res.data.filter(u => u.role === 'Teacher');
      setRows(teachers);
    } catch (err) {
      console.error("Error fetching teachers:", err);
      setSnack("Error fetching teachers");
    }
  };

  React.useEffect(() => {
    fetchTeachers();
  }, [searchTerm]);

  const openEdit = (row) => {
    setForm({
      _id: row._id,
      name: row.name,
      username: row.username,
      email: row.email,
      mobile: row.mobile,
      subject: row.subject || ""
    });
    setOpen(true);
  };

  const save = async () => {
    try {
      const token = localStorage.getItem('token');
      const updateData = {
        name: form.name,
        username: form.username,
        email: form.email,
        mobile: form.mobile,
        subject: form.subject
      };
      
      await axios.put(`http://localhost:5000/api/users/${form._id}`, updateData, { headers: { 'x-auth-token': token } });
      fetchTeachers();
      setOpen(false);
      setSnack("Teacher updated successfully");
    } catch (err) {
      console.error("Error updating teacher:", err);
      if (err.response && err.response.data && err.response.data.msg) {
        setSnack(err.response.data.msg);
      } else {
        setSnack("Error updating teacher");
      }
    }
  };

  return (
    <Box p={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Teachers</Typography>
        <SearchField placeholder="Search teachers..." onChange={(e) => setSearchTerm(e.target.value)} />
      </Stack>
      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 520 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(r => (
              <TableRow key={r._id}>
                <TableCell>{r._id}</TableCell>
                <TableCell>{r.name}</TableCell>
                <TableCell>{r.username}</TableCell>
                <TableCell>{r.email}</TableCell>
                <TableCell>{r.subject || '-'}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => openEdit(r)}><EditIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </TableContainer>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>Edit Teacher</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField 
              label="Full Name" 
              value={form.name} 
              onChange={e => setForm({ ...form, name: e.target.value })} 
              fullWidth
            />
            <Stack direction="row" spacing={2}>
              <TextField 
                label="Username" 
                value={form.username} 
                onChange={e => setForm({ ...form, username: e.target.value })} 
                fullWidth
              />
              <TextField 
                label="Email" 
                value={form.email} 
                onChange={e => setForm({ ...form, email: e.target.value })} 
                fullWidth
              />
            </Stack>
            <TextField 
              label="Mobile" 
              value={form.mobile} 
              onChange={e => setForm({ ...form, mobile: e.target.value })} 
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Subject</InputLabel>
              <Select 
                label="Subject" 
                value={form.subject} 
                onChange={e => setForm({ ...form, subject: e.target.value })}
              >
                <MenuItem value="">No Subject Assigned</MenuItem>
                {subjects.map(subject => (
                  <MenuItem key={subject} value={subject}>{subject}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={save}>Save Changes</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack("")} message={snack} />
    </Box>
  );
};

// ---- Section: Classes & Timetable (proposal p.10–11) IT23621374 - Brundhaban.J ------------------------

const TimetableSection = () => {
  // Dropdown data (hardcoded except teachers)
  const grades = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13"];
  const sections = ["A", "B", "C", "D", "E"];
  // Generate grade+section combinations (1A, 1B, ..., 13E)
  const classes = grades.flatMap(grade => sections.map(section => `${grade}${section}`));
  const rooms = ["R-101", "R-202", "R-303", "Lab-1", "Lab-2", "Auditorium", "Library"];
  const subjects = ["Math", "Science", "English", "History", "ICT", "Geography", "Commerce", "Art"];
  const timeSlots = [
    "08:00–09:00", "09:00–10:00", "10:00–11:00", "11:00–12:00", "12:00–13:00", "13:00–14:00", "14:00–15:00"
  ];
  const [teachers, setTeachers] = React.useState([]);
  React.useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get("http://localhost:5000/api/users", { headers: { 'x-auth-token': token } });
        const teacherUsers = res.data.filter(u => u.role === 'Teacher');
        setTeachers(teacherUsers);
      } catch (err) {
        console.error("Error fetching teachers:", err);
      }
    };
    fetchTeachers();
  }, []);

  // Allow multiple entries for the same slot: do not filter out used teachers/rooms/classes/subjects/periods
  const getAvailable = (field, day, period) => {
    if (field === "teacher") return teachers;
    if (field === "room") return rooms;
    if (field === "class") return classes; // Now returns grade+section combinations like 1A, 2B, etc.
    if (field === "subject") return subjects;
    if (field === "period") return timeSlots;
    return [];
  };
  const [rows, setRows] = React.useState([]);
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState({ _id: "", day: "Mon", period: "", class: "", subject: "", teacher: "", room: "" });
  const [snack, setSnack] = React.useState("");
  const [warning, setWarning] = React.useState("");
  const [searchTerm, setSearchTerm] = React.useState("");

  const fetchTimetable = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/timetable?search=${searchTerm}`);
      setRows(res.data);
    } catch (err) {
      console.error("Error fetching timetable:", err);
      setSnack("Error fetching timetable");
    }
  };

  React.useEffect(() => {
    fetchTimetable();
  }, [searchTerm]);

  const openAdd = () => { setForm({ _id: "", day: "Mon", period: "", class: "", subject: "", teacher: "", room: "" }); setOpen(true); };
  const openEdit = (row) => { setForm(row); setOpen(true); };
  const save = async () => {
    // Check for multiple entries for same date and time slot
    if (form.date && form.period) {
      const duplicates = rows.filter(r => r.date === form.date && r.period === form.period);
      if (!form._id && duplicates.length > 0) {
        setWarning(`Warning: There are already ${duplicates.length} entries for this date and time slot.`);
      } else {
        setWarning("");
      }
    } else {
      setWarning("");
    }
    try {
      if (form._id) {
        await axios.put(`http://localhost:5000/api/timetable/${form._id}`, form);
      } else {
        await axios.post("http://localhost:5000/api/timetable", form);
      }
      fetchTimetable();
      setOpen(false);
      setSnack("Timetable entry saved");
    } catch (err) {
      console.error("Error saving timetable entry:", err);
      setSnack("Error saving timetable entry");
    }
  };
  const remove = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/timetable/${id}`);
      fetchTimetable();
      setSnack("Timetable entry removed");
    } catch (err) {
      console.error("Error removing timetable entry:", err);
      setSnack("Error removing timetable entry");
    }
  };

  // Helper: Map timetable rows to calendar events
  const getEvents = () => {
    // If slot has a date, use it; else use weekday mapping
    return rows
      .filter(r => r.day && r.period && r.period.includes('–'))
      .map(r => {
        try {
          let eventDate;
          if (r.date) {
            eventDate = new Date(r.date);
          } else {
            // fallback: map weekday to next occurrence
            const dayMap = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5 };
            const today = new Date();
            const currentDay = today.getDay();
            const targetDay = dayMap[r.day];
            eventDate = new Date(today);
            eventDate.setDate(today.getDate() + ((targetDay + 7 - currentDay) % 7));
          }
          // Parse period
          const [start, end] = r.period.split('–');
          if (!start || !end) return null;
          const [startHour, startMin] = start.split(':');
          const [endHour, endMin] = end.split(':');
          if (!startHour || !startMin || !endHour || !endMin) return null;
          const startDate = new Date(eventDate);
          startDate.setHours(Number(startHour), Number(startMin), 0, 0);
          const endDate = new Date(eventDate);
          endDate.setHours(Number(endHour), Number(endMin), 0, 0);
          return {
            id: r._id,
            title: `${r.subject} (${r.class})\n${r.teacher} - ${r.room}`,
            start: startDate,
            end: endDate,
            allDay: false,
            extendedProps: { ...r },
          };
        } catch (e) {
          return null;
        }
      })
      .filter(Boolean);
  };

  // Calendar event click: edit slot
  const handleEventClick = (info) => {
    const slot = info.event.extendedProps;
    setForm({
      _id: slot._id,
      day: slot.day,
      period: slot.period,
      class: slot.class,
      subject: slot.subject,
      teacher: slot.teacher,
      room: slot.room,
      date: slot.date || '',
    });
    setOpen(true);
  };

  // Calendar date click: add slot for that date
  const handleDateClick = (info) => {
    // info.dateStr is YYYY-MM-DD
    setForm({
      _id: '',
      day: '',
      period: '',
      class: '',
      subject: '',
      teacher: '',
      room: '',
      date: info.dateStr,
    });
    setOpen(true);
  };

  return (
    <Box p={3}>
      <Stack direction="row" justifyContent="space-between" mb={2}>
        <Typography variant="h5">Classes & Timetable</Typography>
        <Stack direction="row" spacing={2}>
          <SearchField placeholder="Search timetable..." onChange={(e) => setSearchTerm(e.target.value)} />
          <Button startIcon={<AddIcon />} variant="contained" onClick={openAdd}>Add Slot</Button>
        </Stack>
      </Stack>
      <Paper variant="outlined" sx={{ borderRadius: 3, minHeight: 520, p: 2 }}>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{ left: 'prev,next today', center: 'title', right: 'timeGridWeek,dayGridMonth' }}
          events={getEvents()}
          height={520}
          slotMinTime="07:00:00"
          slotMaxTime="18:00:00"
          eventClick={handleEventClick}
          dateClick={handleDateClick}
        />
      </Paper>
      {/* Dialog for add/edit/delete slot */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>{form._id ? "Edit" : "Add"} Timetable Slot</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            {warning && <Alert severity="warning">{warning}</Alert>}
            {form.date && (
              <TextField
                label="Date"
                type="date"
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            )}
            <FormControl fullWidth>
              <InputLabel>Day</InputLabel>
              <Select label="Day" value={form.day} onChange={e => setForm({ ...form, day: e.target.value })}>
                {["Mon","Tue","Wed","Thu","Fri"].map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Time Slot</InputLabel>
              <Select label="Time Slot" value={form.period} onChange={e => setForm({ ...form, period: e.target.value })}>
                {getAvailable("period", form.day).map(ts => <MenuItem key={ts} value={ts}>{ts}</MenuItem>)}
              </Select>
            </FormControl>
            <Stack direction="row" spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Class (Grade+Section)</InputLabel>
                <Select label="Class (Grade+Section)" value={form.class} onChange={e => setForm({ ...form, class: e.target.value })}>
                  {getAvailable("class", form.day, form.period).map(cls => <MenuItem key={cls} value={cls}>{cls}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Room</InputLabel>
                <Select label="Room" value={form.room} onChange={e => setForm({ ...form, room: e.target.value })}>
                  {getAvailable("room", form.day, form.period).map(rm => <MenuItem key={rm} value={rm}>{rm}</MenuItem>)}
                </Select>
              </FormControl>
            </Stack>
            <Stack direction="row" spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Subject</InputLabel>
                <Select label="Subject" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}>
                  {getAvailable("subject", form.day, form.period).map(sub => <MenuItem key={sub} value={sub}>{sub}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Teacher</InputLabel>
                <Select label="Teacher" value={form.teacher} onChange={e => setForm({ ...form, teacher: e.target.value })}>
                  {getAvailable("teacher", form.day, form.period).map(t => <MenuItem key={t.name} value={t.name}>{t.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          {form._id && (
            <Button color="error" onClick={() => { remove(form._id); setOpen(false); }}>Delete</Button>
          )}
          <Button variant="contained" onClick={save}>Save</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={!!snack} autoHideDuration={2000} onClose={() => setSnack("")} message={snack} />
    </Box>
  );
};

// -------------- FEE SECTION IT23337558 - Oshada W G D } ------------------ 
const FeesSection = () => {
  const [rows, setRows] = React.useState([]);
  const [students, setStudents] = React.useState([]);
  const [open, setOpen] = React.useState(false);
  const [viewSlipOpen, setViewSlipOpen] = React.useState(false);
  const [selectedSlip, setSelectedSlip] = React.useState(null);
  const [verifyOpen, setVerifyOpen] = React.useState(false);
  const [verifyingFee, setVerifyingFee] = React.useState(null);
  const [verifyNotes, setVerifyNotes] = React.useState("");
  const [form, setForm] = React.useState({ _id: "", studentId: "", student: "", term: "", amount: 0, status: "DUE", date: "-" });
  const [receipt, setReceipt] = React.useState(null);
  const [snack, setSnack] = React.useState("");
  const [searchTerm, setSearchTerm] = React.useState("");

  const terms = ["1", "2", "3"];

  const fetchFees = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/fees?search=${searchTerm}`);
      setRows(res.data);
    } catch (err) {
      console.error("Error fetching fees:", err);
      setSnack("Error fetching fees");
    }
  };

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/users', { headers: { 'x-auth-token': token } });
      // Filter users with role 'Student'
      const studentUsers = res.data.filter(u => u.role === 'Student');
      setStudents(studentUsers);
    } catch (err) {
      console.error("Error fetching students:", err);
    }
  };

  React.useEffect(() => {
    fetchFees();
    fetchStudents();
  }, [searchTerm]);

  const openAdd = () => { setForm({ _id: "", studentId: "", student: "", term: "", amount: 0, status: "DUE", date: "-" }); setOpen(true); };
  const openEdit = (row) => { setForm(row); setOpen(true); };
  
  const save = async () => {
    try {
      if (form._id) {
        await axios.put(`http://localhost:5000/api/fees/${form._id}`, form);
      } else {
        await axios.post("http://localhost:5000/api/fees", form);
      }
      fetchFees();
      setOpen(false);
      setSnack("Fee saved");
    } catch (err) {
      console.error("Error saving fee:", err);
      setSnack("Error saving fee");
    }
  };

  const viewPaymentSlip = (row) => {
    setSelectedSlip(row);
    setViewSlipOpen(true);
  };

  const openVerifyDialog = (row, action) => {
    setVerifyingFee({ ...row, action });
    setVerifyNotes("");
    setVerifyOpen(true);
  };

  const verifyPayment = async (approve = true) => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = approve ? 'verify' : 'reject';
      
      await axios.post(`http://localhost:5000/api/fees/${verifyingFee._id}/${endpoint}`, {
        verifiedBy: 'Admin', // You can get this from current user context
        notes: verifyNotes
      }, {
        headers: { 'x-auth-token': token }
      });
      
      fetchFees();
      setVerifyOpen(false);
      setVerifyingFee(null);
      setSnack(`Payment ${approve ? 'approved' : 'rejected'} successfully`);
    } catch (err) {
      console.error("Error verifying payment:", err);
      setSnack("Error verifying payment");
    }
  };

  const markPaid = async (row) => {
    try {
      const paid = { ...row, status: "PAID", date: new Date().toISOString().slice(0, 10) };
      await axios.put(`http://localhost:5000/api/fees/${row._id}`, paid);
      fetchFees();
      setReceipt({
        number: paid._id,
        student: paid.student,
        amount: paid.amount,
        term: paid.term,
        date: paid.date,
      });
      setSnack("Fee marked as paid");
    } catch (err) {
      console.error("Error marking fee as paid:", err);
      setSnack("Error marking fee as paid");
    }
  };

  const remove = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/fees/${id}`);
      fetchFees();
      setSnack("Fee removed");
    } catch (err) {
      console.error("Error removing fee:", err);
      setSnack("Error removing fee");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PAID': return 'success';
      case 'PENDING': return 'warning';
      case 'DUE': return 'error';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === '-') return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  return (
    <Box p={3}>
      <Stack direction="row" justifyContent="space-between" mb={2}>
        <Typography variant="h5">Fees & Payments</Typography>
        <Stack direction="row" spacing={2}>
          <SearchField placeholder="Search fees..." onChange={(e) => setSearchTerm(e.target.value)} />
          <Button startIcon={<AddIcon />} variant="contained" onClick={openAdd}>New Invoice</Button>
        </Stack>
      </Stack>
      
      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 520 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Invoice</TableCell>
              <TableCell>Student</TableCell>
              <TableCell>Term</TableCell>
              <TableCell>Amount (LKR)</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Method</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Payment Slip</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(r => (
              <TableRow key={r._id}>
                <TableCell>{r._id?.substring(0, 8)}...</TableCell>
                <TableCell>{r.student}</TableCell>
                <TableCell>{r.term}</TableCell>
                <TableCell>{r.amount?.toLocaleString()}</TableCell>
                <TableCell>
                  <Chip 
                    size="small" 
                    label={r.status} 
                    color={getStatusColor(r.status)}
                    variant={r.status === 'PAID' ? 'filled' : 'outlined'}
                  />
                </TableCell>
                <TableCell>
                  {r.paymentMethod && (
                    <Chip 
                      size="small" 
                      label={r.paymentMethod} 
                      variant="outlined"
                    />
                  )}
                </TableCell>
                <TableCell>{formatDate(r.date)}</TableCell>
                <TableCell>
                  {r.paymentSlip ? (
                    <Button 
                      size="small" 
                      variant="outlined" 
                      onClick={() => viewPaymentSlip(r)}
                    >
                      View Slip
                    </Button>
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      No slip
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    {r.status === "PENDING" && (
                      <>
                        <Button 
                          size="small" 
                          variant="contained" 
                          color="success"
                          onClick={() => openVerifyDialog(r, 'approve')}
                        >
                          Approve
                        </Button>
                        <Button 
                          size="small" 
                          variant="outlined" 
                          color="error"
                          onClick={() => openVerifyDialog(r, 'reject')}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    {r.status === "DUE" && (
                      <Button 
                        size="small" 
                        variant="contained" 
                        onClick={() => markPaid(r)} 
                        startIcon={<ReceiptLongIcon />}
                      >
                        Mark Paid
                      </Button>
                    )}
                    <IconButton onClick={() => openEdit(r)}><EditIcon /></IconButton>
                    <IconButton color="error" onClick={() => remove(r._id)}><DeleteIcon /></IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </TableContainer>
      </Paper>

      {/* Add/Edit Invoice Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>{form._id ? "Edit" : "Add"} Invoice</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <FormControl fullWidth>
              <InputLabel>Select Student</InputLabel>
              <Select 
                label="Select Student" 
                value={form.studentId} 
                onChange={e => {
                  const selectedStudent = students.find(s => s._id === e.target.value);
                  setForm({ 
                    ...form, 
                    studentId: e.target.value, 
                    student: selectedStudent ? selectedStudent.name : "" 
                  });
                }}
              >
                <MenuItem value="">Select a student</MenuItem>
                {students.map(student => (
                  <MenuItem key={student._id} value={student._id}>
                    {student.name} ({student.username}) - Grade {student.grade || 'N/A'}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField 
              label="Student Name" 
              value={form.student} 
              disabled
              helperText="Auto-filled when student is selected"
            />
            <FormControl fullWidth>
              <InputLabel>Term</InputLabel>
              <Select 
                label="Term" 
                value={form.term} 
                onChange={e => setForm({ ...form, term: e.target.value })}
              >
                <MenuItem value="">Select Term</MenuItem>
                {terms.map(term => (
                  <MenuItem key={term} value={term}>Term {term}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField 
              label="Amount (LKR)" 
              type="number" 
              value={form.amount} 
              onChange={e => setForm({ ...form, amount: Number(e.target.value) })} 
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select label="Status" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <MenuItem value="DUE">DUE</MenuItem>
                <MenuItem value="PENDING">PENDING</MenuItem>
                <MenuItem value="PAID">PAID</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={save}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Payment Slip Viewer Dialog */}
      <Dialog 
        open={viewSlipOpen} 
        onClose={() => setViewSlipOpen(false)} 
        fullWidth 
        maxWidth="md"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Payment Slip</Typography>
            <Chip 
              label={selectedSlip?.status} 
              color={getStatusColor(selectedSlip?.status)}
              variant="filled"
            />
          </Stack>
        </DialogTitle>
        <DialogContent>
          {selectedSlip && (
            <Stack spacing={2}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Student</Typography>
                  <Typography variant="body1">{selectedSlip.student}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Term</Typography>
                  <Typography variant="body1">Term {selectedSlip.term}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Amount</Typography>
                  <Typography variant="body1">LKR {selectedSlip.amount?.toLocaleString()}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Upload Date</Typography>
                  <Typography variant="body1">{formatDate(selectedSlip.uploadedDate)}</Typography>
                </Grid>
              </Grid>
              
              <Divider />
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Payment Slip ({selectedSlip.paymentSlipOriginalName})
                </Typography>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    borderRadius: 2,
                    textAlign: 'center',
                    backgroundColor: 'grey.50'
                  }}
                >
                  {selectedSlip.paymentSlip ? (
                    <Box>
                      <img 
                        src={selectedSlip.paymentSlip} 
                        alt="Payment Slip" 
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: '400px',
                          borderRadius: '8px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }} 
                      />
                    </Box>
                  ) : (
                    <Typography color="text.secondary">No payment slip available</Typography>
                  )}
                </Paper>
              </Box>

              {selectedSlip.notes && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Admin Notes
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'warning.light' }}>
                    <Typography variant="body2">{selectedSlip.notes}</Typography>
                  </Paper>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          {selectedSlip?.status === 'PENDING' && (
            <>
              <Button 
                variant="contained" 
                color="success"
                onClick={() => {
                  setViewSlipOpen(false);
                  openVerifyDialog(selectedSlip, 'approve');
                }}
              >
                Approve Payment
              </Button>
              <Button 
                variant="outlined" 
                color="error"
                onClick={() => {
                  setViewSlipOpen(false);
                  openVerifyDialog(selectedSlip, 'reject');
                }}
              >
                Reject Payment
              </Button>
            </>
          )}
          <Button onClick={() => setViewSlipOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Payment Verification Dialog */}
      <Dialog 
        open={verifyOpen} 
        onClose={() => setVerifyOpen(false)} 
        fullWidth 
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle>
          {verifyingFee?.action === 'approve' ? 'Approve Payment' : 'Reject Payment'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <Typography variant="body2" color="text.secondary">
              Student: <strong>{verifyingFee?.student}</strong><br/>
              Term: <strong>Term {verifyingFee?.term}</strong><br/>
              Amount: <strong>LKR {verifyingFee?.amount?.toLocaleString()}</strong>
            </Typography>
            
            <TextField
              label="Admin Notes (Optional)"
              multiline
              rows={3}
              value={verifyNotes}
              onChange={(e) => setVerifyNotes(e.target.value)}
              placeholder={verifyingFee?.action === 'approve' ? 
                "Payment verified and approved..." : 
                "Reason for rejection..."}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVerifyOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color={verifyingFee?.action === 'approve' ? 'success' : 'error'}
            onClick={() => verifyPayment(verifyingFee?.action === 'approve')}
          >
            {verifyingFee?.action === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment Receipt Dialog */}
      <Dialog open={!!receipt} onClose={() => setReceipt(null)} fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>Payment Receipt</DialogTitle>
        <DialogContent>
          <Stack spacing={1} mt={1}>
            <Typography>Invoice: <b>{receipt?.number}</b></Typography>
            <Typography>Student: <b>{receipt?.student}</b></Typography>
            <Typography>Term: <b>{receipt?.term}</b></Typography>
            <Typography>Amount: <b>LKR {receipt?.amount?.toLocaleString()}</b></Typography>
            <Typography>Date: <b>{receipt?.date}</b></Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => window.print()} startIcon={<ReceiptLongIcon />}>Print</Button>
          <Button variant="contained" onClick={() => setReceipt(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snack} autoHideDuration={2000} onClose={() => setSnack("")} message={snack} />
    </Box>
  );
};

// ---- Section: Results Management (proposal p.12–13) IT23646292 - Wathsana P S S  -------------------------

const ResultsSection = () => {
  const [students, setStudents] = React.useState([]);
  const letterGrades = ["A+", "A", "B+", "B", "C+", "C", "D", "E", "F"]; // Letter grades for results
  const subjects = ["Math", "Science", "English", "History", "ICT", "Geography", "Commerce", "Art"];

  // Fetch students, grades, subjects
  React.useEffect(() => {
    const fetchMeta = async () => {
      try {
        const token = localStorage.getItem('token');
        const usersRes = await axios.get("http://localhost:5000/api/users", { 
          headers: { 'x-auth-token': token } 
        });
        
        const studentUsers = usersRes.data.filter(u => u.role === 'Student');
        const teacherUsers = usersRes.data.filter(u => u.role === 'Teacher');
        
        setStudents(studentUsers);
      } catch (err) {
        console.error("Error fetching metadata:", err);
        setSnack("Error loading students: " + (err.response?.data?.msg || err.message));
      }
    };
    fetchMeta();
  }, []);
  const [rows, setRows] = React.useState([]);
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState({ _id: "", studentId: "", student: "", subject: "", exam: "", score: 0, grade: "" });
  const [snack, setSnack] = React.useState("");
  const [searchTerm, setSearchTerm] = React.useState("");

  const fetchResults = async () => {
    try {
      const token = localStorage.getItem('token');
      let url = `http://localhost:5000/api/results?search=${searchTerm}`;
      
      const res = await axios.get(url, {
        headers: { 'x-auth-token': token }
      });
      setRows(res.data);
    } catch (err) {
      console.error("Error fetching results:", err);
      setSnack("Error fetching results: " + (err.response?.data?.msg || err.message));
    }
  };

  React.useEffect(() => {
    fetchResults();
  }, [searchTerm]);

  const openAdd = () => { setForm({ _id: "", studentId: "", student: "", subject: "", exam: "", score: 0, grade: "" }); setOpen(true); };
  const openEdit = (row) => { setForm(row); setOpen(true); };
  const save = async () => {
    try {
      // Validate required fields
      if (!form.studentId || !form.student || !form.subject || !form.exam || !form.grade || form.score === undefined) {
        setSnack("Please fill in all required fields");
        return;
      }

      const token = localStorage.getItem('token');
      const headers = { 'x-auth-token': token };
      
      if (form._id) {
        await axios.put(`http://localhost:5000/api/results/${form._id}`, form, { headers });
        setSnack("Result updated successfully");
      } else {
        await axios.post("http://localhost:5000/api/results", form, { headers });
        setSnack("Result added successfully");
      }
      
      fetchResults();
      setOpen(false);
    } catch (err) {
      console.error("Error saving result:", err);
      const errorMsg = err.response?.data?.msg || err.response?.data?.error || err.message || "Unknown error occurred";
      setSnack("Error saving result: " + errorMsg);
    }
  };
  const remove = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/results/${id}`, {
        headers: { 'x-auth-token': token }
      });
      fetchResults();
      setSnack("Result removed successfully");
    } catch (err) {
      console.error("Error removing result:", err);
      setSnack("Error removing result: " + (err.response?.data?.msg || err.message));
    }
  };

  return (
    <Box p={3}>
      <Stack direction="row" justifyContent="space-between" mb={2}>
        <Typography variant="h5">Results Management</Typography>
        <Stack direction="row" spacing={2}>
          <SearchField placeholder="Search results..." onChange={(e) => setSearchTerm(e.target.value)} />
          <Button startIcon={<AddIcon />} variant="contained" onClick={openAdd}>Add Result</Button>
        </Stack>
      </Stack>
      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 520 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell><TableCell>Student</TableCell><TableCell>Subject</TableCell><TableCell>Exam</TableCell>
              <TableCell>Score</TableCell><TableCell>Grade</TableCell><TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(r => (
              <TableRow key={r._id}>
                <TableCell>{r._id}</TableCell><TableCell>{r.student}</TableCell><TableCell>{r.subject}</TableCell><TableCell>{r.exam}</TableCell>
                <TableCell>{r.score}</TableCell><TableCell>{r.grade}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => openEdit(r)}><EditIcon /></IconButton>
                  <IconButton color="error" onClick={() => remove(r._id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </TableContainer>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>{form._id ? "Edit" : "Add"} Result</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <FormControl fullWidth>
              <InputLabel>Student</InputLabel>
              <Select
                label="Student"
                value={form.studentId}
                onChange={e => {
                  const selected = students.find(s => s._id === e.target.value);
                  setForm({ 
                    ...form, 
                    studentId: e.target.value, 
                    student: selected ? selected.name : "" 
                  });
                }}
              >
                {students.map(s => (
                  <MenuItem key={s._id} value={s._id}>
                    {s.name} (ID: {s._id?.slice(-6) || 'Unknown'})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField 
              label="Selected Student" 
              value={form.student} 
              disabled 
              helperText="Student name will appear after selection"
            />
            <FormControl fullWidth>
              <InputLabel>Subject</InputLabel>
              <Select label="Subject" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}>
                {subjects.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl component="fieldset">
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography>Exam Type:</Typography>
                <Button variant={form.exam === "Mid" ? "contained" : "outlined"} onClick={() => setForm({ ...form, exam: "Mid" })}>Mid</Button>
                <Button variant={form.exam === "Final" ? "contained" : "outlined"} onClick={() => setForm({ ...form, exam: "Final" })}>Final</Button>
              </Stack>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Result Grade</InputLabel>
              <Select label="Result Grade" value={form.grade} onChange={e => setForm({ ...form, grade: e.target.value })}>
                {letterGrades.map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField 
              label="Score (%)" 
              type="number" 
              value={form.score} 
              onChange={e => setForm({ ...form, score: Number(e.target.value) })} 
              inputProps={{ min: 0, max: 100, step: 0.1 }}
              helperText="Enter score as percentage (0-100)"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={save}>Save</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snack} autoHideDuration={2000} onClose={() => setSnack("")} message={snack} />
    </Box>
  );
};

// ---- Section: Notices & Communication (proposal p.14–15) IT23569454 - De Silva K.S.D --------------------

const NoticesSection = () => {
  const [rows, setRows] = React.useState([]);
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState({ _id: "", title: "", message: "", postedBy: "", date: "" });
  const [snack, setSnack] = React.useState("");
  const [searchTerm, setSearchTerm] = React.useState("");

  const fetchNotices = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/notices?search=${searchTerm}`);
      setRows(res.data);
    } catch (err) {
      console.error("Error fetching notices:", err);
      setSnack("Error fetching notices");
    }
  };

  React.useEffect(() => {
    fetchNotices();
  }, [searchTerm]);

  const openAdd = () => { setForm({ _id: "", title: "", message: "", postedBy: "", date: "" }); setOpen(true); };
  const openEdit = (row) => { setForm(row); setOpen(true); };

  const save = async () => {
    try {
      if (form._id) {
        await axios.put(`http://localhost:5000/api/notices/${form._id}`, form);
      } else {
        await axios.post("http://localhost:5000/api/notices", { ...form, postedBy: "Admin", date: new Date().toISOString().slice(0, 10) });
      }
      fetchNotices();
      setOpen(false);
      setSnack("Notice saved");
    } catch (err) {
      console.error("Error saving notice:", err);
      setSnack("Error saving notice");
    }
  };
  const remove = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/notices/${id}`);
      fetchNotices();
      setSnack("Notice removed");
    } catch (err) {
      console.error("Error removing notice:", err);
      setSnack("Error removing notice");
    }
  };

  const post = async () => {
    try {
      if (!form.title || !form.message) return;
      await axios.post("http://localhost:5000/api/notices", { ...form, postedBy: "Admin", date: new Date().toISOString().slice(0, 10) });
      fetchNotices();
      setForm({ _id: "", title: "", message: "", postedBy: "", date: "" });
      setSnack("Notice posted");
    } catch (err) {
      console.error("Error posting notice:", err);
      setSnack("Error posting notice");
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h5" mb={2}>Notices & Messages</Typography>
      <Card sx={{ mb: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', backdropFilter: 'blur(8px)' }}>
        <CardHeader title="Compose Notice" />
        <CardContent>
          <Stack spacing={2}>
            <TextField label="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            <TextField label="Message" multiline minRows={3} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
            <Stack direction="row" spacing={2} alignItems="center">
              <FormControl sx={{ minWidth: 160 }}>
                <InputLabel>Audience</InputLabel>
                <Select label="Audience" value={form.audience} onChange={e => setForm({ ...form, audience: e.target.value })}>
                  <MenuItem value="ALL">All Users</MenuItem>
                  <MenuItem value={Roles.STUDENT}>Students</MenuItem>
                  <MenuItem value={Roles.TEACHER}>Teachers</MenuItem>
                  <MenuItem value={Roles.PARENT}>Parents</MenuItem>
                </Select>
              </FormControl>
              <FormControlLabel control={<Switch checked={form.sendSilent} onChange={e => setForm({ ...form, sendSilent: e.target.checked })} />} label="Silent (no push)" />
              <Box flex={1} />
              <Button variant="contained" startIcon={<SendIcon />} onClick={post}>Post Notice</Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 520 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell><TableCell>Title</TableCell><TableCell>Message</TableCell><TableCell>By</TableCell><TableCell>Date</TableCell><TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(r => (
              <TableRow key={r._id}>
                <TableCell>{r._id}</TableCell>
                <TableCell>{r.title}</TableCell>
                <TableCell>{r.message}</TableCell>
                <TableCell>{r.postedBy}</TableCell>
                <TableCell>{r.date}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => openEdit(r)}><EditIcon /></IconButton>
                  <IconButton color="error" onClick={() => remove(r._id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </TableContainer>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>{form._id ? "Edit" : "Add"} Notice</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField label="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            <TextField label="Message" multiline minRows={3} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
            <TextField label="Posted By" value={form.postedBy} onChange={e => setForm({ ...form, postedBy: e.target.value })} />
            <TextField label="Date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={save}>Save</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snack} autoHideDuration={2000} onClose={() => setSnack("")} message={snack} />
    </Box>
  );
};

// ---- Section: Parents (light directory) - IT23168190 - R A WEERASOORIYA -------------------------------------

const ParentsSection = () => {
  const [rows, setRows] = React.useState([]);
  const [snack, setSnack] = React.useState("");
  const [searchTerm, setSearchTerm] = React.useState("");

  const fetchParents = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/users?search=${searchTerm}`, { headers: { 'x-auth-token': token } });
      // Filter users with role 'Parent'
      const parents = res.data.filter(u => u.role === 'Parent');
      setRows(parents);
    } catch (err) {
      console.error("Error fetching parents:", err);
      setSnack("Error fetching parents");
    }
  };

  React.useEffect(() => {
    fetchParents();
  }, [searchTerm]);

  return (
    <Box p={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Parents</Typography>
        <SearchField placeholder="Search parents..." onChange={(e) => setSearchTerm(e.target.value)} />
      </Stack>
      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 520 }}>
        <Table size="small" stickyHeader>
          <TableHead><TableRow><TableCell>ID</TableCell><TableCell>Name</TableCell><TableCell>Email</TableCell><TableCell>Mobile</TableCell></TableRow></TableHead>
          <TableBody>
            {rows.map(r => (
              <TableRow key={r._id}>
                <TableCell>{r._id}</TableCell><TableCell>{r.name}</TableCell><TableCell>{r.email}</TableCell><TableCell>{r.mobile}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </TableContainer>
      </Paper>
      <Snackbar open={!!snack} autoHideDuration={2000} onClose={() => setSnack("")} message={snack} />
    </Box>
  );
};

// ---- Section: Users (create user + role) IT23168190 - R A WEERASOORIYA ------------------------------------

const UsersSection = () => {
  // Strong password generator
  function generateStrongPassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=';
    let pwd = '';
    for (let i = 0; i < 12; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pwd;
  }
  const [rows, setRows] = React.useState([]);
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState({ _id: "", name: "", username: "", email: "", role: Roles.TEACHER, phone: "", password: "" });
  const [snack, setSnack] = React.useState("");
  const [searchTerm, setSearchTerm] = React.useState("");

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/users?search=${searchTerm}`,
        { headers: { 'x-auth-token': token } });
      setRows(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
      setSnack("Error fetching users");
    }
  };

  React.useEffect(() => {
    fetchUsers();
  }, [searchTerm]);

  const openAdd = () => { setForm({ _id: "", name: "", username: "", email: "", role: Roles.TEACHER, phone: "", password: "" }); setOpen(true); };
  const openEdit = (row) => { 
    // Map backend role format to frontend format when opening edit dialog
    const roleMapping = {
      'Admin': Roles.ADMIN,
      'Teacher': Roles.TEACHER,
      'Student': Roles.STUDENT,
      'Parent': Roles.PARENT,
    };
    
    setForm({
      ...row, 
      role: roleMapping[row.role] || Roles.STUDENT,
      phone: row.mobile || row.phone || "", // Handle both mobile and phone fields
      password: "" // Don't populate password field for editing
    }); 
    setOpen(true); 
  };
  
  const save = async () => {
    if (!form.name || !form.username || !form.email || !form.phone) {
      setSnack("Name, username, email, and phone are required");
      return;
    }
    
    // For new users, password is required
    if (!form._id && !form.password) {
      setSnack("Password is required for new users");
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      if (form._id) {
        const roleMap = {
          ADMIN: 'Admin',
          TEACHER: 'Teacher',
          STUDENT: 'Student',
          PARENT: 'Parent',
        };
        const updateData = {
          name: form.name,
          username: form.username,
          email: form.email,
          role: roleMap[form.role] || 'Student',
          mobile: form.phone,
        };
        
        // Only include password if it's provided
        if (form.password && form.password.trim() !== '') {
          updateData.password = form.password;
        }
        
        await axios.put(`http://localhost:5000/api/users/${form._id}`, updateData, { headers: { 'x-auth-token': token } });
      } else {
        // Map role to backend format: 'Admin', 'Teacher', etc.
        const roleMap = {
          ADMIN: 'Admin',
          TEACHER: 'Teacher',
          STUDENT: 'Student',
          PARENT: 'Parent',
        };
        const userData = {
          name: form.name,
          username: form.username,
          email: form.email,
          role: roleMap[form.role] || 'Student',
          mobile: form.phone,
          password: form.password,
        };
        await axios.post("http://localhost:5000/api/users/register", userData, { headers: { 'x-auth-token': token } });
      }
      fetchUsers();
      setOpen(false);
      setSnack("User saved");
    } catch (err) {
      console.error("Error saving user:", err);
      if (err.response && err.response.data && err.response.data.msg) {
        if (err.response.data.msg.toLowerCase().includes('email')) {
          setSnack('Email already exists');
        } else if (err.response.data.msg.toLowerCase().includes('username')) {
          setSnack('Username already exists');
        } else {
          setSnack(err.response.data.msg);
        }
      } else {
        setSnack("Error saving user");
      }
    }
  };
  const remove = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/users/${id}`, { headers: { 'x-auth-token': token } });
      fetchUsers();
      setSnack("User removed");
    } catch (err) {
      console.error("Error removing user:", err);
      setSnack("Error removing user");
    }
  };

  return (
    <Box p={3}>
      <Stack direction="row" justifyContent="space-between" mb={2}>
        <Typography variant="h5">Users & Roles</Typography>
        <Stack direction="row" spacing={2}>
          <SearchField placeholder="Search users..." onChange={(e) => setSearchTerm(e.target.value)} />
          <Button startIcon={<AddIcon />} variant="contained" onClick={openAdd}>Create User</Button>
        </Stack>
      </Stack>
      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 520 }}>
        <Table size="small" stickyHeader>
          <TableHead><TableRow><TableCell>ID</TableCell><TableCell>Name</TableCell><TableCell>Email</TableCell><TableCell>Role</TableCell><TableCell align="right">Actions</TableCell></TableRow></TableHead>
          <TableBody>
            {rows.map(r => (
              <TableRow key={r._id}>
                <TableCell>{r._id}</TableCell><TableCell>{r.name}</TableCell><TableCell>{r.email}</TableCell>
                <TableCell><Chip size="small" label={r.role} icon={<AdminPanelSettingsIcon fontSize="small" />} /></TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => openEdit(r)}><EditIcon /></IconButton>
                  <IconButton color="error" onClick={() => remove(r._id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </TableContainer>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>{form._id ? "Edit" : "Add"} User</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField label="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <TextField label="Username" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
            <TextField label="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            <TextField label="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select label="Role" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                {Object.values(Roles).map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
              </Select>
            </FormControl>
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField 
                label={form._id ? "New Password (optional)" : "Temporary Password"} 
                type="text" 
                value={form.password} 
                onChange={e => setForm({ ...form, password: e.target.value })} 
                helperText={form._id ? "Leave blank to keep current password" : "Admin can assign a temporary password."} 
                required={!form._id}
              />
              <Button variant="outlined" onClick={() => setForm({ ...form, password: generateStrongPassword() })}>
                {form._id ? "Generate New Password" : "Choose Random Strong Password"}
              </Button>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={save}>Save</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snack} autoHideDuration={2000} onClose={() => setSnack("")} message={snack} />
    </Box>
  );
};

// ---- Section: Reports (placeholder KPIs) ------------------------------------

const ReportsSection = () => {
  const [snack, setSnack] = React.useState("");

  const handleDownloadReport = async (type) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/reports/${type}?format=pdf`, {
        responseType: 'arraybuffer', // Use arraybuffer for binary PDF
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}.pdf`); // Set the filename to PDF
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      setSnack(`${type} PDF report downloaded`);
    } catch (err) {
      console.error(`Error downloading ${type} report:`, err);
      setSnack(`Error downloading ${type} report`);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h5" mb={2}>Reports</Typography>
      <Grid container spacing={2}>

        {/* STUDENT REPORT */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardHeader title="Student Reports" />
            <CardContent>
              <Button variant="contained" onClick={() => handleDownloadReport('students')}>Download Student Report</Button>
            </CardContent>
          </Card>
        </Grid>

        {/* TEACHER REPORT */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardHeader title="Teacher Reports" />
            <CardContent>
              <Button variant="contained" onClick={() => handleDownloadReport('teachers')}>Download Teacher Report</Button>
            </CardContent>
          </Card>
        </Grid>

        {/* FEE REPORT */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardHeader title="Fee Reports" />
            <CardContent>
              <Button variant="contained" onClick={() => handleDownloadReport('fees')}>Download Fee Report</Button>
            </CardContent>
          </Card>
        </Grid>

        {/* RESULT REPORT */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardHeader title="Result Reports" />
            <CardContent>
              <Button variant="contained" onClick={() => handleDownloadReport('results')}>Download Result Report</Button>
            </CardContent>
          </Card>
        </Grid>

        {/* NOTICE REPORT */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardHeader title="Notice Reports" />
            <CardContent>
              <Button variant="contained" onClick={() => handleDownloadReport('notices')}>Download Notice Report</Button>
            </CardContent>
          </Card>
        </Grid>
        
        {/* TIMETABLE REPORT */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardHeader title="Timetable Reports" />
            <CardContent>
              <Button variant="contained" onClick={() => handleDownloadReport('timetable')}>Download Timetable Report</Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Snackbar open={!!snack} autoHideDuration={2000} onClose={() => setSnack("")} message={snack} />
    </Box>
  );
};


// ---- Root Admin Dashboard - IT23569454 - De Silva K.S.D----------------------------------------------------

const NAV_ITEMS = [
  { key: "Overview", icon: <DashboardIcon /> },
  { key: "Students", icon: <SchoolIcon /> },
  { key: "Teachers", icon: <PersonIcon /> },
  { key: "ClassesTimetable", label: "Classes & Timetable", icon: <CalendarMonthIcon /> },
  { key: "FeesPayments", label: "Fees & Payments", icon: <PaymentsIcon /> },
  { key: "Results", icon: <AssignmentTurnedInIcon /> },
  { key: "Notices", label: "Notices & Messages", icon: <CampaignIcon /> },
  { key: "Applications", label: "Applications", icon: <AssignmentTurnedInIcon /> },
  { key: "Parents", icon: <PeopleIcon /> },
  { key: "Users", label: "Users & Roles", icon: <AdminPanelSettingsIcon /> },
  { key: "Reports", icon: <BarChartIcon /> }
];
// ---- Section: Applications (Admissions) IT23168190 R A WEERASOORIYA ------------------------------------
const ApplicationsSection = () => {
  const [rows, setRows] = React.useState([]);
  const [snack, setSnack] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/admissions");
      setRows(res.data);
    } catch (err) {
      setSnack("Error fetching applications");
    }
    setLoading(false);
  };
  React.useEffect(() => { fetchApplications(); }, []);

  const handleStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:5000/api/admissions/${id}/status`, { status, reviewedBy: "Admin" }, { headers: { 'x-auth-token': token } });
      fetchApplications();
      setSnack(`Application ${status}`);
    } catch (err) {
      setSnack("Error updating status");
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h5" mb={2}>Admission Applications</Typography>
      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 520 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Grade</TableCell>
                <TableCell>Message</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map(r => (
                <TableRow key={r._id}>
                  <TableCell>{r.name}</TableCell>
                  <TableCell>{r.email}</TableCell>
                  <TableCell>{r.phone}</TableCell>
                  <TableCell>{r.grade}</TableCell>
                  <TableCell>
                    <Tooltip title={r.message || ''} placement="top" arrow>
                      <span style={{ maxWidth: 180, display: 'inline-block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {r.message}
                      </span>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Chip label={r.status} color={r.status === "Accepted" ? "success" : r.status === "Rejected" ? "error" : "warning"} />
                  </TableCell>
                  <TableCell>
                    {r.status === "Pending" && (
                      <Stack direction="row" spacing={1}>
                        <Button size="small" color="success" variant="contained" onClick={() => handleStatus(r._id, "Accepted")}>Accept</Button>
                        <Button size="small" color="error" variant="contained" onClick={() => handleStatus(r._id, "Rejected")}>Reject</Button>
                      </Stack>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <Snackbar open={!!snack} autoHideDuration={2000} onClose={() => setSnack("")} message={snack} />
    </Box>
  );
};

export default function AdminDashboard({ currentUser = { name: "Admin", role: Roles.ADMIN } }) {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [section, setSection] = React.useState("Overview");
  const [currentUserProfile, setCurrentUserProfile] = React.useState(null);
  const [profileModalOpen, setProfileModalOpen] = React.useState(false);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const decoded = jwtDecode(token);
        const userId = decoded.user.id;
        const res = await axios.get(`http://localhost:5000/api/users/profile`, {
          headers: {
            'x-auth-token': token,
          },
        });
        setCurrentUserProfile(res.data);
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
      // Handle error, e.g., redirect to login if token is invalid
    }
  };


  React.useEffect(() => {
    fetchUserProfile();
  }, []);


  const handleProfileMenuOpen = () => {
    setProfileModalOpen(true);
  };

  const handleProfileMenuClose = () => {
    setProfileModalOpen(false);
  };

  const handleSignOut = () => {
    localStorage.clear();
    navigate("/");
  };

  const visibleNav = React.useMemo(
    () => NAV_ITEMS.filter(item => permissions[item.key]?.includes(currentUser.role)),
    [currentUser.role]
  );

  // Minimal Settings section to avoid undefined reference and allow theme toggles later
  const SettingsSection = () => (
    <Box p={3}>
      <Typography variant="h5" mb={2}>Settings</Typography>
      <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <CardHeader title="Appearance" subheader="Basic preferences" />
        <CardContent>
          <Stack direction="row" spacing={2}>
            <FormControlLabel control={<Switch defaultChecked />} label="Use compact tables" />
            <FormControlLabel control={<Switch />} label="Reduce motion" />
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );

  const SectionView = React.useMemo(() => {
    switch (section) {
      case "Overview": return <OverviewSection />;
      case "Students": return <Guard role={currentUser.role} section="Students"><StudentsSection /></Guard>;
      case "Teachers": return <Guard role={currentUser.role} section="Teachers"><TeachersSection /></Guard>;
      case "ClassesTimetable": return <Guard role={currentUser.role} section="ClassesTimetable"><TimetableSection /></Guard>;
      case "FeesPayments": return <Guard role={currentUser.role} section="FeesPayments"><FeesSection /></Guard>;
      case "Results": return <Guard role={currentUser.role} section="Results"><ResultsSection /></Guard>;
      case "Notices": return <Guard role={currentUser.role} section="Notices"><NoticesSection /></Guard>;
      case "Applications": return <Guard role={currentUser.role} section="Overview"><ApplicationsSection /></Guard>;
      case "Parents": return <Guard role={currentUser.role} section="Parents"><ParentsSection /></Guard>;
      case "Users": return <Guard role={currentUser.role} section="Users"><UsersSection /></Guard>;
      case "Reports": return <Guard role={currentUser.role} section="Reports"><ReportsSection /></Guard>;
      case "Settings": return <Guard role={currentUser.role} section="Settings"><SettingsSection /></Guard>;
      default: return <OverviewSection />;
    }
  }, [section]);

  const drawer = (
    <div>
      <Toolbar>
        <Stack direction="column" spacing={1} alignItems="center" width="100%">
          <Avatar sx={{ width: 40, height: 40 }}>IS</Avatar>
          <Typography variant="caption" color="text.secondary" textAlign="center">{currentUser.role}</Typography>
        </Stack>
      </Toolbar>
      <Divider />
      <List sx={{ px: 1 }}>
        {visibleNav.map((item) => (
          <ListItem key={item.key} disablePadding sx={{ display: 'block' }}>
            <Tooltip title={item.label || item.key} placement="right">
              <ListItemButton
                selected={section === item.key}
                onClick={() => { setSection(item.key); setMobileOpen(false); }}
                sx={{
                  minHeight: 48,
                  justifyContent: 'center',
                  borderRadius: 2,
                  my: 0.5
                }}
              >
                <ListItemIcon sx={{ minWidth: 0, mr: 0, justifyContent: 'center' }}>
                  {item.icon}
                </ListItemIcon>
              </ListItemButton>
            </Tooltip>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: "flex", minHeight: '100vh', background: {
      xs: 'linear-gradient(180deg, #f8fbff 0%, #ffffff 100%)',
      md: 'radial-gradient(1200px 600px at 10% -10%, #eaf3ff 0%, transparent 60%), radial-gradient(1000px 800px at 100% 0%, #f7f5ff 0%, transparent 60%)'
    } }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: 'rgba(255,255,255,0.6)',
        backdropFilter: 'blur(10px)',
        color: 'text.primary',
        boxShadow: 'none',
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(!mobileOpen)} sx={{ mr: 2, display: { md: "none" } }}>
            <DashboardIcon />
          </IconButton>
          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar src={currentUserProfile?.profileImage} sx={{ width: 28, height: 28 }}>
              {currentUserProfile?.username?.[0]?.toUpperCase() || currentUserProfile?.name?.[0]?.toUpperCase() || "A"}
            </Avatar>
            <Typography variant="subtitle1" noWrap component="div" sx={{ fontWeight: 700 }}>
              {currentUserProfile?.username || currentUserProfile?.name || "Admin"}
            </Typography>
          </Stack>
          <Box sx={{ flexGrow: 1 }} />
          <Button color="inherit" onClick={handleSignOut} sx={{ textTransform: 'none', borderRadius: 2 }}>
            Sign Out
          </Button>
          <IconButton onClick={handleProfileMenuOpen} sx={{ ml: 2 }}>
            <Avatar src={currentUserProfile?.profileImage} alt={currentUserProfile?.username?.[0] || currentUserProfile?.name?.[0] || "A"} />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Side Drawer */}
      <Drawer variant="permanent" sx={{ width: drawerWidth, flexShrink: 0, [`& .MuiDrawer-paper`]: {
        width: drawerWidth,
        boxSizing: "border-box",
        display: { xs: "none", md: "block" },
        backgroundColor: 'rgba(255,255,255,0.6)',
        backdropFilter: 'blur(12px)',
        borderRight: '1px solid',
        borderColor: 'divider'
      } }}>
        {drawer}
      </Drawer>
      <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: "block", md: "none" }, [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: "border-box",
          backgroundColor: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(12px)'
        } }}>
        {drawer}
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, minHeight: 600, p: 0, display: 'flex', flexDirection: 'column' }}>
        <Toolbar />
        <Container maxWidth="xl" sx={{ py: 3, flexGrow: 1, minHeight: 520, display: 'flex', flexDirection: 'column' }}>
          <Stack direction="row" spacing={1} sx={{ mb: 2, overflowX: 'auto' }}>
            {visibleNav.map(item => (
              <Chip
                key={item.key}
                label={item.label || item.key}
                onClick={() => setSection(item.key)}
                color={section === item.key ? 'primary' : 'default'}
                variant={section === item.key ? 'filled' : 'outlined'}
                size="small"
                sx={{ borderRadius: 2 }}
              />
            ))}
          </Stack>
          <Box sx={{ flexGrow: 1, minHeight: 520, display: 'flex', flexDirection: 'column' }}>
            {SectionView}
          </Box>
        </Container>
      </Box>
      <ProfileManagementModal
        open={profileModalOpen}
        onClose={handleProfileMenuClose}
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
          fetchUserProfile(); // Re-fetch user profile to update the image in the header
        }}
      />
    </Box>
  );
}
