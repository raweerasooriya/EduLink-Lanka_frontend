import * as React from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import {
  AppBar, Avatar, Badge, Box, Button, Card, CardContent, CardHeader, Chip,
  Container, CssBaseline, Dialog, DialogActions, DialogContent, DialogTitle,
  Divider, FormControl, Grid, IconButton, InputLabel, MenuItem, Select, Snackbar, Stack,
  Table, TableBody, TableCell, TableHead, TableRow, TextField, Toolbar, Tooltip,
  Typography, Paper, Tab, Tabs, useTheme, alpha
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PeopleIcon from "@mui/icons-material/People";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import CampaignIcon from "@mui/icons-material/Campaign";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SendIcon from "@mui/icons-material/Send";
import SchoolIcon from "@mui/icons-material/School";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import GroupsIcon from "@mui/icons-material/Groups";

import { useNavigate } from "react-router-dom";
import ProfileManagementModal from "./ProfileManagementModal";

// ---------- axios instance with auth header ----------
const api = axios.create({ baseURL: "http://localhost:5000/api" });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers["x-auth-token"] = token;
  return config;
});

// ---------- Enhanced UI Components ----------
const SearchField = ({ placeholder = "Search…", onChange }) => (
  <TextField
    size="small"
    placeholder={placeholder}
    onChange={onChange}
    sx={{
      "& .MuiOutlinedInput-root": {
        backgroundColor: alpha("#fff", 0.1),
        borderRadius: 3,
        "& fieldset": { borderColor: alpha("#fff", 0.3) },
        "&:hover fieldset": { borderColor: alpha("#fff", 0.5) },
        "&.Mui-focused fieldset": { borderColor: "#fff" },
        "& input": { color: "#fff" },
        "& input::placeholder": { color: alpha("#fff", 0.7) }
      }
    }}
    InputProps={{
      startAdornment: (
        <IconButton size="small" sx={{ color: alpha("#fff", 0.7) }}>
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
        borderRadius: 4,
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

// Utility: unique list from array of objects
const uniq = (arr) => Array.from(new Set(arr.filter(Boolean)));

// ---------- Overview - IT23168190 - R A WEERASOORIYA ----------
function OverviewSection({ teacherName, teacherSubject }) {
  const [totals, setTotals] = React.useState({ classes: 0, students: 0, notices: 0 });
  const [nextClass, setNextClass] = React.useState(null);
  const [snack, setSnack] = React.useState("");

  // Use lowercase 3-letter day for robust comparisons (e.g., "Mon" vs "Monday")
  const dayShort = ["sun","mon","tue","wed","thu","fri","sat"][new Date().getDay()];

  const fetchAll = async () => {
    try {
      // Get this teacher's timetable rows
      const ttRes = await api.get(`/timetable`, { params: { search: teacherName } });
      const mine = (ttRes.data || []).filter(x => (x.teacher || "").toLowerCase() === (teacherName || "").toLowerCase());
      const classes = uniq(mine.map(m => m.class));
      // Next class (today else earliest)
      // Normalize stored day values to first 3 letters, lowercase
      const todays = mine.filter(x => (x.day || "").slice(0,3).toLowerCase() === dayShort);
      const byTime = (arr) => arr.sort((a,b) => (a.period||"").localeCompare(b.period||""));
      setNextClass(todays.length ? byTime(todays)[0] : byTime(mine)[0] || null);

      // Count students across these classes (best-effort)
      // Use /users with role=Student and parse grade/section from class name (e.g., "10A")
      const studentCalls = classes.slice(0, 10).map(c => {
        const grade = (c || "").replace(/\D/g, "");
        const section = (c || "").replace(/\d/g, "");
        const params = { role: 'Student' };
        if (grade) params.grade = grade;
        if (section) params.section = section;
        return api.get(`/users`, { params });
      });
      const [noticesRes, ...studentResps] = await Promise.all([
        api.get(`/notices`),
        ...studentCalls
      ]);
      const studentsTotal = studentResps.reduce((acc, r) => acc + (r.data?.length || 0), 0);

      setTotals({
        classes: classes.length,
        students: studentsTotal,
        notices: (noticesRes.data || []).length,
      });
    } catch (e) {
      console.error(e);
      setSnack("Failed to load overview");
    }
  };

  React.useEffect(() => { if (teacherName) fetchAll(); }, [teacherName]);

  return (
    <Box>
      {/* Hero Section */}
      <ModernCard gradient sx={{ mb: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack>
              <Typography variant="h3" fontWeight={800} gutterBottom>
                Welcome back, {teacherName?.split(' ')[0] || 'Teacher'}!
              </Typography>
              {teacherSubject && (
                <Stack direction="row" alignItems="center" spacing={1}>
                  <SchoolIcon color="primary" />
                  <Typography variant="h5" color="primary" fontWeight={600}>
                    {teacherSubject} Department
                  </Typography>
                </Stack>
              )}
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
              {teacherName?.charAt(0) || 'T'}
            </Avatar>
          </Stack>
        </CardContent>
      </ModernCard>

      {/* Stats Grid */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={4}>
          <StatsCard 
            title="My Classes" 
            value={totals.classes} 
            icon={<GroupsIcon />}
            trend={5}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatsCard 
            title="Total Students" 
            value={totals.students} 
            icon={<PeopleIcon />}
            trend={12}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatsCard 
            title="Active Notices" 
            value={totals.notices} 
            icon={<CampaignIcon />}
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Next Class Card */}
      <ModernCard>
        <CardHeader 
          title={
            <Stack direction="row" alignItems="center" spacing={1}>
              <CalendarMonthIcon color="primary" />
              <Typography variant="h6" fontWeight={600}>Next Class</Typography>
            </Stack>
          }
        />
        <CardContent sx={{ pt: 0 }}>
          {nextClass ? (
            <Stack spacing={2}>
              <Box sx={{ p: 3, borderRadius: 2, bgcolor: alpha("#1976d2", 0.05), border: "1px solid", borderColor: alpha("#1976d2", 0.2) }}>
                <Typography variant="h6" fontWeight={600} color="primary" gutterBottom>
                  {nextClass.subject}
                </Typography>
                <Stack direction="row" spacing={4}>
                  <Stack>
                    <Typography variant="caption" color="text.secondary">CLASS</Typography>
                    <Typography variant="body1" fontWeight={500}>{nextClass.class}</Typography>
                  </Stack>
                  <Stack>
                    <Typography variant="caption" color="text.secondary">ROOM</Typography>
                    <Typography variant="body1" fontWeight={500}>{nextClass.room}</Typography>
                  </Stack>
                  <Stack>
                    <Typography variant="caption" color="text.secondary">TIME</Typography>
                    <Typography variant="body1" fontWeight={500}>{nextClass.day} • {nextClass.period}</Typography>
                  </Stack>
                </Stack>
              </Box>
            </Stack>
          ) : (
            <Typography color="text.secondary">No upcoming class found.</Typography>
          )}
        </CardContent>
      </ModernCard>

      <Snackbar open={!!snack} autoHideDuration={2500} onClose={() => setSnack("")} message={snack} />
    </Box>
  );
}

// ---------- My Timetable - IT23621374 - Brundhaban.J ----------
function TimetableSection({ teacherName }) {
  const [rows, setRows] = React.useState([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [snack, setSnack] = React.useState("");

  const fetchTT = async () => {
    try {
      const res = await api.get(`/timetable`, { params: { search: searchTerm || teacherName } });
      const mine = (res.data || []).filter(x => (x.teacher || "").toLowerCase() === (teacherName || "").toLowerCase());
      setRows(mine);
    } catch (e) {
      console.error(e);
      setSnack("Failed to load timetable");
    }
  };

  React.useEffect(() => { if (teacherName) fetchTT(); }, [teacherName, searchTerm]);

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>My Timetable</Typography>
        <TextField
          size="small"
          placeholder="Search subject/class…"
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ minWidth: 250 }}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />,
          }}
        />
      </Stack>

      <ModernCard>
        <Table>
          <TableHead>
            <TableRow>
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
              <TableRow key={r._id || r.id} sx={{ "&:hover": { bgcolor: alpha("#1976d2", 0.02) } }}>
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
          </TableBody>
        </Table>
      </ModernCard>

      <Snackbar open={!!snack} autoHideDuration={2500} onClose={() => setSnack("")} message={snack} />
    </Box>
  );
}

// ---------- My Students (by class taught) - IT23168190 - R A WEERASOORIYA ----------
function StudentsSection({ teacherName }) {
  const [classes, setClasses] = React.useState([]);
  const [selectedClass, setSelectedClass] = React.useState("");
  const [rows, setRows] = React.useState([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [snack, setSnack] = React.useState("");

  const loadClasses = async () => {
    try {
      // Get classes from timetable
      const ttRes = await api.get(`/timetable`, { params: { search: teacherName } });
      const mine = (ttRes.data || []).filter(x => (x.teacher || "").toLowerCase() === (teacherName || "").toLowerCase());
      const timetableClasses = uniq(mine.map(m => m.class));
      
      // Also get all available classes from students
      const usersRes = await api.get(`/users`, { params: { role: 'Student' } });
      const allStudents = usersRes.data || [];
      const allClasses = uniq(allStudents.map(s => s.grade && s.section ? `${s.grade}${s.section}` : null).filter(Boolean));
      
      // Combine timetable classes with all classes, prioritizing timetable classes
      const combinedClasses = [...new Set([...timetableClasses, ...allClasses])].sort();
      
      setClasses(combinedClasses);
      if (!selectedClass && combinedClasses.length) {
        setSelectedClass(timetableClasses[0] || combinedClasses[0]);
      }
    } catch (e) {
      console.error("Load classes error:", e);
      setSnack("Failed to load classes: " + (e.response?.data?.msg || e.message));
    }
  };

  const fetchStudents = async () => {
    try {      
      let params = { role: 'Student' };
      
      if (selectedClass && selectedClass !== "") {
        // Extract grade and section from selectedClass (e.g., "10A" -> grade="10", section="A")
        const grade = selectedClass.replace(/\D/g, ''); // Remove non-digits
        const section = selectedClass.replace(/\d/g, ''); // Remove digits
        
        if (grade) params.grade = grade;
        if (section) params.section = section;
      }
      
      if (searchTerm) params.search = searchTerm;
      
      const res = await api.get(`/users`, { params });
      
      let students = res.data || [];
      
      // Additional client-side filtering for specific class selection
      if (selectedClass && selectedClass !== "") {
        const grade = selectedClass.replace(/\D/g, '');
        const section = selectedClass.replace(/\d/g, '');
        
        console.log("Client-side filtering - grade:", grade, "section:", section);
        
        if (grade && section) {
          const filteredStudents = students.filter(user => {
            console.log("Checking user:", user.name, "role:", user.role, "grade:", user.grade, "section:", user.section);
            return user.role === 'Student' && 
                   user.grade === grade && 
                   user.section === section;
          });
          students = filteredStudents;
          console.log("Filtered students:", filteredStudents);
        }
      }
      
      console.log("Final filtered students:", students);
      console.log("Final filtered students count:", students.length);
      setRows(students);
    } catch (e) {
      console.error("Students fetch error:", e);
      console.error("Error details:", e.response?.data);
      setSnack("Failed to load students: " + (e.response?.data?.msg || e.message));
    }
  };

  React.useEffect(() => { 
    if (teacherName) {
      loadClasses();
      // Load all students by default
      fetchStudents();
    }
  }, [teacherName]);
  React.useEffect(() => { fetchStudents(); }, [selectedClass, searchTerm]);

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" mb={3} alignItems="center">
        <Typography variant="h5" fontWeight={700}>My Students</Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Class</InputLabel>
            <Select label="Class" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
              <MenuItem value="">All Students</MenuItem>
              {classes.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField
            size="small"
            placeholder="Search name/email…"
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ minWidth: 250 }}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />,
            }}
          />
        </Stack>
      </Stack>

      <ModernCard>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Grade</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Section</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Guardian</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(r => (
              <TableRow key={r._id || r.id} sx={{ "&:hover": { bgcolor: alpha("#1976d2", 0.02) } }}>
                <TableCell>
                  <Chip label={(r._id || r.id)?.slice(-6) || 'N/A'} size="small" />
                </TableCell>
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ width: 32, height: 32 }}>{r.name?.charAt(0)}</Avatar>
                    <Typography fontWeight={500}>{r.name}</Typography>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Chip label={r.grade || 'N/A'} size="small" color="primary" />
                </TableCell>
                <TableCell>
                  <Chip label={r.section || 'N/A'} size="small" color="secondary" />
                </TableCell>
                <TableCell>{r.email}</TableCell>
                <TableCell>{r.parent?.name || r.parent || 'N/A'}</TableCell>
              </TableRow>
            ))}
            {!rows.length && (
              <TableRow><TableCell colSpan={6} align="center" sx={{ py: 3, color: "text.secondary" }}>
                <Stack spacing={1} alignItems="center">
                  <Typography>
                    {selectedClass && selectedClass !== "" 
                      ? `No students found in class ${selectedClass}.` 
                      : "No students found in the system."}
                  </Typography>
                  <Typography variant="caption">
                    Try selecting "All Students" or contact your administrator to add students.
                  </Typography>
                </Stack>
              </TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </ModernCard>

      <Snackbar open={!!snack} autoHideDuration={2500} onClose={() => setSnack("")} message={snack} />
    </Box>
  );
}

