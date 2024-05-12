export class UserResponse {
  name: string;
  email: string;
  role: string;
}

export class SearchUserRequest {
  name: string;
  email: string;
  role: string;
  size: number;
  page: number;
  sortDirection: string;
  sortColumn: string;
}
