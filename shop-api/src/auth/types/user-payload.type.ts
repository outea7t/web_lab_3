import { UserRole } from '../../users/user.model';

export interface UserPayload {
  id: number;
  email: string;
  role: UserRole;
}
