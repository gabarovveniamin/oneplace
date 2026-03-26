import { query } from '../config/database';

export type ServicePricingType = 'hourly' | 'fixed' | 'monthly';
export type ServiceExperienceLevel = 'junior' | 'middle' | 'senior';
export type ServiceStatus = 'active' | 'paused';

export interface ServiceListing {
    id: string;
    userId: string;
    title: string;
    description: string;
    category: string;
    price: number;
    pricingType: ServicePricingType;
    experienceLevel: ServiceExperienceLevel;
    tags: string[];
    location?: string;
    portfolioUrl?: string;
    status: ServiceStatus;
    views: number;
    createdAt: Date;
    updatedAt: Date;
    userFirstName?: string;
    userLastName?: string;
    userAvatar?: string;
}

export interface CreateServiceData {
    userId: string;
    title: string;
    description: string;
    category: string;
    price: number;
    pricingType?: ServicePricingType;
    experienceLevel?: ServiceExperienceLevel;
    tags?: string[];
    location?: string;
    portfolioUrl?: string;
}

interface ServiceListingRow {
    id: string;
    user_id: string;
    title: string;
    description: string;
    category: string;
    price: string | number;
    pricing_type: ServicePricingType;
    experience_level: ServiceExperienceLevel;
    tags: unknown;
    location: string | null;
    portfolio_url: string | null;
    status: ServiceStatus;
    views: number;
    created_at: Date;
    updated_at: Date;
    first_name?: string;
    last_name?: string;
    avatar?: string;
}

export class ServiceListingModel {
    static async create(data: CreateServiceData): Promise<ServiceListing> {
        const result = await query<{ id: string }>(
            `INSERT INTO service_listings (user_id, title, description, category, price, pricing_type, experience_level, tags, location, portfolio_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id`,
            [
                data.userId,
                data.title,
                data.description,
                data.category,
                data.price,
                data.pricingType || 'hourly',
                data.experienceLevel || 'middle',
                JSON.stringify(data.tags || []),
                data.location || null,
                data.portfolioUrl || null
            ]
        );

        const listing = await this.findById(result.rows[0].id);
        if (!listing) throw new Error('Failed to create service listing');
        return listing;
    }

    static async findById(id: string): Promise<ServiceListing | null> {
        const result = await query<ServiceListingRow>(
            `SELECT s.*, u.first_name, u.last_name, u.avatar
       FROM service_listings s
       JOIN users u ON s.user_id = u.id
       WHERE s.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return null;
        }

        return this.mapRow(result.rows[0]);
    }

    static async findAll(filters: { category?: string; userId?: string } = {}): Promise<ServiceListing[]> {
        let sql = `
      SELECT s.*, u.first_name, u.last_name, u.avatar
      FROM service_listings s
      JOIN users u ON s.user_id = u.id
      WHERE s.status = 'active'
    `;
        const params: string[] = [];

        if (filters.category) {
            params.push(filters.category);
            sql += ` AND s.category = $${params.length}`;
        }

        if (filters.userId) {
            params.push(filters.userId);
            sql += ` AND s.user_id = $${params.length}`;
        }

        sql += ' ORDER BY s.created_at DESC';

        const result = await query<ServiceListingRow>(sql, params);
        return result.rows.map((row) => this.mapRow(row));
    }

    static async findByUserId(userId: string): Promise<ServiceListing[]> {
        const result = await query<ServiceListingRow>(
            `SELECT s.*, u.first_name, u.last_name, u.avatar
       FROM service_listings s
       JOIN users u ON s.user_id = u.id
       WHERE s.user_id = $1
       ORDER BY s.created_at DESC`,
            [userId]
        );

        return result.rows.map((row) => this.mapRow(row));
    }

    static async delete(id: string, userId: string): Promise<boolean> {
        const result = await query('DELETE FROM service_listings WHERE id = $1 AND user_id = $2', [id, userId]);
        return result.rowCount > 0;
    }

    private static mapRow(row: ServiceListingRow): ServiceListing {
        return {
            id: row.id,
            userId: row.user_id,
            title: row.title,
            description: row.description,
            category: row.category,
            price: Number(row.price),
            pricingType: row.pricing_type,
            experienceLevel: row.experience_level,
            tags: Array.isArray(row.tags) ? (row.tags as string[]) : JSON.parse((row.tags as string) || '[]'),
            location: row.location || undefined,
            portfolioUrl: row.portfolio_url || undefined,
            status: row.status,
            views: row.views,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at),
            userFirstName: row.first_name,
            userLastName: row.last_name,
            userAvatar: row.avatar
        };
    }
}