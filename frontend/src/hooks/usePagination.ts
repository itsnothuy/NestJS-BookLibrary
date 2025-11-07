import { useState } from 'react';

export interface PaginationState {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  search: string;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export function usePagination(initialLimit = 10) {
  const [state, setState] = useState<PaginationState>({
    page: 1,
    limit: initialLimit,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    search: '',
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const updatePagination = (updates: Partial<PaginationState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const goToPage = (page: number) => {
    updatePagination({ page });
  };

  const nextPage = () => {
    if (state.hasNextPage) {
      goToPage(state.page + 1);
    }
  };

  const previousPage = () => {
    if (state.hasPreviousPage) {
      goToPage(state.page - 1);
    }
  };

  const changePageSize = (limit: number) => {
    updatePagination({ limit, page: 1 });
  };

  const updateSort = (sortBy: string, sortOrder?: 'asc' | 'desc') => {
    const newSortOrder = sortOrder || (state.sortBy === sortBy && state.sortOrder === 'asc' ? 'desc' : 'asc');
    updatePagination({ sortBy, sortOrder: newSortOrder, page: 1 });
  };

  const updateSearch = (search: string) => {
    updatePagination({ search, page: 1 }); 
  };

  const reset = () => {
    setState({
      page: 1,
      limit: initialLimit,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      search: '',
      total: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    });
  };

  return {
    state,
    goToPage,
    nextPage,
    previousPage,
    changePageSize,
    updateSort,
    updateSearch,
    updatePagination,
    reset,
  };
}