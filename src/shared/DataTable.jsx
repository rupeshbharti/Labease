import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import './DataTable.css';

/**
 * DataTable — Sortable, filterable table with pagination.
 *
 * @param {Array} columns - [{key, label, sortable?, render?}]
 * @param {Array} data - Row data objects
 * @param {number} pageSize - Rows per page (default 10)
 * @param {function} onRowClick - Called with row data on click
 * @param {string} emptyMessage - Message when no data
 */
export default function DataTable({
  columns = [],
  data = [],
  pageSize = 10,
  onRowClick,
  emptyMessage = 'No data found',
  className = '',
}) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (typeof aVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [data, sortKey, sortDirection]);

  // Paginate
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  return (
    <div className={`data-table-wrapper ${className}`}>
      <div className="data-table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`data-table__th ${col.sortable ? 'data-table__th--sortable' : ''}`}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                >
                  <span className="data-table__th-content">
                    {col.label}
                    {col.sortable && sortKey === col.key && (
                      sortDirection === 'asc'
                        ? <ChevronUp size={14} />
                        : <ChevronDown size={14} />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="data-table__empty">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, i) => (
                <tr
                  key={row.id || i}
                  className={`data-table__row ${onRowClick ? 'data-table__row--clickable' : ''}`}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="data-table__td">
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="data-table__pagination">
          <span className="body-sm text-muted">
            Showing {(currentPage - 1) * pageSize + 1}–
            {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length}
          </span>
          <div className="data-table__pagination-controls">
            <button
              className="data-table__page-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              aria-label="Previous page"
            >
              <ChevronLeft size={18} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => Math.abs(p - currentPage) <= 2 || p === 1 || p === totalPages)
              .map((page, i, arr) => (
                <span key={page}>
                  {i > 0 && arr[i - 1] !== page - 1 && <span className="data-table__ellipsis">…</span>}
                  <button
                    className={`data-table__page-btn ${page === currentPage ? 'data-table__page-btn--active' : ''}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                </span>
              ))}
            <button
              className="data-table__page-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              aria-label="Next page"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
