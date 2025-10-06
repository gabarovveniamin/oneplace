import { query } from '../config/database';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: 'user' | 'employer' | 'admin';
  isEmailVerified: boolean;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: 'user' | 'employer' | 'admin';
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
}

export class UserModel {
  // Создание пользователя
  static async create(userData: CreateUserData): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    
    const result = await query(
      `INSERT INTO users (email, password, first_name, last_name, phone, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, first_name, last_name, phone, avatar, role, 
                 is_email_verified, is_active, last_login, created_at, updated_at`,
      [
        userData.email,
        hashedPassword,
        userData.firstName,
        userData.lastName,
        userData.phone,
        userData.role || 'user'
      ]
    );

    return this.mapRowToUser(result.rows[0]);
  }

  // Поиск пользователя по email
  static async findByEmail(email: string, includePassword = false): Promise<User | null> {
    const passwordField = includePassword ? 'password, ' : '';
    const result = await query(
      `SELECT id, ${passwordField}email, first_name, last_name, phone, avatar, role,
              is_email_verified, is_active, last_login, created_at, updated_at
       FROM users 
       WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToUser(result.rows[0]);
  }

  // Поиск пользователя по ID
  static async findById(id: string): Promise<User | null> {
    const result = await query(
      `SELECT id, email, first_name, last_name, phone, avatar, role,
              is_email_verified, is_active, last_login, created_at, updated_at
       FROM users 
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToUser(result.rows[0]);
  }

  // Обновление пользователя
  static async update(id: string, userData: UpdateUserData): Promise<User | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (userData.firstName !== undefined) {
      fields.push(`first_name = $${paramCount++}`);
      values.push(userData.firstName);
    }
    if (userData.lastName !== undefined) {
      fields.push(`last_name = $${paramCount++}`);
      values.push(userData.lastName);
    }
    if (userData.phone !== undefined) {
      fields.push(`phone = $${paramCount++}`);
      values.push(userData.phone);
    }
    if (userData.avatar !== undefined) {
      fields.push(`avatar = $${paramCount++}`);
      values.push(userData.avatar);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const result = await query(
      `UPDATE users 
       SET ${fields.join(', ')}
       WHERE id = $${paramCount}
       RETURNING id, email, first_name, last_name, phone, avatar, role,
                 is_email_verified, is_active, last_login, created_at, updated_at`,
      values
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToUser(result.rows[0]);
  }

  // Обновление пароля
  static async updatePassword(id: string, newPassword: string): Promise<boolean> {
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    const result = await query(
      'UPDATE users SET password = $1 WHERE id = $2',
      [hashedPassword, id]
    );

    return result.rowCount > 0;
  }

  // Обновление времени последнего входа
  static async updateLastLogin(id: string): Promise<void> {
    await query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );
  }

  // Сравнение пароля
  static async comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  // Проверка существования пользователя по email
  static async existsByEmail(email: string): Promise<boolean> {
    const result = await query(
      'SELECT 1 FROM users WHERE email = $1',
      [email]
    );

    return result.rows.length > 0;
  }

  // Маппинг строки БД в объект User
  private static mapRowToUser(row: any): User {
    return {
      id: row.id,
      email: row.email,
      password: row.password,
      firstName: row.first_name,
      lastName: row.last_name,
      phone: row.phone,
      avatar: row.avatar,
      role: row.role,
      isEmailVerified: row.is_email_verified,
      isActive: row.is_active,
      lastLogin: row.last_login,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}