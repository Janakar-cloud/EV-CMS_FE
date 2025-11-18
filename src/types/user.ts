export interface User {
  id: string;
  userid: string;
  fullName: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'blocked';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserRequest {
  userid: string;
  fullName: string;
  email: string;
  phone: string;
}

export interface UserValidationError {
  field: string;
  message: string;
}

export interface UserResponse {
  success: boolean;
  user?: User;
  errors?: UserValidationError[];
}
