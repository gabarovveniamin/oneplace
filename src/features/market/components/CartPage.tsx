import React from 'react';
import {
    ArrowLeft,
    Minus,
    Plus,
    ShieldCheck,
    ShoppingBag,
    ShoppingCart,
    Trash2,
    Truck
} from 'lucide-react';
import { Button } from '../../../shared/ui/components/button';
import { useCart } from '../hooks/useCart';

interface CartPageProps {
    onBack: () => void;
    onCheckout: () => void;
    onItemClick: (id: string) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
    electronics: 'Электроника',
    services: 'Услуги',
    home: 'Дом и сад',
    fashion: 'Мода',
    hobbies: 'Хобби',
    other: 'Другое'
};

export function CartPage({ onBack, onCheckout, onItemClick }: CartPageProps) {
    const { cart, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();

    const formatPrice = (value: number) => `${new Intl.NumberFormat('ru-RU').format(value)} ₸`;

    return (
        <div className="min-h-screen bg-background pb-16">
            <section className="relative overflow-hidden pt-8 sm:pt-10">
                <div className="absolute top-[-180px] right-[-120px] h-[320px] w-[320px] rounded-full bg-primary/15 blur-[90px]" />
                <div className="absolute bottom-[-180px] left-[-120px] h-[320px] w-[320px] rounded-full bg-primary/10 blur-[90px]" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
                        <div>
                            <Button
                                variant="ghost"
                                onClick={onBack}
                                className="rounded-full px-4 hover:bg-card/80 mb-4"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Вернуться в маркет
                            </Button>

                            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight flex items-center gap-3">
                                Корзина
                                <span className="text-sm sm:text-base font-semibold border border-border bg-card px-3 py-1 rounded-full text-muted-foreground">
                                    {totalItems}
                                </span>
                            </h1>
                        </div>
                    </div>

                    {cart.length === 0 ? (
                        <div className="hero-shell rounded-[28px] max-w-2xl mx-auto py-14 px-8 text-center space-y-6">
                            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto">
                                <ShoppingCart className="w-12 h-12 text-muted-foreground/45" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl sm:text-3xl font-bold">Ваша корзина пуста</h2>
                                <p className="text-muted-foreground">
                                    Добавьте товары из каталога, чтобы оформить заказ.
                                </p>
                            </div>
                            <Button size="lg" onClick={onBack} className="rounded-full px-8 h-12 font-semibold">
                                <ShoppingBag className="w-4 h-4 mr-2" />
                                Перейти в каталог
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
                            <div className="lg:col-span-2 space-y-4">
                                {cart.map((item) => (
                                    <div
                                        key={item.id}
                                        className="card-hover rounded-2xl border border-border bg-card p-4 sm:p-5"
                                    >
                                        <div className="flex items-center gap-4">
                                            <button
                                                className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-border shrink-0"
                                                onClick={() => onItemClick(item.id)}
                                            >
                                                <img
                                                    src={item.images?.[0] || 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?auto=format&fit=crop&q=80&w=800'}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </button>

                                            <div className="flex-1 min-w-0">
                                                <button
                                                    className="text-left font-semibold text-base sm:text-lg truncate hover:text-primary transition-colors"
                                                    onClick={() => onItemClick(item.id)}
                                                >
                                                    {item.title}
                                                </button>
                                                <p className="text-xs text-muted-foreground uppercase tracking-wide mt-1">
                                                    {CATEGORY_LABELS[item.category] || item.category}
                                                </p>
                                            </div>

                                            <div className="hidden sm:block text-right min-w-[110px]">
                                                <div className="text-sm text-muted-foreground">Сумма</div>
                                                <div className="text-lg font-bold">{formatPrice(Number(item.price) * item.quantity)}</div>
                                            </div>
                                        </div>

                                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                                            <div className="flex items-center gap-2 bg-muted/60 p-1 rounded-xl border border-border">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="w-8 h-8 rounded-lg bg-background hover:bg-muted flex items-center justify-center"
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                                <span className="w-8 text-center font-semibold">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="w-8 h-8 rounded-lg bg-background hover:bg-muted flex items-center justify-center"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                            </div>

                                            <div className="sm:hidden text-right min-w-[100px]">
                                                <div className="text-xs text-muted-foreground">Сумма</div>
                                                <div className="font-bold">{formatPrice(Number(item.price) * item.quantity)}</div>
                                            </div>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeFromCart(item.id)}
                                                className="h-9 w-9 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4 lg:sticky lg:top-24">
                                <div className="hero-shell rounded-[28px] p-6 space-y-6">
                                    <h2 className="text-xl sm:text-2xl font-bold">Детали заказа</h2>

                                    <div className="space-y-3 text-sm sm:text-base">
                                        <div className="flex justify-between text-muted-foreground">
                                            <span>Товары ({totalItems})</span>
                                            <span className="font-semibold text-foreground">{formatPrice(totalPrice)}</span>
                                        </div>
                                        <div className="flex justify-between text-muted-foreground">
                                            <span>Доставка</span>
                                            <span className="font-semibold text-green-600">Бесплатно</span>
                                        </div>
                                        <div className="pt-4 border-t border-border flex justify-between items-end">
                                            <span className="font-semibold">Итого</span>
                                            <span className="text-3xl font-black">{formatPrice(totalPrice)}</span>
                                        </div>
                                    </div>

                                    <Button size="lg" onClick={onCheckout} className="w-full h-12 rounded-xl font-semibold">
                                        Оформить заказ
                                    </Button>
                                </div>

                                <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-green-500/15 text-green-600 flex items-center justify-center">
                                            <ShieldCheck className="w-4 h-4" />
                                        </div>
                                        <div className="text-sm">
                                            <div className="font-semibold">Безопасность OnePlace</div>
                                            <div className="text-muted-foreground">Средства защищены до получения товара</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-600 flex items-center justify-center">
                                            <Truck className="w-4 h-4" />
                                        </div>
                                        <div className="text-sm">
                                            <div className="font-semibold">Доставка по всей сети</div>
                                            <div className="text-muted-foreground">Более 5000 пунктов выдачи</div>
                                        </div>
                                    </div>
                                </div>

                                <p className="text-xs text-muted-foreground px-1 leading-relaxed">
                                    Нажимая кнопку «Оформить заказ», вы соглашаетесь с правилами пользования торговой площадкой OnePlace.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}