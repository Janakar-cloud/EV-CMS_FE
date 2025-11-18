import { User, CreateUserRequest, UserResponse, UserValidationError } from '@/types/user';
class UserStorage {
  private users: User[] = [];
  private nextId = 1;

  constructor() {
    this.users = [
      {
        id: '1',
        userid: 'admin001',
        fullName: 'John Admin',
        email: 'janakar.ganesan@gmail.com',
        phone: '+1234567890',
        status: 'active',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: '2',
        userid: 'user002',
        fullName: 'Sarah Manager',
        email: 'sarah.manager@evcms.com',
        phone: '+1234567891',
        status: 'active',
        createdAt: new Date('2024-02-10'),
        updatedAt: new Date('2024-02-10')
      },
      {
        id: '3',
        userid: 'operator003',
        fullName: 'Mike Operator',
        email: 'mike.operator@evcms.com',
        phone: '+1234567892',
        status: 'inactive',
        createdAt: new Date('2024-03-05'),
        updatedAt: new Date('2024-03-05')
      }
    ];
    this.nextId = 4;
  }

  private validateUser(userData: CreateUserRequest): UserValidationError[] {
    const errors: UserValidationError[] = [];

    if (!userData.fullName || userData.fullName.trim().length < 2) {
      errors.push({
        field: 'fullName',
        message: 'Full name must be at least 2 characters long'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!userData.email || !emailRegex.test(userData.email)) {
      errors.push({
        field: 'email',
        message: 'Please enter a valid email address'
      });
    }

    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    if (!userData.phone || !phoneRegex.test(userData.phone)) {
      errors.push({
        field: 'phone',
        message: 'Please enter a valid phone number (minimum 10 digits)'
      });
    }

    if (!userData.userid || userData.userid.trim().length < 3) {
      errors.push({
        field: 'userid',
        message: 'User ID must be at least 3 characters long'
      });
    }

    if (this.isUserIdTaken(userData.userid)) {
      errors.push({
        field: 'userid',
        message: 'User ID already taken, please try another'
      });
    }

    if (this.isEmailTaken(userData.email)) {
      errors.push({
        field: 'email',
        message: 'Email address already registered'
      });
    }

    if (this.isPhoneTaken(userData.phone)) {
      errors.push({
        field: 'phone',
        message: 'Phone number already registered'
      });
    }

    return errors;
  }

  private isUserIdTaken(userid: string): boolean {
    return this.users.some(user => user.userid.toLowerCase() === userid.toLowerCase());
  }

  private isEmailTaken(email: string): boolean {
    return this.users.some(user => user.email.toLowerCase() === email.toLowerCase());
  }

  private isPhoneTaken(phone: string): boolean {
    return this.users.some(user => user.phone === phone);
  }

  createUser(userData: CreateUserRequest): UserResponse {
    const errors = this.validateUser(userData);
    
    if (errors.length > 0) {
      return {
        success: false,
        errors
      };
    }

    const newUser: User = {
      id: this.nextId.toString(),
      userid: userData.userid.trim(),
      fullName: userData.fullName.trim(),
      email: userData.email.toLowerCase().trim(),
      phone: userData.phone.trim(),
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.users.push(newUser);
    this.nextId++;

    return {
      success: true,
      user: newUser
    };
  }

  getAllUsers(): User[] {
    return [...this.users];
  }

  getUserById(id: string): User | undefined {
    return this.users.find(user => user.id === id);
  }

  getUserByUserId(userid: string): User | undefined {
    return this.users.find(user => user.userid.toLowerCase() === userid.toLowerCase());
  }

  updateUserStatus(id: string, status: User['status']): UserResponse {
    const userIndex = this.users.findIndex(user => user.id === id);
    
    if (userIndex === -1) {
      return {
        success: false,
        errors: [{ field: 'id', message: 'User not found' }]
      };
    }

    this.users[userIndex] = {
      ...this.users[userIndex],
      status,
      updatedAt: new Date()
    };

    return {
      success: true,
      user: this.users[userIndex]
    };
  }

  searchUsers(query: string): User[] {
    if (!query) return this.getAllUsers();
    
    const searchTerm = query.toLowerCase();
    return this.users.filter(user =>
      user.fullName.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm) ||
      user.userid.toLowerCase().includes(searchTerm) ||
      user.phone.includes(searchTerm)
    );
  }
}

export const userStorage = new UserStorage();

export const userService = {
  createUser: (userData: CreateUserRequest): Promise<UserResponse> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(userStorage.createUser(userData));
      }, 500);
    });
  },

  getAllUsers: (): Promise<User[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(userStorage.getAllUsers());
      }, 300);
    });
  },

  searchUsers: (query: string): Promise<User[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(userStorage.searchUsers(query));
      }, 300);
    });
  },

  updateUserStatus: (id: string, status: User['status']): Promise<UserResponse> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(userStorage.updateUserStatus(id, status));
      }, 300);
    });
  },

  checkUserIdAvailability: (userid: string): Promise<{ available: boolean }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const isAvailable = !userStorage.getUserByUserId(userid);
        resolve({ available: isAvailable });
      }, 200);
    });
  }
};
