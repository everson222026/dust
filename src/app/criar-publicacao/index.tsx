import { ThemedIonicons as Ionicons, ThemedSafeAreaView as SafeAreaView, ThemedText as Text, ThemedTextInput as TextInput, ThemedView as View } from '../../theme/ThemedComponents';
import * as ImagePicker from 'expo-image-picker';
import {
    useRouter,
} from 'expo-router';
import {
    useState,
} from 'react';

import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';

import {
    CATEGORIES,
    createPost,
    getSession,
} from '../../storage/storage';
import { goBackOrReplace } from '../../lib/navigation';
import { uploadImage } from '../../storage/images';
import { isSupabaseConfigured } from '../../lib/supabase';

export default function CriarPublicacaoScreen() {
  const router = useRouter();

  const [title, setTitle] =
    useState('');

  const [description, setDescription] =
    useState('');

  const [category, setCategory] =
    useState('Curioso');

  const [selectedImage, setSelectedImage] =
    useState<{
      uri: string;
      mimeType: string | null;
    } | null>(null);

  const [whyUseless, setWhyUseless] =
    useState('');

  const [history, setHistory] =
    useState('');

  const [location, setLocation] =
    useState('');

  const [condition, setCondition] =
    useState(
      'Preservado pelo proprietário'
    );

  const [loading, setLoading] =
    useState(false);

  async function chooseImage() {
    try {
      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });

      if (!result.canceled) {
        setSelectedImage({
          uri: result.assets[0].uri,
          mimeType: result.assets[0].mimeType ?? null,
        });
      }
    } catch (error) {
      Alert.alert(
        'Não foi possível abrir as fotos',
        error instanceof Error
          ? error.message
          : 'Tente novamente.'
      );
    }
  }

  async function publish() {
    if (!title.trim()) {
      Alert.alert(
        'Título obrigatório',
        'Dê um nome para a peça.'
      );
      return;
    }

    if (!description.trim()) {
      Alert.alert(
        'Descrição obrigatória',
        'Conte o que é essa coisa.'
      );
      return;
    }

    if (!whyUseless.trim()) {
      Alert.alert(
        'Falta uma explicação',
        'Conte por que essa peça é inútil.'
      );
      return;
    }

    try {
      setLoading(true);

      const user = await getSession();
      if (!user) {
        Alert.alert(
          'Faça login',
          'Você precisa estar logado para publicar.',
          [
            {
              text: 'Entrar',
              onPress: () => router.replace('/login'),
            },
            {
              text: 'Cancelar',
              style: 'cancel',
            },
          ]
        );
        return;
      }

      const imageUrl = selectedImage
        ? isSupabaseConfigured()
          ? await uploadImage(
              selectedImage.uri,
              user.id,
              selectedImage.mimeType
            )
          : selectedImage.uri
        : '';

      const post =
        await createPost({
          authorId:
            user.id,

          authorName:
            user.name,

          title:
            title.trim(),

          description:
            description.trim(),

          category,

          image: imageUrl,

          whyUseless:
            whyUseless.trim(),

          history:
            history.trim() ||
            description.trim(),

          location:
            location.trim() ||
            'Não informado',

          condition:
            condition.trim(),
        });

      router.replace({
        pathname:
          '/publicacao/[id]',
        params: {
          id: post.id,
        },
      });
    } catch (error) {
      Alert.alert(
        'Não foi possível publicar',
        error instanceof Error
          ? error.message
          : 'Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView
      style={styles.container}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={
            styles.page
          }
        >

          <View
            style={styles.header}
          >
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Voltar"
              onPress={() => goBackOrReplace(router, '/acervo')}
            >
              <Ionicons
                name="arrow-back"
                size={22}
                color="#F2E1C7"
              />
            </TouchableOpacity>

            <Text
              style={styles.headerTitle}
            >
              NOVA PUBLICAÇÃO
            </Text>

            <View
              style={{ width: 22 }}
            />
          </View>

          <View
            style={styles.intro}
          >
            <Text
              style={styles.eyebrow}
            >
              CONTRIBUA PARA O ACERVO
            </Text>

            <Text
              style={styles.title}
            >
              Adicionar minha coisa inútil
            </Text>

            <Text
              style={styles.subtitle}
            >
              Toda coisa inútil merece
              pelo menos uma história.
            </Text>
          </View>

          <Field
            label="NOME DA PEÇA *"
            placeholder="Ex.: Caneca estranha"
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />

          <Text
            style={styles.label}
          >
            CATEGORIA
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={
              false
            }
            contentContainerStyle={
              styles.categories
            }
          >
            {CATEGORIES.map(
              item => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.category,
                    category === item &&
                      styles.categoryActive,
                  ]}
                  onPress={() =>
                    setCategory(item)
                  }
                >
                  <Text
                    style={[
                      styles.categoryText,
                      category ===
                        item &&
                        styles.categoryTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </ScrollView>

          <Field
            label="DESCRIÇÃO *"
            placeholder="O que é essa coisa?"
            value={description}
            onChangeText={setDescription}
            multiline
            maxLength={2000}
          />

          <Field
            label="POR QUE ELA É INÚTIL? *"
            placeholder="Explique a inutilidade..."
            value={whyUseless}
            onChangeText={setWhyUseless}
            multiline
          />

          <Field
            label="HISTÓRIA"
            placeholder="Existe alguma história por trás dela?"
            value={history}
            onChangeText={setHistory}
            multiline
          />

          <Field
            label="LOCAL"
            placeholder="Onde essa coisa estava?"
            value={location}
            onChangeText={setLocation}
          />

          <Text style={styles.label}>FOTO DA PEÇA</Text>

          {selectedImage && (
            <View style={styles.imagePreview}>
              <Image
                source={{ uri: selectedImage.uri }}
                style={styles.previewImage}
                resizeMode="cover"
              />
              <TouchableOpacity
                accessibilityLabel="Remover foto"
                style={styles.removeImageButton}
                onPress={() => setSelectedImage(null)}
              >
                <Ionicons name="close" size={18} color="#F2E1C7" />
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={styles.imagePickerButton}
            onPress={chooseImage}
            disabled={loading}
          >
            <Ionicons
              name="image-outline"
              size={19}
              color="#2F524F"
            />
            <Text style={styles.imagePickerText}>
              {selectedImage ? 'TROCAR FOTO' : 'ESCOLHER FOTO'}
            </Text>
          </TouchableOpacity>

          <Field
            label="ESTADO DE CONSERVAÇÃO"
            placeholder="Ex.: Preservado"
            value={condition}
            onChangeText={setCondition}
          />

          <TouchableOpacity
            style={styles.publishButton}
            onPress={publish}
            disabled={loading}
          >
            <Text
              style={
                styles.publishText
              }
            >
              {loading
                ? 'PUBLICANDO...'
                : 'PUBLICAR NO MUSEU'}
            </Text>

            {!loading && (
              <Ionicons
                name="arrow-forward"
                size={18}
                color="#F2E1C7"
              />
            )}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChangeText,
  multiline,
  keyboardType,
  maxLength,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (
    value: string
  ) => void;
  multiline?: boolean;
  keyboardType?: any;
  maxLength?: number;
}) {
  return (
    <>
      <Text
        style={styles.label}
      >
        {label}
      </Text>

      <TextInput
        style={[
          styles.input,
          multiline &&
            styles.textArea,
        ]}
        placeholder={
          placeholder
        }
        placeholderTextColor="#907C60"
        value={value}
        onChangeText={
          onChangeText
        }
        multiline={multiline}
        textAlignVertical={
          multiline
            ? 'top'
            : 'center'
        }
        keyboardType={
          keyboardType
        }
        maxLength={maxLength}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      '#F2E1C7',
  },

  page: {
    paddingBottom: 40,
  },

  header: {
    height: 62,
    backgroundColor:
      '#2F524F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
    paddingHorizontal: 18,
  },

  headerTitle: {
    color: '#F2E1C7',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },

  intro: {
    padding: 18,
    paddingBottom: 6,
  },

  eyebrow: {
    color: '#595626',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },

  title: {
    color: '#3D0404',
    fontSize: 26,
    lineHeight: 31,
    fontWeight: '900',
    marginTop: 5,
  },

  subtitle: {
    color: '#644219',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 5,
  },

  label: {
    color: '#595626',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.7,
    marginTop: 15,
    marginHorizontal: 18,
    marginBottom: 6,
  },

  input: {
    minHeight: 52,
    marginHorizontal: 18,
    borderRadius: 10,
    backgroundColor:
      '#E3D2B5',
    borderWidth: 1,
    borderColor:
      '#C8B58F',
    paddingHorizontal: 13,
    color: '#3D0404',
    fontSize: 15,
  },

  imagePickerButton: {
    minHeight: 48,
    marginHorizontal: 18,
    marginTop: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2F524F',
    borderStyle: 'dashed',
    backgroundColor: '#E3D2B5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  imagePickerText: {
    color: '#2F524F',
    fontSize: 12,
    fontWeight: '900',
  },

  imagePreview: {
    height: 190,
    marginHorizontal: 18,
    borderRadius: 11,
    overflow: 'hidden',
    backgroundColor: '#D6C29D',
  },

  previewImage: {
    width: '100%',
    height: '100%',
  },

  removeImageButton: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3D0404',
    alignItems: 'center',
    justifyContent: 'center',
  },

  textArea: {
    minHeight: 105,
    paddingTop: 13,
  },

  categories: {
    paddingHorizontal: 18,
    gap: 7,
    paddingBottom: 2,
  },

  category: {
    backgroundColor:
      '#D9D9D9',
    borderRadius: 9,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },

  categoryActive: {
    backgroundColor:
      '#2F524F',
  },

  categoryText: {
    color: '#644219',
    fontSize: 11,
    fontWeight: '900',
  },

  categoryTextActive: {
    color: '#FFFFFF',
  },

  publishButton: {
    marginHorizontal: 18,
    marginTop: 25,
    minHeight: 52,
    borderRadius: 11,
    backgroundColor:
      '#3D0404',
    alignItems: 'center',
    justifyContent:
      'center',
    flexDirection: 'row',
  },

  publishText: {
    color: '#F2E1C7',
    fontSize: 12,
    fontWeight: '900',
    marginRight: 7,
  },
});