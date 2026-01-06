import React, { useState, useEffect } from 'react';
import {
    ArrowLeft,
    Heart,
    MessageCircle,
    ShoppingCart,
    MapPin,
    Tag,
    Share2,
    ShieldCheck,
    Truck,
    Clock,
    User,
    ChevronLeft,
    ChevronRight,
    Star
} from 'lucide-react';
import { Button } from '../../../shared/ui/components/button';
import { Badge } from '../../../shared/ui/components/badge';
import { marketApiService, MarketListing } from '../../../core/api/market';
import { cn } from '../../../shared/ui/components/utils';
import { useCart } from '../hooks/useCart';
import { authApiService, UserResponse } from '../../../core/api/auth';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { toast } from 'sonner';

interface MarketItemDetailsProps {
    item: MarketListing;
    onBack: () => void;
    onChatOpen: (user: { other_user_id: string; first_name: string; last_name: string; avatar?: string }) => void;
}

export function MarketItemDetails({ item, onBack, onChatOpen }: MarketItemDetailsProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isFavorite, setIsFavorite] = useState(false);
    const { addToCart, cart } = useCart();
    const [seller, setSeller] = useState<UserResponse | null>(null);

    const inCart = cart.some(i => i.id === item.id);

    useEffect(() => {
        authApiService.getProfile(item.userId).then(setSeller).catch(console.error);
    }, [item.userId]);

    const getPlatformAge = (date?: string) => {
        if (!date) return 'на OnePlace недавно';
        try {
            const distance = formatDistanceToNow(new Date(date), { locale: ru });
            return `на OnePlace ${distance}`;
        } catch (e) {
            return 'на OnePlace недавно';
        }
    };

    const images = item.images?.length > 0 ? item.images : ['https://images.unsplash.com/photo-1560393464-5c69a73c5770?auto=format&fit=crop&q=80&w=800'];

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

    return (
        <div className="min-h-screen bg-background pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Button
                    variant="ghost"
                    onClick={onBack}
                    className="mb-8 hover:bg-muted"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Назад к маркету
                </Button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Left Column: Images */}
                    <div className="space-y-6">
                        <div className="relative aspect-[4/3] rounded-[40px] overflow-hidden bg-card border border-border group">
                            <img
                                src={images[currentImageIndex]}
                                alt={item.title}
                                className="w-full h-full object-cover"
                            />

                            {images.length > 1 && (
                                <>
                                    <button
                                        onClick={prevImage}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/20 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/40"
                                    >
                                        <ChevronLeft className="w-6 h-6" />
                                    </button>
                                    <button
                                        onClick={nextImage}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/20 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/40"
                                    >
                                        <ChevronRight className="w-6 h-6" />
                                    </button>
                                </>
                            )}

                            <div className="absolute top-6 right-6 flex gap-3">
                                <button
                                    onClick={() => {
                                        if (!authApiService.isAuthenticated()) {
                                            toast.error('Пожалуйста, войдите или зарегистрируйтесь, чтобы добавить в избранное');
                                            return;
                                        }
                                        setIsFavorite(!isFavorite);
                                    }}
                                    className={cn(
                                        "w-12 h-12 rounded-full backdrop-blur-md flex items-center justify-center shadow-lg transition-all active:scale-95",
                                        isFavorite ? "bg-red-500 text-white" : "bg-white/20 text-white hover:bg-white/40"
                                    )}
                                >
                                    <Heart className={cn("w-6 h-6", isFavorite && "fill-current")} />
                                </button>
                                <button className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/40 shadow-lg transition-all">
                                    <Share2 className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {images.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                                {images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentImageIndex(idx)}
                                        className={cn(
                                            "relative w-24 aspect-square rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0",
                                            currentImageIndex === idx ? "border-purple-600 shadow-lg" : "border-transparent opacity-60 hover:opacity-100"
                                        )}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Column: Details */}
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 px-4 py-1 text-sm rounded-full">
                                    {item.category}
                                </Badge>
                                <span className="text-sm text-muted-foreground flex items-center">
                                    <Clock className="w-4 h-4 mr-1.5" />
                                    {new Date(item.createdAt).toLocaleDateString()}
                                </span>
                            </div>

                            <h1 className="text-4xl sm:text-5xl font-black text-foreground tracking-tight leading-tight">
                                {item.title}
                            </h1>

                            <div className="flex items-baseline gap-4">
                                <span className="text-4xl font-black text-purple-600 dark:text-purple-400">
                                    {item.price.toLocaleString()} ₸
                                </span>
                                {item.location && (
                                    <span className="text-lg text-muted-foreground flex items-center">
                                        <MapPin className="w-5 h-5 mr-1" />
                                        {item.location}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Actions Card */}
                        <div className="bg-card rounded-[32px] border border-border p-8 shadow-xl space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Button
                                    size="lg"
                                    onClick={handleContactSeller}
                                    className="h-16 rounded-2xl bg-purple-600 hover:bg-purple-700 text-lg font-bold shadow-lg shadow-purple-600/20"
                                >
                                    <MessageCircle className="w-5 h-5 mr-2" />
                                    Написать
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    onClick={handleAddToCart}
                                    className={cn(
                                        "h-16 rounded-2xl text-lg font-bold border-2 transition-all",
                                        inCart ? "bg-green-50 text-green-600 border-green-200 hover:bg-green-50" : "hover:bg-accent"
                                    )}
                                >
                                    <ShoppingCart className="w-5 h-5 mr-2" />
                                    {inCart ? 'В корзине' : 'В корзину'}
                                </Button>
                            </div>

                            <div className="pt-6 border-t border-border flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-muted overflow-hidden">
                                        {item.userAvatar ? (
                                            <img src={item.userAvatar} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-purple-500/10 flex items-center justify-center">
                                                <User className="w-6 h-6 text-purple-600" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-bold text-lg">{item.userFirstName} {item.userLastName}</div>
                                        <div className="text-sm text-muted-foreground flex items-center">
                                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mr-1" />
                                            4.9 · {seller ? getPlatformAge(seller.createdAt) : 'На OnePlace 2 года'}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="rounded-full hover:text-purple-600"
                                        onClick={handleContactSeller}
                                    >
                                        <MessageCircle className="w-4 h-4 mr-2" />
                                        Написать
                                    </Button>
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
                        </div>

                        {/* Description */}
                        <div className="space-y-4">
                            <h3 className="text-2xl font-bold">Описание</h3>
                            <div className="text-lg text-muted-foreground leading-relaxed whitespace-pre-wrap bg-muted/30 p-8 rounded-[32px] border border-border/50">
                                {item.description}
                            </div>
                        </div>

                        {/* Features / Badges */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-center p-6 bg-green-500/5 rounded-2xl border border-green-500/10">
                                <ShieldCheck className="w-8 h-8 text-green-600 mr-4" />
                                <div>
                                    <div className="font-bold text-green-700">Безопасная сделка</div>
                                    <div className="text-sm text-green-600/80">Проверка товара при получении</div>
                                </div>
                            </div>
                            <div className="flex items-center p-6 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                                <Truck className="w-8 h-8 text-blue-600 mr-4" />
                                <div>
                                    <div className="font-bold text-blue-700">Доставка OnePlace</div>
                                    <div className="text-sm text-blue-600/80">Быстро и надежно по всей сети</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
