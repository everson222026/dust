import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import type { ReactNode } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
} from 'react-native';
import {
  ThemedIonicons as Ionicons,
  ThemedSafeAreaView as SafeAreaView,
  ThemedText as Text,
  ThemedView as View,
} from '../theme/SmartThemedComponents';
import { MUSEUM_FRAME_OPTIONS, getMuseumPalette, useAppTheme } from '../theme/ThemeContext';
import type { AppLanguage } from '../theme/ThemeContext';
import { goBackOrReplace } from '../lib/navigation';
import { useMuseumAudio } from '../components/museum/MuseumAudioProvider';

const PREF_KEYS = {
  language: '@dust_language',
  notifications: '@dust_notifications_enabled',
  reduceMotion: '@dust_reduce_motion',
};

type Language = AppLanguage;

const COPY: Record<Language, Record<string, string>> = {
  'pt-BR': {
    title: 'CONFIGURAÇÕES', subtitle: 'Personalize sua experiência no Museu.', appearance: 'AMBIENTE DA GALERIA',
    darkMode: 'A Noite no Museu', darkModeDescription: 'Apaga a luz geral e mantém os detalhes ativos iluminados, com texto claro e legível.',
    language: 'Idioma', languageDescription: 'Idioma da área de configurações.', notifications: 'NOTIFICAÇÕES',
    notificationsTitle: 'Avisos na interface', notificationsDescription: 'Mostrar avisos e novidades durante a apresentação.',
    accessibility: 'ACESSIBILIDADE', reduceMotion: 'Reduzir animações', reduceMotionDescription: 'Preferência para movimentos mais discretos.',
    highContrast: 'Alto contraste', highContrastDescription: 'Melhora a leitura de textos, bordas e controles no aplicativo.',
    more: 'MAIS OPÇÕES', about: 'Sobre o aplicativo', terms: 'Termos de uso', reset: 'RESTAURAR PREFERÊNCIAS',
    saved: 'Preferência salva neste dispositivo.', resetDone: 'Preferências restauradas.',
    languageNote: 'O idioma escolhido é aplicado em todo o aplicativo e salvo neste dispositivo.',
  },
  'en-US': {
    title: 'SETTINGS', subtitle: 'Personalize your museum experience.', appearance: 'APPEARANCE',
    darkMode: 'Dark theme', darkModeDescription: 'Reduces brightness and adapts colors for low-light environments.',
    language: 'Language', languageDescription: 'Language for the settings area.', notifications: 'NOTIFICATIONS',
    notificationsTitle: 'Interface notices', notificationsDescription: 'Show notices and updates during the presentation.',
    accessibility: 'ACCESSIBILITY', reduceMotion: 'Reduce animations', reduceMotionDescription: 'Preference for subtler movement.',
    highContrast: 'High contrast', highContrastDescription: 'Improves text, border, and control contrast throughout the app.',
    more: 'MORE OPTIONS', about: 'About the app', terms: 'Terms of use', reset: 'RESTORE PREFERENCES',
    saved: 'Preference saved on this device.', resetDone: 'Preferences restored.',
    languageNote: 'Your selected language is applied throughout the app and saved on this device.',
  },
  'es-ES': {
    title: 'CONFIGURACIÓN', subtitle: 'Personaliza tu experiencia en el museo.', appearance: 'APARIENCIA',
    darkMode: 'Tema oscuro', darkModeDescription: 'Reduce el brillo y adapta los colores para ambientes con poca luz.',
    language: 'Idioma', languageDescription: 'Idioma de la sección de configuración.', notifications: 'NOTIFICACIONES',
    notificationsTitle: 'Avisos en la interfaz', notificationsDescription: 'Mostrar avisos y novedades durante la presentación.',
    accessibility: 'ACCESIBILIDAD', reduceMotion: 'Reducir animaciones', reduceMotionDescription: 'Preferencia para movimientos más discretos.',
    highContrast: 'Alto contraste', highContrastDescription: 'Mejora el contraste de textos, bordes y controles en la aplicación.',
    more: 'MÁS OPCIONES', about: 'Acerca de la aplicación', terms: 'Términos de uso', reset: 'RESTABLECER PREFERENCIAS',
    saved: 'Preferencia guardada en este dispositivo.', resetDone: 'Preferencias restablecidas.',
    languageNote: 'El idioma elegido se aplica en toda la aplicación y se guarda en este dispositivo.',
  },
};

