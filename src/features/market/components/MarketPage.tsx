import React, { useEffect, useMemo, useState } from 'react';
import {
    ArrowLeft,
    Heart,
    Plus,
    Search,
    ShieldCheck,
    ShoppingBag,
    Sparkles,
    Star,
    Truck
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../../../shared/ui/components/button';
import { cn } from '../../../shared/ui/components/utils';
import { marketApiService, MarketListing } from '../../../core/api/market';
import { toast } from 'sonner';
import { authApiService } from '../../../core/api/auth';
import { MarketCardSkeleton } from './MarketCardSkeleton';

interface Product {
    id: string;
    title: string;
    description: string;
    price: number;
    category: string;
    rating: number;
    image: string;
}

const CATEGORIES = [
    { id: 'all', title: 'Все товары' },
    { id: 'electronics', title: 'Электроника' },
    { id: 'services', title: 'Услуги' },
    { id: 'home', title: 'Дом и сад' },
    { id: 'fashion', title: 'Мода' },
    { id: 'hobbies', title: 'Хобби' }
];

interface MarketPageProps {
    onBack: () => void;
    onPostClick: () => void;
    onItemClick: (item: MarketListing) => void;
}

const CATEGORY_LABELS = CATEGORIES.reduce<Record<string, string>>((acc, category) => {
    acc[category.id] = category.title;
    return acc;
}, {});

const MARKET_FEATURES = [
    { icon: ShieldCheck, title: 'Безопасные сделки', desc: 'Защищенные платежи и возврат средств' },
    { icon: Truck, title: 'Быстрая доставка', desc: 'До двери или в удобные пункты выдачи' },
    { icon: Star, title: 'Проверенные продавцы', desc: 'Рейтинг, отзывы и прозрачная история' }
];

export function MarketPage({ onBack, onPostClick, onItemClick }: MarketPageProps) {
    const handlePostClick = () => {
        if (!authApiService.isAuthenticated()) {
            toast.error('Пожалуйста, войдите или зарегистрируйтесь, чтобы выставить товар');
            return;
        }
        onPostClick();
    };

    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [realListings, setRealListings] = useState<MarketListing[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchListings = async () => {
            try {
                setLoading(true);
                const data = await marketApiService.getListings();
                setRealListings(data);
            } catch (err) {
                console.error('Failed to fetch listings:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchListings();
    }, []);

    const allProducts = useMemo(
        () =>
            realListings.map((listing) => ({
                id: listing.id,
                title: listing.title,
                description: listing.description,
                price: Number(listing.price),
                category: listing.category,
                rating: 5.0,
                image:
                    listing.images?.[0] ||
                    'https://images.unsplash.com/photo-1560393464-5c69a73c5770?auto=format&fit=crop&q=80&w=800'
            })),
        [realListings]
    );

    const filteredProducts = useMemo(
        () =>
            allProducts.filter((product) => {
                const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
                const normalizedQuery = searchQuery.trim().toLowerCase();
                const matchesSearch =
                    normalizedQuery.length === 0 ||
                    product.title.toLowerCase().includes(normalizedQuery) ||
                    product.description.toLowerCase().includes(normalizedQuery);

                return matchesCategory && matchesSearch;
            }),
        [allProducts, selectedCategory, searchQuery]
    );

    const getCategoryLabel = (category: string) => CATEGORY_LABELS[category] || category;
    const formatPrice = (price: number) => `${new Intl.NumberFormat('ru-RU').format(price)} ₸`;

    return (
        <div className="min-h-screen bg-background">
            <section className="relative overflow-hidden pt-10 pb-12 sm:pt-12 sm:pb-14">
                <div className="absolute top-[-180px] right-[-100px] h-[320px] w-[320px] rounded-full bg-primary/15 blur-[90px]" />
                <div className="absolute bottom-[-180px] left-[-120px] h-[320px] w-[320px] rounded-full bg-primary/10 blur-[90px]" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                        <Button
                            variant="ghost"
                            onClick={onBack}
                            className="rounded-full px-4 hover:bg-card/80"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            К сервисам
                        </Button>

                        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/85 px-4 py-2 text-sm text-muted-foreground">
                            <ShoppingBag className="w-4 h-4 text-primary" />
                            {loading ? 'Загрузка каталога...' : `${allProducts.length} объявлений`}
                        </span>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45 }}
                        className="hero-shell rounded-[28px] px-6 py-9 sm:px-10 sm:py-12"
                    >
                        <div className="max-w-5xl mx-auto text-center">
                            <p className="hero-kicker mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2">
                                <Sparkles className="w-3.5 h-3.5" />
                                Единый визуальный стиль OnePlace
                            </p>

                            <h1 className="hero-title text-foreground mb-6 leading-[1.04]">
                                OnePlace <span className="hero-gradient-text">Маркет</span>
                            </h1>

                            <p className="text-base sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
                                Находите товары и услуги в аккуратном каталоге с быстрым поиском и
                                понятной навигацией.
                            </p>

                            <div className="flex flex-col sm:flex-row items-stretch gap-4 sm:gap-4 max-w-4xl mx-auto">
                                <div className="relative flex-1">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <input
                                        type="text"
                                        placeholder="Найти товары, услуги или продавцов..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full h-14 pl-12 pr-5 rounded-full border border-border bg-input/90 text-base focus:ring-2 focus:ring-primary/30 focus:border-primary/40 focus:outline-none transition-all"
                                    />
                                </div>

                                <Button
                                    onClick={handlePostClick}
                                    className="h-14 rounded-full px-7 sm:px-8 font-semibold shadow-md"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Разместить товар
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
                    {MARKET_FEATURES.map((feature) => (
                        <div
                            key={feature.title}
                            className="card-hover rounded-2xl border border-border bg-card p-6 sm:p-7"
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <feature.icon className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-base sm:text-lg text-foreground mb-1.5 leading-tight">{feature.title}</h3>
                                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{feature.desc}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto pt-1 pb-3 no-scrollbar">
                    {CATEGORIES.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            className={cn(
                                'shrink-0 min-h-11 px-6 sm:px-7 py-2.5 sm:py-3 rounded-2xl whitespace-nowrap border transition-all text-base font-semibold leading-none',
                                selectedCategory === category.id
                                    ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/25'
                                    : 'bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'
                            )}
                        >
                            {category.title}
                        </button>
                    ))}
                </div>

                <div className="space-y-8">
                    <div className="flex items-center justify-between gap-4">
                        <h2 className="text-3xl sm:text-4xl font-bold flex items-center leading-tight">
                            {selectedCategory === 'all'
                                ? 'Рекомендуемое для вас'
                                : CATEGORIES.find((category) => category.id === selectedCategory)?.title}
                            <span className="ml-3 text-sm font-semibold text-muted-foreground bg-card border border-border px-3 py-1.5 rounded-full">
                                {loading ? '...' : filteredProducts.length}
                            </span>
                        </h2>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <MarketCardSkeleton key={i} />
                            ))}
                        </div>
                    ) : filteredProducts.length > 0 ? (
                        <motion.div
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: true }}
                            variants={{
                                hidden: { opacity: 0 },
                                show: {
                                    opacity: 1,
                                    transition: {
                                        staggerChildren: 0.1
                                    }
                                }
                            }}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                        >
                            {filteredProducts.map((product) => (
                                <motion.div
                                    key={product.id}
                                    variants={{
                                        hidden: { opacity: 0, y: 24 },
                                        show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } }
                                    }}
                                    onClick={() => {
                                        const listing = realListings.find((l) => l.id === product.id);
                                        if (listing) onItemClick(listing);
                                    }}
                                    className="group card-hover bg-card rounded-3xl border border-border overflow-hidden cursor-pointer"
                                >
                                    <div className="relative aspect-[4/3] overflow-hidden">
                                        <img
                                            src={product.image}
                                            alt={product.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute top-4 left-4 flex gap-2">
                                            <span className="px-3 py-1 bg-black/35 backdrop-blur-md text-white text-[10px] font-bold rounded-full uppercase">
                                                {getCategoryLabel(product.category)}
                                            </span>
                                        </div>
                                        <button
                                            className="absolute top-4 right-4 w-9 h-9 bg-black/35 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/85 hover:text-red-500 transition-colors"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <Heart className="w-5 h-5" />
                                        </button>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                            <Button
                                                className="w-full rounded-xl bg-white/95 text-slate-900 hover:bg-white font-semibold"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const listing = realListings.find((l) => l.id === product.id);
                                                    if (listing) onItemClick(listing);
                                                }}
                                            >
                                                Открыть карточку
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="p-6 space-y-3">
                                        <div className="flex items-start justify-between">
                                            <h3 className="font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                                                {product.title}
                                            </h3>
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-2 min-h-[44px] leading-relaxed">
                                            {product.description}
                                        </p>
                                        <div className="flex items-center justify-between pt-2">
                                            <div className="space-y-1">
                                                <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Цена</div>
                                                <div className="text-xl font-black text-foreground">
                                                    {formatPrice(product.price)}
                                                </div>
                                            </div>
                                            <div className="flex items-center bg-muted/60 px-2.5 py-1 rounded-lg">
                                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mr-1" />
                                                <span className="text-sm font-bold">{product.rating}</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <div className="text-center py-20 border-2 border-dashed border-border rounded-3xl">
                            <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                            <h3 className="text-xl font-semibold text-foreground">Ничего не найдено</h3>
                            <p className="text-muted-foreground">Попробуйте изменить параметры поиска или категорию</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
