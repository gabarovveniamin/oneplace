import React from 'react';
import { ShoppingCart, ArrowLeft, Trash2, Minus, Plus, ShoppingBag, ShieldCheck, Truck } from 'lucide-react';
import { Button } from '../../../shared/ui/components/button';
import { useCart } from '../hooks/useCart';
import { cn } from '../../../shared/ui/components/utils';

interface CartPageProps {
    onBack: () => void;
    onCheckout: () => void;
    onItemClick: (id: string) => void;
}

export function CartPage({ onBack, onCheckout, onItemClick }: CartPageProps) {
    const { cart, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();

    return (
        <div className="min-h-screen bg-background pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-12">
                    <div className="space-y-2">
                        <Button
                            variant="ghost"
                            onClick={onBack}
                            className="p-0 hover:bg-transparent text-muted-foreground hover:text-foreground transition-colors mb-4"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Вернуться к покупкам
                        </Button>
                        <h1 className="text-4xl sm:text-5xl font-black tracking-tight flex items-center gap-4">
                            Корзина
                            <span className="text-xl font-bold bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300 px-4 py-1 rounded-full">
                                {totalItems}
                            </span>
                        </h1>
                    </div>
                </div>

                {cart.length === 0 ? (
                    <div className="max-w-2xl mx-auto py-20 text-center space-y-8">
                        <div className="w-32 h-32 bg-muted rounded-full flex items-center justify-center mx-auto animate-pulse">
                            <ShoppingCart className="w-16 h-16 text-muted-foreground/40" />
                        </div>
                        <div className="space-y-3">
                            <h2 className="text-3xl font-bold">Ваша корзина пуста</h2>
                            <p className="text-muted-foreground text-lg">
                                Кажется, вы еще ничего не добавили. Перейдите в маркет, чтобы найти что-то интересное!
                            </p>
                        </div>
                        <Button
                            size="lg"
                            onClick={onBack}
                            className="bg-purple-600 hover:bg-purple-700 h-14 px-10 rounded-2xl text-lg font-bold shadow-xl shadow-purple-600/20"
                        >
                            <ShoppingBag className="w-5 h-5 mr-3" />
                            Перейти в Маркет
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
                        {/* List Column */}
                        <div className="lg:col-span-2 space-y-6">
                            {cart.map((item) => (
                                <div
                                    key={item.id}
                                    className="group flex items-center gap-4 sm:gap-6 p-4 bg-card rounded-2xl border border-border hover:border-purple-500/30 transition-all hover:shadow-lg"
                                >
                                    <div
                                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-border cursor-pointer shrink-0"
                                        onClick={() => onItemClick(item.id)}
                                    >
                                        <img
                                            src={item.images?.[0] || 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?auto=format&fit=crop&q=80&w=800'}
                                            alt={item.title}
                                            className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                                        />
                                    </div>

                                    <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                                        <div className="min-w-0 flex-1">
                                            <h3
                                                className="text-base sm:text-lg font-bold hover:text-purple-600 cursor-pointer transition-colors truncate"
                                                onClick={() => onItemClick(item.id)}
                                            >
                                                {item.title}
                                            </h3>
                                            <p className="text-muted-foreground text-[10px] sm:text-xs uppercase tracking-wider font-bold">{item.category}</p>
                                        </div>

                                        <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-8">
                                            <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-xl border border-border shrink-0">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-background hover:bg-muted rounded-lg transition-colors shadow-sm"
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                                <span className="w-6 sm:w-8 text-center text-sm sm:text-base font-bold">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-background hover:bg-muted rounded-lg transition-colors shadow-sm"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                            </div>

                                            <div className="text-lg sm:text-xl font-black text-purple-600 dark:text-purple-400 whitespace-nowrap min-w-[80px] sm:min-w-[120px] text-right">
                                                {(Number(item.price) * item.quantity).toLocaleString()} ₸
                                            </div>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeFromCart(item.id)}
                                                className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Summary Column */}
                        <div className="space-y-6 sticky top-24">
                            <div className="bg-card rounded-[40px] border border-border p-8 shadow-xl space-y-8">
                                <h2 className="text-2xl font-bold">Детали заказа</h2>

                                <div className="space-y-4">
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>Товары ({totalItems})</span>
                                        <span className="font-bold text-foreground">{totalPrice.toLocaleString()} ₸</span>
                                    </div>
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>Доставка</span>
                                        <span className="text-green-600 font-bold">Бесплатно</span>
                                    </div>
                                    <div className="pt-4 border-t border-border flex justify-between items-baseline">
                                        <span className="text-lg font-bold">Итого</span>
                                        <span className="text-4xl font-black text-purple-600">
                                            {totalPrice.toLocaleString()} ₸
                                        </span>
                                    </div>
                                </div>

                                <Button
                                    size="lg"
                                    onClick={onCheckout}
                                    className="w-full h-16 rounded-2xl bg-purple-600 hover:bg-purple-700 text-xl font-bold shadow-xl shadow-purple-600/20 active:scale-[0.98] transition-all"
                                >
                                    Оформить заказ
                                </Button>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-2xl">
                                        <ShieldCheck className="w-6 h-6 text-green-600" />
                                        <div className="text-xs">
                                            <div className="font-bold">Безопасность OnePlace</div>
                                            <div className="text-muted-foreground">Ваши средства защищены до получения товара</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-2xl">
                                        <Truck className="w-6 h-6 text-blue-600" />
                                        <div className="text-xs">
                                            <div className="font-bold">Доставка по всей сети</div>
                                            <div className="text-muted-foreground">Более 5000 пунктов выдачи</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <p className="text-xs text-center text-muted-foreground px-8 leading-relaxed">
                                Нажимая кнопку «Оформить заказ», вы соглашаетесь с правилами пользования торговой площадкой OnePlace.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
