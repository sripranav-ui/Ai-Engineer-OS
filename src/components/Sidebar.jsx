import React from "react";
import DesktopSidebar from "./Desktop/DesktopSidebar.jsx";

/**
 * Legacy Sidebar wrapper re-exporting DesktopSidebar for backward compatibility.
 */
export function Sidebar(props) {
  return <DesktopSidebar {...props} />;
}

export default Sidebar;
