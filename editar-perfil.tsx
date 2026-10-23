import { ThemedIonicons as Ionicons, ThemedSafeAreaView as SafeAreaView, ThemedText as Text, ThemedTextInput as TextInput, ThemedView as View } from '../theme/SmartThemedComponents';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import { updateProfile, getSession, User } from '../storage/storage';
import { uploadImage } from '../storage/images';
import { isSupabaseConfigured } from '../lib/supabase';
import { goBackOrReplace } from '../lib/navigation';
import ImageLightbox from '../components/ImageLightbox';
import { useAppTheme } from '../theme/ThemeContext';

export default function EditarPerfilScreen() {
  const router = useRouter();
  const { isDark, palette } = useAppTheme();
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [photo, setPhoto] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<{
    uri: string;
    mimeType: string | null;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const previewPhotoUri = selectedPhoto?.uri?.trim() || photo.trim();
  const [loaded, setLoaded] = useState(false);
  const [photoPreviewVisible, setPhotoPreviewVisible] = useState(false);

  const load = useCallback(async () => {
    try {
      const session = await getSession();
      setUser(session);
      if (session) {
        setName(session.name);
        setBio(session.bio);
        setPhoto(session.photo);
      }
    } catch (error) {
      Alert.alert(
        'Não foi possível carregar as configurações',
        error instanceof Error ? error.message : 'Tente novamente.'
      );
    } finally {
      setLoaded(true);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function choosePhoto() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setSelectedPhoto({
          uri: result.assets[0].uri,
          mimeType: result.assets[0].mimeType ?? null,
        });
      }
    } catch (error) {
      Alert.alert(
        'Não foi possível abrir as fotos',
        error instanceof Error ? error.message : 'Tente novamente.'
      );
    }
  }

  async function save() {
    if (!user) {
      return;
    }
    if (!name.trim()) {
      Alert.alert('Nome obrigatório', 'Informe como você quer aparecer no Museu.');
      return;
    }
    if (name.trim().length > 60 || bio.trim().length > 240) {
      Alert.alert(
        'Texto muito longo',
        'Use até 60 caracteres no nome e 240 na apresentação.'
      );
      return;
    }
    try {
      setSaving(true);
      const photoUri = selectedPhoto
        ? isSupabaseConfigured()
          ? await uploadImage(selectedPhoto.uri, user.id, selectedPhoto.mimeType)
          : selectedPhoto.uri
        : photo;
      const updated = await updateProfile(user.id, {
        name,
        bio,
        photo: photoUri,
      });
      if (!updated) {
        throw new Error('Sua sessão expirou. Entre novamente para editar o perfil.');
      }
      setUser(updated);
      Alert.alert('Perfil atualizado', 'Suas informações já aparecem no Museu.', [
        { text: 'Continuar', onPress: () => goBackOrReplace(router, '/perfil') },
      ]);
    } catch (error) {
      Alert.alert(
        'Não foi possível salvar',
        error instanceof Error ? error.message : 'Tente novamente.'
      );
    } finally {
      setSaving(false);
    }
  }


  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.page}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <TouchableOpacity
              accessibilityLabel="Voltar"
              onPress={() => goBackOrReplace(router, '/perfil')}
            >
              <Ionicons name="arrow-back" size={22} color={palette.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>EDITAR PERFIL</Text>
            <View style={styles.iconSpacer} />
          </View>


          {user ? (
            <>
              <Text style={[styles.title, isDark && styles.darkPrimaryText]}>
                Sua placa no Museu
              </Text>
              <Text style={[styles.subtitle, isDark && styles.darkSecondaryText]}>
                Conte um pouco sobre a pessoa por trás das coisas inúteis.
              </Text>

              <View style={styles.preview}>
                {previewPhotoUri ? (
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel="Ampliar foto do perfil"
                    onPress={() => setPhotoPreviewVisible(true)}
                    activeOpacity={0.9}
                  >
                    <Image
                      source={{ uri: previewPhotoUri }}
                      style={styles.avatar}
                    />
                  </TouchableOpacity>
                ) : (
                  <View style={styles.avatar}>
                  <Ionicons name="person" size={34} color={palette.accent} />
                  </View>
                )}
                <Text style={styles.username}>@{user.username}</Text>
                <TouchableOpacity
                  style={[styles.photoButton, { backgroundColor: palette.raised, borderColor: palette.border }]}
                  onPress={choosePhoto}
                  disabled={saving}
                >
                  <Ionicons name="image-outline" size={17} color={palette.accent} />
                  <Text style={[styles.photoButtonText, { color: palette.text }]}>
                    {selectedPhoto || photo ? 'TROCAR FOTO' : 'ESCOLHER FOTO DO DISPOSITIVO'}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.label, isDark && styles.darkSecondaryText]}>
                NOME DE EXIBIÇÃO
              </Text>
              <TextInput
                style={[styles.input, isDark && styles.darkInput]}
                value={name}
                onChangeText={setName}
                placeholder="Seu nome"
                placeholderTextColor="#907C60"
                maxLength={60}
                returnKeyType="next"
              />

              <Text style={[styles.label, isDark && styles.darkSecondaryText]}>
                SOBRE VOCÊ
              </Text>
              <TextInput
                style={[styles.input, styles.textArea, isDark && styles.darkInput]}
                value={bio}
                onChangeText={setBio}
                placeholder="Que tipo de coisa inútil te encanta?"
                placeholderTextColor="#907C60"
                multiline
                maxLength={240}
                textAlignVertical="top"
              />
              <Text style={styles.counter}>{bio.length}/240</Text>

              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: palette.accent, borderColor: palette.gold, opacity: saving ? 0.65 : 1 }]}
                onPress={save}
                disabled={saving}
              >
                <Text style={[styles.saveText, { color: palette.background }]}>
                  {saving ? 'SALVANDO...' : 'SALVAR PERFIL'}
                </Text>
                {!saving && (
                  <Ionicons name="checkmark" size={18} color={palette.background} />
                )}
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.guestSettings}>
              <Text style={[styles.subtitle, isDark && styles.darkSecondaryText]}>
                {loaded
                  ? 'Entre ou crie uma conta demonstrativa para personalizar seu perfil.'
                  : 'Carregando suas configurações...'}
              </Text>
              {loaded && (
                <TouchableOpacity
                  style={[styles.saveButton, { backgroundColor: palette.accent, borderColor: palette.gold }]}
                  onPress={() => router.push('/login')}
                >
                  <Text style={[styles.saveText, { color: palette.background }]}>ENTRAR OU CRIAR CONTA</Text>
                  <Ionicons name="arrow-forward" size={18} color={palette.background} />
                </TouchableOpacity>
              )}
            </View>
          )}
        </ScrollView>
        <ImageLightbox
          visible={photoPreviewVisible}
          uri={selectedPhoto?.uri ?? photo}
          title={name || user?.name || 'Foto do perfil'}
          onClose={() => setPhotoPreviewVisible(false)}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2E1C7' },
  darkContainer: { backgroundColor: '#1B1A17' },
  darkPrimaryText: { color: '#F2E1C7' },
  darkSecondaryText: { color: '#D0C1A5' },
  darkInput: {
    backgroundColor: '#302C25',
    borderColor: '#62533A',
    color: '#F2E1C7',
  },
  flex: { flex: 1 },
  page: { padding: 18, paddingBottom: 40 },
  guestSettings: { marginTop: 18 },
  header: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: '#3D0404',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  iconSpacer: { width: 22 },
  title: {
    color: '#3D0404',
    fontSize: 25,
    fontWeight: '900',
    marginTop: 18,
  },
  subtitle: {
    color: '#644219',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
  },
  preview: { alignItems: 'center', marginVertical: 20 },
  photoButton: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginTop: 9,
    paddingHorizontal: 13,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#2F524F',
    backgroundColor: '#E3D2B5',
  },
  photoButtonText: { color: '#2F524F', fontSize: 12, fontWeight: '800' },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#D6C29D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  username: { color: '#2F524F', fontSize: 12, marginTop: 8 },
  label: {
    color: '#595626',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.7,
    marginTop: 16,
    marginBottom: 6,
  },
  input: {
    minHeight: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#C8B58F',
    backgroundColor: '#E3D2B5',
    paddingHorizontal: 13,
    color: '#3D0404',
    fontSize: 15,
  },
  textArea: { minHeight: 105, paddingTop: 12 },
  counter: {
    alignSelf: 'flex-end',
    color: '#776650',
    fontSize: 11,
    marginTop: 4,
  },
  saveButton: {
    minHeight: 51,
    marginTop: 24,
    borderRadius: 10,
    backgroundColor: '#2F524F',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 7,
  },
  saveText: { color: '#F2E1C7', fontSize: 12, fontWeight: '900' },
  disabled: { opacity: 0.6 },
});
