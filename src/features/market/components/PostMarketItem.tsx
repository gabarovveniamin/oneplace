import React, { useMemo, useState } from 'react';
import {
    ArrowLeft,
    CheckCircle2,
    Image as ImageIcon,
    Info,
    MapPin,
    Plus,
    Tag,
    X
} from 'lucide-react';
import { Button } from '../../../shared/ui/components/button';
import { Input } from '../../../shared/ui/components/input';
import { marketApiService } from '../../../core/api/market';

interface PostMarketItemProps {
    onBack: () => void;
    onComplete: () => void;
}

const CATEGORIES = [
    { id: 'electronics', title: 'Электроника' },
    { id: 'services', title: 'Услуги' },
    { id: 'home', title: 'Дом и сад' },
    { id: 'fashion', title: 'Мода' },
    { id: 'hobbies', title: 'Хобби' },
    { id: 'other', title: 'Другое' }
];

const CATEGORY_LABELS = CATEGORIES.reduce<Record<string, string>>((acc, category) => {
    acc[category.id] = category.title;
    return acc;
}, {});

export function PostMarketItem({ onBack, onComplete }: PostMarketItemProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        category: '',
        location: '',
        images: [] as string[]
    });

    const [newImageUrl, setNewImageUrl] = useState('');

    const selectedCategoryTitle = CATEGORY_LABELS[formData.category] || 'Не выбрана';
    const formattedDraftPrice = formData.price
        ? `${new Intl.NumberFormat('ru-RU').format(Number(formData.price) || 0)} ₸`
        : '0 ₸';

    const previewImage = useMemo(
        () =>
            formData.images[0] ||
            'https://images.unsplash.com/photo-1560393464-5c69a73c5770?auto=format&fit=crop&q=80&w=800',
        [formData.images]
    );

    const saveListing = async () => {
        setError(null);
        setLoading(true);

        try {
            if (!formData.title || !formData.description || !formData.price || !formData.category) {
                throw new Error('Пожалуйста, заполните все обязательные поля');
            }

            const finalImages = [...formData.images];
            if (newImageUrl.trim() && !finalImages.includes(newImageUrl.trim())) {
                finalImages.push(newImageUrl.trim());
            }

            await marketApiService.createListing({
                title: formData.title,
                description: formData.description,
                price: Number(formData.price),
                category: formData.category,
                location: formData.location,
                images: finalImages
            });

            setSuccess(true);
            setTimeout(() => {
                onComplete();
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'Ошибка при создании объявления');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        saveListing();
    };

    const addImage = () => {
        const value = newImageUrl.trim();

        if (!value || formData.images.includes(value)) {
            return;
        }

        setFormData((prev) => ({
            ...prev,
            images: [...prev.images, value]
        }));
        setNewImageUrl('');
    };

    const removeImage = (url: string) => {
        setFormData((prev) => ({
            ...prev,
            images: prev.images.filter((image) => image !== url)
        }));
    };

    if (success) {
        return (
            <div className="min-h-[78vh] flex items-center justify-center px-4 py-10">
                <div className="hero-shell rounded-[28px] max-w-lg w-full text-center p-8 sm:p-10 space-y-5">
                    <div className="w-16 h-16 bg-green-500/12 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-8 h-8 text-green-500" />
                    </div>
                    <h2 className="text-3xl font-bold">Объявление опубликовано</h2>
                    <p className="text-muted-foreground">
                        Ваш товар уже доступен в маркете. Перенаправляем вас в каталог.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-16">
            <section className="relative overflow-hidden pt-8 sm:pt-10">
                <div className="absolute top-[-180px] right-[-110px] h-[320px] w-[320px] rounded-full bg-primary/15 blur-[90px]" />
                <div className="absolute bottom-[-180px] left-[-120px] h-[320px] w-[320px] rounded-full bg-primary/10 blur-[90px]" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                        <Button variant="ghost" onClick={onBack} className="rounded-full px-4 hover:bg-card/80">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Назад к маркету
                        </Button>

                        <Button onClick={saveListing} disabled={loading} className="rounded-full px-7 h-11 font-semibold">
                            {loading ? 'Публикация...' : 'Опубликовать'}
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
                        <form onSubmit={handleSubmit} className="lg:col-span-2 hero-shell rounded-[28px] p-5 sm:p-7 space-y-6">
                            <div className="space-y-2">
                                <p className="hero-kicker">OnePlace Market</p>
                                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Новое объявление</h1>
                                <p className="text-muted-foreground">
                                    Заполните ключевые данные о товаре, чтобы пользователи быстрее приняли решение.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold ml-1">Название товара *</label>
                                    <Input
                                        placeholder="Например: iPhone 15 Pro Max"
                                        value={formData.title}
                                        onChange={(event) =>
                                            setFormData((prev) => ({ ...prev, title: event.target.value }))
                                        }
                                        className="h-12 rounded-xl"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold ml-1">Категория *</label>
                                    <select
                                        className="w-full h-12 px-4 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/30 focus:border-primary/40 focus:outline-none"
                                        value={formData.category}
                                        onChange={(event) =>
                                            setFormData((prev) => ({ ...prev, category: event.target.value }))
                                        }
                                    >
                                        <option value="">Выберите категорию</option>
                                        {CATEGORIES.map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold ml-1">Описание *</label>
                                <textarea
                                    placeholder="Подробно опишите состояние, характеристики и комплектацию..."
                                    className="w-full min-h-[150px] p-4 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/30 focus:border-primary/40 focus:outline-none resize-none"
                                    value={formData.description}
                                    onChange={(event) =>
                                        setFormData((prev) => ({ ...prev, description: event.target.value }))
                                    }
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold ml-1">Цена (₸) *</label>
                                    <div className="relative">
                                        <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            type="number"
                                            placeholder="0"
                                            value={formData.price}
                                            onChange={(event) =>
                                                setFormData((prev) => ({ ...prev, price: event.target.value }))
                                            }
                                            className="h-12 pl-12 rounded-xl"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold ml-1">Местоположение</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Город, район"
                                            value={formData.location}
                                            onChange={(event) =>
                                                setFormData((prev) => ({ ...prev, location: event.target.value }))
                                            }
                                            className="h-12 pl-12 rounded-xl"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-semibold ml-1">Фотографии</label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Вставьте прямую ссылку (https://...)"
                                        value={newImageUrl}
                                        onChange={(event) => setNewImageUrl(event.target.value)}
                                        className="h-12 rounded-xl"
                                    />
                                    <Button type="button" variant="outline" onClick={addImage} className="h-12 px-5 rounded-xl">
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>

                                <p className="text-xs text-muted-foreground ml-1">
                                    Поддерживаются прямые ссылки на `.jpg`, `.png`, `.webp`.
                                </p>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                                    {formData.images.map((url, index) => (
                                        <div key={index} className="relative aspect-square rounded-xl overflow-hidden group border border-border bg-muted/20">
                                            <img src={url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(url)}
                                                className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}

                                    {formData.images.length === 0 && (
                                        <div className="aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground">
                                            <ImageIcon className="w-8 h-8 mb-2 opacity-20" />
                                            <span className="text-xs">Нет фото</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 bg-red-500/10 text-red-600 dark:text-red-300 rounded-xl text-sm flex items-start border border-red-500/20">
                                    <Info className="w-4 h-4 mr-2 mt-0.5" />
                                    {error}
                                </div>
                            )}

                            <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl font-semibold">
                                {loading ? 'Публикация...' : 'Опубликовать объявление'}
                            </Button>
                        </form>

                        <div className="space-y-4 lg:sticky lg:top-24">
                            <div className="hero-shell rounded-[24px] p-4 sm:p-5 space-y-4">
                                <h3 className="text-lg font-bold">Предпросмотр карточки</h3>

                                <div className="rounded-2xl overflow-hidden border border-border bg-card">
                                    <div className="aspect-[4/3]">
                                        <img src={previewImage} alt="Предпросмотр" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="p-4 space-y-2">
                                        <div className="text-sm text-muted-foreground">{selectedCategoryTitle}</div>
                                        <div className="font-semibold line-clamp-2">
                                            {formData.title || 'Название объявления'}
                                        </div>
                                        <div className="text-xl font-black">{formattedDraftPrice}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-3xl border border-border bg-card p-5 space-y-3">
                                <h3 className="font-bold text-base">Советы по продаже</h3>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    <li>1. Используйте фото при хорошем освещении.</li>
                                    <li>2. Укажите реальные дефекты и состояние.</li>
                                    <li>3. Добавьте локацию для быстрых сделок.</li>
                                </ul>
                            </div>

                            <div className="rounded-3xl border border-primary/20 bg-primary/10 p-5">
                                <h3 className="font-bold">Безопасная сделка</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    OnePlace защищает платежи и данные. Не отправляйте реквизиты в личных сообщениях.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}