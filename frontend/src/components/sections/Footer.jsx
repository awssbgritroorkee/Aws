const Footer = () => (
  <footer
    className="relative px-6 py-12 text-center"
    style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
  >
    <div className="max-w-4xl mx-auto">
      <p className="text-gray-600 text-sm mb-2">
        Built with ☁️ by{' '}
        <span className="text-purple-glow font-semibold">AWS Student Builder Group</span>
        {' '}·{' '}
        <span className="text-gray-500">Roorkee Institute of Technology</span>
      </p>
      <p className="text-gray-700 text-xs">
        © {new Date().getFullYear()} AWS SBG RIT · All rights reserved
      </p>
    </div>
  </footer>
);

export default Footer;
