import { Mail, Phone, MapPin, Clock, Facebook, Instagram, MessageCircle, Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Логотип и описание */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <img src="/Log.png" alt="OnePlace" className="h-12 w-12 object-contain" />
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
                OnePlace
              </h3>
            </div>
            <p className="text-muted-foreground mb-6 max-w-md">
              Ваша платформа для поиска работы, подработки и проектов. 
              Связываем таланты с возможностями по всему миру.
            </p>
            
            {/* Социальные сети */}
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="text-muted-foreground hover:text-blue-600 transition-colors duration-200"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="text-muted-foreground hover:text-blue-600 transition-colors duration-200"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="text-muted-foreground hover:text-blue-600 transition-colors duration-200"
                aria-label="Telegram"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="text-muted-foreground hover:text-blue-600 transition-colors duration-200"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Контактная информация */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-foreground">Связь с нами</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <a 
                    href="oneplacejob@gmail.com" 
                    className="text-sm text-foreground hover:text-blue-600 transition-colors duration-200"
                  >
                    oneplacejob@gmail.com
                  </a>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Телефон</p>
                  <a 
                    href="tel:+7475450807" 
                    className="text-sm text-foreground hover:text-blue-600 transition-colors duration-200"
                  >
                    +747 545 08 07
                  </a>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Адрес</p>
                  <p className="text-sm text-foreground">
                    Алматы, Казахстан
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Clock className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Время работы</p>
                  <p className="text-sm text-foreground">
                    Пн-Вс: 00:00 - 23:59
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Быстрые ссылки */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-foreground">Полезные ссылки</h4>
            <ul className="space-y-2">
              <li>
                <a 
                  href="#post-job" 
                  className="text-sm text-muted-foreground hover:text-blue-600 transition-colors duration-200"
                >
                  Разместить вакансию
                </a>
              </li>
              <li>
                <a 
                  href="#register" 
                  className="text-sm text-muted-foreground hover:text-blue-600 transition-colors duration-200"
                >
                  Регистрация
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-sm text-muted-foreground hover:text-blue-600 transition-colors duration-200"
                >
                  Помощь
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-sm text-muted-foreground hover:text-blue-600 transition-colors duration-200"
                >
                  FAQ
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-sm text-muted-foreground hover:text-blue-600 transition-colors duration-200"
                >
                  О нас
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-sm text-muted-foreground hover:text-blue-600 transition-colors duration-200"
                >
                  Конфиденциальность
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Нижняя часть футера */}
        <div className="border-t border-border mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground mb-4 md:mb-0">
              © 2024 OnePlace. Все права защищены.
            </p>
            <div className="flex space-x-6">
              <a 
                href="#" 
                className="text-sm text-muted-foreground hover:text-blue-600 transition-colors duration-200"
              >
                Условия использования
              </a>
              <a 
                href="#" 
                className="text-sm text-muted-foreground hover:text-blue-600 transition-colors duration-200"
              >
                Политика конфиденциальности
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
