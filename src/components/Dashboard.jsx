import React, { useMemo, useState } from "react";
import { Link, useNavigate  } from "react-router-dom";
import {
  AppBar, Toolbar, Typography, Button, Container, Box, Grid, Card, CardContent, CardMedia,
  IconButton, CssBaseline, Paper, Stack, Chip, Divider, Tabs, Tab, Stepper, Step, StepLabel,
  TextField, MenuItem, Accordion, AccordionSummary, AccordionDetails, Table, TableHead, TableRow,
  TableCell, TableBody, ImageList, ImageListItem, Badge, Tooltip, Avatar, Dialog, DialogContent,
  useMediaQuery, alpha
} from "@mui/material";
import { createTheme, ThemeProvider, responsiveFontSizes } from "@mui/material/styles";
import { keyframes } from "@mui/system";

import {
  Menu as MenuIcon,
  School as SchoolIcon,
  CalendarMonth as CalendarIcon,
  People as PeopleIcon,
  Star as StarIcon,
  Verified as VerifiedIcon,
  ArrowForward as ArrowForwardIcon,
  PlayCircle as PlayCircleIcon,
  Security as SecurityIcon,
  Payment as PaymentIcon,
  Assessment as AssessmentIcon,
  Chat as ChatIcon,
  LibraryBooks as LibraryBooksIcon,
  DirectionsBus as DirectionsBusIcon,
  Science as ScienceIcon,
  SportsSoccer as SportsSoccerIcon,
  ExpandMore as ExpandMoreIcon,
  Facebook, Twitter, Instagram, YouTube, Email, Phone, LocationOn, CheckCircle as CheckCircleIcon,
  Close as CloseIcon
} from "@mui/icons-material";

import LogoImg from "../assects/WhatsApp_Image_2025-08-23_at_17.56.40_22b59ce9-removebg-preview.png";

/* =====================
   THEME
===================== */
let baseTheme = createTheme({
  palette: {
    mode: "light",
    primary: { 
      main: "#1A4B8C",     // Deep blue
      light: "#4A76B9",
      dark: "#0D2A56"
    },
    secondary: { 
      main: "#FF6B35",     // Warm orange
      light: "#FF9D6B",
      dark: "#C14913"
    },
    background: { 
      default: "#F7F9FC", 
      paper: "#FFFFFF" 
    },
    text: {
      primary: "#2D3748",
      secondary: "#718096"
    }
  },
  typography: {
    fontFamily: "'Poppins', 'Inter', Roboto, sans-serif",
    h1: { fontWeight: 700, fontSize: "2.5rem" },
    h2: { fontWeight: 700, fontSize: "2rem" },
    h3: { fontWeight: 600, fontSize: "1.75rem" },
    h4: { fontWeight: 600, fontSize: "1.5rem" },
    h5: { fontWeight: 600, fontSize: "1.25rem" },
    h6: { fontWeight: 600, fontSize: "1.125rem" },
    button: { fontWeight: 600, textTransform: "none" },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: { 
        root: { 
          borderRadius: 8,
          padding: "10px 24px"
        },
      },
    },
    MuiPaper: { 
      styleOverrides: { 
        root: { 
          borderRadius: 16,
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)" 
        } 
      } 
    },
    MuiCard: { 
      styleOverrides: { 
        root: { 
          borderRadius: 16,
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)"
        } 
      } 
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#FFFFFF",
          color: "#2D3748",
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
        }
      }
    }
  },
});
baseTheme = responsiveFontSizes(baseTheme);

/* =====================
   DATA
===================== */
const sections = [
  { id: "home", label: "Home" },
  { id: "academics", label: "Academics" },
  { id: "programs", label: "Programs" },
  { id: "admissions", label: "Admissions" },
  { id: "life", label: "Student Life" },
  { id: "staff", label: "Faculty" },
  { id: "news", label: "News & Events" },
  { id: "contact", label: "Contact" },
];

