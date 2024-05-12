export class WebResponse<T> {
  data?: T;
  errors?: string;
  paging?: Paging;
}

export class Paging {
  page: number;
  pageSize: number;
  totalPage: number;
  total: number;
  sortDirection: string;
  sortColumn: string;
}
