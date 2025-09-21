import React, { useState } from "react";
import {
  Container, Paper, Typography, Grid, TextField, MenuItem, Button, Stack, Divider,
  Accordion, AccordionSummary, AccordionDetails, Dialog, DialogTitle, DialogContent,
  DialogActions, Chip, Alert, IconButton, Box, Tooltip, InputAdornment, CircularProgress,
  Stepper, Step, StepLabel, FormControlLabel, Checkbox
} from "@mui/material";
import {
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  CalendarMonth as CalendarIcon,
  ExpandMore as ExpandMoreIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Close as CloseIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Edit as EditIcon,
  Home as HomeIcon,
  Public as PublicIcon,
  Badge as BadgeIcon,
  FavoriteBorder as BloodIcon,
  LocalHospital as HospitalIcon,
  DirectionsBus as BusIcon,
  People as PeopleIcon,
  Translate as TranslateIcon
} from "@mui/icons-material";
import jsPDF from "jspdf";

const grades = ["Grade 1", "Grade 7", "Grade 10", "A-Levels"];

const keyDates = [
  { label: "Applications Open", date: "Aug 30, 2025" },
  { label: "Entrance Assessment (Primary)", date: "Sep 20, 2025" },
  { label: "Entrance Assessment (Secondary)", date: "Sep 27, 2025" },
  { label: "Decisions Released", date: "Oct 10, 2025" },
];

// ---------- Validation ----------
const phoneOk = (v) => /^\+?\d[\d\s\-()]{7,}$/.test(v || "");

function validateGuardian(g) {
  const e = {};
  if (!g.guardianName?.trim()) e.guardianName = "Please enter guardian name.";
  if (!g.guardianEmail?.trim()) e.guardianEmail = "Email is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(g.guardianEmail)) e.guardianEmail = "Enter a valid email.";
  if (g.guardianPhone && !phoneOk(g.guardianPhone)) e.guardianPhone = "Enter a valid phone number.";
  if (!g.relationship?.trim()) e.relationship = "Relationship is required.";
  if (!g.address?.trim()) e.address = "Address is required.";
  return e;
}

function validateStudent(s) {
  const e = {};
  if (!s.studentName?.trim()) e.studentName = "Please enter student name.";
  if (!s.dob) e.dob = "Date of birth is required.";
  if (!s.gender) e.gender = "Please select gender.";
  if (!s.grade) e.grade = "Select a grade.";

  // New requireds for safety/contact
  if (!s.studentAddress?.trim()) e.studentAddress = "Student address is required.";
  if (!s.nationality?.trim()) e.nationality = "Nationality is required.";
  if (s.emergencyPhone && !phoneOk(s.emergencyPhone)) e.emergencyPhone = "Enter a valid phone number.";
  if (!s.emergencyName?.trim()) e.emergencyName = "Emergency contact name is required.";
  if (!s.emergencyRelation?.trim()) e.emergencyRelation = "Emergency contact relationship is required.";

  // Optional fields (no hard validation): idType, idNumber, bloodGroup, allergies, medications,
  // specialNeeds, previousSchool, interests, languages, pickupLocation, transportNeeded
  return e;
}

