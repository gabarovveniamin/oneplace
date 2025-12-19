import React, { useEffect, useState } from 'react';
import { Job } from '../../../shared/types/job';
import { favoritesApiService } from '../../../core/api/favorites';
import { JobsList } from '../../jobs/components/JobsList';
import { Card, CardContent, CardHeader, CardTitle } from "../../../shared/ui/components/card";

interface FavoritesSectionProps {
    onJobClick: (job: Job) => void;
}

export function FavoritesSection({ onJobClick }: FavoritesSectionProps) {
    const [favorites, setFavorites] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFavorites();
    }, []);

    const loadFavorites = async () => {
        try {
            setLoading(true);
            const data = await favoritesApiService.getFavorites();
            setFavorites(data);
        } catch (error) {
            console.error('Failed to load favorites', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="shadow-sm mt-8">
            <CardHeader>
                <CardTitle>Избранные вакансии</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <JobsList
                    jobs={favorites}
                    loading={loading}
                    onJobClick={onJobClick}
                />
            </CardContent>
        </Card>
    );
}