const features = [
  { icon: <AssessmentIcon />, title: "Insights & Gradebook", desc: "View progress by class or student with exportable analytics." },
  { icon: <PaymentIcon />, title: "Smart Billing", desc: "Online payments, receipts, and automated reminders." },
  { icon: <ChatIcon />, title: "Community Messaging", desc: "Announcements, class channels, and family messaging." },
  { icon: <LibraryBooksIcon />, title: "Digital Library & LMS", desc: "Borrowing, reservations, e-resources, assignments and quizzes." },
  { icon: <DirectionsBusIcon />, title: "Transport Suite", desc: "Route planning, live location, and guardian alerts." },
  { icon: <SecurityIcon />, title: "Attendance & Safety", desc: "Touchless attendance, visitor logs, and access control." },
];

const programs = {
  Primary: [
    "Foundational Literacy & Numeracy",
    "Visual Arts & Music",
    "Outdoor Learning",
    "Physical Education",
  ],
  Secondary: [
    "STEM Labs (Physics, Chemistry, Biology)",
    "Humanities & Social Sciences",
    "Modern Languages",
    "Entrepreneurship & Design",
  ],
  "A-Levels": [
    "Maths, Further Maths, & Computer Science",
    "Biology, Chemistry & Physics",
    "Economics & Business",
    "English Literature",
  ],
};

const gallery = [
  "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1600&auto=format&fit=crop",
  "https://epe.brightspotcdn.com/dims4/default/693a6bb/2147483647/strip/true/crop/2949x2001+26+0/resize/840x570!/format/webp/quality/90/?url=https%3A%2F%2Fepe-brightspot.s3.us-east-1.amazonaws.com%2F4a%2F7d%2Fa0c5cd4e47c38228548a26d1782b%2Fprivate-school-elementary-students-042025-2175339358.jpg",
  "https://images.unsplash.com/photo-1588072432836-e10032774350?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=1600&auto=format&fit=crop",
  "https://www.leeds.lk/wp-content/uploads/2025/07/Home-page-under-founding-early-vision-replace-the-image-with-three-standing-kids-1024x683.jpg",
  "https://tkat-rainham.s3.amazonaws.com/uploads/home_header/2_21_s.jpg?t=1721903589",
  "https://www.unicef.org/srilanka/sites/unicef.org.srilanka/files/styles/hero_extended/public/HIS-2024-MH-1.jpg.webp?itok=-BRgYI4z",
  "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1600&auto=format&fit=crop",
];

const news = [
  {
    title: "EduLink Lanka Wins National Coding Challenge",
    img: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1600&auto=format&fit=crop",
    date: "July 29, 2025",
  },
  {
    title: "New Sustainable Science Wing Opens",
    img: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1600&auto=format&fit=crop",
    date: "June 12, 2025",
  },
  {
    title: "A-Level Cohort Achieves 98% Pass Rate",
    img: "https://images.unsplash.com/photo-1511988617509-a57c8a288659?q=80&w=1600&auto=format&fit=crop",
    date: "May 05, 2025",
  },
];

const events = [
  { when: "Aug 30, 2025", title: "Open House & Campus Tour", tag: "Admissions" },
  { when: "Sep 07, 2025", title: "Inter-School Sports Meet", tag: "Athletics" },
  { when: "Sep 18, 2025", title: "Career & University Fair", tag: "Guidance" },
  { when: "Oct 10, 2025", title: "Innovation Day: Robotics Expo", tag: "STEM" },
];

const testimonials = [
  { name: "Ravindu Senanayake", role: "Alumnus, Mechatronics", quote: "Teachers who challenge and care. The robotics lab made engineering feel real.", avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=800&auto=format&fit=crop" },
  { name: "Dilini Perera", role: "Parent of Grade 5", quote: "Transparent communication and inspiring teachers. My son can't wait to go to school.", avatar: "https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=800&auto=format&fit=crop" },
  { name: "Ashan Wickramasinghe", role: "Head of Mathematics", quote: "We pair data with creativity. Students learn to reason, build, and lead.", avatar: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=800&auto=format&fit=crop" },
];

/* =====================
   SMALL COMPONENTS
===================== */
const Logo = () => (
  <Stack direction="row" alignItems="center" spacing={1.5}>
    <img
      src={LogoImg}
      alt="EduLink Lanka Intl. logo"
      loading="lazy"
      style={{ height: 42, width: "auto" }}
    />
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
        EduLink Lanka Intl.
      </Typography>
      <Typography variant="caption" sx={{ color: "text.secondary", lineHeight: 1 }}>
        Excellence in Education
      </Typography>
    </Box>
  </Stack>
);

const Stat = ({ value, label, Icon }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2, 
      borderRadius: 3, 
      display: "flex", 
      alignItems: "center", 
      gap: 2,
      bgcolor: "rgba(255,255,255,0.15)", 
      border: "1px solid rgba(255,255,255,0.2)",
      backdropFilter: "blur(8px)"
    }}
  >
    <Avatar sx={{ bgcolor: "primary.main", width: 56, height: 56 }}>{Icon}</Avatar>
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.1 }}>{value}</Typography>
      <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.9)" }}>{label}</Typography>
    </Box>
  </Paper>
);

