import { Button } from "./button";
import { ArrowRight, Sparkles, Globe2, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-16">
      <div className="absolute top-[-120px] right-[-140px] h-[320px] w-[320px] rounded-full bg-primary/20 blur-[80px]" />
      <div className="absolute bottom-[-140px] left-[-120px] h-[320px] w-[320px] rounded-full bg-primary/15 blur-[86px]" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="hero-shell rounded-xl px-6 py-8 sm:px-8 sm:py-8"
        >
          <div className="max-w-4xl mx-auto text-center">
            <p className="hero-kicker mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2">
              <Sparkles className="h-3 w-3" />
              Новая визуальная система OnePlace
            </p>

            <h1 className="hero-title text-foreground mb-6">
              Работа, маркет и комьюнити
              <br />
              <span className="hero-gradient-text">в одном минималистичном пространстве</span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Единая платформа для поиска вакансий, услуг и полезных контактов.
              Сфокусированный интерфейс и быстрые сценарии без лишнего шума.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8">
              <Button size="lg" className="px-8">
                Начать поиск
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg" className="px-8">
                Посмотреть сервисы
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-border bg-card p-4 text-left">
                <Globe2 className="h-4 w-4 text-primary mb-2" />
                <p className="text-sm font-semibold">Одна экосистема</p>
                <p className="text-xs text-muted-foreground">Вакансии, товары и сообщество без переключений</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4 text-left">
                <ShieldCheck className="h-4 w-4 text-primary mb-2" />
                <p className="text-sm font-semibold">Чистый UX</p>
                <p className="text-xs text-muted-foreground">Минималистичный интерфейс в стиле modern web</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4 text-left">
                <Sparkles className="h-4 w-4 text-primary mb-2" />
                <p className="text-sm font-semibold">Быстрый старт</p>
                <p className="text-xs text-muted-foreground">Понятные действия и крупные точки входа</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
