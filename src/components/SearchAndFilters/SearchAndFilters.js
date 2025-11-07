import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useTheme } from "../../contexts/ThemeContext";
import { getThemeClass } from "../../utils/themeUtils";
import {
  SearchOutlined,
  CloseOutlined,
  ClearOutlined,
  FilterOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import styles from "./SearchAndFilters.module.css";

/**
 * Comprehensive search and filtering component that provides multiple ways to filter
 * bookings data. Includes debounced text search, status filtering, date range filtering,
 * and a clear all functionality with smart detection of active filters.
 *
 * Features:
 * - Debounced text search for customer names (configurable delay)
 * - Status dropdown filtering with all booking statuses
 * - Date range filtering with start and end date inputs
 * - Clear all filters functionality with active state detection
 * - Responsive design that adapts to different screen sizes
 * - Accessibility features with proper ARIA labels and keyboard navigation
 * - Theme support for dark/light mode
 * - Clean, intuitive interface with visual indicators
 *
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.filters - Current filter values object
 * @param {string} [props.filters.customerName] - Current search term for customer names
 * @param {string} [props.filters.status] - Current status filter value
 * @param {string} [props.filters.startDate] - Current start date filter (YYYY-MM-DD)
 * @param {string} [props.filters.endDate] - Current end date filter (YYYY-MM-DD)
 * @param {function} props.onFiltersChange - Callback function called when any filter changes
 * @param {function} props.onClearFilters - Callback function called when clear filters is triggered
 * @param {number} [props.debounceMs=300] - Debounce delay in milliseconds for search input
 * @returns {JSX.Element} Search and filters interface component
 *
 * @example
 * // Basic usage with filter state management
 * <SearchAndFilters
 *   filters={{
 *     customerName: 'John',
 *     status: 'confirmed',
 *     startDate: '2024-01-01',
 *     endDate: '2024-12-31'
 *   }}
 *   onFiltersChange={(updates) => setFilters(prev => ({...prev, ...updates}))}
 *   onClearFilters={() => setFilters({})}
 *   debounceMs={500}
 * />
 */
const SearchAndFilters = ({
  filters,
  onFiltersChange,
  onClearFilters,
  debounceMs = 300,
}) => {
  const { currentTheme } = useTheme();
  const [searchTerm, setSearchTerm] = useState(filters.customerName || "");

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      onFiltersChange({ customerName: searchTerm });
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchTerm, onFiltersChange, debounceMs]);

  // Update local search term when filters change externally (e.g., clear filters)
  useEffect(() => {
    setSearchTerm(filters.customerName || "");
  }, [filters.customerName]);

  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  const handleStatusChange = (status) => {
    onFiltersChange({ status });
  };

  const handleDateRangeChange = (dateRange) => {
    onFiltersChange({ dateRange });
  };

  const isFiltersActive = () => {
    return (
      searchTerm ||
      filters.status ||
      filters.dateRange.start ||
      filters.dateRange.end
    );
  };

  return (
    <div className={getThemeClass("filtersSection", currentTheme, styles)}>
      <div className={styles.filtersContainer}>
        {/* Search Input */}
        <div className={styles.searchInputGroup}>
          <div
            className={getThemeClass("searchContainer", currentTheme, styles)}
          >
            <div
              className={getThemeClass(
                "searchInputContainer",
                currentTheme,
                styles
              )}
            >
              <div
                className={getThemeClass("searchIcon", currentTheme, styles)}
              >
                <SearchOutlined />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search by customer name..."
                className={getThemeClass("searchInput", currentTheme, styles)}
                aria-label="Search bookings by customer name"
              />
              {searchTerm && (
                <button
                  onClick={handleClearSearch}
                  className={getThemeClass(
                    "clearSearchButton",
                    currentTheme,
                    styles
                  )}
                  aria-label="Clear search"
                  type="button"
                >
                  <CloseOutlined />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Status Filter */}
        <div className={styles.filterGroup}>
          <label
            htmlFor="status-filter"
            className={getThemeClass("filterLabel", currentTheme, styles)}
          >
            <FilterOutlined style={{ marginRight: "8px" }} />
            Status
          </label>
          <select
            id="status-filter"
            value={filters.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className={getThemeClass("filterSelect", currentTheme, styles)}
          >
            <option value="">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Date Range Filter */}
        <div className={styles.filterGroup}>
          <label
            htmlFor="start-date"
            className={getThemeClass("filterLabel", currentTheme, styles)}
          >
            <CalendarOutlined style={{ marginRight: "8px" }} />
            Date Range
          </label>
          <div className={styles.dateRangeInputs}>
            <input
              id="start-date"
              type="date"
              value={filters.dateRange.start}
              onChange={(e) =>
                handleDateRangeChange({
                  ...filters.dateRange,
                  start: e.target.value,
                })
              }
              className={getThemeClass("dateInput", currentTheme, styles)}
              aria-label="Start date"
            />
            <span
              className={getThemeClass("dateSeparator", currentTheme, styles)}
            >
              to
            </span>
            <input
              id="end-date"
              type="date"
              value={filters.dateRange.end}
              onChange={(e) =>
                handleDateRangeChange({
                  ...filters.dateRange,
                  end: e.target.value,
                })
              }
              className={getThemeClass("dateInput", currentTheme, styles)}
              aria-label="End date"
            />
          </div>
        </div>

        {/* Clear Filters Button */}
        <div className={styles.clearFiltersGroup}>
          <button
            onClick={onClearFilters}
            className={getThemeClass(
              "clearFiltersButton",
              currentTheme,
              styles
            )}
            disabled={!isFiltersActive()}
            aria-label="Clear all filters"
          >
            <ClearOutlined style={{ marginRight: "8px" }} />
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
};

SearchAndFilters.propTypes = {
  /** Current filter values object */
  filters: PropTypes.shape({
    /** Current search term for customer names */
    customerName: PropTypes.string,
    /** Current status filter value */
    status: PropTypes.oneOf(["", "confirmed", "pending", "cancelled"]),
    /** Current date range filter object */
    dateRange: PropTypes.shape({
      /** Start date in YYYY-MM-DD format */
      start: PropTypes.string,
      /** End date in YYYY-MM-DD format */
      end: PropTypes.string,
    }),
  }).isRequired,
  /** Callback function called when any filter changes */
  onFiltersChange: PropTypes.func.isRequired,
  /** Callback function called when clear filters is triggered */
  onClearFilters: PropTypes.func.isRequired,
  /** Debounce delay in milliseconds for search input */
  debounceMs: PropTypes.number,
};

SearchAndFilters.defaultProps = {
  debounceMs: 300,
};

export default SearchAndFilters;
