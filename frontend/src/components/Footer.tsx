// src/app/components/Footer.tsx (Conceptual Example)
const Footer = () => {
  return (
    <footer
      className="bg-gray-800 border-t border-gray-700 mt-12"
      style={{ "--footer-height": "80px" } as React.CSSProperties}
    >
      <div className="container mx-auto px-4 py-6 text-center text-gray-400 text-sm">
        <p>© {2025} MindGrid. All rights reserved.</p>
        {/* Add other links if needed: About, Contact, Privacy Policy */}
        {/* <div className="mt-2">
            <Link href="/about" className="hover:text-cyan-400 mx-2">About</Link>
            <Link href="/privacy" className="hover:text-cyan-400 mx-2">Privacy Policy</Link>
          </div> */}
      </div>
    </footer>
  );
};

export default Footer;