export default function ConfiguracoesScreen() {
  const router = useRouter();
  const { isDark, highContrast, setDarkMode, setHighContrast, frameStyle, setFrameStyle, language, setLanguage } = useAppTheme();
  const { enabled: soundsEnabled, setSoundEnabled } = useMuseumAudio();
  const [notifications, setNotifications] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const t = COPY[language];

  const colors = getMuseumPalette(isDark, highContrast);
  const palette = {
    background: colors.background,
    card: colors.surface,
    inner: colors.raised,
    border: colors.border,
    text: colors.text,
    secondary: colors.secondary,
    accent: colors.forest,
    buttonText: colors.background,
  };

  const loadPreferences = useCallback(async () => {
    try {
      const values = await AsyncStorage.multiGet([
        PREF_KEYS.language,
        PREF_KEYS.notifications,
        PREF_KEYS.reduceMotion,
      ]);
      const stored: Record<string, string | null> = {};
      values.forEach(([key, value]) => { stored[key] = value; });
      if (stored[PREF_KEYS.language] === 'en-US' || stored[PREF_KEYS.language] === 'es-ES' || stored[PREF_KEYS.language] === 'pt-BR') {
        await setLanguage(stored[PREF_KEYS.language] as Language);
      }
      if (stored[PREF_KEYS.notifications] !== null) setNotifications(stored[PREF_KEYS.notifications] === 'true');
      if (stored[PREF_KEYS.reduceMotion] !== null) setReduceMotion(stored[PREF_KEYS.reduceMotion] === 'true');
    } catch {
      Alert.alert('Configurações', 'Não foi possível carregar algumas preferências salvas.');
    } finally {
      setLoaded(true);
    }
  }, [setLanguage]);

  useFocusEffect(useCallback(() => { void loadPreferences(); }, [loadPreferences]));

  async function savePreference(key: string, value: string) {
    try {
      await AsyncStorage.setItem(key, value);
    } catch {
      Alert.alert('Não foi possível salvar', 'Verifique o armazenamento do dispositivo e tente novamente.');
    }
  }

  async function changeTheme(enabled: boolean) {
    try {
      await setDarkMode(enabled);
    } catch (error) {
      Alert.alert('Não foi possível salvar o tema', error instanceof Error ? error.message : 'Tente novamente.');
    }
  }

  async function changeContrast(enabled: boolean) {
    try {
      await setHighContrast(enabled);
    } catch (error) {
      Alert.alert('Não foi possível salvar o contraste', error instanceof Error ? error.message : 'Tente novamente.');
    }
  }

  async function chooseLanguage(nextLanguage: Language) {
    try {
      await setLanguage(nextLanguage);
    } catch {
      Alert.alert('Language', 'Could not save this language preference.');
    }
  }

  async function changeSwitch(
    key: string,
    enabled: boolean,
    setter: (value: boolean) => void,
  ) {
    setter(enabled);
    await savePreference(key, String(enabled));
  }

  async function resetPreferences() {
    try {
      await Promise.all([
        setDarkMode(false),
        setHighContrast(false),
        setFrameStyle('gold'),
        setLanguage('pt-BR'),
        setSoundEnabled(true),
        AsyncStorage.multiRemove([PREF_KEYS.notifications, PREF_KEYS.reduceMotion]),
      ]);
      setNotifications(true);
      setReduceMotion(false);
      Alert.alert('Configurações', COPY['pt-BR'].resetDone);
    } catch {
      Alert.alert('Não foi possível restaurar', 'Tente novamente.');
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.background }]}>
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Voltar ao menu"
            onPress={() => goBackOrReplace(router, '/menu')}
            style={[styles.headerButton, { backgroundColor: palette.card, borderColor: palette.border }]}
          >
            <Ionicons name="arrow-back" size={21} color={palette.text} />
          </TouchableOpacity>
          <View style={styles.headerCopy}>
            <Text style={[styles.eyebrow, { color: palette.secondary }]}>MUSEU DO INUSITADO</Text>
            <Text style={[styles.title, { color: palette.text }]}>{t.title}</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>
        <Text style={[styles.subtitle, { color: palette.secondary }]}>{t.subtitle}</Text>

        <Section title={t.appearance} palette={palette}>
          <PreferenceRow
            icon="moon-outline"
            title={t.darkMode}
            description={t.darkModeDescription}
            palette={palette}
            control={<Switch value={isDark} onValueChange={changeTheme} trackColor={{ false: '#C8B58F', true: '#2F524F' }} thumbColor={isDark ? '#E3B86B' : '#F8EFDF'} />}
          />
          <View style={[styles.rowDivider, { backgroundColor: palette.border }]} />
          <PreferenceRow
            icon="volume-high-outline"
            title="Sons da galeria"
            description="Toques suaves, abertura das portas e ambientação opcional do audioguia."
            palette={palette}
            control={<Switch value={soundsEnabled} onValueChange={value => { void setSoundEnabled(value).catch(() => Alert.alert('Som da galeria', 'Não foi possível salvar esta preferência.')); }} trackColor={{ false: '#C8B58F', true: palette.accent }} thumbColor={soundsEnabled ? colors.gold : '#F8EFDF'} />}
          />
          <View style={[styles.rowDivider, { backgroundColor: palette.border }]} />
          <View style={styles.frameSection}>
            <Text style={[styles.preferenceTitle, { color: palette.text }]}>Moldura das obras</Text>
            <Text style={[styles.preferenceDescription, { color: palette.secondary }]}>Escolha o acabamento das placas do acervo.</Text>
            <View style={styles.frameOptions}>
              {MUSEUM_FRAME_OPTIONS.map(option => (
                <TouchableOpacity
                  key={option.value}
                  accessibilityRole="button"
                  accessibilityState={{ selected: frameStyle === option.value }}
                  onPress={() => { void setFrameStyle(option.value); }}
                  style={[styles.frameOption, { backgroundColor: palette.inner, borderColor: frameStyle === option.value ? option.color : palette.border }]}
                >
                  <View style={[styles.frameSwatch, { borderColor: option.color, backgroundColor: palette.card }]} />
                  <Text style={[styles.frameLabel, { color: palette.text }]}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={[styles.rowDivider, { backgroundColor: palette.border }]} />
          <View style={styles.languageHeading}>
            <View style={[styles.preferenceIcon, { backgroundColor: palette.inner }]}>
              <Ionicons name="language-outline" size={20} color={palette.accent} />
            </View>
            <View style={styles.preferenceCopy}>
              <Text style={[styles.preferenceTitle, { color: palette.text }]}>{t.language}</Text>
              <Text style={[styles.preferenceDescription, { color: palette.secondary }]}>{t.languageDescription}</Text>
            </View>
          </View>
          <View style={styles.languageOptions}>
            <LanguageButton label="Português" code="pt-BR" active={language === 'pt-BR'} palette={palette} onPress={() => chooseLanguage('pt-BR')} />
            <LanguageButton label="English" code="en-US" active={language === 'en-US'} palette={palette} onPress={() => chooseLanguage('en-US')} />
            <LanguageButton label="Español" code="es-ES" active={language === 'es-ES'} palette={palette} onPress={() => chooseLanguage('es-ES')} />
          </View>
          <Text style={[styles.languageNote, { color: palette.secondary }]}>{t.languageNote}</Text>
        </Section>

        <Section title={t.notifications} palette={palette}>
          <PreferenceRow
            icon="notifications-outline"
            title={t.notificationsTitle}
            description={t.notificationsDescription}
            palette={palette}
            control={<Switch value={notifications} onValueChange={value => changeSwitch(PREF_KEYS.notifications, value, setNotifications)} trackColor={{ false: '#C8B58F', true: '#2F524F' }} thumbColor={notifications ? '#E3B86B' : '#F8EFDF'} />}
          />
          <Text style={[styles.helper, { color: palette.secondary }]}>As preferências de notificação são demonstrativas; este protótipo não envia notificações push.</Text>
        </Section>

        <Section title={t.accessibility} palette={palette}>
          <PreferenceRow
            icon="eye-outline"
            title={t.highContrast}
            description={t.highContrastDescription}
            palette={palette}
            control={<Switch value={highContrast} onValueChange={changeContrast} trackColor={{ false: '#C8B58F', true: '#2F524F' }} thumbColor={highContrast ? '#E3B86B' : '#F8EFDF'} />}
          />
          <View style={[styles.rowDivider, { backgroundColor: palette.border }]} />
          <PreferenceRow
            icon="flash-off-outline"
            title={t.reduceMotion}
            description={t.reduceMotionDescription}
            palette={palette}
            control={<Switch value={reduceMotion} onValueChange={value => changeSwitch(PREF_KEYS.reduceMotion, value, setReduceMotion)} trackColor={{ false: '#C8B58F', true: '#2F524F' }} thumbColor={reduceMotion ? '#E3B86B' : '#F8EFDF'} />}
          />
        </Section>

        <Section title={t.more} palette={palette}>
          <TouchableOpacity style={styles.linkRow} onPress={() => router.push('/sobre')}>
            <Ionicons name="information-circle-outline" size={21} color={palette.accent} />
            <Text style={[styles.linkText, { color: palette.text }]}>{t.about}</Text>
            <Ionicons name="chevron-forward" size={17} color={palette.secondary} />
          </TouchableOpacity>
          <View style={[styles.rowDivider, { backgroundColor: palette.border }]} />
          <TouchableOpacity style={styles.linkRow} onPress={() => router.push('/termos')}>
            <Ionicons name="document-text-outline" size={21} color={palette.accent} />
            <Text style={[styles.linkText, { color: palette.text }]}>{t.terms}</Text>
            <Ionicons name="chevron-forward" size={17} color={palette.secondary} />
          </TouchableOpacity>
        </Section>

        <TouchableOpacity
          accessibilityRole="button"
          style={[styles.resetButton, { borderColor: palette.border }]}
          onPress={() => Alert.alert(t.reset, language === 'en-US' ? 'Restore the default app preferences?' : language === 'es-ES' ? '¿Restablecer las preferencias predeterminadas?' : 'Restaurar as preferências padrão do aplicativo?', [
            { text: language === 'en-US' ? 'Cancel' : language === 'es-ES' ? 'Cancelar' : 'Cancelar', style: 'cancel' },
            { text: t.reset, style: 'destructive', onPress: () => { void resetPreferences(); } },
          ])}
        >
          <Ionicons name="refresh-outline" size={18} color={palette.secondary} />
          <Text style={[styles.resetText, { color: palette.secondary }]}>{t.reset}</Text>
        </TouchableOpacity>
        <Text style={[styles.version, { color: palette.secondary }]}>{loaded ? 'DUST · Museu do Inusitado · Preferências locais' : 'Carregando preferências…'}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, palette, children }: { title: string; palette: any; children: ReactNode }) {
  return (
    <View style={styles.sectionWrap}>
      <Text style={[styles.sectionTitle, { color: palette.secondary }]}>{title}</Text>
      <View style={[styles.section, { backgroundColor: palette.card, borderColor: palette.border }]}>{children}</View>
    </View>
  );
}

function PreferenceRow({
  icon, title, description, control, palette,
}: { icon: any; title: string; description: string; control: ReactNode; palette: any }) {
  return (
    <View style={styles.preferenceRow}>
      <View style={[styles.preferenceIcon, { backgroundColor: palette.inner }]}>
        <Ionicons name={icon} size={20} color={palette.accent} />
      </View>
      <View style={styles.preferenceCopy}>
        <Text style={[styles.preferenceTitle, { color: palette.text }]}>{title}</Text>
        <Text style={[styles.preferenceDescription, { color: palette.secondary }]}>{description}</Text>
      </View>
      {control}
    </View>
  );
}

function LanguageButton({
  label, code, active, palette, onPress,
}: { label: string; code: Language; active: boolean; palette: any; onPress: () => void }) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[
        styles.languageButton,
        { backgroundColor: active ? palette.accent : palette.inner, borderColor: active ? palette.accent : palette.border },
      ]}
    >
      <Text style={[styles.languageText, { color: active ? palette.buttonText : palette.text }]}>{label}</Text>
      <Text style={[styles.languageCode, { color: active ? palette.buttonText : palette.secondary }]}>{code}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  page: { flexGrow: 1, paddingHorizontal: 18, paddingTop: 14, paddingBottom: 42 },
  header: { minHeight: 55, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerButton: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  headerCopy: { alignItems: 'center', flex: 1 },
  eyebrow: { fontSize: 9, fontWeight: '900', letterSpacing: 1.4 },
  title: { fontSize: 20, fontWeight: '900', letterSpacing: 0.8, marginTop: 3 },
  subtitle: { fontSize: 13, lineHeight: 19, textAlign: 'center', marginTop: 4, marginBottom: 7 },
  sectionWrap: { marginTop: 17 },
  sectionTitle: { fontSize: 10, fontWeight: '900', letterSpacing: 1.1, marginBottom: 8, marginLeft: 3 },
  section: { borderWidth: 1, borderRadius: 15, overflow: 'hidden', paddingHorizontal: 13, paddingVertical: 4 },
  preferenceRow: { minHeight: 78, flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 10 },
  preferenceIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  preferenceCopy: { flex: 1 },
  preferenceTitle: { fontSize: 13, fontWeight: '800' },
  preferenceDescription: { fontSize: 11, lineHeight: 16, marginTop: 3 },
  frameSection: { paddingTop: 12, paddingBottom: 10 },
  frameOptions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  frameOption: { flex: 1, minHeight: 67, borderWidth: 1.5, borderRadius: 11, alignItems: 'center', justifyContent: 'center', gap: 6 },
  frameSwatch: { width: 29, height: 23, borderWidth: 3, borderRadius: 3 },
  frameLabel: { fontSize: 10, fontWeight: '700' },
  rowDivider: { height: StyleSheet.hairlineWidth, marginLeft: 50 },
  languageHeading: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingTop: 12, paddingBottom: 8 },
  languageOptions: { flexDirection: 'row', gap: 7, marginTop: 4 },
  languageButton: { flex: 1, minHeight: 54, paddingHorizontal: 3, alignItems: 'center', justifyContent: 'center', borderRadius: 10, borderWidth: 1 },
  languageText: { fontSize: 11, fontWeight: '800', textAlign: 'center' },
  languageCode: { fontSize: 9, marginTop: 3 },
  languageNote: { fontSize: 10, lineHeight: 15, marginTop: 10, marginBottom: 7 },
  helper: { fontSize: 10, lineHeight: 15, marginTop: 2, marginBottom: 10, paddingLeft: 3 },
  linkRow: { minHeight: 55, flexDirection: 'row', alignItems: 'center', gap: 11 },
  linkText: { flex: 1, fontSize: 13, fontWeight: '700' },
  resetButton: { minHeight: 47, marginTop: 24, borderWidth: 1, borderRadius: 11, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  resetText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.4 },
  version: { fontSize: 9, textAlign: 'center', marginTop: 16 },
});
