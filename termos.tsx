import { useRouter } from 'expo-router';
import { Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { goBackOrReplace } from '../lib/navigation';
import { useAppTheme } from '../theme/ThemeContext';
import { ThemedIonicons as Ionicons, ThemedSafeAreaView as SafeAreaView, ThemedText as Text, ThemedView as View } from '../theme/ThemedComponents';
import { useMuseumAudio } from '../components/museum/MuseumAudioProvider';

export default function TermosScreen() {
  const router = useRouter();
  const { palette: themePalette } = useAppTheme();
  const palette = {
    background: themePalette.background,
    card: themePalette.surface,
    border: themePalette.border,
    text: themePalette.text,
    secondary: themePalette.secondary,
    accent: themePalette.accent,
    gold: themePalette.gold,
  };
  const { enabled, playEffect, speakLoud } = useMuseumAudio();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.background }]}>
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            onPress={() => goBackOrReplace(router, '/home')}
            style={[styles.backButton, { backgroundColor: palette.card, borderColor: palette.border }]}
          >
            <Ionicons name="arrow-back" size={22} color={palette.text} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.eyebrow}>MUSEU DO INUSITADO</Text>
            <Text style={[styles.headerTitle, { color: palette.text }]}>Termos de Uso</Text>
          </View>
          <View style={{ width: 38 }} />
        </View>

        <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/logo-dust.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <Text style={[styles.sectionTitle, { color: palette.text }]}>1. Aceitação dos Termos</Text>
          <Text style={[styles.paragraph, { color: palette.secondary }]}>
            Ao acessar e utilizar o aplicativo <Text style={[styles.bold, { color: palette.text }]}>Museu do Inusitado (DUST)</Text>, você concorda em cumprir estes Termos de Uso e todas as leis e regulamentos aplicáveis.
          </Text>

          <Text style={[styles.sectionTitle, { color: palette.text }]}>2. Natureza do Conteúdo</Text>
          <Text style={[styles.paragraph, { color: palette.secondary }]}>
            O DUST é um ambiente voltado ao humor, à criatividade e à apreciação de objetos inusitados ou sem função prática. As publicações devem manter o respeito e a leveza.
          </Text>

          <Text style={[styles.sectionTitle, { color: palette.text }]}>3. Responsabilidade pelas Publicações</Text>
          <Text style={[styles.paragraph, { color: palette.secondary }]}>
            Cada visitante é inteiramente responsável pelas peças, histórias e comentários que publica no acervo, podendo editar ou remover seus conteúdos a qualquer momento.
          </Text>

          <Text style={[styles.sectionTitle, { color: palette.text }]}>4. Privacidade e Dados</Text>
          <Text style={[styles.paragraph, { color: palette.secondary }]}>
            Respeitamos sua privacidade. Seus dados de perfil e interações são armazenados com segurança para garantir a melhor experiência na comunidade.
          </Text>

          <Text style={[styles.sectionTitle, { color: palette.text }]}>5. Mensagens diretas</Text>
          <Text style={[styles.paragraph, { color: palette.secondary }]}>
            As conversas diretas ficam disponíveis apenas para as pessoas participantes e não aparecem no acervo público. Evite compartilhar dados sensíveis nas mensagens.
          </Text>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => goBackOrReplace(router, '/home')}
          >
            <Ionicons name="checkmark-circle-outline" size={18} color="#F2E1C7" />
            <Text style={styles.actionButtonText}>ENTENDI E CONCORDO</Text>
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Botão secreto"
            accessibilityHint="Reproduz uma surpresa falada em voz alta."
            disabled={!enabled}
            onPress={() => {
              playEffect('chime');
              speakLoud('fabio gay');
            }}
            style={[styles.secretButton, { backgroundColor: palette.accent, borderColor: palette.gold, opacity: enabled ? 1 : 0.55 }]}
          >
            <Ionicons name="volume-high" size={18} color={palette.background} />
            <Text style={[styles.secretButtonText, { color: palette.background }]}>Botão secreto</Text>
            <Ionicons name="sparkles" size={15} color={palette.background} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  page: { padding: 18, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  backButton: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 19, borderWidth: 1 },
  headerCenter: { alignItems: 'center' },
  eyebrow: { color: '#595626', fontSize: 11, fontWeight: '900', letterSpacing: 1.1 },
  headerTitle: { fontSize: 22, fontWeight: '900', marginTop: 2 },
  card: { borderRadius: 16, borderWidth: 1, padding: 20 },
  logoContainer: { alignItems: 'center', marginBottom: 16 },
  logo: { width: 110, height: 90 },
  sectionTitle: { fontSize: 16, fontWeight: '900', marginTop: 16, marginBottom: 8 },
  paragraph: { fontSize: 14, lineHeight: 22 },
  bold: { fontWeight: '900' },
  actionButton: { marginTop: 24, backgroundColor: '#2F524F', borderRadius: 12, minHeight: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  actionButtonText: { color: '#F2E1C7', fontSize: 12, fontWeight: '900', letterSpacing: 0.8 },
  secretButton: { marginTop: 11, minHeight: 48, borderRadius: 12, borderWidth: 1.5, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, shadowColor: '#000000', shadowOffset: { width: 0, height: 4 }, shadowRadius: 9, shadowOpacity: 0.18, elevation: 3 },
  secretButtonText: { fontSize: 12, fontWeight: '900', letterSpacing: 0.5 },
});
