/** SpinnerLoader — Extracted loading spinner component. */
export const SpinnerLoader = () => (
  <div
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(32, 30, 29, 0.4)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
    }}
  >
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      .glowing-spinner {
        width: 50px;
        height: 50px;
        border: 4px solid rgba(99, 102, 241, 0.1);
        border-top: 4px solid var(--primary);
        border-radius: 50%;
        animation: spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        box-shadow: 0 0 15px rgba(99, 102, 241, 0.2);
      }
    `}</style>
    <div className="glowing-spinner"></div>
    <p
      style={{
        marginTop: '1rem',
        fontWeight: 600,
        color: 'white',
        fontSize: '0.9rem',
        letterSpacing: '0.05em',
      }}
    >
      Loading LiviSync...
    </p>
  </div>
);
export default SpinnerLoader;