// ---------- Results (create/edit within classes taught) - IT23646292 - Wathsana P S S ----------
function ResultsSection({ teacherName }) {
  const [classes, setClasses] = React.useState([]);
  const [subjects, setSubjects] = React.useState([]);
  const [selectedClass, setSelectedClass] = React.useState("");
  const [rows, setRows] = React.useState([]);
  const [gradeFilter, setGradeFilter] = React.useState("");
  const [students, setStudents] = React.useState([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [snack, setSnack] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState({ _id: "", studentId: "", student: "", subject: "", exam: "", score: 0, grade: "" });

  // Calculate grade based on score
  const calculateGrade = (score) => {
    let grade = "";
    if (score >= 90) grade = "A+";
    else if (score >= 75) grade = "A";
    else if (score >= 65) grade = "B";
    else if (score >= 50) grade = "C";
    else if (score >= 35) grade = "S";
    else if (score >= 0) grade = "W";
    return grade;
  };

  // Check if result already exists for same student, subject, and exam
  const isDuplicateResult = (studentId, subject, exam, currentId = "") => {
    return rows.some(row => 
      row.studentId === studentId && 
      row.subject === subject && 
      row.exam === exam && 
      (row._id || row.id) !== currentId
    );
  };

  const loadMeta = async () => {
    try {
      console.log("Loading results metadata for teacher:", teacherName);
      
      // Get classes and subjects from timetable
      const ttRes = await api.get(`/timetable`, { params: { search: teacherName } });
      const mine = (ttRes.data || []).filter(x => (x.teacher || "").toLowerCase() === (teacherName || "").toLowerCase());
      const timetableClasses = uniq(mine.map(m => m.class));
      const timetableSubjects = uniq(mine.map(m => m.subject));
      
      // Also get all available classes from students as fallback
      const usersRes = await api.get(`/users`, { params: { role: 'Student' } });
      const allStudents = usersRes.data || [];
      const allClasses = uniq(allStudents.map(s => s.grade && s.section ? `${s.grade}${s.section}` : null).filter(Boolean));
      
      // Get teacher's subject from profile as fallback
      const profileRes = await api.get(`/users/profile`);
      const teacherSubject = profileRes.data?.subject;
      const fallbackSubjects = ["Math", "Science", "English", "History", "ICT", "Geography", "Commerce", "Art"];
      
      const combinedClasses = [...new Set([...timetableClasses, ...allClasses])].sort();
      const combinedSubjects = [...new Set([...timetableSubjects, ...(teacherSubject ? [teacherSubject] : []), ...fallbackSubjects])];
      
      console.log("Results classes:", combinedClasses);
      console.log("Results subjects:", combinedSubjects);
      
      setClasses(combinedClasses);
      setSubjects(combinedSubjects);
      
      if (!selectedClass && combinedClasses.length) {
        setSelectedClass(timetableClasses[0] || combinedClasses[0]);
      }
    } catch (e) {
      console.error("Load results metadata error:", e);
      setSnack("Failed to load class/subject data: " + (e.response?.data?.msg || e.message));
    }
  };

  const fetchRows = async () => {
    try {
      console.log("Fetching results for class:", selectedClass, "search:", searchTerm, "gradeFilter:", gradeFilter);
      
      let params = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedClass && selectedClass !== "All Students/Classes") {
        params.class = selectedClass;
      }
      
      console.log("Results API params:", params);
      
      const res = await api.get(`/results`, { params });
      console.log("Results API response:", res.data);
      
      let data = res.data || [];
      
      // CLIENT-SIDE GRADE FILTERING
      if (gradeFilter) {
        data = data.filter(row => row.grade === gradeFilter);
      }
      
      console.log("Final filtered results:", data);
      setRows(data);
    } catch (e) {
      console.error("Results fetch error:", e);
      setSnack("Failed to load results: " + (e.response?.data?.msg || e.message));
    }
  };

  const fetchStudents = async () => {
    try {
      console.log("Fetching students for results in class:", selectedClass);
      
      let params = { role: 'Student' };
      
      if (selectedClass && selectedClass !== "") {
        // Extract grade and section from selectedClass
        const grade = selectedClass.replace(/\D/g, ''); // Remove non-digits
        const section = selectedClass.replace(/\d/g, ''); // Remove digits
        
        console.log("Results section - Parsed grade:", grade, "section:", section);
        
        if (grade) params.grade = grade;
        if (section) params.section = section;
      }
      
      console.log("Results section - API params:", params);
      
      const res = await api.get(`/users`, { params });
      console.log("Students for results API response:", res.data);
      
      let students = res.data || [];
      
      // Additional client-side filtering for specific class selection
      if (selectedClass && selectedClass !== "") {
        const grade = selectedClass.replace(/\D/g, '');
        const section = selectedClass.replace(/\d/g, '');
        
        if (grade && section) {
          students = students.filter(user => 
            user.role === 'Student' && 
            user.grade === grade && 
            user.section === section
          );
        }
      }
      
      console.log("Filtered students for results:", students);
      setStudents(students);
    } catch (e) {
      console.error("Students for results fetch error:", e);
      setSnack("Failed to load students for class: " + (e.response?.data?.msg || e.message));
    }
  };

  React.useEffect(() => { 
    if (teacherName) {
      loadMeta();
      // Load results initially
      fetchRows();
      fetchStudents();
    }
  }, [teacherName]);
  React.useEffect(() => { fetchRows(); fetchStudents(); }, [selectedClass, searchTerm, gradeFilter]);


  const openAdd = () => { 
    setForm({ 
      _id: "", 
      studentId: "", 
      student: "", 
      subject: subjects[0] || "", 
      exam: "", 
      score: 0, 
      grade: "" 
    }); 
    setOpen(true); 
  };

  const openEdit = (row) => { 
    setForm({ 
      ...row, 
      studentId: row.studentId, 
      student: row.student, 
      subject: row.subject 
    }); 
    setOpen(true); 
  };

  const handleScoreChange = (score) => {
    // Prevent negative values
    const validScore = Math.max(0, score);
    const grade = calculateGrade(validScore);
    setForm({ ...form, score: validScore, grade });
  };

  const save = async () => {
    try {
      // Validation: Check for duplicate result
      if (isDuplicateResult(form.studentId, form.subject, form.exam, form._id)) {
        setSnack("Error: This student already has a result for the same subject and term test!");
        return;
      }

      // Validation: Check if score is valid
      if (form.score < 0) {
        setSnack("Error: Score cannot be negative!");
        return;
      }

      if (form.score > 100) {
        setSnack("Error: Score cannot be greater than 100!");
        return;
      }

      const payload = { 
        ...form, 
        class: selectedClass,
        grade: calculateGrade(form.score) // Ensure grade is calculated before saving
      };
      
      if (form._id) {
        await api.put(`/results/${form._id}`, payload);
      } else {
        await api.post(`/results`, payload);
      }
      setOpen(false);
      setSnack("Result saved successfully");
      fetchRows();
    } catch (e) {
      console.error(e);
      setSnack("Error saving result: " + (e.response?.data?.msg || e.message));
    }
  };

  const remove = async (id) => {
    try {
      await api.delete(`/results/${id}`);
      setSnack("Result removed");
      fetchRows();
    } catch (e) {
      console.error(e);
      setSnack("Error removing result");
    }
  };

  return (
    <Box>
 <Stack direction="row" justifyContent="space-between" mb={3}>
  <Typography variant="h5" fontWeight={700}>Results</Typography>
  <Stack direction="row" spacing={2} alignItems="center">
    <FormControl sx={{ minWidth: 160 }}>
      <InputLabel>Class</InputLabel>
      <Select label="Class" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
        <MenuItem value="">All Classes</MenuItem>
        {classes.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
      </Select>
    </FormControl>

    {/* ADD THIS GRADE FILTER */}
    <FormControl sx={{ minWidth: 140 }}>
      <InputLabel>Grade Filter</InputLabel>
      <Select 
        label="Grade Filter" 
        value={gradeFilter} 
        onChange={(e) => setGradeFilter(e.target.value)}
      >
        <MenuItem value="">All Grades</MenuItem>
        <MenuItem value="A+">A+</MenuItem>
        <MenuItem value="A">A</MenuItem>
        <MenuItem value="B">B</MenuItem>
        <MenuItem value="C">C</MenuItem>
        <MenuItem value="S">S</MenuItem>
        <MenuItem value="W">W</MenuItem>
      </Select>
    </FormControl>

    <TextField
      size="small"
      placeholder="Search subject/student…"
      onChange={(e) => setSearchTerm(e.target.value)}
      sx={{ minWidth: 250 }}
      InputProps={{
        startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />,
      }}
    />
    <Button startIcon={<AddIcon />} variant="contained" onClick={openAdd} sx={{ borderRadius: 2 }}>
      Add Result
    </Button>
  </Stack>
</Stack>

      <ModernCard>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Student</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Subject</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Term Test</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Score</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Grade</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(r => (
              <TableRow key={r._id || r.id} sx={{ "&:hover": { bgcolor: alpha("#1976d2", 0.02) } }}>
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ width: 32, height: 32 }}>{r.student?.charAt(0)}</Avatar>
                    <Typography fontWeight={500}>{r.student}</Typography>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Chip label={r.subject} size="small" color="primary" />
                </TableCell>
                <TableCell>{r.exam}</TableCell>
                <TableCell>
                  <Chip 
                    label={r.score} 
                    size="small" 
                    color={r.score >= 80 ? "success" : r.score >= 60 ? "warning" : "error"}
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={r.grade} 
                    size="small" 
                    variant="outlined" 
                    color={
                      r.grade === "A+" ? "success" : 
                      r.grade === "A" ? "success" : 
                      r.grade === "B" ? "warning" : 
                      r.grade === "C" ? "warning" : 
                      r.grade === "S" ? "error" : 
                      "error"
                    }
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => openEdit(r)} color="primary" size="small">
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => remove(r._id || r.id)} size="small">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {!rows.length && (
              <TableRow><TableCell colSpan={6} align="center" sx={{ py: 3, color: "text.secondary" }}>
                {selectedClass ? "No results yet." : "Select a class to manage results."}
              </TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </ModernCard>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 600 }}>{form._id ? "Edit" : "Add"} Result</DialogTitle>
        <DialogContent>
          <Stack spacing={3} mt={2}>
            <FormControl fullWidth>
              <InputLabel>Student *</InputLabel>
              <Select
                label="Student *"
                value={form.studentId}
                onChange={(e) => {
                  const s = students.find(x => (x._id || x.id) === e.target.value);
                  setForm({ ...form, studentId: e.target.value, student: s?.name || "" });
                }}
              >
                {students.map(s => (
                  <MenuItem key={s._id || s.id} value={s._id || s.id}>{s.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Subject *</InputLabel>
              <Select
                label="Subject *"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
              >
                {subjects.map(sub => <MenuItem key={sub} value={sub}>{sub}</MenuItem>)}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Term Test *</InputLabel>
              <Select
                label="Term Test *"
                value={form.exam}
                onChange={(e) => setForm({ ...form, exam: e.target.value })}
              >
                <MenuItem value="Term Test 1">Term Test 1</MenuItem>
                <MenuItem value="Term Test 2">Term Test 2</MenuItem>
                <MenuItem value="Term Test 3">Term Test 3</MenuItem>
              </Select>
            </FormControl>

            <Stack direction="row" spacing={2} alignItems="center">
            <TextField 
                label="Score *" 
                type="number" 
                value={form.score === 0 ? '' : form.score} 
                onChange={e => {
                  const value = e.target.value === '' ? 0 : Number(e.target.value);
                  handleScoreChange(value);
                }}
                onFocus={(e) => {
                  if (form.score === 0) {
                    setForm({ ...form, score: '', grade: '' });
                  }
                }}
                onBlur={e => {
                  const value = e.target.value === '' ? 0 : Number(e.target.value);
                  handleScoreChange(value);
                }}
                inputProps={{ 
                  min: 0,
                  max: 100,
                  step: 0.1
                }}
                sx={{ width: 120 }}
                error={form.score < 0 || form.score > 100}
                helperText={
                  form.score < 0 ? "Score cannot be negative" : 
                  form.score > 100 ? "Score cannot exceed 100" : 
                  ""
                }
              />
              <TextField 
                label="Grade" 
                value={form.grade} 
                InputProps={{
                  readOnly: true,
                }}
                sx={{ width: 100 }}
              />
            </Stack>

            {form.studentId && form.subject && form.exam && isDuplicateResult(form.studentId, form.subject, form.exam, form._id) && (
              <Typography color="error" variant="body2">
                ⚠️ This student already has a result for {form.subject} - {form.exam}
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpen(false)} sx={{ borderRadius: 2 }}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={save} 
              disabled={!form.studentId || !form.subject || !form.exam || form.score < 0 || form.score > 100 || isDuplicateResult(form.studentId, form.subject, form.exam, form._id)}            sx={{ borderRadius: 2 }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snack} autoHideDuration={2500} onClose={() => setSnack("")} message={snack} />
    </Box>
  );
};




// ---------- Notices (compose + list; teacher-scoped) - IT23569454 - De Silva K.S.D ----------
function NoticesSection({ teacherName }) {
  const [rows, setRows] = React.useState([]);
  const [snack, setSnack] = React.useState("");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [form, setForm] = React.useState({ title: "", message: "", audience: "STUDENT", class: "" });
  const [classes, setClasses] = React.useState([]);

  const loadClasses = async () => {
    try {
      const ttRes = await api.get(`/timetable`, { params: { search: teacherName } });
      const mine = (ttRes.data || []).filter(x => (x.teacher || "").toLowerCase() === (teacherName || "").toLowerCase());
      setClasses(uniq(mine.map(m => m.class)));
    } catch (e) {
      // ignore
    }
  };

  const fetchNotices = async () => {
    try {
      const res = await api.get(`/notices`, { params: { search: searchTerm } });
      // Prioritize teacher's own posts or student/parent-visible ones
      const data = (res.data || []).filter(n =>
        (!n.audience || ["ALL","STUDENT","PARENT"].includes(n.audience)) ||
        (n.postedBy && n.postedBy.toLowerCase() === (teacherName || "").toLowerCase())
      );
      setRows(data);
    } catch (e) {
      console.error(e);
      setSnack("Failed to load notices");
    }
  };

  const post = async () => {
    try {
      if (!form.title || !form.message) return;
      await api.post(`/notices`, {
        ...form,
        postedBy: teacherName || "Teacher",
        date: new Date().toISOString().slice(0, 10),
      });
      setForm({ title: "", message: "", audience: "STUDENT", class: "" });
      setSnack("Notice posted");
      fetchNotices();
    } catch (e) {
      console.error(e);
      setSnack("Error posting notice");
    }
  };

  React.useEffect(() => { if (teacherName) loadClasses(); }, [teacherName]);
  React.useEffect(() => { fetchNotices(); }, [searchTerm]);

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={3}>Notices</Typography>

      <ModernCard sx={{ mb: 3 }}>
        <CardHeader 
          title={
            <Stack direction="row" alignItems="center" spacing={1}>
              <CampaignIcon color="primary" />
              <Typography variant="h6" fontWeight={600}>Compose Notice</Typography>
            </Stack>
          }
        />
        <CardContent>
          <Stack spacing={3}>
            <TextField 
              label="Title" 
              value={form.title} 
              onChange={e => setForm({ ...form, title: e.target.value })} 
              fullWidth
            />
            <TextField 
              label="Message" 
              multiline 
              minRows={4} 
              value={form.message} 
              onChange={e => setForm({ ...form, message: e.target.value })} 
              fullWidth
            />
            <Stack direction="row" spacing={2} alignItems="center">
              <FormControl sx={{ minWidth: 160 }}>
                <InputLabel>Audience</InputLabel>
                <Select label="Audience" value={form.audience} onChange={e => setForm({ ...form, audience: e.target.value })}>
                  <MenuItem value="STUDENT">Students</MenuItem>
                  <MenuItem value="PARENT">Parents</MenuItem>
                  <MenuItem value="ALL">All</MenuItem>
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 140 }}>
                <InputLabel>Class (optional)</InputLabel>
                <Select label="Class (optional)" value={form.class} onChange={e => setForm({ ...form, class: e.target.value })}>
                  <MenuItem value="">All</MenuItem>
                  {classes.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </Select>
              </FormControl>
              <Box flex={1} />
              <Button 
                variant="contained" 
                startIcon={<SendIcon />} 
                onClick={post} 
                sx={{ borderRadius: 2, px: 3 }}
                disabled={!form.title || !form.message}
              >
                Post Notice
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </ModernCard>

      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" color="text.secondary" fontWeight={600}>Recent Notices</Typography>
        <TextField
          size="small"
          placeholder="Search notices…"
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ minWidth: 250 }}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />,
          }}
        />
      </Stack>
      
      <ModernCard>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Message</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Audience</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>By</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(r => (
              <TableRow key={r._id || r.id} sx={{ "&:hover": { bgcolor: alpha("#1976d2", 0.02) } }}>
                <TableCell>
                  <Typography fontWeight={500}>{r.title}</Typography>
                </TableCell>
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
                <TableCell>
                  <Chip 
                    label={r.audience || "ALL"} 
                    size="small" 
                    color={r.audience === "STUDENT" ? "primary" : r.audience === "PARENT" ? "secondary" : "default"}
                  />
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






// ---------- Parents Directory (read-only) - IT23168190 - R A WEERASOORIYA ----------
function ParentsSection() {
  const [rows, setRows] = React.useState([]);
  const [snack, setSnack] = React.useState("");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [students, setStudents] = React.useState([]); // Store all students

  // Helper function to format contact information
  const formatContactInfo = (parent) => {
    // Priority order based on User model: mobile -> email
    const contactFields = [
      { value: parent.mobile, label: 'Mobile' },
      { value: parent.phone, label: 'Phone' }, // Fallback for legacy data
      { value: parent.contact, label: 'Contact' }, // Fallback for legacy data
      { value: parent.email, label: 'Email' }
    ];

    // Find the first available contact method
    const availableContact = contactFields.find(field => field.value && field.value.trim() !== '');
    
    if (availableContact) {
      // If it's an email and there's already mobile/phone, just return the number
      if (availableContact.label === 'Email' && !parent.mobile && !parent.phone && !parent.contact) {
        return availableContact.value;
      }
      // For phone/mobile numbers, show them prominently
      if (availableContact.label === 'Mobile' || availableContact.label === 'Phone') {
        return availableContact.value;
      }
      // For other contact types, show with label
      return `${availableContact.value}`;
    }

    return 'No contact info';
  };

  // Fetch all students
  const fetchAllStudents = async () => {
    try {
      const res = await api.get(`/users`, { 
        params: { role: 'Student' } 
      });
      return res.data || [];
    } catch (error) {
      console.error("Error fetching students:", error);
      return [];
    }
  };

  // Fetch all parents and their children
  const fetchParents = async () => {
    try {
      console.log("Fetching parents with search:", searchTerm);
      
      // Fetch parents and students in parallel
      const [parentsRes, studentsRes] = await Promise.all([
        api.get(`/users`, { 
          params: { role: 'Parent', search: searchTerm } 
        }),
        fetchAllStudents()
      ]);

      console.log("Parents response:", parentsRes.data);
      const parents = (parentsRes.data || []).filter(user => user.role === 'Parent');
      setRows(parents);
      setStudents(studentsRes);
    } catch (e) {
      console.error("Parents fetch error:", e);
      setSnack("Failed to load parents: " + (e.response?.data?.msg || e.message));
    }
  };

  React.useEffect(() => { fetchParents(); }, [searchTerm]);

  // Get children for a specific parent
  const getChildrenForParent = (parentId) => {
    return students.filter(student => student.parent === parentId || student.parent?._id === parentId);
  };

  // Format children display for a parent
  const formatChildrenDisplay = (parentId) => {
    const children = getChildrenForParent(parentId);
    
    if (children.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary" fontStyle="italic">
          No children assigned
        </Typography>
      );
    }

    return (
      <Stack spacing={0.5}>
        {children.map(child => (
          <Chip 
            key={child._id}
            label={`${child.name} (${child.grade || 'No grade'}${child.section ? child.section : ''})`}
            size="small"
            variant="outlined"
            color="primary"
          />
        ))}
      </Stack>
    );
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>Parents Directory</Typography>
        <TextField
          size="small"
          placeholder="Search parents…"
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ minWidth: 250 }}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />,
          }}
        />
      </Stack>
      
      <ModernCard>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Parent Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Children/Students</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Contact Information</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(parent => (
              <TableRow key={parent._id || parent.id} sx={{ "&:hover": { bgcolor: alpha("#1976d2", 0.02) } }}>
                <TableCell>
                  <Chip label={(parent._id || parent.id)?.slice(-6) || 'N/A'} size="small" />
                </TableCell>
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ width: 32, height: 32 }}>{parent.name?.charAt(0)}</Avatar>
                    <Typography fontWeight={500}>{parent.name}</Typography>
                  </Stack>
                </TableCell>
                <TableCell>{parent.email}</TableCell>
                <TableCell>
                  {formatChildrenDisplay(parent._id)}
                </TableCell>
                <TableCell>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: formatContactInfo(parent) === 'No contact info' ? 'text.secondary' : 'text.primary',
                      fontStyle: formatContactInfo(parent) === 'No contact info' ? 'italic' : 'normal'
                    }}
                  >
                    {formatContactInfo(parent)}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
            {!rows.length && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3, color: "text.secondary" }}>
                  {searchTerm ? "No parents found matching your search." : "No parents found."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ModernCard>
      <Snackbar open={!!snack} autoHideDuration={2500} onClose={() => setSnack("")} message={snack} />
    </Box>
  );
};





