import { StyleSheet, useWindowDimensions, View } from "react-native";
import RenderHtml, {
    CustomTagRendererRecord,
    HTMLContentModel,
    HTMLElementModel,
} from 'react-native-render-html';

interface Props {
    verseText: string;
    fontSize?: number;
    lineHeight?: number;
}

const tajweedModel = HTMLElementModel.fromCustomModel({
    tagName: 'tajweed',
    contentModel: HTMLContentModel.textual,
});

const customHTMLElementModels = { tajweed: tajweedModel };

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

export default function VerseRenderer({ verseText, fontSize = 26, lineHeight = 46 }: Props) {
    const { width } = useWindowDimensions();
    if (!verseText) return null;

    return (
        <View style={styles.card}>
            <RenderHtml
                contentWidth={width - 64}
                source={{ html: verseText }}
                customHTMLElementModels={customHTMLElementModels}
                renderers={renderers}
                baseStyle={{
                    textAlign: 'justify',
                    writingDirection: 'rtl',
                    fontSize,
                    lineHeight,
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
    },
});