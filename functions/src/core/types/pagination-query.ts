type PaginationQuery = {
  limit: number;
  sortField: string;
  sortDirection: string;
  last?: string;
};

export default PaginationQuery;
