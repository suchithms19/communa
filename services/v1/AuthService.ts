import { IUser, IUserCreate } from "@interfaces/v1/user";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Env from "@loaders/v1/Env";
import UserService from "./UserService";

class AuthService {
  static async findUserByEmail(email: string) {
    return UserService.getByEmailWithPassword(email);
  }

  static async createUser(userData: IUserCreate) {
    return UserService.create(userData);
  }

  static async verifyPassword(plainPassword: string, hashedPassword: string) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  static generateToken(user: any): string {
    const secret = Env.variable.JWT_SECRET || 'your-secret-key';
    const expiresIn = Env.variable.JWT_EXPIRY || '1d';
    
    return jwt.sign(
      { id: user.id },
      secret as jwt.Secret,
      { expiresIn: expiresIn as jwt.SignOptions['expiresIn'] }
    );
  }

  static async findUserById(id: number) {
    return UserService.getUserWithPassword(id);
  }
}

export default AuthService; 