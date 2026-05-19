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
import { StyleSheet, useWindowDimensions, View } from "react-native";
import RenderHtml, {
    CustomTagRendererRecord,
    HTMLContentModel,
    HTMLElementModel,
} from 'react-native-render-html';

interface Props {
    htmlText: string;
    italic?: boolean;
    fontSize?: number;
    /** Callback fired when the user selects text (Android only via onSelectionChange) */
    onTextSelected?: (selectedText: string) => void;
}

const tajweedModel = HTMLElementModel.fromCustomModel({
    tagName: 'tajweed',
    contentModel: HTMLContentModel.textual,
});

const supModel = HTMLElementModel.fromCustomModel({
    tagName: 'sup',
    contentModel: HTMLContentModel.textual,
});

const customHTMLElementModels = { tajweed: tajweedModel, sup: supModel };

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

const renderers: CustomTagRendererRecord = {
    tajweed: ({ tnode, TDefaultRenderer, ...props }: any) => {
        const cls = tnode.attributes?.class ?? '';
        const color = tajweedColors[cls] ?? undefined;
        return (
            <TDefaultRenderer tnode={tnode} {...props} style={{ color }} />
        );
    },
};

export default function TextRenderer({
    htmlText,
    italic = false,
    fontSize = 18,
    onTextSelected,
}: Props) {
    const { width } = useWindowDimensions();

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

    if (!htmlText || !fontsLoaded) return null;

    const fontFamily = italic
        ? 'EBGaramond_500Medium_Italic'
        : 'EBGaramond_500Medium';

    return (
        <View style={styles.card}>
            <RenderHtml
                contentWidth={width - 64}
                source={{ html: htmlText }}
                customHTMLElementModels={customHTMLElementModels}
                renderers={renderers}
                ignoredDomTags={['sup']}
                systemFonts={[
                    'EBGaramond_400Regular',
                    'EBGaramond_400Regular_Italic',
                    'EBGaramond_500Medium',
                    'EBGaramond_500Medium_Italic',
                    'EBGaramond_600SemiBold',
                    'EBGaramond_600SemiBold_Italic',
                    'EBGaramond_700Bold',
                    'EBGaramond_700Bold_Italic',
                    'EBGaramond_800ExtraBold',
                    'EBGaramond_800ExtraBold_Italic',
                ]}
                // ─── Text selection (iOS & Android) ───────────────────────────
                // react-native-render-html passes renderersProps down to every
                // Text node it creates.  Setting `selectable: true` here makes
                // ALL text nodes selectable, which gives native iOS magnifier /
                // copy-menu and Android selection handles out of the box.
                renderersProps={{
                    // The key "body" targets the root wrapper; individual leaf
                    // Text nodes honour the selectable flag via the library's
                    // internal defaultTextProps spreading.
                    body: {
                        selectable: true,
                    },
                }}
                // defaultTextProps is the correct API for setting props on every
                // Text leaf rendered by the library (works on both platforms).
                defaultTextProps={{
                    selectable: true,
                    // Android: suppress the default long-press context menu that
                    // only shows "Select All" – the native handles already appear.
                    suppressHighlighting: false,
                }}
                baseStyle={{
                    textAlign: 'left',
                    writingDirection: 'ltr',
                    fontSize,
                    lineHeight: fontSize * 1.65,
                    fontStyle: italic ? 'italic' : 'normal',
                    fontFamily,
                    color: '#222222',
                }}
                tagsStyles={{
                    h2: {
                        marginBottom: 16,
                        fontWeight: '600',
                        fontFamily: 'EBGaramond_600SemiBold',
                    },
                    h3: {
                        marginBottom: 12,
                        fontWeight: '500',
                        fontFamily: 'EBGaramond_500Medium',
                    },
                    p: {
                        marginBottom: 16,
                        fontFamily,
                    },
                    strong: {
                        fontFamily: italic
                            ? 'EBGaramond_700Bold_Italic'
                            : 'EBGaramond_700Bold',
                        fontWeight: '700',
                    },
                    em: {
                        fontFamily: 'EBGaramond_500Medium_Italic',
                        fontStyle: 'italic',
                    },
                    sup: {
                        fontSize: fontSize * 0.7,
                        display: 'none',
                    },
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'transparent',
    },
});