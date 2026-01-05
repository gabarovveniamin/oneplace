import React, { useState, useEffect } from 'react';
import {
    Search,
    ShoppingBag,
    ChevronRight,
    Star,
    ShieldCheck,
    Truck,
    ArrowLeft,
    Filter,
    Tag,
    Clock,
    Heart,
    Plus
} from 'lucide-react';
import { Button } from '../../../shared/ui/components/button';
import { cn } from '../../../shared/ui/components/utils';
import { marketApiService, MarketListing } from '../../../core/api/market';

interface Product {
    id: string;
    title: string;
    description: string;
    price: number;
    category: string;
    rating: number;
    reviews: number;
    image: string;
    isHot?: boolean;
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
}

export function MarketPage({ onBack, onPostClick }: MarketPageProps) {
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

    const allProducts = realListings.map(l => ({
        id: l.id,
        title: l.title,
        description: l.description,
        price: Number(l.price),
        category: l.category,
        rating: 5.0,
        reviews: 0,
        image: l.images?.[0] || 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?auto=format&fit=crop&q=80&w=800', // Generic product placeholder
        isHot: false
    }));

    const filteredProducts = allProducts.filter(p => {
        const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
        const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-background">
            {/* Header / Hero */}
            <div className="relative h-[400px] overflow-hidden bg-purple-900 flex items-center justify-center pt-20 px-4">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=2000"
                        alt="Market Hero"
                        className="w-full h-full object-cover opacity-30 mix-blend-overlay"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-purple-950/50 via-background/20 to-background" />
                </div>

                <div className="relative z-10 max-w-4xl w-full text-center space-y-8">
                    <div className="space-y-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onBack}
                            className="bg-white/10 hover:bg-white/20 text-white border-0 backdrop-blur-md mb-4"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Вернуться в хаб
                        </Button>
                        <h1 className="text-4xl sm:text-6xl font-bold text-white tracking-tight">
                            OnePlace <span className="text-purple-400">Маркет</span>
                        </h1>
                        <p className="text-lg text-purple-100/80 max-w-2xl mx-auto">
                            Современный маркетплейс для покупки и продажи товаров и цифровых услуг
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-2xl mx-auto">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Найти товары, услуги или авторов..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-14 pl-12 pr-4 bg-background/80 backdrop-blur-xl border border-white/10 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:outline-none text-foreground shadow-2xl transition-all"
                            />
                        </div>
                        <Button
                            onClick={onPostClick}
                            className="h-14 px-8 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-xl shadow-purple-600/20 whitespace-nowrap"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Продать
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 space-y-12">
                {/* Stats / Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { icon: ShieldCheck, title: 'Безопасные сделки', desc: 'Гарантия возврата средств' },
                        { icon: Truck, title: 'Быстрая доставка', desc: 'До двери или в пункты выдачи' },
                        { icon: Star, title: 'Проверенные продавцы', desc: 'Только качественные товары' }
                    ].map((feature, i) => (
                        <div key={i} className="flex items-center p-6 bg-card rounded-2xl border border-border shadow-sm group hover:border-purple-500/50 transition-colors">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                                <feature.icon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground">{feature.title}</h3>
                                <p className="text-sm text-muted-foreground">{feature.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Categories */}
                <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={cn(
                                "px-6 py-2 rounded-full whitespace-nowrap transition-all border",
                                selectedCategory === cat.id
                                    ? "bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-600/20"
                                    : "bg-card text-muted-foreground border-border hover:border-purple-500/50 hover:text-foreground"
                            )}
                        >
                            {cat.title}
                        </button>
                    ))}
                </div>

                {/* Products Grid */}
                <div className="space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold flex items-center">
                            {selectedCategory === 'all' ? 'Рекомендуемое для вас' : CATEGORIES.find(c => c.id === selectedCategory)?.title}
                            <span className="ml-3 text-sm font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                {loading ? '...' : filteredProducts.length}
                            </span>
                        </h2>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 animate-pulse text-center">
                            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mb-4">
                                <ShoppingBag className="w-8 h-8 text-purple-600/40" />
                            </div>
                            <div className="h-4 w-48 bg-muted rounded-full mb-3 mx-auto" />
                            <div className="h-3 w-32 bg-muted/60 rounded-full mx-auto" />
                        </div>
                    ) : filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {filteredProducts.map(product => (
                                <div key={product.id} className="group bg-card rounded-3xl border border-border overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                                    <div className="relative aspect-[4/3] overflow-hidden">
                                        <img
                                            src={product.image}
                                            alt={product.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute top-4 left-4 flex gap-2">
                                            {product.isHot && (
                                                <span className="px-3 py-1 bg-red-500 text-white text-[10px] font-bold rounded-full uppercase flex items-center">
                                                    🔥 Хит
                                                </span>
                                            )}
                                            <span className="px-3 py-1 bg-white/10 backdrop-blur-md text-white text-[10px] font-bold rounded-full uppercase">
                                                {product.category}
                                            </span>
                                        </div>
                                        <button className="absolute top-4 right-4 w-9 h-9 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white hover:text-red-500 transition-colors">
                                            <Heart className="w-5 h-5" />
                                        </button>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                            <Button className="w-full bg-white text-black hover:bg-white/90 font-bold">
                                                Посмотреть
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="p-6 space-y-3">
                                        <div className="flex items-start justify-between">
                                            <h3 className="font-bold text-foreground line-clamp-1 group-hover:text-purple-600 transition-colors">
                                                {product.title}
                                            </h3>
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
                                            {product.description}
                                        </p>
                                        <div className="flex items-center justify-between pt-2">
                                            <div className="space-y-1">
                                                <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Цена</div>
                                                <div className="text-xl font-black text-foreground">
                                                    {product.price.toLocaleString()} ₽
                                                </div>
                                            </div>
                                            <div className="flex items-center bg-muted/50 px-2 py-1 rounded-lg">
                                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mr-1" />
                                                <span className="text-sm font-bold">{product.rating}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 border-2 border-dashed border-border rounded-3xl">
                            <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                            <h3 className="text-xl font-semibold text-foreground">Ничего не найдено</h3>
                            <p className="text-muted-foreground">Попробуйте изменить параметры поиска или категорию</p>
                        </div>
                    )}
                </div>

                {/* Seller CTA */}
                <div className="relative rounded-[40px] overflow-hidden bg-gradient-to-r from-purple-600 to-indigo-700 p-8 sm:p-12 text-white">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="space-y-4 max-w-xl text-center md:text-left">
                            <h2 className="text-3xl sm:text-4xl font-bold">Стань продавцом на OnePlace</h2>
                            <p className="text-purple-100/80">Разместите свои товары или услуги и начните зарабатывать. Комиссия 0% на первые 10 сделок.</p>
                            <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-2">
                                <div className="flex items-center text-sm font-medium bg-white/10 px-4 py-2 rounded-full border border-white/20">
                                    <Tag className="w-4 h-4 mr-2" /> Низкие комиссии
                                </div>
                                <div className="flex items-center text-sm font-medium bg-white/10 px-4 py-2 rounded-full border border-white/20">
                                    <Clock className="w-4 h-4 mr-2" /> Быстрые выплаты
                                </div>
                            </div>
                        </div>
                        <Button
                            size="lg"
                            onClick={onPostClick}
                            className="bg-white text-purple-700 hover:bg-purple-50 h-16 px-12 text-lg font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all"
                        >
                            Создать объявление
                        </Button>
                    </div>
                </div>
            </div>

            {/* Simple Footer */}
            <footer className="border-t border-border mt-20 py-12">
                <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-muted-foreground">
                    <div>© 2024 OnePlace Market. Часть экосистемы OnePlace.</div>
                    <div className="flex gap-8">
                        <a href="#" className="hover:text-foreground transition-colors">Помощь</a>
                        <a href="#" className="hover:text-foreground transition-colors">Правила</a>
                        <a href="#" className="hover:text-foreground transition-colors">Конфиденциальность</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
