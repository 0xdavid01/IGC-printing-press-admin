import "../css/mobiletopbar.css";

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}

export default function MobileTopbar({ onOpen }) {
  return (
    <header className="mobile-topbar">
      <button className="mobile-topbar-btn" onClick={onOpen} aria-label="Open menu">
        <MenuIcon />
      </button>
      <span className="mobile-topbar-brand">IGC Print Press</span>
    </header>
  );
}