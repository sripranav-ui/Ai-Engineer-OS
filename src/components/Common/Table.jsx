import React from "react";

/**
 * Reusable Table Component
 * @param {Array} headers List of column names or objects { label, style }
 * @param {Array} data List of rows data
 * @param {Function} renderRow Callback to render single row (e.g. data => <tr>...)
 */
function Table({ headers, data, renderRow }) {
  return (
    <div className="table-container">
      <table className="library-table">
        <thead>
          <tr>
            {headers.map((h, i) => {
              const label = typeof h === "object" ? h.label : h;
              const style = typeof h === "object" ? h.style : {};
              return (
                <th key={i} style={style}>
                  {label}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {data && data.length > 0 ? (
            data.map((row, idx) => renderRow(row, idx))
          ) : (
            <tr>
              <td colSpan={headers.length} style={{ textAlign: "center", color: "var(--light-text)", padding: "30px" }}>
                No records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default React.memo(Table);
