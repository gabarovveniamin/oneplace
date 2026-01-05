import React, { useState } from 'react';
import {
    ArrowLeft,
    Plus,
    X,
    Image as ImageIcon,
    Tag,
    MapPin,
    Info,
    CheckCircle2
} from 'lucide-react';
import { Button } from '../../../shared/ui/components/button';
import { Input } from '../../../shared/ui/components/input';
import { marketApiService } from '../../../core/api/market';
import { cn } from '../../../shared/ui/components/utils';

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        saveListing();
    };

    const addImage = () => {
        if (newImageUrl && !formData.images.includes(newImageUrl)) {
            setFormData(prev => ({
                ...prev,
                images: [...prev.images, newImageUrl]
            }));
            setNewImageUrl('');
        }
    };

    const removeImage = (url: string) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter(img => img !== url)
        }));
    };

    if (success) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-card border border-border rounded-[40px] p-12 text-center space-y-6 shadow-2xl animate-in zoom-in duration-500">
                    <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </div>
                    <h2 className="text-3xl font-bold text-foreground">Объявление опубликовано!</h2>
                    <p className="text-muted-foreground">
                        Ваш товар теперь доступен в Маркете. Перенаправляем вас...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <Button
                    variant="ghost"
                    onClick={onBack}
                    className="w-fit hover:bg-muted"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Назад
                </Button>

                <Button
                    onClick={saveListing}
                    disabled={loading}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-8 rounded-xl shadow-lg shadow-purple-600/20"
                >
                    {loading ? 'Публикация...' : 'Опубликовать'}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
                {/* Main Form */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-bold tracking-tight">Новое объявление</h1>
                        <p className="text-muted-foreground text-lg">Расскажите о вашем товаре или услуге</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Title & Category */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold ml-1">Название товара *</label>
                                <Input
                                    placeholder="Например: iPhone 15 Pro Max"
                                    value={formData.title}
                                    onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    className="h-12 rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold ml-1">Категория *</label>
                                <select
                                    className="w-full h-12 px-4 rounded-xl border border-input bg-background focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                    value={formData.category}
                                    onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                >
                                    <option value="">Выберите категорию</option>
                                    {CATEGORIES.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.title}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold ml-1">Описание *</label>
                            <textarea
                                placeholder="Подробно опишите состояние, характеристики и особенности..."
                                className="w-full min-h-[150px] p-4 rounded-xl border border-input bg-background focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none"
                                value={formData.description}
                                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            />
                        </div>

                        {/* Price & Location */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold ml-1">Цена (₸) *</label>
                                <div className="relative">
                                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        type="number"
                                        placeholder="0.00"
                                        value={formData.price}
                                        onChange={e => setFormData(prev => ({ ...prev, price: e.target.value }))}
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
                                        onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
                                        className="h-12 pl-12 rounded-xl"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Images */}
                        <div className="space-y-4">
                            <label className="text-sm font-semibold ml-1">Фотографии</label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Вставьте прямую ссылку на фото (https://...)"
                                    value={newImageUrl}
                                    onChange={e => setNewImageUrl(e.target.value)}
                                    className="h-12 rounded-xl"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={addImage}
                                    className="h-12 px-6 rounded-xl hover:bg-purple-50"
                                >
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                            <p className="text-[10px] text-muted-foreground ml-1">
                                Совет: используйте прямые ссылки на изображения (заканчиваются на .jpg, .png и т.д.)
                            </p>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                                {formData.images.map((url, i) => (
                                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden group border border-border">
                                        <img src={url} alt={`Preview ${i}`} className="w-full h-full object-cover" />
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
                            <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm flex items-start border border-red-100">
                                <Info className="w-4 h-4 mr-2 mt-0.5" />
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 rounded-2xl bg-purple-600 hover:bg-purple-700 text-lg font-bold shadow-lg shadow-purple-600/20 transition-all"
                        >
                            {loading ? 'Публикация...' : 'Опубликовать объявление'}
                        </Button>
                    </form>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
                        <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
                            <Info className="w-6 h-6 text-purple-600" />
                        </div>
                        <h3 className="font-bold text-lg">Советы по продаже</h3>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li className="flex items-start">
                                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 mr-2 flex-shrink-0" />
                                Сделайте качественные фото при хорошем освещении
                            </li>
                            <li className="flex items-start">
                                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 mr-2 flex-shrink-0" />
                                Укажите честное описание и все дефекты, если они есть
                            </li>
                            <li className="flex items-start">
                                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 mr-2 flex-shrink-0" />
                                Отвечайте на сообщения покупателей как можно быстрее
                            </li>
                        </ul>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white space-y-2">
                        <h3 className="font-bold">Безопасная сделка</h3>
                        <p className="text-sm text-white/80">OnePlace защищает ваши платежи и данные. Не передавайте реквизиты в чате.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
