import React from 'react';
import { Briefcase, Store, Users, Hammer, ArrowRight, LayoutGrid } from 'lucide-react';
import { Button } from '../../../shared/ui/components/button';
import { cn } from '../../../shared/ui/components/utils';

interface ServiceHubProps {
    onSelectService: (service: 'jobs' | 'market' | 'community') => void;
}

export function ServiceHub({ onSelectService }: ServiceHubProps) {
    const services = [
        {
            id: 'jobs',
            title: 'OnePlace Работа',
            description: 'Поиск работы, подработок и проектов. Вакансии, резюме и карьерный рост.',
            icon: Briefcase,
            color: 'bg-blue-600',
            gradient: 'from-blue-600 to-blue-700',
            available: true,
            action: () => onSelectService('jobs')
        },
        {
            id: 'market',
            title: 'OnePlace Маркет',
            description: 'Маркетплейс товаров и услуг. Покупайте и продавайте безопасно.',
            icon: Store,
            color: 'bg-purple-600',
            gradient: 'from-purple-600 to-purple-700',
            available: true,
            action: () => onSelectService('market')
        },
        {
            id: 'social',
            title: 'OnePlace Сообщество',
            description: 'Профессиональная сеть. Нетворкинг, общение и обмен опытом.',
            icon: Users,
            color: 'bg-green-600',
            gradient: 'from-green-600 to-green-700',
            available: true,
            action: () => onSelectService('community')
        },
        {
            id: 'services',
            title: 'OnePlace Услуги',
            description: 'Заказ бытовых и бизнес услуг. Мастера, фрилансеры и исполнители.',
            icon: Hammer,
            color: 'bg-orange-600',
            gradient: 'from-orange-600 to-orange-700',
            available: false
        }
    ];

    return (
        <div className="min-h-[calc(100vh-64px)] bg-background text-foreground flex flex-col items-center justify-center p-4 sm:p-8 animate-in fade-in duration-500">
            <div className="max-w-6xl w-full space-y-12">
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center p-2 bg-muted/50 rounded-2xl mb-4 shadow-sm border border-border">
                        <LayoutGrid className="w-6 h-6 text-blue-600 mr-2" />
                        <span className="text-sm font-semibold text-muted-foreground">Экосистема сервисов</span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground">
                        Добро пожаловать в <span className="text-blue-600">OnePlace</span>
                    </h1>
                    <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
                        Единая платформа для всех ваших потребностей. Выберите сервис, чтобы начать.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {services.map((service) => (
                        <div
                            key={service.id}
                            className={cn(
                                "group relative overflow-hidden rounded-3xl bg-card border border-border p-6 sm:p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
                                !service.available && "opacity-75 cursor-not-allowed"
                            )}
                            onClick={service.available ? service.action : undefined}
                        >
                            {/* background decorative blob */}
                            <div className={cn(
                                "absolute -right-10 -top-10 w-32 h-32 rounded-full opacity-10 blur-2xl transition-all duration-500 group-hover:scale-150",
                                service.color
                            )} />

                            <div className="relative z-10 flex flex-col h-full">
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 bg-muted/30">
                                    <service.icon className="w-6 h-6 text-foreground" />
                                </div>

                                <h3 className="text-xl font-bold text-foreground mb-2">
                                    {service.title}
                                </h3>

                                <p className="text-sm text-muted-foreground mb-6 flex-grow">
                                    {service.description}
                                </p>

                                <div className="mt-auto">
                                    {service.available ? (
                                        <Button
                                            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 group-hover:shadow-lg transition-all"
                                        >
                                            Перейти
                                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    ) : (
                                        <div className="w-full py-2 text-center text-sm font-medium text-muted-foreground bg-muted rounded-md">
                                            Скоро запуск
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}
