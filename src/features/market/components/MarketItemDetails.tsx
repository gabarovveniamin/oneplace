import React, { useEffect, useMemo, useState } from 'react';
import {
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    Clock,
    Heart,
    MapPin,
    MessageCircle,
    Share2,
    ShieldCheck,
    ShoppingCart,
    Star,
    Truck,
    User
} from 'lucide-react';
import { Button } from '../../../shared/ui/components/button';
import { Badge } from '../../../shared/ui/components/badge';
import { cn } from '../../../shared/ui/components/utils';
import { useCart } from '../hooks/useCart';
import { authApiService, UserResponse } from '../../../core/api/auth';
import { MarketListing } from '../../../core/api/market';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { toast } from 'sonner';

interface MarketItemDetailsProps {
    item: MarketListing;
    onBack: () => void;
    onChatOpen: (user: { other_user_id: string; first_name: string; last_name: string; avatar?: string }) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
    electronics: 'Электроника',
    services: 'Услуги',
    home: 'Дом и сад',
    fashion: 'Мода',
    hobbies: 'Хобби',
    other: 'Другое'
};

export function MarketItemDetails({ item, onBack, onChatOpen }: MarketItemDetailsProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isFavorite, setIsFavorite] = useState(false);
    const [seller, setSeller] = useState<UserResponse | null>(null);
    const { addToCart, cart } = useCart();

    const inCart = cart.some((cartItem) => cartItem.id === item.id);

    useEffect(() => {
        authApiService.getProfile(item.userId).then(setSeller).catch(console.error);
    }, [item.userId]);

    const images = useMemo(
        () =>
            item.images?.length > 0
                ? item.images
                : ['https://images.unsplash.com/photo-1560393464-5c69a73c5770?auto=format&fit=crop&q=80&w=800'],
        [item.images]
    );

    const postedDate = useMemo(
        () =>
            new Date(item.createdAt).toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            }),
        [item.createdAt]
    );

    const categoryLabel = CATEGORY_LABELS[item.category] || item.category;
    const formattedPrice = `${new Intl.NumberFormat('ru-RU').format(Number(item.price))} ₸`;

    const getPlatformAge = (date?: string) => {
        if (!date) return 'на OnePlace недавно';

        try {
            const distance = formatDistanceToNow(new Date(date), { locale: ru });
            return `на OnePlace ${distance}`;
        } catch {
            return 'на OnePlace недавно';
        }
    };

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const handleContactSeller = () => {
        if (!authApiService.isAuthenticated()) {
            toast.error('Пожалуйста, войдите или зарегистрируйтесь, чтобы написать продавцу');
            return;
        }

        onChatOpen({
            other_user_id: item.userId,
            first_name: item.userFirstName || 'Продавец',
            last_name: item.userLastName || '',
            avatar: item.userAvatar
        });
    };

    const handleAddToCart = () => {
        if (!authApiService.isAuthenticated()) {
            toast.error('Пожалуйста, войдите или зарегистрируйтесь, чтобы добавить товар в корзину');
            return;
        }

        if (!inCart) {
            addToCart(item);
            toast.success('Товар добавлен в корзину');
        }
    };

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            toast.success('Ссылка на объявление скопирована');
        } catch {
            toast.error('Не удалось скопировать ссылку');
        }
    };

    return (
        <div className="min-h-screen bg-background pb-16">
            <section className="relative overflow-hidden pt-8 pb-4 sm:pt-10">
                <div className="absolute top-[-180px] right-[-120px] h-[320px] w-[320px] rounded-full bg-primary/15 blur-[90px]" />
                <div className="absolute bottom-[-180px] left-[-120px] h-[320px] w-[320px] rounded-full bg-primary/10 blur-[90px]" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <Button variant="ghost" onClick={onBack} className="rounded-full px-4 hover:bg-card/80 mb-6">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Назад к маркету
                    </Button>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-start">
                        <div className="space-y-4">
                            <div className="hero-shell rounded-[28px] p-3 sm:p-4">
                                <div className="relative aspect-[4/3] rounded-[20px] overflow-hidden group">
                                    <img
                                        src={images[currentImageIndex]}
                                        alt={item.title}
                                        className="w-full h-full object-cover"
                                    />

                                    {images.length > 1 && (
                                        <>
                                            <button
                                                onClick={prevImage}
                                                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/35 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <ChevronLeft className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={nextImage}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/35 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <ChevronRight className="w-5 h-5" />
                                            </button>
                                        </>
                                    )}

                                    <div className="absolute top-3 right-3 flex gap-2">
                                        <button
                                            onClick={() => {
                                                if (!authApiService.isAuthenticated()) {
                                                    toast.error('Пожалуйста, войдите или зарегистрируйтесь, чтобы добавить в избранное');
                                                    return;
                                                }

                                                setIsFavorite(!isFavorite);
                                            }}
                                            className={cn(
                                                'w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-all active:scale-95',
                                                isFavorite
                                                    ? 'bg-red-500 text-white'
                                                    : 'bg-black/35 text-white hover:bg-black/45'
                                            )}
                                        >
                                            <Heart className={cn('w-5 h-5', isFavorite && 'fill-current')} />
                                        </button>

                                        <button
                                            onClick={handleShare}
                                            className="w-10 h-10 rounded-full bg-black/35 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/45 transition-all"
                                        >
                                            <Share2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {images.length > 1 && (
                                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                                    {images.map((image, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentImageIndex(index)}
                                            className={cn(
                                                'relative w-20 sm:w-24 aspect-square rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0',
                                                currentImageIndex === index
                                                    ? 'border-primary shadow-sm'
                                                    : 'border-transparent opacity-60 hover:opacity-100'
                                            )}
                                        >
                                            <img src={image} alt="" className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="space-y-6 lg:sticky lg:top-24">
                            <div className="hero-shell rounded-[28px] p-6 sm:p-8 space-y-5">
                                <div className="flex flex-wrap items-center gap-3">
                                    <Badge className="rounded-full bg-primary/10 text-primary border border-primary/20 px-4 py-1 font-semibold">
                                        {categoryLabel}
                                    </Badge>

                                    <span className="text-sm text-muted-foreground flex items-center">
                                        <Clock className="w-4 h-4 mr-1.5" />
                                        {postedDate}
                                    </span>
                                </div>

                                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground leading-tight">
                                    {item.title}
                                </h1>

                                <div className="flex flex-wrap items-baseline gap-4">
                                    <span className="text-3xl sm:text-4xl font-black text-foreground">{formattedPrice}</span>
                                    {item.location && (
                                        <span className="text-base text-muted-foreground flex items-center">
                                            <MapPin className="w-4 h-4 mr-1" />
                                            {item.location}
                                        </span>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                    <Button size="lg" onClick={handleContactSeller} className="h-12 rounded-xl font-semibold">
                                        <MessageCircle className="w-4 h-4 mr-2" />
                                        Написать продавцу
                                    </Button>

                                    <Button
                                        size="lg"
                                        variant="outline"
                                        onClick={handleAddToCart}
                                        className={cn(
                                            'h-12 rounded-xl font-semibold',
                                            inCart && 'bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-300'
                                        )}
                                    >
                                        <ShoppingCart className="w-4 h-4 mr-2" />
                                        {inCart ? 'В корзине' : 'Добавить в корзину'}
                                    </Button>
                                </div>

                                <div className="pt-5 border-t border-border flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-12 h-12 rounded-xl bg-muted overflow-hidden shrink-0">
                                            {item.userAvatar ? (
                                                <img src={item.userAvatar} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                                                    <User className="w-5 h-5 text-primary" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="min-w-0">
                                            <div className="font-semibold truncate">
                                                {item.userFirstName || 'Пользователь'} {item.userLastName || ''}
                                            </div>
                                            <div className="text-sm text-muted-foreground flex items-center">
                                                <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500 mr-1" />
                                                4.9 · {seller ? getPlatformAge(seller.createdAt) : 'на OnePlace давно'}
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="rounded-full"
                                        onClick={() => {
                                            window.location.hash = `#profile/${item.userId}`;
                                        }}
                                    >
                                        Профиль
                                    </Button>
                                </div>
                            </div>

                            <div className="rounded-3xl border border-border bg-card p-6">
                                <h3 className="text-xl font-bold mb-3">Описание</h3>
                                <div className="text-base text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                    {item.description}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-green-500/15 text-green-600 flex items-center justify-center">
                                        <ShieldCheck className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="font-semibold">Безопасная сделка</div>
                                        <div className="text-xs text-muted-foreground">Проверка при получении</div>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-600 flex items-center justify-center">
                                        <Truck className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="font-semibold">Доставка OnePlace</div>
                                        <div className="text-xs text-muted-foreground">Быстро по всей сети</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}