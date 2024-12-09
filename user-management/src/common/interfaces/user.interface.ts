import { Role } from '../../users/entities/role.enum';

export interface User {
  id: number;
  username: string;
  email: string;
  roles: Role[];
}