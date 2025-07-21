export interface PaginatedMetaFormat {
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  totalItems: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginatedMetaFormat;
}
