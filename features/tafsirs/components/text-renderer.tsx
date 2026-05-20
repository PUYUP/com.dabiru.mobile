import {
    EBGaramond_400Regular,
    EBGaramond_400Regular_Italic,
    EBGaramond_500Medium,
    EBGaramond_500Medium_Italic,
    EBGaramond_600SemiBold,
    EBGaramond_600SemiBold_Italic,
    EBGaramond_700Bold,
    EBGaramond_700Bold_Italic,
    EBGaramond_800ExtraBold,
    EBGaramond_800ExtraBold_Italic,
    useFonts,
} from '@expo-google-fonts/eb-garamond';

import React, {
    forwardRef,
    useImperativeHandle,
    useRef,
    useState,
} from 'react';

import {
    StyleSheet,
    useWindowDimensions,
    View,
} from 'react-native';

import { WebView } from 'react-native-webview';

interface Props {
    htmlText: string;
    italic?: boolean;
    fontSize?: number;
    onTextSelected?: (selectedText: string | null) => void;
}

export interface TextRendererHandle {
    clearSelection: () => void;
}

const tajweedCSS = `
  .ham_wasl, .laam_shamsiyah { color: #AAAAAA; }
  .madda_normal               { color: #537FFF; }
  .madda_permissible          { color: #4BC8CF; }
  .madda_obligatory           { color: #2144C1; }
  .ghunnah                    { color: #FF7E1D; }
  .ikhafa                     { color: #9400D3; }
  .idgham_ghunnah             { color: #169777; }
  .idgham_wo_ghunnah          { color: #169200; }
  .qalaqah                    { color: #DD6608; }
  .slnt                       { color: #AAAAAA; }
`;

// CSS override: force semua elemen ber-font "kfgqpc" menggunakan UthmanicHafs dari CDN
const fontOverrideCSS = `
  [style*="kfgqpc"],
  [style*="KFGQPC"],
  [style*="Kfgqpc"],
  [style*="uthmanic"],
  [style*="Uthmanic"],
  [style*="UTHMANIC"] {
    font-family: 'UthmanicHafs', 'Traditional Arabic', serif !important;
  }
`;

function preprocessHtml(html: string): string {
    return html.replace(
        /(<p[^>]*>)([\s\S]*?)(\([^)]+\))\s*(<\/p>)/gi,
        (_, openTag, content, ref, closeTag) => {
            // Tidak ada newline/spasi di antara span dan konten Arab
            return `${openTag}<span class="surah-ref">${ref.trim()}</span>${content.trim()}${closeTag}`;
        }
    );
}

