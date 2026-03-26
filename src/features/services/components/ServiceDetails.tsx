import React from 'react';
import { ArrowLeft, Clock, MessageCircle, UserCircle2 } from 'lucide-react';
import { Button } from '../../../shared/ui/components/button';
import { Badge } from '../../../shared/ui/components/badge';
import { ServiceListing } from '../../../core/api/services';
import { authApiService } from '../../../core/api/auth';
import { toast } from 'sonner';

interface ServiceDetailsProps {
    service: ServiceListing;
    onBack: () => void;
    onChatOpen: (user: { other_user_id: string; first_name: string; last_name: string; avatar?: string }) => void;
}

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

const CATEGORY_LABELS: Record<string, string> = {
    design: 'Дизайн',
    development: 'Разработка',
    marketing: 'Маркетинг',
    copywriting: 'Тексты',
    analytics: 'Аналитика',
    consulting: 'Консалтинг',
    other: 'Другое'
};

export function ServiceDetails({ service, onBack, onChatOpen }: ServiceDetailsProps) {
    const formattedPrice = `${new Intl.NumberFormat('ru-RU').format(Number(service.price))} ₸`;

    const handleContact = () => {
        if (!authApiService.isAuthenticated()) {
            toast.error('Пожалуйста, войдите или зарегистрируйтесь, чтобы связаться с исполнителем');
            return;
        }

        onChatOpen({
            other_user_id: service.userId,
            first_name: service.userFirstName || 'Исполнитель',
            last_name: service.userLastName || '',
            avatar: service.userAvatar
        });
    };

    return (
        <div className="min-h-screen bg-background pb-16">
            <section className="relative overflow-hidden pt-10 pb-8">
                <div className="absolute top-[-180px] right-[-100px] h-[320px] w-[320px] rounded-full bg-primary/15 blur-[90px]" />
                <div className="absolute bottom-[-180px] left-[-120px] h-[320px] w-[320px] rounded-full bg-primary/10 blur-[90px]" />

                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
                    <Button variant="ghost" onClick={onBack} className="rounded-full px-4 hover:bg-card/80">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Назад к услугам
                    </Button>

                    <div className="hero-shell rounded-[28px] p-6 sm:p-8 space-y-6">
                        <div className="flex flex-wrap gap-2 items-center">
                            <Badge className="rounded-full bg-primary/10 text-primary border border-primary/20 px-4 py-1 font-semibold">
                                {CATEGORY_LABELS[service.category] || service.category}
                            </Badge>
                            <Badge variant="secondary" className="rounded-full px-4 py-1 font-semibold">
                                {EXPERIENCE_LABELS[service.experienceLevel] || service.experienceLevel}
                            </Badge>
                        </div>

                        <div className="space-y-3">
                            <h1 className="text-3xl sm:text-4xl font-bold leading-tight">{service.title}</h1>
                            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{service.description}</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="rounded-2xl border border-border bg-card p-4">
                                <div className="text-xs uppercase tracking-wide text-muted-foreground">Ставка</div>
                                <div className="text-2xl font-black mt-1">
                                    {formattedPrice}
                                    <span className="text-sm font-semibold text-muted-foreground ml-2">
                                        {PRICING_LABELS[service.pricingType] || ''}
                                    </span>
                                </div>
                            </div>
                            <div className="rounded-2xl border border-border bg-card p-4">
                                <div className="text-xs uppercase tracking-wide text-muted-foreground">Локация</div>
                                <div className="text-lg font-semibold mt-1">{service.location || 'Удаленно / Без привязки'}</div>
                            </div>
                        </div>

                        {service.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {service.tags.map((tag) => (
                                    <span key={tag} className="text-xs rounded-md px-2.5 py-1 bg-muted text-muted-foreground">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {service.portfolioUrl && (
                            <div className="rounded-2xl border border-border bg-card p-4 text-sm">
                                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Портфолио</div>
                                <a
                                    href={service.portfolioUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-primary hover:underline break-all"
                                >
                                    {service.portfolioUrl}
                                </a>
                            </div>
                        )}

                        <div className="pt-2 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                    <UserCircle2 className="w-6 h-6" />
                                </div>
                                <div className="min-w-0">
                                    <div className="font-semibold truncate">
                                        {service.userFirstName || 'Исполнитель'} {service.userLastName || ''}
                                    </div>
                                    <div className="text-sm text-muted-foreground flex items-center">
                                        <Clock className="w-3.5 h-3.5 mr-1" />
                                        опубликовано {new Date(service.createdAt).toLocaleDateString('ru-RU')}
                                    </div>
                                </div>
                            </div>

                            <Button onClick={handleContact} className="rounded-full px-6">
                                <MessageCircle className="w-4 h-4 mr-2" />
                                Связаться в чате
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}