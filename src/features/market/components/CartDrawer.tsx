import React, { useEffect } from 'react';
import { ShoppingCart, X, Trash2, Minus, Plus } from 'lucide-react';
import { Button } from '../../../shared/ui/components/button';
import { useCart } from '../hooks/useCart';
import { cn } from '../../../shared/ui/components/utils';

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
    const { cart, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();

    // Prevent scrolling when drawer is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex justify-end overflow-hidden">
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-all animate-in fade-in duration-300"
                onClick={onClose}
            />

            <div
                className="relative w-full max-w-md bg-background h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300"
                style={{ height: '100%' }}
            >
                <div className="p-6 border-b border-border flex items-center justify-between bg-card shrink-0">
                    <div className="flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5 text-purple-600" />
                        <h2 className="text-xl font-bold">Корзина</h2>
                        <span className="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300 text-xs font-bold px-2 py-0.5 rounded-full">
                            {totalItems}
                        </span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-muted">
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-60">
                            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                                <ShoppingCart className="w-12 h-12" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold">Ваша корзина пуста</h3>
                                <p className="text-sm text-balance">Добавьте понравившиеся товары из маркета, чтобы они появились здесь</p>
                            </div>
                            <Button variant="outline" onClick={onClose} className="rounded-xl px-8">Начать покупки</Button>
                        </div>
                    ) : (
                        cart.map((item) => (
                            <div key={item.id} className="flex gap-4 p-4 bg-muted/20 rounded-2xl border border-border/50 group hover:border-purple-500/30 transition-all">
                                <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-border shadow-sm">
                                    <img
                                        src={item.images?.[0] || 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?auto=format&fit=crop&q=80&w=800'}
                                        alt={item.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col justify-between">
                                    <div>
                                        <h4 className="font-bold text-sm line-clamp-1">{item.title}</h4>
                                        <div className="text-purple-600 dark:text-purple-400 font-extrabold text-lg mt-0.5">
                                            {item.price.toLocaleString()} ₸
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                        <div className="flex items-center gap-1 bg-background rounded-lg border border-border p-0.5">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="w-7 h-7 flex items-center justify-center hover:bg-muted rounded-md transition-colors"
                                            >
                                                <Minus className="w-3.5 h-3.5" />
                                            </button>
                                            <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="w-7 h-7 flex items-center justify-center hover:bg-muted rounded-md transition-colors"
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            onClick={() => removeFromCart(item.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {cart.length > 0 && (
                    <div className="p-6 border-t border-border bg-card shrink-0 space-y-4 shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground font-medium">К оплате:</span>
                            <span className="text-3xl font-black text-purple-600">
                                {totalPrice.toLocaleString()} ₸
                            </span>
                        </div>
                        <Button className="w-full h-14 rounded-2xl bg-purple-600 hover:bg-purple-700 text-lg font-bold shadow-xl shadow-purple-600/20 active:scale-[0.98] transition-all">
                            Перейти к оформлению
                        </Button>
                        <p className="text-[10px] text-center text-muted-foreground uppercase tracking-wider font-bold">
                            Безопасная оплата через OnePlace Pay
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
