import { query } from '../config/database';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

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
  orgName?: string;
  orgIndustry?: string;
  orgLocation?: string;
  orgDescription?: string;
  orgWebsite?: string;
  orgEmail?: string;
  orgPhone?: string;
  orgLogo?: string;
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
  orgName?: string;
  orgIndustry?: string;
  orgLocation?: string;
  orgDescription?: string;
  orgWebsite?: string;
  orgEmail?: string;
  orgPhone?: string;
  orgLogo?: string;
}

// Генерация UUID для SQLite
const generateId = (): string => {
  return randomBytes(16).toString('hex');
};

export class UserModel {
  // Создание пользователя
  static async create(userData: CreateUserData): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    const result = await query(
      `INSERT INTO users (email, password, first_name, last_name, phone, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        userData.email,
        hashedPassword,
        userData.firstName,
        userData.lastName,
        userData.phone || null,
        userData.role || 'user'
      ]
    );

    const id = result.rows[0].id;

    // Получаем созданного пользователя
    const user = await this.findById(id);
    if (!user) throw new Error('Failed to create user');
    return user;
  }

  // Поиск пользователя по email
  static async findByEmail(email: string, includePassword = false): Promise<User | null> {
    const passwordField = includePassword ? 'password, ' : '';
    const result = await query(
      `SELECT id, ${passwordField}email, first_name, last_name, phone, avatar, role,
              is_email_verified, is_active, last_login, created_at, updated_at,
              org_name, org_industry, org_location, org_description, 
              org_website, org_email, org_phone, org_logo
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
              is_email_verified, is_active, last_login, created_at, updated_at,
              org_name, org_industry, org_location, org_description, 
              org_website, org_email, org_phone, org_logo
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

    const fields: string[] = [];
    const values: (string | number | boolean | null)[] = [];

    if (userData.firstName !== undefined) {
      fields.push(`first_name = $${fields.length + 1}`);
      values.push(userData.firstName);
    }
    if (userData.lastName !== undefined) {
      fields.push(`last_name = $${fields.length + 1}`);
      values.push(userData.lastName);
    }
    if (userData.phone !== undefined) {
      fields.push(`phone = $${fields.length + 1}`);
      values.push(userData.phone);
    }
    if (userData.avatar !== undefined) {
      fields.push(`avatar = $${fields.length + 1}`);
      values.push(userData.avatar);
    }
    if (userData.orgName !== undefined) {
      fields.push(`org_name = $${fields.length + 1}`);
      values.push(userData.orgName);
    }
    if (userData.orgIndustry !== undefined) {
      fields.push(`org_industry = $${fields.length + 1}`);
      values.push(userData.orgIndustry);
    }
    if (userData.orgLocation !== undefined) {
      fields.push(`org_location = $${fields.length + 1}`);
      values.push(userData.orgLocation);
    }
    if (userData.orgDescription !== undefined) {
      fields.push(`org_description = $${fields.length + 1}`);
      values.push(userData.orgDescription);
    }
    if (userData.orgWebsite !== undefined) {
      fields.push(`org_website = $${fields.length + 1}`);
      values.push(userData.orgWebsite);
    }
    if (userData.orgEmail !== undefined) {
      fields.push(`org_email = $${fields.length + 1}`);
      values.push(userData.orgEmail);
    }
    if (userData.orgPhone !== undefined) {
      fields.push(`org_phone = $${fields.length + 1}`);
      values.push(userData.orgPhone);
    }
    if (userData.orgLogo !== undefined) {
      fields.push(`org_logo = $${fields.length + 1}`);
      values.push(userData.orgLogo);
    }

    // Always update updated_at
    fields.push("updated_at = CURRENT_TIMESTAMP");

    if (fields.length === 1) { // Only updated_at
      console.log('No fields to update, returning existing user');
      return this.findById(id);
    }

    values.push(id);
    const sql = `UPDATE users 
       SET ${fields.join(', ')}
       WHERE id = $${values.length}`;

    await query(sql, values);

    return this.findById(id);
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
      "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1",
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

  // Получить всех пользователей (для админки)
  static async findAll(): Promise<User[]> {
    const result = await query(
      `SELECT id, email, first_name, last_name, phone, avatar, role,
              is_email_verified, is_active, last_login, created_at, updated_at,
              org_name, org_industry, org_location, org_description, 
              org_website, org_email, org_phone, org_logo
       FROM users
       ORDER BY created_at DESC`
    );

    return result.rows.map(row => this.mapRowToUser(row));
  }

  // Удалить пользователя (для админки)
  static async delete(id: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM users WHERE id = $1',
      [id]
    );
    return result.rowCount > 0;
  }

  // Маппинг строки БД в объект User
  private static mapRowToUser(row: Record<string, any>): User {
    return {
      id: row.id,
      email: row.email,
      password: row.password,
      firstName: row.first_name,
      lastName: row.last_name,
      phone: row.phone,
      avatar: row.avatar,
      role: row.role,
      isEmailVerified: Boolean(row.is_email_verified),
      isActive: Boolean(row.is_active),
      lastLogin: row.last_login ? new Date(row.last_login) : undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      orgName: row.org_name,
      orgIndustry: row.org_industry,
      orgLocation: row.org_location,
      orgDescription: row.org_description,
      orgWebsite: row.org_website,
      orgEmail: row.org_email,
      orgPhone: row.org_phone,
      orgLogo: row.org_logo,
    };
  }
}