const TextRenderer = forwardRef<TextRendererHandle, Props>(
    (
        {
            htmlText,
            italic = false,
            fontSize = 18,
            onTextSelected,
        },
        ref
    ) => {
        console.log(htmlText)
        const { width } = useWindowDimensions();
        const [webViewHeight, setWebViewHeight] = useState(1);
        const webViewRef = useRef<WebView>(null);

        useImperativeHandle(ref, () => ({
            clearSelection: () => {
                webViewRef.current?.injectJavaScript(`
                    window.getSelection().removeAllRanges();
                    true;
                `);
            },
        }));

        const [fontsLoaded] = useFonts({
            EBGaramond_400Regular,
            EBGaramond_400Regular_Italic,
            EBGaramond_500Medium,
            EBGaramond_500Medium_Italic,
            EBGaramond_600SemiBold,
            EBGaramond_600SemiBold_Italic,
            EBGaramond_700Bold,
            EBGaramond_700Bold_Italic,
            EBGaramond_800ExtraBold,
            EBGaramond_800ExtraBold_Italic,
        });

        if (!htmlText || !fontsLoaded) {
            return null;
        }

        const fontStyle = italic ? 'italic' : 'normal';
        const lineHeight = fontSize * 1.45;

        const injectedJS = `
            (function() {

                // ── Font override: paksa semua elemen kfgqpc/uthmanic pakai UthmanicHafs ──
                function overrideUthmanicFont() {
                    const allElements = document.querySelectorAll('[style]');
                    allElements.forEach(function(el) {
                        const style = el.getAttribute('style') || '';
                        if (
                            style.toLowerCase().includes('kfgqpc') ||
                            style.toLowerCase().includes('uthmanic')
                        ) {
                            el.style.fontFamily = "'UthmanicHafs', 'Traditional Arabic', serif";
                        }
                    });
                }

                overrideUthmanicFont();
                window.addEventListener('load', overrideUthmanicFont);
                // ──────────────────────────────────────────────────────────────────────────

                function postHeight() {
                    // Paksa body shrink dulu sebelum ukur
                    document.body.style.height = 'auto';
                    document.documentElement.style.height = 'auto';

                    // Ukur dari last element, bukan scrollHeight
                    const children = document.body.children;
                    if (children.length === 0) return;

                    const lastChild = children[children.length - 1];
                    const rect = lastChild.getBoundingClientRect();
                    const height = Math.ceil(rect.bottom);

                    window.ReactNativeWebView.postMessage(
                        JSON.stringify({ type: 'HEIGHT', height: height })
                    );
                }

                postHeight();
                window.addEventListener('load', postHeight);

                let resizeTimeout;

                if (window.ResizeObserver) {
                    const resizeObserver = new ResizeObserver(() => {
                        clearTimeout(resizeTimeout);
                        resizeTimeout = setTimeout(() => {
                            requestAnimationFrame(postHeight);
                        }, 50);
                    });

                    resizeObserver.observe(document.body);
                }

                let selectionTimeout;

                document.addEventListener('selectionchange', function() {
                    clearTimeout(selectionTimeout);
                    selectionTimeout = setTimeout(() => {
                        const text = window
                            .getSelection()
                            .toString()
                            .trim();

                        window.ReactNativeWebView.postMessage(
                            JSON.stringify({
                                type: 'SELECTION_CHANGE',
                                text: text || null
                            })
                        );
                    }, 50);
                });
            })();
            true;
        `;

        const handleMessage = (event: any) => {
            try {
                const parsed = JSON.parse(event.nativeEvent.data);

                if (
                    parsed.type === 'HEIGHT' &&
                    parsed.height > 0
                ) {
                    setWebViewHeight(parsed.height);
                }

                if (parsed.type === 'SELECTION_CHANGE') {
                    onTextSelected?.(parsed.text);
                }
            } catch (error) {}
        };

        const styledHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
                />

                <link rel="preconnect" href="https://fonts.googleapis.com">

                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossorigin
                >

                <link
                    href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500;1,600;1,700;1,800&display=swap"
                    rel="stylesheet"
                >

                <style>
                    * {
                        box-sizing: border-box;
                        margin: 0;
                        padding: 0;
                    }

                    @font-face {
                        font-family: 'UthmanicHafs';

                        src:
                            url('https://verses.quran.foundation/fonts/quran/hafs/uthmanic_hafs/UthmanicHafs1Ver18.woff2')
                            format('woff2'),

                            url('https://verses.quran.foundation/fonts/quran/hafs/uthmanic_hafs/UthmanicHafs1Ver18.ttf')
                            format('truetype');

                        font-display: swap;
                    }

                    html,
                    body {
                        height: auto !important; 
                        width: 100%;
                        overflow: hidden;

                        font-family:
                            'EB Garamond',
                            'UthmanicHafs',
                            'Traditional Arabic',
                            serif;

                        background: transparent;
                    }

                    body {
                        color: #222222;
                        font-size: ${fontSize}px;
                        line-height: ${lineHeight}px;
                        font-style: ${fontStyle};
                        font-weight: 500;
                        word-wrap: break-word;
                        overflow-wrap: break-word;
                        -webkit-user-select: text;
                        user-select: text;
                        -webkit-touch-callout: default;
                        padding: 0;
                    }

                    p,
                    div,
                    span,
                    h2,
                    h3 {
                        unicode-bidi: plaintext;
                    }

                    h2 {
                        margin-bottom: 16px;
                        font-weight: 700;
                    }

                    h3 {
                        margin-bottom: 12px;
                        font-weight: 600;
                    }

                    p {
                        margin-bottom: 16px;
                    }

                    strong {
                        font-weight: 700;
                        font-style: ${italic ? 'italic' : 'normal'};
                    }

                    em {
                        font-style: italic;
                    }

                    sup {
                        font-size: ${fontSize * 0.7}px;
                        display: none;
                    }

                    img {
                        max-width: 100%;
                        height: auto;
                    }

                    table {
                        width: 100%;
                        border-collapse: collapse;
                    }

                    /* Ganti p yang lama */
                    p {
                        margin-bottom: 16px;
                        unicode-bidi: plaintext;
                    }

                    /* Khusus p yang mengandung Arab + surah-ref */
                    p:has(.surah-ref) {
                        display: flex;
                        flex-direction: column;
                        align-items: flex-end;
                        margin-bottom: 16px;
                        gap: 2px;          /* ← kecilkan gap di sini */
                    }

                    .surah-ref {
                        font-family: 'EB Garamond', serif;
                        font-size: ${fontSize * 0.85}px;
                        color: #888888;
                        font-style: italic;
                        direction: ltr;
                        line-height: 1.4;
                        margin: 0;
                        margin-bottom: 16px;
                    }

                    ${tajweedCSS}

                    ${fontOverrideCSS}
                </style>
            </head>

            <body>
                ${preprocessHtml(htmlText)}
            </body>
            </html>
        `;

        return (
            <View
                style={[
                    styles.card,
                    {
                        width,
                    },
                ]}
            >
                <WebView
                    ref={webViewRef}
                    originWhitelist={['*']}
                    source={{
                        html: styledHTML,
                    }}
                    injectedJavaScript={injectedJS}
                    onMessage={handleMessage}
                    scrollEnabled={false}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    bounces={false}
                    automaticallyAdjustContentInsets={false}
                    contentInset={{
                        top: 0,
                        bottom: 0,
                        left: 0,
                        right: 0,
                    }}
                    style={[
                        styles.webView,
                        {
                            width: width - 32,
                            height: webViewHeight,
                        },
                    ]}
                />
            </View>
        );
    }
);

TextRenderer.displayName = 'TextRenderer';

export default TextRenderer;

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'transparent',
    },
    webView: {
        backgroundColor: 'transparent',
    },
});