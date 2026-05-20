import * as Font from 'expo-font';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, useWindowDimensions, View } from 'react-native';
import RenderHtml, {
    CustomTagRendererRecord,
    HTMLContentModel,
    HTMLElementModel,
} from 'react-native-render-html';

/**
 * QuranText
 *
 * Renders Quranic Arabic HTML (from Quran.com API) using:
 *  - react-native-render-html  → parses <tajweed> tags & inline HTML
 *  - UthmanicHafs font          → loaded via expo-font at runtime from CDN
 *
 * Font CDN: https://verses.quran.foundation (Quran Foundation)
 *
 * verseText format (from API field `text_imlaei_simple` or tajweed HTML):
 *   Plain:   "بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ"
 *   Tajweed: '<tajweed class="ham_wasl">ٱ</tajweed>...'
 */

// ─── Font ────────────────────────────────────────────────────────────────────

const FONT_FAMILY = 'UthmanicHafs';

// Load from Quran Foundation CDN at runtime.
// Alternatively, download the file and put it in assets/fonts/ then use:
//   require('../assets/fonts/UthmanicHafs1Ver18.ttf')
const FONT_SOURCE =
    'https://verses.quran.foundation/fonts/quran/hafs/uthmanic_hafs/UthmanicHafs1Ver18.ttf';

// ─── Tajweed tag model ───────────────────────────────────────────────────────

const tajweedModel = HTMLElementModel.fromCustomModel({
    tagName: 'tajweed',
    contentModel: HTMLContentModel.textual,
});

const customHTMLElementModels = { tajweed: tajweedModel };

// ─── Tajweed color map ───────────────────────────────────────────────────────

const tajweedColors: Record<string, string> = {
    ham_wasl: '#AAAAAA',
    laam_shamsiyah: '#AAAAAA',
    madda_normal: '#537FFF',
    madda_permissible: '#4BC8CF',
    madda_obligatory: '#2144C1',
    ghunnah: '#FF7E1D',
    ikhafa: '#9400D3',
    idgham_ghunnah: '#169777',
    idgham_wo_ghunnah: '#169200',
    qalaqah: '#DD6608',
    slnt: '#AAAAAA',
};

// ─── Custom renderers ────────────────────────────────────────────────────────

const renderers: CustomTagRendererRecord = {
    tajweed: ({ tnode, TDefaultRenderer, ...props }: any) => {
        const cls: string = tnode.attributes?.class ?? '';
        const color = tajweedColors[cls];
        return (
            <TDefaultRenderer
                tnode={tnode}
                {...props}
                style={color ? { color } : undefined}
            />
        );
    },
};

// ─── Props ───────────────────────────────────────────────────────────────────

interface Props {
    verseText: string;
    fontSize?: number;
    lineHeight?: number;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function QuranText({
    verseText,
    fontSize = 26,
    lineHeight = 46,
}: Props) {
    const { width } = useWindowDimensions();
    const [fontReady, setFontReady] = useState(false);

    useEffect(() => {
        let cancelled = false;

        Font.loadAsync({ [FONT_FAMILY]: { uri: FONT_SOURCE } })
            .then(() => {
                if (!cancelled) setFontReady(true);
            })
            .catch((err) => {
                console.warn('[QuranText] Font load failed, using system fallback:', err);
                if (!cancelled) setFontReady(true); // render anyway with fallback
            });

        return () => {
            cancelled = true;
        };
    }, []);

    if (!verseText) return null;

    // Horizontal padding from parent (adjust to match your layout)
    const contentWidth = width - 64;

    return (
        <View style={styles.container}>
            {!fontReady ? (
                // Show a small spinner while font downloads (~200-400 KB)
                <ActivityIndicator
                    size="small"
                    color="#888"
                    style={{ minHeight: lineHeight }}
                />
            ) : (
                <RenderHtml
                    contentWidth={contentWidth}
                    source={{ html: verseText }}
                    customHTMLElementModels={customHTMLElementModels}
                    renderers={renderers}
                    // Tell RenderHtml that UthmanicHafs is available as a system font
                    systemFonts={[FONT_FAMILY]}
                    baseStyle={{
                        fontFamily: FONT_FAMILY,
                        textAlign: 'justify',
                        writingDirection: 'rtl',
                        fontSize,
                        lineHeight,
                        color: '#1a1a1a',
                    }}
                    // Propagate font to all inline tags (including <tajweed>)
                    tagsStyles={{
                        body: {
                            fontFamily: FONT_FAMILY,
                            fontSize,
                            lineHeight,
                        },
                        span: { fontFamily: FONT_FAMILY },
                        tajweed: { fontFamily: FONT_FAMILY },
                    }}
                />
            )}
        </View>
    );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'transparent',
    },
});