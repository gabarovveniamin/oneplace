import React from "react";
import { Briefcase, Store, Users, Hammer, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "../../../shared/ui/components/button";
import { cn } from "../../../shared/ui/components/utils";

interface ServiceHubProps {
  onSelectService: (service: "jobs" | "market" | "community" | "services") => void;
}

export function ServiceHub({ onSelectService }: ServiceHubProps) {
  const services = [
    {
      id: "jobs",
      title: "OnePlace Работа",
      description: "Вакансии, подработки и карьерные возможности в одном потоке.",
      icon: Briefcase,
      color: "bg-blue-600",
      available: true,
      action: () => onSelectService("jobs"),
      cta: "Открыть вакансии",
    },
    {
      id: "market",
      title: "OnePlace Маркет",
      description: "Товары и услуги с быстрым размещением и понятным каталогом.",
      icon: Store,
      color: "bg-purple-600",
      available: true,
      action: () => onSelectService("market"),
      cta: "Открыть маркет",
    },
    {
      id: "social",
      title: "OnePlace Сообщество",
      description: "Посты, обмен опытом и профессиональные связи внутри платформы.",
      icon: Users,
      color: "bg-green-600",
      available: true,
      action: () => onSelectService("community"),
      cta: "Открыть сообщество",
    },
    {
      id: "services",
      title: "OnePlace Услуги",
      description: "Фриланс-формат: исполнитель размещает услугу, заказчики связываются напрямую.",
      icon: Hammer,
      color: "bg-orange-600",
      available: true,
      action: () => onSelectService("services"),
      cta: "Открыть услуги",
    },
  ];

  return (
    <div className="min-h-screen text-foreground flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="max-w-7xl w-full space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full border border-border bg-card shadow-sm">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-muted-foreground">Единая экосистема сервисов</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground">
            Выберите направление
            <br />
            <span className="hero-gradient-text">и начните за минуту</span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Полный редизайн платформы с чистой визуальной иерархией,
            крупными точками входа и минималистичной эстетикой.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service) => (
            <div
              key={service.id}
              className={cn(
                "group relative overflow-hidden rounded-xl bg-card border border-border p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
                !service.available && "opacity-75 cursor-not-allowed",
              )}
              onClick={service.available ? service.action : undefined}
            >
              <div
                className={cn(
                  "absolute -right-10 -top-10 w-32 h-32 rounded-full opacity-10 blur-2xl transition-all duration-500 group-hover:scale-150",
                  service.color,
                )}
              />

              <div className="relative z-10 flex flex-col h-full">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-muted/30">
                  <service.icon className="w-6 h-6 text-foreground" />
                </div>

                <h3 className="text-xl font-bold text-foreground mb-2">{service.title}</h3>
                <p className="text-sm text-muted-foreground mb-6 flex-grow leading-relaxed">
                  {service.description}
                </p>

                <div className="mt-auto">
                  {service.available ? (
                    <Button className="w-full justify-center">
                      {service.cta}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <div className="w-full py-2 text-center text-sm font-semibold text-muted-foreground bg-muted rounded-md">
                      {service.cta}
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