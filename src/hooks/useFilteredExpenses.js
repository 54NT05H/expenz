import { useMemo } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { useFilters } from '../context/FilterContext';

// Returns the expenses that match the current search, category and month.
export const useFilteredExpenses = () => {
  const { allExpenses } = useExpenses();
  const { searchQuery, selectedCategory, selectedMonth } = useFilters();

  return useMemo(() => {
    const query = searchQuery.toLowerCase();

    return allExpenses.filter((item) => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSearch =
        item.title.toLowerCase().includes(query) ||
        (item.notes && item.notes.toLowerCase().includes(query));
      const matchesMonth = selectedMonth ? item.date?.startsWith(selectedMonth) : true;
      return matchesCategory && matchesSearch && matchesMonth;
    });
  }, [allExpenses, searchQuery, selectedCategory, selectedMonth]);
};