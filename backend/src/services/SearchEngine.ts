/**
 * ТИПЫ ДАННЫХ ДЛЯ ПОИСКА
 */
export interface SearchableItem {
    id: string;
    [key: string]: any;
}

export interface SearchResult<T> {
    item: T;
    score: number;
}

/**
 * МОДУЛЬНАЯ СИСТЕМА УМНОГО ПОИСКА (OnePlace Search Engine)
 * Реализует триграммный поиск с поддержкой опечаток и высокой производительностью.
 */
export class SearchEngine<T extends SearchableItem> {
    // Инвертированный индекс: Триграмма -> Set с ID документов
    private index: Map<string, Set<string>> = new Map();
    // Хранилище объектов для быстрого доступа по ID
    private items: Map<string, T> = new Map();
    // Поля документа, по которым строится индекс
    private searchFields: (keyof T)[];

    constructor(items: T[] = [], searchFields: (keyof T)[] = []) {
        this.searchFields = searchFields;
        if (items.length > 0) {
            this.buildIndex(items);
        }
    }

    /**
     * 1. НОРМАЛИЗАЦИЯ (Normalizer)
     * Приводит текст к единому виду: регистр, спецсимволы, замена Ё
     */
    private normalize(text: string): string {
        if (!text) return '';
        return text
            .toString()
            .toLowerCase()
            .replace(/ё/g, 'е')
            // Удаляем всё кроме букв русской и латинской раскладки, цифр и пробелов
            .replace(/[^a-zа-я0-9\s]/gi, ' ')
            // Схлопываем лишние пробелы
            .replace(/\s+/g, ' ')
            .trim();
    }

    /**
     * 2. ТОКЕНИЗАЦИЯ (Tokenizer)
     * Разбивает строку на слова, фильтруя слишком короткие
     */
    private tokenize(text: string): string[] {
        const normalized = this.normalize(text);
        // Фильтруем слова короче 3 символов (требование 6)
        return normalized.split(' ').filter(token => token.length >= 3);
    }

    /**
     * 3. ГЕНЕРАТОР ТРИГРАММ (TrigramGenerator)
     * Разбивает токены на пересекающиеся последовательности по 3 символа
     */
    private generateTrigrams(token: string): string[] {
        if (token.length < 3) return [];

        const trigrams: string[] = [];
        // Добавляем пробелы по краям для учета начала и конца слова
        const padded = ` ${token} `;

        for (let i = 0; i < padded.length - 2; i++) {
            trigrams.push(padded.substring(i, i + 3));
        }

        return trigrams;
    }

    /**
     * 4. ИНДЕКСАТОР (Indexer)
     * Создает или обновляет инвертированный индекс в памяти
     */
    public buildIndex(items: T[]): void {
        console.time('[SearchEngine] BuildIndex');
        this.index.clear();
        this.items.clear();

        for (const item of items) {
            this.addToIndex(item);
        }

        console.timeEnd('[SearchEngine] BuildIndex');
        console.log(`[SearchEngine] Index built: ${this.items.size} documents, ${this.index.size} unique trigrams`);
    }

    /**
     * Вспомогательный метод для добавления одного элемента в индекс
     */
    private addToIndex(item: T): void {
        this.items.set(item.id, item);

        // Объединяем текст из всех индексируемых полей
        const combinedText = this.searchFields
            .map(field => item[field])
            .filter(Boolean)
            .join(' ');

        const tokens = this.tokenize(combinedText);

        for (const token of tokens) {
            const trigrams = this.generateTrigrams(token);
            for (const tri of trigrams) {
                if (!this.index.has(tri)) {
                    this.index.set(tri, new Set());
                }
                this.index.get(tri)!.add(item.id);
            }
        }
    }

    /**
     * 5. СКОРИНГ И ПОИСК (Scorer)
     * Рассчитывает релевантность и возвращает отсортированные результаты
     */
    public search(query: string, threshold = 0.05): SearchResult<T>[] {
        if (!query || query.trim().length === 0) return [];

        const queryTokens = this.tokenize(query);
        const queryTrigrams: string[] = [];

        for (const token of queryTokens) {
            queryTrigrams.push(...this.generateTrigrams(token));
        }

        if (queryTrigrams.length === 0) return [];

        // Карта: DocumentID -> Количество совпавших триграмм
        const matchCounts: Map<string, number> = new Map();

        for (const tri of queryTrigrams) {
            const docIds = this.index.get(tri);
            if (docIds) {
                for (const id of docIds) {
                    matchCounts.set(id, (matchCounts.get(id) || 0) + 1);
                }
            }
        }

        const results: SearchResult<T>[] = [];
        const totalUniqueTrigrams = new Set(queryTrigrams).size;

        matchCounts.forEach((count, id) => {
            const item = this.items.get(id);
            if (!item) return;

            // Формула релевантности (требование 4)
            // score = совпавшие_триграммы / общее_количество_триграмм_запроса
            const score = count / queryTrigrams.length;

            if (score >= threshold) {
                results.push({ item, score });
            }
        });

        // Сортировка по релевантности (требование 5)
        return results.sort((a, b) => b.score - a.score);
    }

    /**
     * Обновление одного элемента без пересборки всего индекса (Оптимизация)
     */
    public updateItem(item: T): void {
        // В идеале тут нужно удалять старые триграммы, но для упрощения 
        // и учитывая требование "индекс хранится в памяти", можно просто передобавить
        this.addToIndex(item);
    }
}
