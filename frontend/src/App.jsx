import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar             from './components/Navbar';
import Footer             from './components/Footer';
import AwsGridBackground  from './components/AwsGridBackground';
import FeatureGate        from './components/FeatureGate';
import Home               from './pages/Home';
import About              from './pages/About';
import Events             from './pages/Events';
import Challenges         from './pages/Challenges';
import ChallengeDetail    from './pages/ChallengeDetail';
import HackathonDetail    from './pages/HackathonDetail';
import Team               from './pages/Team';
import Gallery            from './pages/Gallery';
import Contact            from './pages/Contact';
import ProfileUpdate      from './pages/ProfileUpdate';
import TeamUp             from './pages/TeamUp';
import StudentDashboard   from './pages/StudentDashboard';
import MyRegistrations    from './pages/MyRegistrations';
import BuilderProfile     from './pages/BuilderProfile';
import DashboardLayout    from './components/DashboardLayout';
import VolunteerApply     from './pages/VolunteerApply';

const MainLayout = () => {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');

  if (isDashboard) {
    return (
      // Dashboard is wrapped at the layout level — if disabled, the whole
      // /dashboard/* subtree shows the "Feature Unavailable" screen.
      <FeatureGate flag="is_dashboard_active" name="Student Dashboard">
        <Routes>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<StudentDashboard />} />
            <Route path="registrations" element={<MyRegistrations />} />
            <Route path="profile" element={<BuilderProfile />} />
          </Route>
        </Routes>
      </FeatureGate>
    );
  }

  return (
    <div className="flex flex-col min-h-screen font-sans text-white bg-transparent relative">
      <AwsGridBackground />
      <Navbar />
      <main id="main-content" tabIndex="-1" className="flex-grow flex flex-col">
        <Routes>
          {/* Always-on routes */}
          <Route path="/"                 element={<Home />}           />
          <Route path="/about"            element={<About />}          />
          <Route path="/events"           element={<Events />}         />
          <Route path="/team"             element={<Team />}           />
          <Route path="/gallery"          element={<Gallery />}        />
          <Route path="/contact"          element={<Contact />}        />
          <Route path="/profile"          element={<ProfileUpdate />}  />

          {/* ── Feature-gated routes ──────────────────────────────────────── */}

          {/* Challenges */}
          <Route
            path="/challenges"
            element={
              <FeatureGate flag="is_challenges_active" name="Challenges">
                <Challenges />
              </FeatureGate>
            }
          />
          <Route
            path="/challenges/:slug"
            element={
              <FeatureGate flag="is_challenges_active" name="Challenges">
                <ChallengeDetail />
              </FeatureGate>
            }
          />
          <Route
            path="/hackathons/:slug"
            element={
              <FeatureGate flag="is_challenges_active" name="Challenges">
                <HackathonDetail />
              </FeatureGate>
            }
          />

          {/* Team Up */}
          <Route
            path="/teamup"
            element={
              <FeatureGate flag="is_teamup_active" name="Team Up">
                <TeamUp />
              </FeatureGate>
            }
          />

          {/* Volunteer */}
          <Route
            path="/volunteer"
            element={
              <FeatureGate flag="is_volunteers_active" name="Volunteer">
                <VolunteerApply />
              </FeatureGate>
            }
          />

          {/* Catch-all → Home */}
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

const App = () => (
  <BrowserRouter>
    <MainLayout />
  </BrowserRouter>
);

export default App;
