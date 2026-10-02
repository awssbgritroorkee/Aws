import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar             from './components/Navbar';
import Footer             from './components/Footer';
import AwsGridBackground  from './components/AwsGridBackground';
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

const MainLayout = () => {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');

  if (isDashboard) {
    return (
      <Routes>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<StudentDashboard />} />
          <Route path="registrations" element={<MyRegistrations />} />
          <Route path="profile" element={<BuilderProfile />} />
        </Route>
      </Routes>
    );
  }

  return (
    <div className="flex flex-col min-h-screen font-sans text-white bg-transparent relative">
      <AwsGridBackground />
      <Navbar />
      <main id="main-content" tabIndex="-1" className="flex-grow flex flex-col">
        <Routes>
          <Route path="/"                 element={<Home />}            />
          <Route path="/about"            element={<About />}           />
          <Route path="/events"           element={<Events />}          />
          <Route path="/challenges"       element={<Challenges />}      />
          <Route path="/challenges/:slug" element={<ChallengeDetail />} />
          <Route path="/hackathons/:slug" element={<HackathonDetail />} />
          <Route path="/teamup"           element={<TeamUp />}          />
          <Route path="/team"             element={<Team />}            />
          <Route path="/gallery"          element={<Gallery />}         />
          <Route path="/contact"          element={<Contact />}         />
          <Route path="/profile"          element={<ProfileUpdate />}   />
          {/* Catch-all → Home */}
          <Route path="*"                 element={<Home />}            />
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

