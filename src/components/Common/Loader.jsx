// =======================================================
// Loader.jsx
// Reusable Loader Component
// =======================================================

function Loader({ size = "md", inline = false }) {
  return (
    <div
      className={`loader-container ${
        inline ? "loader-inline" : "loader-fullscreen"
      }`}
    >
      <div className={`loader spinner-${size}`} />
    </div>
  );
}

export default Loader;
