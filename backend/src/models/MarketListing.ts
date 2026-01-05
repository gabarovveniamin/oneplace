import { query } from '../config/database';

export interface MarketListing {
    id: string;
    userId: string;
    title: string;
    description: string;
    price: number;
    category: string;
    images: string[];
    location?: string;
    status: 'active' | 'sold' | 'hidden';
    views: number;
    createdAt: Date;
    updatedAt: Date;
    // Join fields
    userFirstName?: string;
    userLastName?: string;
    userAvatar?: string;
}

export interface CreateListingData {
    userId: string;
    title: string;
    description: string;
    price: number;
    category: string;
    images?: string[];
    location?: string;
}

export class MarketListingModel {
    static async create(data: CreateListingData): Promise<MarketListing> {
        const result = await query(
            `INSERT INTO market_listings (user_id, title, description, price, category, images, location)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
            [
                data.userId,
                data.title,
                data.description,
                data.price,
                data.category,
                JSON.stringify(data.images || []),
                data.location || null
            ]
        );

        const listing = await this.findById(result.rows[0].id);
        if (!listing) throw new Error('Failed to create market listing');
        return listing;
    }

    static async findById(id: string): Promise<MarketListing | null> {
        const result = await query(
            `SELECT m.*, u.first_name, u.last_name, u.avatar
       FROM market_listings m
       JOIN users u ON m.user_id = u.id
       WHERE m.id = $1`,
            [id]
        );

        if (result.rows.length === 0) return null;
        return this.mapRow(result.rows[0]);
    }

    static async findAll(filters: { category?: string; userId?: string } = {}): Promise<MarketListing[]> {
        let sql = `
      SELECT m.*, u.first_name, u.last_name, u.avatar
      FROM market_listings m
      JOIN users u ON m.user_id = u.id
      WHERE m.status = 'active'
    `;
        const params: any[] = [];

        if (filters.category) {
            params.push(filters.category);
            sql += ` AND m.category = $${params.length}`;
        }

        if (filters.userId) {
            params.push(filters.userId);
            sql += ` AND m.user_id = $${params.length}`;
        }

        sql += ` ORDER BY m.created_at DESC`;

        const result = await query(sql, params);
        return result.rows.map(row => this.mapRow(row));
    }

    static async findByUserId(userId: string): Promise<MarketListing[]> {
        const result = await query(
            `SELECT m.*, u.first_name, u.last_name, u.avatar
       FROM market_listings m
       JOIN users u ON m.user_id = u.id
       WHERE m.user_id = $1
       ORDER BY m.created_at DESC`,
            [userId]
        );

        return result.rows.map(row => this.mapRow(row));
    }

    static async delete(id: string, userId: string): Promise<boolean> {
        const result = await query(
            'DELETE FROM market_listings WHERE id = $1 AND user_id = $2',
            [id, userId]
        );
        return result.rowCount > 0;
    }

    private static mapRow(row: any): MarketListing {
        return {
            id: row.id,
            userId: row.user_id,
            title: row.title,
            description: row.description,
            price: Number(row.price),
            category: row.category,
            images: Array.isArray(row.images) ? row.images : JSON.parse(row.images || '[]'),
            location: row.location,
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
