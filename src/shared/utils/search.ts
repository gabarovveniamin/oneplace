/**
 * Trigram Search Utility
 *
 * This utility provides functions for breaking strings into trigrams and 
 * calculating similarity between strings based on trigrams.
 */

/**
 * Splits a string into an array of trigrams.
 * A trigram is a group of three consecutive characters.
 * Standard trigram logic adds two spaces at the beginning and one at the end.
 */
export const getTrigrams = (str: string): string[] => {
    if (!str) return [];
    const s = `  ${str.toLowerCase()} `;
    const trigrams = [];
    for (let i = 0; i < s.length - 2; i++) {
        trigrams.push(s.substring(i, i + 3));
    }
    return trigrams;
};

/**
 * Calculates the similarity between two strings using trigrams.
 * Returns a value between 0 and 1.
 */
export const calculateTrigramSimilarity = (str1: string, str2: string): number => {
    const trigrams1 = new Set(getTrigrams(str1));
    const trigrams2 = new Set(getTrigrams(str2));

    if (trigrams1.size === 0 || trigrams2.size === 0) return 0;

    let intersectionCount = 0;
    trigrams1.forEach(t => {
        if (trigrams2.has(t)) {
            intersectionCount++;
        }
    });

    const unionCount = new Set([...trigrams1, ...trigrams2]).size;

    return intersectionCount / unionCount;
};

/**
 * Filters and sorts an array of objects based on trigram similarity.
 */
export const fuzzySearch = <T>(
    items: T[],
    query: string,
    keys: (keyof T)[],
    threshold = 0.3
): T[] => {
    if (!query) return items;

    return items
        .map(item => {
            let maxSimilarity = 0;
            keys.forEach(key => {
                const value = String(item[key] || '');
                const sim = calculateTrigramSimilarity(query, value);
                if (sim > maxSimilarity) maxSimilarity = sim;
            });
            return { item, similarity: maxSimilarity };
        })
        .filter(pair => pair.similarity >= threshold)
        .sort((a, b) => b.similarity - a.similarity)
        .map(pair => pair.item);
};
