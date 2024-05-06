export class RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export class LoginRequest {
  email: string;
  password: string;
}

export class ForgotPasswordRequest {
  email: string;
}

export class AuthResponse {
  name: string;
  email: string;
  token?: string;
}
