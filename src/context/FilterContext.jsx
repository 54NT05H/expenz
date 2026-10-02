import React, { createContext, useContext, useState, useMemo } from 'react';
import { format } from 'date-fns';

const FilterContext = createContext(null);

export const FilterProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState(() => format(new Date(), 'yyyy-MM'));

  // useMemo: the object only changes when one of these values really changes.
  const value = useMemo(
    () => ({
      searchQuery,
      setSearchQuery,
      selectedCategory,
      setSelectedCategory,
      selectedMonth,
      setSelectedMonth,
    }),
    [searchQuery, selectedCategory, selectedMonth]
  );

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
};

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};