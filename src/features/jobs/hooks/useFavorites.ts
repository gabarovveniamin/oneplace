import React, { useState, useEffect, useCallback } from 'react';
import { favoritesApiService } from '../../../core/api/favorites';
import { authApiService } from '../../../core/api/auth';

export const useFavorites = () => {
    const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(false);

    const fetchFavorites = useCallback(async () => {
        if (!authApiService.isAuthenticated()) return;

        try {
            const ids = await favoritesApiService.getFavoriteIds();
            setFavoriteIds(new Set(ids));
        } catch (error) {
            console.error('Failed to fetch favorites', error);
        }
    }, []);

    useEffect(() => {
        fetchFavorites();
    }, [fetchFavorites]);

    const toggleFavorite = async (jobId: string, e?: React.MouseEvent) => {
        e?.stopPropagation(); // Prevent card click

        if (!authApiService.isAuthenticated()) {
            alert('Please log in to add favorites');
            return;
        }

        // Optimistic update
        const isFavorite = favoriteIds.has(jobId);
        setFavoriteIds(prev => {
            const next = new Set(prev);
            if (isFavorite) {
                next.delete(jobId);
            } else {
                next.add(jobId);
            }
            return next;
        });

        try {
            if (isFavorite) {
                await favoritesApiService.removeFromFavorites(jobId);
            } else {
                await favoritesApiService.addToFavorites(jobId);
            }
        } catch (error) {
            console.error('Failed to update favorite', error);
            // Revert on error
            setFavoriteIds(prev => {
                const next = new Set(prev);
                if (isFavorite) {
                    next.add(jobId);
                } else {
                    next.delete(jobId);
                }
                return next;
            });
        }
    };

    const isFavorite = (jobId: string) => favoriteIds.has(jobId);

    return {
        favoriteIds,
        loading,
        toggleFavorite,
        isFavorite,
        refreshFavorites: fetchFavorites
    };
};
