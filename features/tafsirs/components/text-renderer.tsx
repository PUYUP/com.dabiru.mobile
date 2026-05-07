import { StyleSheet, useWindowDimensions, View } from "react-native";
import RenderHtml, {
    CustomTagRendererRecord,
    HTMLContentModel,
    HTMLElementModel,
} from 'react-native-render-html';

interface Props {
    htmlText: string;
    italic?: boolean;
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

export default function TextRenderer({ htmlText, italic = false }: Props) {
    const { width } = useWindowDimensions();
    if (!htmlText) return null;

    return (
        <View style={styles.card}>
            <RenderHtml
                contentWidth={width - 64}
                source={{ html: htmlText }}
                customHTMLElementModels={customHTMLElementModels}
                renderers={renderers}
                ignoredDomTags={['sup']}
                baseStyle={{
                    textAlign: 'left',
                    writingDirection: 'ltr',
                    fontSize: 17,
                    lineHeight: 28,
                    fontStyle: italic ? 'italic' : 'normal',
                    fontFamily: italic ? 'Georgia' : undefined,
                }}
                tagsStyles={{
                    h2: {
                        marginBottom: 16,
                        fontWeight: 600,
                    },
                    p: {
                        marginBottom: 16,
                    },
                    sup: {
                        fontSize: 12,
                        display: 'none',
                    },
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