const AdmissionForm = () => {
  // ---------- State ----------
  const [step, setStep] = useState(0);
  const [openDates, setOpenDates] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    // Guardian
    guardianName: "",
    guardianEmail: "",
    guardianPhone: "",
    relationship: "",
    address: "",
    // Student (expanded)
    studentName: "",
    dob: "",
    gender: "",
    grade: grades[1],
    studentAddress: "",
    nationality: "",
    idType: "Birth Certificate",
    idNumber: "",
    previousSchool: "",
    interests: "",
    languages: "",
    bloodGroup: "",
    allergies: "",
    medications: "",
    specialNeeds: "",
    transportNeeded: false,
    pickupLocation: "",
    emergencyName: "",
    emergencyPhone: "",
    emergencyRelation: "",
  });
  const [errors, setErrors] = useState({});

  // ---------- Helpers ----------
  const setField = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  // ---------- PDF ----------
  const downloadPDF = () => {
    const doc = new jsPDF();
    let y = 20;
    const line = (t) => { doc.text(t, 15, y); y += 7; };

    doc.setFontSize(18);
    line("Student Admission Application");
    doc.setFontSize(12); y += 6;

    line("Guardian Information:");
    line(`Full Name: ${form.guardianName}`);
    line(`Email: ${form.guardianEmail}`);
    line(`Phone: ${form.guardianPhone || "—"}`);
    line(`Relationship: ${form.relationship}`);
    line(`Address: ${form.address}`);
    y += 4;

    line("Student Information:");
    line(`Full Name: ${form.studentName}`);
    line(`Date of Birth: ${form.dob}`);
    line(`Gender: ${form.gender}`);
    line(`Grade Applying: ${form.grade}`);
    line(`Address: ${form.studentAddress}`);
    line(`Nationality: ${form.nationality}`);
    line(`ID Type/No: ${form.idType}${form.idNumber ? " — " + form.idNumber : ""}`);
    line(`Previous School: ${form.previousSchool || "—"}`);
    line(`Languages: ${form.languages || "—"}`);
    line(`Interests: ${form.interests || "—"}`);
    line(`Blood Group: ${form.bloodGroup || "—"}`);
    line(`Allergies: ${form.allergies || "—"}`);
    line(`Medications: ${form.medications || "—"}`);
    line(`Special Needs: ${form.specialNeeds || "—"}`);
    line(`Transport Needed: ${form.transportNeeded ? "Yes" : "No"}`);
    line(`Pickup Location: ${form.pickupLocation || "—"}`);
    y += 4;

    line("Emergency Contact:");
    line(`Name: ${form.emergencyName}`);
    line(`Relation: ${form.emergencyRelation}`);
    line(`Phone: ${form.emergencyPhone || "—"}`);

    doc.save("AdmissionForm.pdf");
  };

  // ---------- Nav ----------
  const next = () => {
    const e = step === 0 ? validateGuardian(form) : validateStudent(form);
    if (Object.keys(e).length) {
      setErrors(e);
      const first = Object.keys(e)[0];
      const el = document.querySelector(`[name="${first}"]`);
      el?.focus({ preventScroll: true });
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setStep((s) => s + 1);
  };

  const back = () => setStep((s) => Math.max(0, s - 1));

  // ---------- Submit ----------
  const handleSubmit = async () => {
    const eAll = { ...validateGuardian(form), ...validateStudent(form) };
    if (Object.keys(eAll).length) {
      setErrors(eAll);
      setStep(0);
      return;
    }
    try {
      setSubmitting(true);
      const payload = {
        // Keep guardian fields aligned to your earlier backend
        name: form.guardianName,
        email: form.guardianEmail,
        phone: form.guardianPhone,
        grade: form.grade,
        // Send a consolidated message with all the new student details
        message:
`Student: ${form.studentName}
DOB: ${form.dob}
Gender: ${form.gender}
Grade: ${form.grade}
Student Address: ${form.studentAddress}
Nationality: ${form.nationality}
ID: ${form.idType}${form.idNumber ? " — " + form.idNumber : ""}
Previous School: ${form.previousSchool || "—"}
Languages: ${form.languages || "—"}
Interests: ${form.interests || "—"}
Blood Group: ${form.bloodGroup || "—"}
Allergies: ${form.allergies || "—"}
Medications: ${form.medications || "—"}
Special Needs: ${form.specialNeeds || "—"}
Transport Needed: ${form.transportNeeded ? "Yes" : "No"}
Pickup Location: ${form.pickupLocation || "—"}

Emergency Contact:
Name: ${form.emergencyName}
Relation: ${form.emergencyRelation}
Phone: ${form.emergencyPhone || "—"}

Guardian Relationship: ${form.relationship}
Guardian Address: ${form.address}`
      };

      const res = await fetch("/api/admissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        setErrors({ form: data.error || "Submission failed. Please try again." });
      }
    } catch (err) {
      setErrors({ form: "Something went wrong. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- Success Screen ----------
  if (submitted) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: { xs: 3, md: 5 }, textAlign: "center" }}>
          <CheckCircleIcon color="success" sx={{ fontSize: 56, mb: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Application Submitted
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Thank you! We’ve received your details and will contact you shortly.
          </Typography>

          <Divider sx={{ my: 4 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Summary</Typography>
          <Grid container spacing={2} sx={{ textAlign: "left" }}>
            <Grid item xs={12}><strong>Guardian:</strong> {form.guardianName}</Grid>
            <Grid item xs={12} sm={6}><strong>Email:</strong> {form.guardianEmail}</Grid>
            <Grid item xs={12} sm={6}><strong>Phone:</strong> {form.guardianPhone || "—"}</Grid>
            <Grid item xs={12}><strong>Relationship:</strong> {form.relationship}</Grid>
            <Grid item xs={12}><strong>Address:</strong> {form.address}</Grid>

            <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>

            <Grid item xs={12}><strong>Student:</strong> {form.studentName}</Grid>
            <Grid item xs={12} sm={6}><strong>Date of Birth:</strong> {form.dob}</Grid>
            <Grid item xs={12} sm={6}><strong>Gender:</strong> {form.gender}</Grid>
            <Grid item xs={12} sm={6}><strong>Grade Applying:</strong> {form.grade}</Grid>
            <Grid item xs={12} sm={6}><strong>Nationality:</strong> {form.nationality || "—"}</Grid>
            <Grid item xs={12}><strong>Address:</strong> {form.studentAddress || "—"}</Grid>
            <Grid item xs={12} sm={6}><strong>ID Type:</strong> {form.idType || "—"}</Grid>
            <Grid item xs={12} sm={6}><strong>ID Number:</strong> {form.idNumber || "—"}</Grid>
            <Grid item xs={12} sm={6}><strong>Previous School:</strong> {form.previousSchool || "—"}</Grid>
            <Grid item xs={12} sm={6}><strong>Languages:</strong> {form.languages || "—"}</Grid>
            <Grid item xs={12}><strong>Interests:</strong> {form.interests || "—"}</Grid>
            <Grid item xs={12} sm={4}><strong>Blood Group:</strong> {form.bloodGroup || "—"}</Grid>
            <Grid item xs={12} sm={4}><strong>Allergies:</strong> {form.allergies || "—"}</Grid>
            <Grid item xs={12} sm={4}><strong>Medications:</strong> {form.medications || "—"}</Grid>
            <Grid item xs={12}><strong>Special Needs:</strong> {form.specialNeeds || "—"}</Grid>
            <Grid item xs={12} sm={6}><strong>Transport Needed:</strong> {form.transportNeeded ? "Yes" : "No"}</Grid>
            <Grid item xs={12} sm={6}><strong>Pickup Location:</strong> {form.pickupLocation || "—"}</Grid>

            <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>

            <Grid item xs={12}><strong>Emergency Contact:</strong> {form.emergencyName}</Grid>
            <Grid item xs={12} sm={6}><strong>Relation:</strong> {form.emergencyRelation}</Grid>
            <Grid item xs={12} sm={6}><strong>Phone:</strong> {form.emergencyPhone || "—"}</Grid>
          </Grid>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center" sx={{ mt: 4 }}>
            <Button variant="contained" onClick={() => { setSubmitted(false); setStep(0); }}>
              Submit Another
            </Button>
            <Button variant="outlined" href="/">Back to Home</Button>
            <Button variant="contained" color="secondary" onClick={downloadPDF} sx={{ ml: { xs: 0, sm: 2 } }}>
              Download PDF
            </Button>
          </Stack>
        </Paper>
      </Container>
    );
  }

  // ---------- Header / Hero ----------
  const Hero = (
    <Box
      sx={{
        background: "linear-gradient(135deg, #1A4B8C 0%, #0D2A56 100%)",
        color: "white",
        py: { xs: 5, md: 7 },
        mb: 3
      }}
    >
      <Container maxWidth="md">
        <Stack direction="row" alignItems="center" spacing={2}>
          <SchoolIcon sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
              Student Admission Application
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Step {step + 1} of 3
            </Typography>
          </Box>
        </Stack>
      </Container>
    </Box>
  );

  // ---------- Step Header ----------
  const StepHeader = (
    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Chip label="Admissions" color="primary" variant="outlined" />
        <Tooltip title="Your details are kept confidential.">
          <InfoIcon sx={{ color: "text.secondary" }} />
        </Tooltip>
      </Stack>
      <Button size="small" variant="text" startIcon={<CalendarIcon />} onClick={() => setOpenDates(true)}>
        View Key Dates
      </Button>
    </Stack>
  );

  // ---------- Steps ----------
  const GuardianStep = (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth label="Guardian Full Name" name="guardianName" required
          value={form.guardianName} onChange={(e)=>setField("guardianName", e.target.value)}
          error={!!errors.guardianName} helperText={errors.guardianName}
          InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon/></InputAdornment> }}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth label="Email" name="guardianEmail" type="email" required
          value={form.guardianEmail} onChange={(e)=>setField("guardianEmail", e.target.value)}
          error={!!errors.guardianEmail} helperText={errors.guardianEmail || "We'll send confirmation here."}
          InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon/></InputAdornment> }}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth label="Phone" name="guardianPhone" placeholder="+94 77 123 4567"
          value={form.guardianPhone} onChange={(e)=>setField("guardianPhone", e.target.value)}
          error={!!errors.guardianPhone} helperText={errors.guardianPhone || "Optional, but helps us reach you faster."}
          InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon/></InputAdornment> }}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth label="Relationship to Student" name="relationship" required
          value={form.relationship} onChange={(e)=>setField("relationship", e.target.value)}
          error={!!errors.relationship} helperText={errors.relationship}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth label="Home Address" name="address" required
          value={form.address} onChange={(e)=>setField("address", e.target.value)}
          error={!!errors.address} helperText={errors.address}
          multiline minRows={2}
        />
      </Grid>
    </Grid>
  );

  const StudentStep = (
    <Stack spacing={3}>
      <Typography variant="h6" sx={{ fontWeight: 700 }}>Basic Information</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <TextField
            fullWidth label="Student Full Name" name="studentName" required
            value={form.studentName} onChange={(e)=>setField("studentName", e.target.value)}
            error={!!errors.studentName} helperText={errors.studentName}
          />
        </Grid>
        <Grid item xs={12} md={5}>
          <TextField
            fullWidth label="Date of Birth" name="dob" type="date" required
            value={form.dob} onChange={(e)=>setField("dob", e.target.value)}
            error={!!errors.dob} helperText={errors.dob}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            select fullWidth label="Gender" name="gender" required
            value={form.gender} onChange={(e)=>setField("gender", e.target.value)}
            error={!!errors.gender} helperText={errors.gender}
          >
            {["Male","Female","Prefer not to say","Other"].map((g)=>(<MenuItem key={g} value={g}>{g}</MenuItem>))}
          </TextField>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            select fullWidth label="Grade Applying" name="grade" required
            value={form.grade} onChange={(e)=>setField("grade", e.target.value)}
            error={!!errors.grade} helperText={errors.grade}
          >
            {grades.map((g)=>(<MenuItem key={g} value={g}>{g}</MenuItem>))}
          </TextField>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth label="Student Address" name="studentAddress" required
            value={form.studentAddress} onChange={(e)=>setField("studentAddress", e.target.value)}
            error={!!errors.studentAddress} helperText={errors.studentAddress}
            multiline minRows={2}
            InputProps={{ startAdornment: <InputAdornment position="start"><HomeIcon/></InputAdornment> }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth label="Nationality" name="nationality" required
            value={form.nationality} onChange={(e)=>setField("nationality", e.target.value)}
            error={!!errors.nationality} helperText={errors.nationality}
            InputProps={{ startAdornment: <InputAdornment position="start"><PublicIcon/></InputAdornment> }}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField
            select fullWidth label="ID Type" name="idType"
            value={form.idType} onChange={(e)=>setField("idType", e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><BadgeIcon/></InputAdornment> }}
          >
            {["Birth Certificate","National ID","Passport","Other"].map((o)=>(<MenuItem key={o} value={o}>{o}</MenuItem>))}
          </TextField>
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth label="ID Number (optional)" name="idNumber"
            value={form.idNumber} onChange={(e)=>setField("idNumber", e.target.value)}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth label="Previous School (if any)" name="previousSchool"
            value={form.previousSchool} onChange={(e)=>setField("previousSchool", e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth label="Languages Spoken (comma separated)" name="languages"
            value={form.languages} onChange={(e)=>setField("languages", e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><TranslateIcon/></InputAdornment> }}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth label="Areas of Interest (e.g., Robotics, Music)" name="interests"
            value={form.interests} onChange={(e)=>setField("interests", e.target.value)}
          />
        </Grid>
      </Grid>

      <Divider />

      <Typography variant="h6" sx={{ fontWeight: 700 }}>Health & Support</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth label="Blood Group (optional)" name="bloodGroup"
            value={form.bloodGroup} onChange={(e)=>setField("bloodGroup", e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><BloodIcon/></InputAdornment> }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth label="Allergies (if any)" name="allergies"
            value={form.allergies} onChange={(e)=>setField("allergies", e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><HospitalIcon/></InputAdornment> }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth label="Medications (if any)" name="medications"
            value={form.medications} onChange={(e)=>setField("medications", e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth label="Special Needs / Support" name="specialNeeds"
            value={form.specialNeeds} onChange={(e)=>setField("specialNeeds", e.target.value)}
            multiline minRows={3}
          />
        </Grid>
      </Grid>

      <Divider />

      <Typography variant="h6" sx={{ fontWeight: 700 }}>Transport & Emergency</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <FormControlLabel
            control={<Checkbox checked={form.transportNeeded} onChange={(e)=>setField("transportNeeded", e.target.checked)} />}
            label={<Stack direction="row" spacing={1} alignItems="center"><BusIcon fontSize="small" /> <span>Request school transport</span></Stack>}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth label="Pickup Location (if transport requested)" name="pickupLocation"
            value={form.pickupLocation} onChange={(e)=>setField("pickupLocation", e.target.value)}
            disabled={!form.transportNeeded}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth label="Emergency Contact Name" name="emergencyName" required
            value={form.emergencyName} onChange={(e)=>setField("emergencyName", e.target.value)}
            error={!!errors.emergencyName} helperText={errors.emergencyName}
            InputProps={{ startAdornment: <InputAdornment position="start"><PeopleIcon/></InputAdornment> }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth label="Relationship" name="emergencyRelation" required
            value={form.emergencyRelation} onChange={(e)=>setField("emergencyRelation", e.target.value)}
            error={!!errors.emergencyRelation} helperText={errors.emergencyRelation}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth label="Emergency Phone" name="emergencyPhone" required
            value={form.emergencyPhone} onChange={(e)=>setField("emergencyPhone", e.target.value)}
            error={!!errors.emergencyPhone} helperText={errors.emergencyPhone}
          />
        </Grid>
      </Grid>
    </Stack>
  );

  const ReviewRow = ({ label, value, onEdit }) => (
    <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={1}>
      <Typography sx={{ fontWeight: 600 }}>{label}</Typography>
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography color="text.secondary" sx={{ textAlign: "right" }}>{value || "—"}</Typography>
        {onEdit && <IconButton size="small" onClick={onEdit}><EditIcon fontSize="small" /></IconButton>}
      </Stack>
    </Stack>
  );

  const ReviewStep = (
    <Stack spacing={3}>
      <Typography variant="h6" sx={{ fontWeight: 700 }}>Guardian</Typography>
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Stack spacing={2}>
          <ReviewRow label="Full Name" value={form.guardianName} onEdit={()=>setStep(0)} />
          <ReviewRow label="Email" value={form.guardianEmail} onEdit={()=>setStep(0)} />
          <ReviewRow label="Phone" value={form.guardianPhone} onEdit={()=>setStep(0)} />
          <ReviewRow label="Relationship" value={form.relationship} onEdit={()=>setStep(0)} />
          <ReviewRow label="Address" value={form.address} onEdit={()=>setStep(0)} />
        </Stack>
      </Paper>

      <Typography variant="h6" sx={{ fontWeight: 700 }}>Student</Typography>
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Stack spacing={2}>
          <ReviewRow label="Full Name" value={form.studentName} onEdit={()=>setStep(1)} />
          <ReviewRow label="Date of Birth" value={form.dob} onEdit={()=>setStep(1)} />
          <ReviewRow label="Gender" value={form.gender} onEdit={()=>setStep(1)} />
          <ReviewRow label="Grade Applying" value={form.grade} onEdit={()=>setStep(1)} />
          <ReviewRow label="Student Address" value={form.studentAddress} onEdit={()=>setStep(1)} />
          <ReviewRow label="Nationality" value={form.nationality} onEdit={()=>setStep(1)} />
          <ReviewRow label="ID Type" value={form.idType} onEdit={()=>setStep(1)} />
          <ReviewRow label="ID Number" value={form.idNumber} onEdit={()=>setStep(1)} />
          <ReviewRow label="Previous School" value={form.previousSchool} onEdit={()=>setStep(1)} />
          <ReviewRow label="Languages" value={form.languages} onEdit={()=>setStep(1)} />
          <ReviewRow label="Interests" value={form.interests} onEdit={()=>setStep(1)} />
          <ReviewRow label="Blood Group" value={form.bloodGroup} onEdit={()=>setStep(1)} />
          <ReviewRow label="Allergies" value={form.allergies} onEdit={()=>setStep(1)} />
          <ReviewRow label="Medications" value={form.medications} onEdit={()=>setStep(1)} />
          <ReviewRow label="Special Needs" value={form.specialNeeds} onEdit={()=>setStep(1)} />
          <ReviewRow label="Transport Needed" value={form.transportNeeded ? "Yes" : "No"} onEdit={()=>setStep(1)} />
          <ReviewRow label="Pickup Location" value={form.pickupLocation} onEdit={()=>setStep(1)} />
        </Stack>
      </Paper>

      <Typography variant="h6" sx={{ fontWeight: 700 }}>Emergency Contact</Typography>
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Stack spacing={2}>
          <ReviewRow label="Name" value={form.emergencyName} onEdit={()=>setStep(1)} />
          <ReviewRow label="Relation" value={form.emergencyRelation} onEdit={()=>setStep(1)} />
          <ReviewRow label="Phone" value={form.emergencyPhone} onEdit={()=>setStep(1)} />
        </Stack>
      </Paper>
    </Stack>
  );

  // ---------- Render ----------
  return (
    <>
      {Hero}

      <Container maxWidth="md" sx={{ pb: 8 }}>
        <Paper elevation={3} sx={{ p: { xs: 3, md: 5 } }}>
          {StepHeader}
          <Divider sx={{ mb: 3 }} />

          {errors.form && <Alert severity="error" sx={{ mb: 3 }}>{errors.form}</Alert>}

          <Stepper activeStep={step} alternativeLabel sx={{ mb: 4 }}>
            {["Guardian", "Student", "Review"].map((label) => (
              <Step key={label}><StepLabel>{label}</StepLabel></Step>
            ))}
          </Stepper>

          {step === 0 && <>{GuardianStep}</>}
          {step === 1 && <>{StudentStep}</>}
          {step === 2 && <>{ReviewStep}</>}

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 4 }}>
            {step > 0 && (
              <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={back}>
                Back
              </Button>
            )}
            {step < 2 && (
              <Button variant="contained" endIcon={<ArrowForwardIcon />} onClick={next}>
                Continue
              </Button>
            )}
            {step === 2 && (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={submitting}
                endIcon={!submitting && <ArrowForwardIcon />}
              >
                {submitting ? (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CircularProgress size={20} />
                    <span>Submitting…</span>
                  </Stack>
                ) : (
                  "Submit Application"
                )}
              </Button>
            )}
            <Button variant="text" startIcon={<CalendarIcon />} onClick={() => setOpenDates(true)}>
              View Key Dates
            </Button>
          </Stack>

          {/* FAQs */}
          <Box sx={{ mt: 4 }}>
            <Accordion elevation={2}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight={600}>What documents are required?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                Birth certificate, previous school reports, national ID/passport copy, and immunization record.
              </AccordionDetails>
            </Accordion>
            <Accordion elevation={2}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight={600}>Are scholarships available?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                Merit and need-based scholarships are offered each year for exceptional applicants.
              </AccordionDetails>
            </Accordion>
          </Box>
        </Paper>
      </Container>

      {/* Key Dates Dialog */}
      <Dialog open={openDates} onClose={() => setOpenDates(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Admissions — Key Dates
          <IconButton aria-label="close" onClick={() => setOpenDates(false)} sx={{ position: "absolute", right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            {keyDates.map((k) => (
              <Paper key={k.label} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <CalendarIcon color="primary" />
                  <Box>
                    <Typography sx={{ fontWeight: 600 }}>{k.label}</Typography>
                    <Typography variant="body2" color="text.secondary">{k.date}</Typography>
                  </Box>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDates(false)} variant="contained">Done</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AdmissionForm;
