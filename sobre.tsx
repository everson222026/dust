import { useRouter } from 'expo-router';
import { Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { goBackOrReplace } from '../lib/navigation';
import { useAppTheme } from '../theme/ThemeContext';
import { ThemedIonicons as Ionicons, ThemedSafeAreaView as SafeAreaView, ThemedText as Text, ThemedView as View } from '../theme/SmartThemedComponents';

export default function SobreScreen() {
  const router = useRouter();
  const { isDark } = useAppTheme();

  const palette = isDark
    ? { background: '#1B1A17', card: '#292722', border: '#514B40', text: '#FFFFFF', secondary: '#E0DCD3', innerCard: '#1D1C19' }
    : { background: '#F2E1C7', card: '#E3D2B5', border: '#C8B58F', text: '#3D0404', secondary: '#644219', innerCard: '#F2E1C7' };

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
            <Text style={[styles.headerTitle, { color: palette.text }]}>Sobre o App</Text>
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

          <Text style={[styles.sectionTitle, { color: palette.text }]}>O que é o DUST?</Text>
          <Text style={[styles.paragraph, { color: palette.secondary }]}>
            O <Text style={[styles.bold, { color: palette.text }]}>Museu do Inusitado (DUST)</Text> é um espaço digital dedicado a celebrar tudo aquilo que não serve para absolutamente nada, mas que carrega consigo memórias, mistérios e boas histórias.
          </Text>

          <Text style={[styles.sectionTitle, { color: palette.text }]}>Nossa Missão</Text>
          <Text style={[styles.paragraph, { color: palette.secondary }]}>
            Dar abrigo a objetos esquecidos em gavetas, manuais sem aparelhos, tampas sem potes e bugigangas sem função. Aqui, a inutilidade é uma virtude e a criatividade não tem limites.
          </Text>

          <View style={styles.featureList}>
            <FeatureItem icon="cube-outline" title="Acervo Único" description="Explore peças improváveis enviadas por visitantes de todo o mundo." palette={palette} />
            <FeatureItem icon="people-outline" title="Comunidade" description="Siga outros colecionadores de insignificâncias e troque ideias." palette={palette} />
            <FeatureItem icon="heart-outline" title="Interação" description="Curta, comente e salve suas peças favoritas na sua coleção particular." palette={palette} />
            <FeatureItem icon="chatbubble-ellipses-outline" title="Mensagens diretas" description="Converse com outros visitantes sobre suas descobertas e histórias." palette={palette} />
          </View>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/explorar')}
          >
            <Ionicons name="sparkles-outline" size={18} color="#F2E1C7" />
            <Text style={styles.actionButtonText}>EXPLORAR O ACERVO</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function FeatureItem({ icon, title, description, palette }: { icon: any; title: string; description: string; palette: any }) {
  return (
    <View style={[styles.featureItem, { backgroundColor: palette.innerCard, borderColor: palette.border }]}>
      <View style={[styles.featureIcon, { backgroundColor: palette.card }]}>
        <Ionicons name={icon} size={20} color="#2F524F" />
      </View>
      <View style={styles.featureTextWrap}>
        <Text style={[styles.featureTitle, { color: palette.text }]}>{title}</Text>
        <Text style={[styles.featureDescription, { color: palette.secondary }]}>{description}</Text>
      </View>
    </View>
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
  featureList: { marginTop: 18, gap: 12 },
  featureItem: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, padding: 12, gap: 12 },
  featureIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  featureTextWrap: { flex: 1 },
  featureTitle: { fontSize: 13, fontWeight: '900' },
  featureDescription: { fontSize: 11, marginTop: 2, lineHeight: 16 },
  actionButton: { marginTop: 24, backgroundColor: '#2F524F', borderRadius: 12, minHeight: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  actionButtonText: { color: '#F2E1C7', fontSize: 12, fontWeight: '900', letterSpacing: 0.8 },
});
