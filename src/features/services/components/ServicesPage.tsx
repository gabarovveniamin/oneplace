import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, BriefcaseBusiness, Plus, Search, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../../../shared/ui/components/button';
import { cn } from '../../../shared/ui/components/utils';
import { ServiceListing, servicesApiService } from '../../../core/api/services';
import { authApiService } from '../../../core/api/auth';
import { toast } from 'sonner';

interface ServicesPageProps {
    onBack: () => void;
    onPostClick: () => void;
    onItemClick: (item: ServiceListing) => void;
}

const CATEGORIES = [
    { id: 'all', title: 'Все услуги' },
    { id: 'design', title: 'Дизайн' },
    { id: 'development', title: 'Разработка' },
    { id: 'marketing', title: 'Маркетинг' },
    { id: 'copywriting', title: 'Тексты' },
    { id: 'analytics', title: 'Аналитика' },
    { id: 'consulting', title: 'Консалтинг' },
    { id: 'other', title: 'Другое' }
];

const EXPERIENCE_LABELS: Record<string, string> = {
    junior: 'Junior',
    middle: 'Middle',
    senior: 'Senior'
};

const PRICING_LABELS: Record<string, string> = {
    hourly: 'в час',
    fixed: 'за проект',
    monthly: 'в месяц'
};

const CATEGORY_LABELS = CATEGORIES.reduce<Record<string, string>>((acc, category) => {
    acc[category.id] = category.title;
    return acc;
}, {});

export function ServicesPage({ onBack, onPostClick, onItemClick }: ServicesPageProps) {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [services, setServices] = useState<ServiceListing[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                setLoading(true);
                const data = await servicesApiService.getServices();
                setServices(data);
            } catch (error) {
                console.error('Failed to fetch services:', error);
                toast.error('Не удалось загрузить услуги');
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
    }, []);

    const filteredServices = useMemo(() => {
        return services.filter((service) => {
            const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
            const q = searchQuery.trim().toLowerCase();
            const matchesSearch =
                q.length === 0 ||
                service.title.toLowerCase().includes(q) ||
                service.description.toLowerCase().includes(q) ||
                service.tags.some((tag) => tag.toLowerCase().includes(q));

            return matchesCategory && matchesSearch;
        });
    }, [services, selectedCategory, searchQuery]);

    const handlePostClick = () => {
        if (!authApiService.isAuthenticated()) {
            toast.error('Пожалуйста, войдите или зарегистрируйтесь, чтобы разместить услугу');
            return;
        }

        onPostClick();
    };

    const formatPrice = (value: number) => `${new Intl.NumberFormat('ru-RU').format(value)} ₸`;

    return (
        <div className="min-h-screen bg-background">
            <section className="relative overflow-hidden pt-10 pb-12 sm:pt-12 sm:pb-14">
                <div className="absolute top-[-180px] right-[-100px] h-[320px] w-[320px] rounded-full bg-primary/15 blur-[90px]" />
                <div className="absolute bottom-[-180px] left-[-120px] h-[320px] w-[320px] rounded-full bg-primary/10 blur-[90px]" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                        <Button variant="ghost" onClick={onBack} className="rounded-full px-4 hover:bg-card/80">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            К сервисам
                        </Button>

                        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/85 px-4 py-2 text-sm text-muted-foreground">
                            <BriefcaseBusiness className="w-4 h-4 text-primary" />
                            {loading ? 'Загрузка услуг...' : `${services.length} услуг`}
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
                                Формат фриланса для исполнителей
                            </p>

                            <h1 className="hero-title text-foreground mb-6 leading-[1.04]">
                                OnePlace <span className="hero-gradient-text">Услуги</span>
                            </h1>

                            <p className="text-base sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
                                Исполнитель публикует услугу, заказчики находят подходящий профиль и связываются напрямую в чате.
                            </p>

                            <div className="flex flex-col sm:flex-row items-stretch gap-4 sm:gap-4 max-w-4xl mx-auto">
                                <div className="relative flex-1">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <input
                                        type="text"
                                        placeholder="Найти услуги, навыки или теги..."
                                        value={searchQuery}
                                        onChange={(event) => setSearchQuery(event.target.value)}
                                        className="w-full h-14 pl-12 pr-5 rounded-full border border-border bg-input/90 text-base focus:ring-2 focus:ring-primary/30 focus:border-primary/40 focus:outline-none transition-all"
                                    />
                                </div>

                                <Button onClick={handlePostClick} className="h-14 rounded-full px-7 sm:px-8 font-semibold shadow-md">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Разместить услугу
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-10">
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
                    <h2 className="text-3xl sm:text-4xl font-bold flex items-center leading-tight">
                        {selectedCategory === 'all'
                            ? 'Актуальные предложения услуг'
                            : CATEGORY_LABELS[selectedCategory] || 'Актуальные предложения услуг'}
                        <span className="ml-3 text-sm font-semibold text-muted-foreground bg-card border border-border px-3 py-1.5 rounded-full">
                            {loading ? '...' : filteredServices.length}
                        </span>
                    </h2>

                    {loading ? (
                        <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">Загрузка...</div>
                    ) : filteredServices.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                            {filteredServices.map((service) => (
                                <article
                                    key={service.id}
                                    className="card-hover rounded-2xl border border-border bg-card p-6 space-y-5"
                                >
                                    <div className="space-y-3">
                                        <div className="flex flex-wrap gap-2 items-center">
                                            <span className="text-xs font-semibold rounded-full px-3 py-1 bg-primary/10 text-primary border border-primary/20">
                                                {CATEGORY_LABELS[service.category] || service.category}
                                            </span>
                                            <span className="text-xs font-semibold rounded-full px-3 py-1 bg-muted text-muted-foreground">
                                                {EXPERIENCE_LABELS[service.experienceLevel] || service.experienceLevel}
                                            </span>
                                        </div>

                                        <h3 className="text-xl font-bold leading-tight">{service.title}</h3>
                                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed min-h-[44px]">
                                            {service.description}
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="text-2xl font-black text-foreground">
                                            {formatPrice(service.price)}
                                            <span className="text-sm font-semibold text-muted-foreground ml-2">
                                                {PRICING_LABELS[service.pricingType] || ''}
                                            </span>
                                        </div>
                                        {service.location && <p className="text-sm text-muted-foreground">{service.location}</p>}
                                        {service.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-2 pt-1">
                                                {service.tags.slice(0, 3).map((tag) => (
                                                    <span key={tag} className="text-xs rounded-md px-2 py-1 bg-muted text-muted-foreground">
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-2">
                                        <Button className="w-full rounded-xl" onClick={() => onItemClick(service)}>
                                            Открыть и связаться
                                        </Button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center space-y-3">
                            <h3 className="text-xl font-semibold">Услуги не найдены</h3>
                            <p className="text-muted-foreground">Попробуйте изменить поиск или категорию.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}