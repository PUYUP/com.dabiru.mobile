export function getNextVerseKey(
    current: string,
    surahVerseCounts: Record<number, number>
): string | null {
    const [chapterStr, verseStr] = current.split(':');
    const chapter = Number(chapterStr);
    const verse = Number(verseStr);
    const maxVerse = surahVerseCounts[chapter];

    if (!maxVerse) return null;

    if (verse < maxVerse) {
        return `${chapter}:${verse + 1}`;
    }

    const nextChapter = chapter + 1;
    if (!surahVerseCounts[nextChapter]) return null;

    return `${nextChapter}:1`;
}