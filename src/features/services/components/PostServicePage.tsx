import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, Info, Plus, Tag, X } from 'lucide-react';
import { Button } from '../../../shared/ui/components/button';
import { Input } from '../../../shared/ui/components/input';
import { servicesApiService } from '../../../core/api/services';

interface PostServicePageProps {
    onBack: () => void;
    onComplete: () => void;
}

const CATEGORIES = [
    { id: 'design', title: 'Дизайн' },
    { id: 'development', title: 'Разработка' },
    { id: 'marketing', title: 'Маркетинг' },
    { id: 'copywriting', title: 'Тексты' },
    { id: 'analytics', title: 'Аналитика' },
    { id: 'consulting', title: 'Консалтинг' },
    { id: 'other', title: 'Другое' }
];

const PRICING_TYPES = [
    { id: 'hourly', title: 'Почасовая ставка' },
    { id: 'fixed', title: 'Фикс за проект' },
    { id: 'monthly', title: 'Месячный ритейнер' }
];

const EXPERIENCE_LEVELS = [
    { id: 'junior', title: 'Junior' },
    { id: 'middle', title: 'Middle' },
    { id: 'senior', title: 'Senior' }
];

export function PostServicePage({ onBack, onComplete }: PostServicePageProps) {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [tagInput, setTagInput] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        price: '',
        pricingType: 'hourly' as 'hourly' | 'fixed' | 'monthly',
        experienceLevel: 'middle' as 'junior' | 'middle' | 'senior',
        tags: [] as string[],
        location: '',
        portfolioUrl: ''
    });

    const addTag = () => {
        const value = tagInput.trim().replace(/^#/, '');
        if (!value || formData.tags.includes(value)) return;

        setFormData((prev) => ({ ...prev, tags: [...prev.tags, value] }));
        setTagInput('');
    };

    const removeTag = (tag: string) => {
        setFormData((prev) => ({ ...prev, tags: prev.tags.filter((item) => item !== tag) }));
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);

        if (!formData.title || !formData.description || !formData.category || !formData.price) {
            setError('Пожалуйста, заполните обязательные поля');
            return;
        }

        try {
            setLoading(true);
            await servicesApiService.createService({
                title: formData.title,
                description: formData.description,
                category: formData.category,
                price: Number(formData.price),
                pricingType: formData.pricingType,
                experienceLevel: formData.experienceLevel,
                tags: formData.tags,
                location: formData.location || undefined,
                portfolioUrl: formData.portfolioUrl || undefined
            });

            setSuccess(true);
            setTimeout(() => onComplete(), 1800);
        } catch (err: any) {
            setError(err?.message || 'Не удалось создать услугу');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-[78vh] flex items-center justify-center px-4 py-10">
                <div className="hero-shell rounded-[28px] max-w-lg w-full text-center p-8 sm:p-10 space-y-5">
                    <div className="w-16 h-16 bg-green-500/12 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-8 h-8 text-green-500" />
                    </div>
                    <h2 className="text-3xl font-bold">Услуга опубликована</h2>
                    <p className="text-muted-foreground">
                        Ваше предложение уже доступно в каталоге OnePlace Услуги.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-16">
            <section className="relative overflow-hidden pt-10 pb-8">
                <div className="absolute top-[-180px] right-[-100px] h-[320px] w-[320px] rounded-full bg-primary/15 blur-[90px]" />
                <div className="absolute bottom-[-180px] left-[-120px] h-[320px] w-[320px] rounded-full bg-primary/10 blur-[90px]" />

                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
                    <div className="flex items-center justify-between gap-3">
                        <Button variant="ghost" onClick={onBack} className="rounded-full px-4 hover:bg-card/80">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Назад к услугам
                        </Button>
                    </div>

                    <form onSubmit={handleSubmit} className="hero-shell rounded-[28px] p-6 sm:p-8 space-y-6">
                        <div className="space-y-2">
                            <p className="hero-kicker">OnePlace Services</p>
                            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Создать услугу</h1>
                            <p className="text-muted-foreground">
                                Опишите, чем вы помогаете клиентам и на каких условиях работаете.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold ml-1">Название услуги *</label>
                                <Input
                                    value={formData.title}
                                    onChange={(event) => setFormData((prev) => ({ ...prev, title: event.target.value }))}
                                    placeholder="Например: Разработка лендинга под ключ"
                                    className="h-12 rounded-xl"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold ml-1">Категория *</label>
                                <select
                                    value={formData.category}
                                    onChange={(event) => setFormData((prev) => ({ ...prev, category: event.target.value }))}
                                    className="w-full h-12 px-4 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/30 focus:border-primary/40 focus:outline-none"
                                >
                                    <option value="">Выберите категорию</option>
                                    {CATEGORIES.map((category) => (
                                        <option key={category.id} value={category.id}>{category.title}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold ml-1">Описание *</label>
                            <textarea
                                value={formData.description}
                                onChange={(event) => setFormData((prev) => ({ ...prev, description: event.target.value }))}
                                placeholder="Опишите результаты, этапы работы, сроки и что включено в услугу..."
                                className="w-full min-h-[140px] p-4 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/30 focus:border-primary/40 focus:outline-none resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold ml-1">Ставка (₸) *</label>
                                <div className="relative">
                                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        type="number"
                                        value={formData.price}
                                        onChange={(event) => setFormData((prev) => ({ ...prev, price: event.target.value }))}
                                        placeholder="0"
                                        className="h-12 pl-12 rounded-xl"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold ml-1">Формат оплаты</label>
                                <select
                                    value={formData.pricingType}
                                    onChange={(event) => setFormData((prev) => ({ ...prev, pricingType: event.target.value as 'hourly' | 'fixed' | 'monthly' }))}
                                    className="w-full h-12 px-4 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/30 focus:border-primary/40 focus:outline-none"
                                >
                                    {PRICING_TYPES.map((pricing) => (
                                        <option key={pricing.id} value={pricing.id}>{pricing.title}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold ml-1">Уровень</label>
                                <select
                                    value={formData.experienceLevel}
                                    onChange={(event) => setFormData((prev) => ({ ...prev, experienceLevel: event.target.value as 'junior' | 'middle' | 'senior' }))}
                                    className="w-full h-12 px-4 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/30 focus:border-primary/40 focus:outline-none"
                                >
                                    {EXPERIENCE_LEVELS.map((level) => (
                                        <option key={level.id} value={level.id}>{level.title}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold ml-1">Локация</label>
                                <Input
                                    value={formData.location}
                                    onChange={(event) => setFormData((prev) => ({ ...prev, location: event.target.value }))}
                                    placeholder="Удаленно / Алматы / Астана ..."
                                    className="h-12 rounded-xl"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold ml-1">Портфолио (URL)</label>
                                <Input
                                    value={formData.portfolioUrl}
                                    onChange={(event) => setFormData((prev) => ({ ...prev, portfolioUrl: event.target.value }))}
                                    placeholder="https://..."
                                    className="h-12 rounded-xl"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-semibold ml-1">Теги навыков</label>
                            <div className="flex gap-2">
                                <Input
                                    value={tagInput}
                                    onChange={(event) => setTagInput(event.target.value)}
                                    placeholder="React, UI/UX, SEO..."
                                    className="h-12 rounded-xl"
                                />
                                <Button type="button" variant="outline" onClick={addTag} className="h-12 px-5 rounded-xl">
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>

                            {formData.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-1">
                                    {formData.tags.map((tag) => (
                                        <button
                                            type="button"
                                            key={tag}
                                            onClick={() => removeTag(tag)}
                                            className="inline-flex items-center gap-1 text-xs rounded-md px-2.5 py-1 bg-muted text-muted-foreground hover:bg-muted/80"
                                        >
                                            #{tag}
                                            <X className="w-3 h-3" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className="p-4 bg-red-500/10 text-red-600 dark:text-red-300 rounded-xl text-sm flex items-start border border-red-500/20">
                                <Info className="w-4 h-4 mr-2 mt-0.5" />
                                {error}
                            </div>
                        )}

                        <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl font-semibold">
                            {loading ? 'Публикация...' : 'Опубликовать услугу'}
                        </Button>
                    </form>
                </div>
            </section>
        </div>
    );
}