// ---------- Navigation Items - IT23569454 - De Silva K.S.D ----------
const NAV_ITEMS = [
  { key: "Overview", label: "Overview", icon: <DashboardIcon /> },
  { key: "Timetable", label: "My Timetable", icon: <CalendarMonthIcon /> },
  { key: "Students", label: "My Students", icon: <PeopleIcon /> },
  { key: "Results", label: "Results", icon: <AssignmentTurnedInIcon /> },
  { key: "Notices", label: "Notices", icon: <CampaignIcon /> },
  { key: "Parents", label: "Parents", icon: <PeopleIcon /> },
];

// ---------- Root Teacher Dashboard - IT23569454 - De Silva K.S.D ----------
export default function TeacherDashboard() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [section, setSection] = React.useState("Overview");
  const [currentUserProfile, setCurrentUserProfile] = React.useState(null);
  const [profileModalOpen, setProfileModalOpen] = React.useState(false);
  const [teacherName, setTeacherName] = React.useState("");
  const [teacherSubject, setTeacherSubject] = React.useState("");

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const decoded = jwtDecode(token);
      const profileRes = await api.get(`/users/profile`);
      setCurrentUserProfile(profileRes.data);
      const name = profileRes?.data?.name || decoded?.user?.name || "Teacher";
      const subject = profileRes?.data?.subject || "N/A";
      setTeacherName(name);
      setTeacherSubject(subject);
      console.log("Teacher profile loaded:", { name, subject });
    } catch (e) {
      console.error("Error fetching teacher profile:", e);
    }
  };

  React.useEffect(() => { fetchProfile(); }, []);

  const handleSignOut = () => {
    localStorage.clear();
    navigate("/");
  };

  const SectionView = React.useMemo(() => {
    switch (section) {
      case "Overview": return <OverviewSection teacherName={teacherName} teacherSubject={teacherSubject} />;
      case "Timetable": return <TimetableSection teacherName={teacherName} />;
      case "Students": return <StudentsSection teacherName={teacherName} />;
      case "Results": return <ResultsSection teacherName={teacherName} />;
      case "Notices": return <NoticesSection teacherName={teacherName} />;
      case "Parents": return <ParentsSection />;
      default: return <OverviewSection teacherName={teacherName} teacherSubject={teacherSubject} />;
    }
  }, [section, teacherName, teacherSubject]);

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
                Teacher Portal
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {teacherSubject || 'Education Platform'}
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
                {currentUserProfile?.name?.[0] || "T"}
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