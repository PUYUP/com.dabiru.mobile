export type AppConfig = {
  theme: {
    type: 'auto' | 'light' | 'dark';
  };
  reading: {
    readingPreference: string;
    selectedWordByWordLocale: string;
    wordClickFunctionality: string;
    isReadingByRevelationOrder: boolean;
    wordByWordContentType: string[];
    wordByWordDisplay: string[];
    wordByWordTooltipContentType: string[];
    wordByWordInlineContentType: string[];
    selectedReadingTranslation: string;
    selectedReflectionLanguages: string[];
    selectedLessonLanguages: string[];
  };
  quranReaderStyles: {
    tafsirFontScale: number;
    quranTextFontScale: number;
    translationFontScale: number;
    wordByWordFontScale: number;
    reflectionFontScale: number;
    qnaFontScale: number;
    lessonFontScale: number;
    surahInfoFontScale: number;
    hadithFontScale: number;
    layersFontScale: number;
    quranFont: string;
    mushafLines: string;
    showTajweedRules: boolean;
  };
  translations: {
    selectedTranslations: number[];
  };
  tafsirs: {
    selectedTafsirs: string[];
  };
  audio: {
    reciter: number;
    playbackRate: number;
    showTooltipWhenPlayingAudio: boolean;
    enableAutoScrolling: boolean;
  };
  language: {
    language: string | null;
  };
  userHasCustomised: {
    userHasCustomised: boolean;
  };
};

export type UpdateConfigPayload = {
    group: keyof AppConfig;
    key: string;
    value: any;
}