const FeatureCard = ({ icon, title, desc }) => (
  <Card elevation={0} sx={{ 
    height: "100%", 
    p: 3, 
    border: "1px solid", 
    borderColor: "divider",
    transition: "all 0.3s ease",
    "&:hover": {
      transform: "translateY(-4px)",
      boxShadow: "0 8px 30px rgba(0,0,0,0.1)"
    }
  }}>
    <Stack direction="row" spacing={2} alignItems="flex-start">
      <Box sx={{ 
        p: 1.5, 
        borderRadius: 2, 
        bgcolor: "primary.main", 
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        {icon}
      </Box>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>{title}</Typography>
        <Typography variant="body2" color="text.secondary">{desc}</Typography>
      </Box>
    </Stack>
  </Card>
);

const Section = ({ id, title, subtitle, children, padTop = 8, padBottom = 8, bgColor }) => (
  <Box 
    id={id} 
    component="section" 
    sx={{ 
      py: { xs: padTop * 0.7, md: padTop }, 
      scrollMarginTop: 90,
      backgroundColor: bgColor || "transparent"
    }}
  >
    <Container maxWidth="lg">
      {title && (
        <Box sx={{ textAlign: "center", mb: 6 }}>
          {subtitle && (
            <Chip 
              label={subtitle} 
              color="primary" 
              variant="outlined"
              sx={{ mb: 2, fontWeight: 600 }}
            />
          )}
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
            {title}
          </Typography>
          <Divider sx={{ width: 80, height: 4, backgroundColor: "primary.main", mx: "auto" }} />
        </Box>
      )}
      {children}
    </Container>
  </Box>
);

/* =====================
   HERO EFFECTS
===================== */
const float = keyframes`
  0% { transform: translateY(0px) translateX(0px); opacity:.8; }
  50% { transform: translateY(-12px) translateX(6px); opacity:1; }
  100% { transform: translateY(0px) translateX(0px); opacity:.8; }
`;
const glowPulse = keyframes`
  0%,100% { box-shadow: 0 0 0px 0 rgba(26,75,140,.5); }
  50% { box-shadow: 0 0 30px 10px rgba(26,75,140,.35); }
`;
const shine = keyframes`
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
`;

function VideoDialog({ open, onClose }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { bgcolor: "black" } }}>
      <IconButton onClick={onClose} sx={{ position: "absolute", top: 8, right: 8, zIndex: 1, color: "white" }}>
        <CloseIcon />
      </IconButton>
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ position: "relative", pt: "56.25%" }}>
          {open && (
            <iframe
              title="Campus Tour"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
            />
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}

/* =====================
   MAIN PAGE
===================== */
const Dashboard = () => {
  const [tab, setTab] = useState("Primary");
  const theme = useMemo(() => baseTheme, []);
  const [videoOpen, setVideoOpen] = useState(false);
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const year = new Date().getFullYear();

 const navigate = useNavigate(); // ✅


  const handleApplyScroll = () => {
    navigate("/admission"); // ✅ go to the route we defined
  };

  // Map footer "Explore" anchors to existing IDs
  const exploreLinks = [
    { label: "Academics", to: "#academics" },
    { label: "Programs", to: "#programs" },
    { label: "Admissions", to: "#admissions" },
    { label: "Student Life", to: "#life" },
    { label: "News", to: "#news" },
    { label: "Contact", to: "#contact" },
  ];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {/* Top Contact Strip */}
      <Box sx={{ bgcolor: "primary.main", color: "white", py: 1 }}>
        <Container maxWidth="lg">
          <Stack direction={{ xs: "column", sm: "row" }} alignItems="center" justifyContent="space-between" spacing={1}>
            <Stack direction="row" spacing={3}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Email fontSize="small" />
                <Typography variant="body2">info@edulinklanka.edu</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Phone fontSize="small" />
                <Typography variant="body2">+94 81 555 0123</Typography>
              </Stack>
            </Stack>
            <Stack direction="row" spacing={1}>
              <IconButton size="small" color="inherit" aria-label="Facebook">
                <Facebook fontSize="small" />
              </IconButton>
              <IconButton size="small" color="inherit" aria-label="Twitter">
                <Twitter fontSize="small" />
              </IconButton>
              <IconButton size="small" color="inherit" aria-label="Instagram">
                <Instagram fontSize="small" />
              </IconButton>
              <IconButton size="small" color="inherit" aria-label="YouTube">
                <YouTube fontSize="small" />
              </IconButton>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* App Bar */}
      <AppBar position="sticky" elevation={1}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between", gap: 2, py: 1 }}>
          <Logo />
          <Stack direction="row" alignItems="center" spacing={1} sx={{ display: { xs: "none", md: "flex" } }}>
            {sections.map((s) => (
              <Button 
                key={s.id} 
                href={`#${s.id}`} 
                color="inherit" 
                sx={{ fontWeight: 500 }}
              >
                {s.label}
              </Button>
            ))}
          </Stack>
          <Stack direction="row" spacing={1.5}>
            <Button variant="outlined" component={Link} to="/login">
              Portal Login
            </Button>
            <Button 
              variant="contained" 
              color="secondary" 
              onClick={handleApplyScroll} 
              endIcon={<ArrowForwardIcon />}
            >
              Apply Now
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* HERO */}
      <Box
        id="home"
        sx={{
          position: "relative",
          minHeight: { xs: "80vh", md: "90vh" },
          display: "flex",
          alignItems: "center",
          backgroundColor: "primary.dark",
          color: "white",
          overflow: "hidden",
        }}
      >
        {/* Background image with overlay */}
        <Box
          sx={{
            position: "absolute", 
            inset: 0,
            background: `
              linear-gradient(135deg, rgba(26,75,140,0.85) 0%, rgba(13,42,86,0.9) 100%),
              url(https://upload.wikimedia.org/wikipedia/commons/8/8e/Staples_High_School%2C_Westport%2C_CT.jpg) center/cover
            `,
          }}
        />
        
        {/* Floating elements */}
        {[ 
          { left: "10%", top: "22%", size: 180, delay: "0s" },
          { left: "72%", top: "30%", size: 260, delay: ".8s" },
          { left: "40%", top: "65%", size: 160, delay: "1.6s" },
        ].map((p, i) => (
          <Box
            key={i}
            sx={{
              position: "absolute", 
              left: p.left, 
              top: p.top, 
              width: p.size, 
              height: p.size,
              borderRadius: "50%", 
              background: "radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.73), transparent 60%)",
              filter: "blur(30px)", 
              mixBlendMode: "overlay", 
              animation: `${float} 7s ease-in-out ${p.delay} infinite`,
            }}
          />
        ))}

        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Chip
                label="Kandy, Sri Lanka"
                color="secondary"
                sx={{ 
                  mt: 1,
                  mb: 3, 
                  color: "white",
                  fontWeight: 600
                }}
              />

              <Typography
                variant="h1"
                sx={{
                  fontWeight: 700,
                  lineHeight: 1.1,
                  mb: 3,
                  fontSize: { xs: "2.5rem", md: "3.5rem" }
                }}
              >
                EduLink Lanka International School
              </Typography>

              <Typography variant="h6" sx={{ 
                mb: 4, 
                opacity: 0.9, 
                fontWeight: 400,
                maxWidth: 600 
              }}>
                Where imagination meets discipline. We blend rigorous academics with modern technology
                and an ethos of kindness — preparing global citizens with purpose.
              </Typography>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 6 }}>
                <Button
                  size="large"
                  variant="contained"
                  color="secondary"
                  onClick={handleApplyScroll}
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontWeight: 600,
                    fontSize: "1.1rem"
                  }}
                >
                  Start Application
                </Button>
                <Button
                  size="large"
                  variant="outlined"
                  color="inherit"
                  startIcon={<PlayCircleIcon />}
                  onClick={() => setVideoOpen(true)}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontWeight: 600,
                    borderWidth: 2,
                    "&:hover": { borderWidth: 2 }
                  }}
                >
                  Campus Tour
                </Button>
              </Stack>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ flexWrap: "wrap" }}>
                <Stat value="1,000+" label="Students" Icon={<PeopleIcon />} />
                <Stat value="98%" label="A-Level Pass" Icon={<VerifiedIcon />} />
                <Stat value="50+" label="Clubs & Teams" Icon={<StarIcon />} />
              </Stack>
            </Grid>

            {/* Right-side highlight card */}
            {isMdUp && (
              <Grid item xs={12} md={5}>
                <Paper
                  elevation={8}
                  sx={{
                    p: 4, 
                    borderRadius: 4, 
                    bgcolor: "rgba(255, 255, 255, 0.88)",
                    border: "1px solid rgba(255, 255, 255, 0.84)", 
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                    Why Choose EduLink?
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
                    World-class curricula, smart classrooms, and a culture that nurtures confidence,
                    curiosity, and compassion.
                  </Typography>
                  <Stack spacing={2} sx={{ mt: 2 }}>
                    {[
                      "STEM labs with industry mentorship",
                      "AI-powered learning analytics",
                      "Sports & arts scholarships",
                    ].map((t) => (
                      <Stack key={t} direction="row" spacing={2} alignItems="center">
                        <Box sx={{ 
                          width: 24, 
                          height: 24, 
                          borderRadius: "50%", 
                          bgcolor: "secondary.main",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}>
                          <CheckCircleIcon sx={{ fontSize: 16, color: "white" }} />
                        </Box>
                        <Typography>{t}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Paper>
              </Grid>
            )}
          </Grid>
        </Container>

        {/* Wave divider */}
        <Box 
          component="svg" 
          viewBox="0 0 1440 120" 
          preserveAspectRatio="none"
          sx={{ 
            position: "absolute", 
            bottom: -1, 
            left: 0, 
            right: 0, 
            width: "100%", 
            height: 120,
            color: "background.default"
          }}
        >
          <path fill="currentColor" d="M0,64L80,58.7C160,53,320,43,480,48C640,53,800,75,960,74.7C1120,75,1280,53,1360,42.7L1440,32L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
        </Box>

        <VideoDialog open={videoOpen} onClose={() => setVideoOpen(false)} />
      </Box>

      {/* FEATURES */}
      <Section id="academics" title="A Complete, Modern School Platform" subtitle="OUR PLATFORM" padTop={10} padBottom={10}>
        <Grid container spacing={4}>
          {features.map((f) => (
            <Grid item xs={12} sm={6} md={4} key={f.title}>
              <FeatureCard icon={f.icon} title={f.title} desc={f.desc} />
            </Grid>
          ))}
        </Grid>
      </Section>

      {/* PROGRAMS */}
      <Section id="programs" title="Programs & Curriculum" subtitle="ACADEMICS" padTop={8} padBottom={10} bgColor="grey.50">
        <Paper elevation={0} sx={{ overflow: "hidden", bgcolor: "transparent" }}>
          <Tabs
            value={tab}
            onChange={(e, v) => setTab(v)}
            variant="fullWidth"
            sx={{ 
              mb: 4,
              "& .MuiTab-root": {
                fontSize: "1rem",
                fontWeight: 600,
                py: 2.5
              }
            }}
          >
            {Object.keys(programs).map((k) => (
              <Tab key={k} label={k} value={k} />
            ))}
          </Tabs>
          
          <Grid container spacing={3}>
            {programs[tab].map((p) => (
              <Grid item xs={12} md={6} key={p}>
                <Card elevation={2}>
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <Box sx={{ 
                        p: 1.5, 
                        bgcolor: "primary.main", 
                        borderRadius: 2, 
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}>
                        {tab === "A-Levels" ? <ScienceIcon /> : <LibraryBooksIcon />}
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>{p}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Inquiry-led, project-based learning with modern labs and maker spaces.
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Section>

      {/* ADMISSIONS
      <Section id="admissions" title="Admissions Process" subtitle="JOIN OUR COMMUNITY" padTop={10} padBottom={10}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={7}>
            <Paper elevation={2} sx={{ p: { xs: 3, md: 4 } }}>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>Application Steps</Typography>
              <Stepper activeStep={0} alternativeLabel sx={{ mb: 4 }}>
                {["Inquiry", "Assessment", "Offer", "Enroll"].map((s) => (
                  <Step key={s}>
                    <StepLabel>{s}</StepLabel>
                  </Step>
                ))}
              </Stepper>
              
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Book a Campus Tour</Typography>
              <Grid container spacing={3} component="form" onSubmit={(e)=>{e.preventDefault(); alert("Request submitted!");}}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Parent/Guardian Name" required />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Email" type="email" required />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Phone" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Preferred Grade" select defaultValue="Grade 7">
                    {["Grade 1","Grade 7","Grade 10","A-Levels"].map((g) => (
                      <MenuItem key={g} value={g}>{g}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField 
                    fullWidth 
                    label="Message" 
                    multiline 
                    rows={4} 
                    placeholder="Tell us about your child's interests…" 
                  />
                </Grid>
                <Grid item xs={12}>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <Button size="large" type="submit" variant="contained" endIcon={<ArrowForwardIcon />}>
                      Submit Request
                    </Button>
                    <Button size="large" variant="outlined" startIcon={<CalendarIcon />}>
                      View Key Dates
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </Paper>

            <Box sx={{ mt: 3 }}>
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
          </Grid>

          <Grid item xs={12} md={5}>
            <Card elevation={3}>
              <CardMedia 
                component="img" 
                height="240" 
                image="https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?q=80&w=1600&auto=format&fit=crop" 
                alt="Campus" 
              />
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Tuition & Key Dates</Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Term</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Start</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">Fees (LKR)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>Term 1</TableCell>
                      <TableCell>Jan 12, 2026</TableCell>
                      <TableCell align="right">195,000</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Term 2</TableCell>
                      <TableCell>May 10, 2026</TableCell>
                      <TableCell align="right">195,000</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Term 3</TableCell>
                      <TableCell>Sep 07, 2026</TableCell>
                      <TableCell align="right">195,000</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                <Divider sx={{ my: 2 }} />
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Chip label="Sibling Discount" color="primary" variant="outlined" />
                  <Chip label="Merit Scholarships" color="primary" variant="outlined" />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Section>
 */}
      {/* STUDENT LIFE */}
      <Section id="life" title="Life at EduLink Lanka" subtitle="BEYOND THE CLASSROOM" padTop={10} padBottom={10} bgColor="grey.50">
        <Grid container spacing={4}>
          {[
            { title: "Innovation Lab", icon: <ScienceIcon />, img: "https://static.sliit.lk/wp-content/uploads/2022/12/20115600/SLIIT-partners-in-a-pioneering-project-to-establish-an-Innovation-Lab-for-STEM-Education-at-Royal-College-Colombo-07-1.jpg", desc: "Robotics, AI, and maker projects with coaches from industry." },
            { title: "Sports & Wellness", icon: <SportsSoccerIcon />, img: "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=1600&auto=format&fit=crop", desc: "Competitive teams and inclusive fitness programs for all." },
            { title: "Arts & Culture", icon: <LibraryBooksIcon />, img: "https://www.ecoleglobale.com/wp-content/uploads/2019/10/ecole-globale-art-culture-3.jpg", desc: "Music, drama, and visual arts—showcase nights every term." },
          ].map((item) => (
            <Grid item xs={12} md={4} key={item.title}>
              <Card sx={{ height: "100%" }}>
                <CardMedia 
                  component="img" 
                  height="200" 
                  image={item.img} 
                  alt={item.title}
                  sx={{ objectFit: "cover" }}
                />
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <Box sx={{ 
                      p: 1.5, 
                      bgcolor: "primary.main", 
                      borderRadius: 2, 
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      {item.icon}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>{item.title}</Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">{item.desc}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Section>

      {/* FACULTY */}
      <Section id="staff" title="Meet Our Faculty" subtitle="DEDICATED EDUCATORS" padTop={10} padBottom={10}>
        <Grid container spacing={4}>
          {[
            { name: "Dr. Nadeesha Silva", role: "Head of Science", img: "https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=800&auto=format&fit=crop" },
            { name: "Ruwan Dias", role: "Mathematics", img: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=800&auto=format&fit=crop" },
            { name: "Amaya Senanayake", role: "English Literature", img: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=800&auto=format&fit=crop" },
            { name: "Kasun Jayasinghe", role: "Physical Education", img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop" },
          ].map((t) => (
            <Grid item xs={12} sm={6} md={3} key={t.name}>
              <Card sx={{ textAlign: "center" }}>
                <CardMedia 
                  component="img" 
                  height="240" 
                  image={t.img} 
                  alt={t.name}
                  sx={{ objectFit: "cover" }}
                />
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>{t.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{t.role}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Section>

      {/* NEWS & EVENTS */}
      <Section id="news" title="News & Events" subtitle="STAY CONNECTED" padTop={10} padBottom={10} bgColor="grey.50">
        <Grid container spacing={4} sx={{ mb: 6 }}>
          {news.map((n) => (
            <Grid item xs={12} md={4} key={n.title}>
              <Card sx={{ height: "100%" }}>
                <CardMedia 
                  component="img" 
                  height="200" 
                  image={n.img} 
                  alt={n.title}
                  sx={{ objectFit: "cover" }}
                />
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                    <CalendarIcon fontSize="small" color="primary" />
                    <Typography variant="caption" color="text.secondary">{n.date}</Typography>
                  </Stack>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>{n.title}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Paper elevation={2} sx={{ p: 4 }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>Upcoming Events</Typography>
          <Grid container spacing={3}>
            {events.map((e) => (
              <Grid item xs={12} md={6} key={e.title}>
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box sx={{ 
                      p: 2, 
                      bgcolor: "primary.main", 
                      borderRadius: 2, 
                      color: "white",
                      textAlign: "center",
                      minWidth: 70
                    }}>
                      <Typography variant="overline" sx={{ lineHeight: 1, display: "block" }}>
                        {e.when.split(" ")[0]}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1 }}>
                        {e.when.split(" ")[1].replace(",", "")}
                      </Typography>
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>{e.title}</Typography>
                      <Chip label={e.tag} color="primary" size="small" />
                    </Box>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Section>

      {/* TESTIMONIALS */}
      <Section id="testimonials" title="What Our Community Says" subtitle="VOICES" padTop={10} padBottom={10}>
        <Grid container spacing={4}>
          {testimonials.map((t) => (
            <Grid item xs={12} md={4} key={t.name}>
              <Card elevation={3} sx={{ p: 3, height: "100%" }}>
                <Stack spacing={3}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar src={t.avatar} alt={t.name} sx={{ width: 60, height: 60 }} />
                    <Box>
                      <Typography sx={{ fontWeight: 600 }}>{t.name}</Typography>
                      <Typography variant="body2" color="text.secondary">{t.role}</Typography>
                    </Box>
                  </Stack>
                  <Typography variant="body1" fontStyle="italic">"{t.quote}"</Typography>
                  <Stack direction="row" spacing={0.5}>
                    {[...Array(5)].map((_, i) => (
                      <StarIcon key={i} fontSize="small" color="warning" />
                    ))}
                  </Stack>
                </Stack>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Section>

      {/* GALLERY */}
      <Section id="gallery" title="Campus Gallery" subtitle="EXPLORE OUR CAMPUS" padTop={10} padBottom={10} bgColor="grey.50">
        <ImageList variant="masonry" cols={isMdUp ? 3 : 2} gap={16}>
          {gallery.map((src, i) => (
            <ImageListItem key={i}>
              <img 
                src={src} 
                alt={`Campus ${i + 1}`} 
                loading="lazy" 
                style={{ 
                  borderRadius: 12, 
                  width: "100%", 
                  display: "block",
                  transition: "transform 0.3s ease",
                  cursor: "pointer"
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.02)"}
                onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
              />
            </ImageListItem>
          ))}
        </ImageList>
      </Section>

      {/* CTA */}
      <Section id="cta" padTop={8} padBottom={8}>
        <Paper sx={{ 
          p: { xs: 4, md: 6 }, 
          background: "linear-gradient(135deg, #1A4B8C 0%, #0D2A56 100%)", 
          color: "white",
          textAlign: "center"
        }}>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
            Ready to Join EduLink Lanka?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9, fontWeight: 400 }}>
            Create your parent account, start an application, and track progress in real time.
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={3} justifyContent="center">
            <Button 
              component={Link} 
              to="/register" 
              variant="contained" 
              color="secondary" 
              size="large"
              endIcon={<ArrowForwardIcon />}
              sx={{ px: 4, py: 1.5 }}
            >
              Create Account
            </Button>
            <Button 
              component={Link} 
              to="/login" 
              variant="outlined" 
              size="large"
              sx={{ 
                color: "white", 
                borderColor: "white",
                px: 4,
                py: 1.5,
                "&:hover": { borderColor: "white", backgroundColor: "rgba(255,255,255,0.1)" }
              }}
            >
              Sign In
            </Button>
          </Stack>
        </Paper>
      </Section>

      {/* FOOTER */}
      <Box id="contact" component="footer" sx={{ bgcolor: "primary.dark", color: "white", pt: 8, pb: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={5}>
            <Grid item xs={12} md={4}>
              <Stack spacing={3}>
                <Logo />
                <Stack direction="row" spacing={2} alignItems="center">
                  <LocationOn color="secondary" />
                  <Typography>45 Hillcrest Road, Kandy, Sri Lanka</Typography>
                </Stack>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Phone color="secondary" />
                  <Typography>+94 81 555 0123</Typography>
                </Stack>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Email color="secondary" />
                  <Typography>info@edulinklanka.edu</Typography>
                </Stack>
                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                  <IconButton color="secondary" aria-label="Facebook">
                    <Facebook />
                  </IconButton>
                  <IconButton color="secondary" aria-label="Twitter">
                    <Twitter />
                  </IconButton>
                  <IconButton color="secondary" aria-label="Instagram">
                    <Instagram />
                  </IconButton>
                  <IconButton color="secondary" aria-label="YouTube">
                    <YouTube />
                  </IconButton>
                </Stack>
              </Stack>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>Explore</Typography>
              <Stack spacing={2}>
                {exploreLinks.map((x) => (
                  <Button 
                    key={x.label} 
                    href={x.to} 
                    color="inherit" 
                    sx={{ 
                      justifyContent: "flex-start",
                      "&:hover": { color: "secondary.main" }
                    }}
                  >
                    {x.label}
                  </Button>
                ))}
              </Stack>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>Resources</Typography>
              <Stack spacing={2}>
                <Button color="inherit" sx={{ justifyContent: "flex-start" }}>Prospectus (PDF)</Button>
                <Button color="inherit" sx={{ justifyContent: "flex-start" }}>Term Calendar</Button>
                <Button color="inherit" sx={{ justifyContent: "flex-start" }}>Policies</Button>
                <Button color="inherit" sx={{ justifyContent: "flex-start" }}>Careers</Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>Newsletter</Typography>
              <Stack
                component="form"
                spacing={2}
                onSubmit={(e)=>{e.preventDefault(); alert("Subscribed!");}}
              >
                <TextField 
                  fullWidth 
                  size="small" 
                  placeholder="Your email" 
                  type="email" 
                  required 
                  sx={{ 
                    backgroundColor: "rgba(255,255,255,0.1)",
                    borderRadius: 1,
                    "& .MuiOutlinedInput-root": {
                      color: "white",
                      "& fieldset": {
                        borderColor: "rgba(255,255,255,0.3)",
                      },
                      "&:hover fieldset": {
                        borderColor: "rgba(255,255,255,0.5)",
                      },
                    }
                  }}
                />
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="secondary"
                  sx={{ fontWeight: 600 }}
                >
                  Subscribe
                </Button>
              </Stack>
              <Typography variant="caption" sx={{ mt: 2, display: "block", opacity: 0.7 }}>
                By subscribing you agree to our Privacy Policy.
              </Typography>
            </Grid>
          </Grid>
          <Divider sx={{ my: 6, borderColor: "rgba(255,255,255,0.2)" }} />
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={2}>
            <Typography variant="body2">© {year} EduLink Lanka International School. All rights reserved.</Typography>
            <Typography variant="body2">ITP - Y2S2</Typography>
          </Stack>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default Dashboard;