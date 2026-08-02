import React from "react";
import Button from "./Button";

/**
 * Reusable Pagination Controller Component
 */
function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "15px", margin: "20px 0" }}>
      <Button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        type="outline"
        style={{ padding: "6px 12px", fontSize: "12px" }}
      >
        ◀ Prev
      </Button>

      <span style={{ fontSize: "13px", color: "var(--light-text)", fontWeight: "600" }}>
        Page {currentPage} of {totalPages}
      </span>

      <Button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        type="outline"
        style={{ padding: "6px 12px", fontSize: "12px" }}
      >
        Next ▶
      </Button>
    </div>
  );
}

export default React.memo(Pagination);
