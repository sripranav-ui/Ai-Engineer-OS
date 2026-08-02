import React from "react";
import { useLocation, Link } from "react-router-dom";
import { buildBreadcrumbs } from "../../config/navigation";

// =======================================================
// Breadcrumb.jsx — Route-Driven Breadcrumb Navigation
// =======================================================
// Generates breadcrumbs automatically from the current
// pathname via the navigation registry.
//
// Renders nothing on the home route ("/").
// =======================================================

function Breadcrumb() {
  const { pathname } = useLocation();
  const crumbs = buildBreadcrumbs(pathname);

  // Don't render breadcrumb on home
  if (crumbs.length <= 1) return null;

  return (
    <nav
      className="breadcrumb"
      aria-label="Breadcrumb"
    >
      <ol className="breadcrumb-list" role="list">
        {crumbs.map((crumb, idx) => {
          const isLast = idx === crumbs.length - 1;
          return (
            <li key={idx} className="breadcrumb-item">
              {!isLast && crumb.path ? (
                <Link to={crumb.path} className="breadcrumb-link">
                  {crumb.label}
                </Link>
              ) : !isLast && !crumb.path ? (
                <span className="breadcrumb-segment">{crumb.label}</span>
              ) : (
                <span className="breadcrumb-current" aria-current="page">
                  {crumb.label}
                </span>
              )}
              {!isLast && (
                <span className="breadcrumb-sep" aria-hidden="true">
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default React.memo(Breadcrumb);
