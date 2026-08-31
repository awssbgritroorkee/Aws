import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar             from './components/Navbar';
import Footer             from './components/Footer';
import AwsGridBackground  from './components/AwsGridBackground';
import Home               from './pages/Home';
import About              from './pages/About';
import Events             from './pages/Events';
import Team               from './pages/Team';
import Gallery            from './pages/Gallery';
import Contact            from './pages/Contact';
import ProfileUpdate      from './pages/ProfileUpdate';
import TeamUp             from './pages/TeamUp';
import AdminAnalytics     from './pages/AdminAnalytics';

const App = () => (
  <BrowserRouter>
    <div className="flex flex-col min-h-screen font-sans text-white bg-transparent relative">
      <AwsGridBackground />
      <Navbar />
      <main id="main-content" tabIndex="-1" className="flex-grow flex flex-col">
        <Routes>
          <Route path="/"                 element={<Home />}          />
          <Route path="/about"            element={<About />}         />
          <Route path="/events"           element={<Events />}        />
          <Route path="/teamup"           element={<TeamUp />}        />
          <Route path="/team"             element={<Team />}          />
          <Route path="/gallery"          element={<Gallery />}       />
          <Route path="/contact"          element={<Contact />}       />
          <Route path="/profile"          element={<ProfileUpdate />} />
          <Route path="/admin/analytics"  element={<AdminAnalytics />}/>
          {/* Catch-all → Home */}
          <Route path="*"                 element={<Home />}          />
        </Routes>
      </main>
      <Footer />
    </div>
  </BrowserRouter>
);

export default App;
