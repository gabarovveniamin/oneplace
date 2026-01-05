import React, { useState, useEffect } from 'react';
import {
    ShoppingBag,
    Plus,
    Trash2,
    ExternalLink,
    Clock,
    Tag,
    AlertCircle
} from 'lucide-react';
import { Button } from '../../../shared/ui/components/button';
import { marketApiService, MarketListing } from '../../../core/api/market';
import { Card, CardContent } from '../../../shared/ui/components/card';
import { Alert, AlertDescription } from '../../../shared/ui/components/alert';

interface MarketSectionProps {
    userId: string;
    isOwnProfile: boolean;
    onPostClick?: () => void;
}

export function MarketSection({ userId, isOwnProfile, onPostClick }: MarketSectionProps) {
    const [listings, setListings] = useState<MarketListing[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadListings();
    }, [userId]);

    const loadListings = async () => {
        try {
            setLoading(true);
            const data = await marketApiService.getUserListings(userId);
            setListings(data);
        } catch (err: any) {
            setError('Не удалось загрузить объявления');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Вы уверены, что хотите удалить это объявление?')) return;

        try {
            await marketApiService.deleteListing(id);
            setListings(prev => prev.filter(l => l.id !== id));
        } catch (err: any) {
            alert('Ошибка при удалении');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Объявления на Маркете</h2>
                    <p className="text-muted-foreground">
                        {isOwnProfile ? 'Ваши товары и услуги' : 'Товары и услуги пользователя'}
                    </p>
                </div>
                {isOwnProfile && (
                    <Button
                        onClick={onPostClick}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Разместить товар
                    </Button>
                )}
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {listings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {listings.map(listing => (
                        <Card key={listing.id} className="overflow-hidden group hover:shadow-md transition-all border-border/50">
                            <CardContent className="p-0 flex h-32">
                                <div className="w-32 h-full bg-muted flex-shrink-0">
                                    {listing.images && listing.images.length > 0 ? (
                                        <img
                                            src={listing.images[0]}
                                            alt={listing.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                                            <ShoppingBag className="w-8 h-8" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 p-4 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-foreground line-clamp-1">{listing.title}</h3>
                                            <div className="text-lg font-black text-purple-600">
                                                {listing.price.toLocaleString()} ₸
                                            </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                            {listing.description}
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                                            <span className="flex items-center">
                                                <Tag className="w-3 h-3 mr-1" />
                                                {listing.category}
                                            </span>
                                            <span className="flex items-center">
                                                <Clock className="w-3 h-3 mr-1" />
                                                {new Date(listing.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            {isOwnProfile && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-500 hover:bg-red-50"
                                                    onClick={() => handleDelete(listing.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-muted/20 rounded-3xl border-2 border-dashed border-border">
                    <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                    <h3 className="text-xl font-semibold text-foreground">Объявлений пока нет</h3>
                    <p className="text-muted-foreground mt-1">
                        {isOwnProfile
                            ? 'Вы еще не разместили ни одного товара на Маркете'
                            : 'У пользователя пока нет активных объявлений'}
                    </p>
                    {isOwnProfile && (
                        <Button
                            variant="outline"
                            className="mt-6 border-purple-200 text-purple-600 hover:bg-purple-50"
                            onClick={onPostClick}
                        >
                            Разместить первое объявление
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
