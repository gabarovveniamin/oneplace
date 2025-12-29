import { JobModel, Job } from '../models/Job';
import { SearchEngine, SearchableItem } from './SearchEngine';

/**
 * МЕНЕДЖЕР ПОИСКА
 * Синхронизирует данные из БД с поисковым движком в памяти.
 */
export class SearchManager {
    private static instance: SearchManager;
    private jobEngine: SearchEngine<Job>;
    private isInitialized = false;

    private constructor() {
        // Инициализируем движок для вакансий по ключевым полям
        this.jobEngine = new SearchEngine<Job>([], ['title', 'company', 'description', 'location']);
    }

    public static getInstance(): SearchManager {
        if (!SearchManager.instance) {
            SearchManager.instance = new SearchManager();
        }
        return SearchManager.instance;
    }

    /**
     * Первоначальная загрузка всех активных вакансий в индекс
     */
    public async initialize(): Promise<void> {
        if (this.isInitialized) return;

        console.log('[SearchManager] Initializing job search index...');
        try {
            // Получаем все активные вакансии (без пагинации для индекса)
            const { jobs } = await JobModel.findMany({ isActive: true }, { page: 1, limit: 10000 });

            // Превращаем их в SearchableItem (Job уже подходит под интерфейс)
            this.jobEngine.buildIndex(jobs);

            this.isInitialized = true;
            console.log(`[SearchManager] Job index initialized with ${jobs.length} items`);
        } catch (error) {
            console.error('[SearchManager] Initialization failed:', error);
        }
    }

    /**
     * Поиск вакансий
     */
    public searchJobs(query: string, limit = 20): Job[] {
        // Умный поиск через движок
        const results = this.jobEngine.search(query);

        // Возвращаем только объекты вакансий, ограниченные лимитом
        return results.slice(0, limit).map(res => res.item);
    }

    /**
     * Метод для обновления индекса при создании/изменении вакансии в БД
     */
    public refreshJob(job: Job): void {
        this.jobEngine.updateItem(job);
    }
}

export const searchManager = SearchManager.getInstance();
