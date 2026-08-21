import TopNav           from '../components/layout/TopNav';
import Hero             from '../components/sections/Hero';
import AboutSection     from '../components/sections/AboutSection';
import ProjectsSection  from '../components/sections/ProjectsSection';
import TeamSection      from '../components/sections/TeamSection';
import ContactSection   from '../components/sections/ContactSection';
import Footer           from '../components/sections/Footer';

/**
 * LandingPage — Single flowing page, all sections stacked vertically.
 * TopNav is fixed above; sections scroll underneath it.
 */
const LandingPage = () => (
  <>
    <TopNav />
    <main id="main-content" tabIndex="-1">
      <Hero />
      <AboutSection />
      <ProjectsSection />
      <TeamSection />
      <ContactSection />
    </main>
    <Footer />
  </>
);

export default LandingPage;
