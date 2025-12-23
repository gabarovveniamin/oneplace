import { Button } from "./button";
import { ArrowRight } from "lucide-react";

interface HeroProps {}

export function Hero() {
  return (
    <section className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
          Найди работу, подработку<br />
          <span className="bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
            или проект легко
          </span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Современная платформа для поиска работы, подработок и интересных проектов. 
          Находи возможности, которые подходят именно тебе.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-8 py-3"
          >
            Начать поиск
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
