import { ThemedIonicons as Ionicons, ThemedSafeAreaView as SafeAreaView, ThemedText as Text, ThemedTextInput as TextInput, ThemedView as View } from '../../theme/ThemedComponents';
import {
    useFocusEffect,
    useLocalSearchParams,
    useRouter,
} from 'expo-router';
import {
    useCallback,
    useState,
} from 'react';

import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';

import {
    addComment,
    getPost,
    getSession,
    Post,
    User,
} from '../../storage/storage';
import { goBackOrReplace } from '../../lib/navigation';

export default function ComentariosScreen() {
  const router = useRouter();

  const { id } =
    useLocalSearchParams<{
      id: string;
    }>();

  const [post, setPost] =
    useState<Post | null>(null);

  const [user, setUser] =
    useState<User | null>(null);

  const [text, setText] =
    useState('');

  const load = useCallback(async () => {
    const result =
      await getPost(
        String(id)
      );

    const session =
      await getSession();

    setPost(result);
    setUser(session);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function sendComment() {
    if (!user) {
      Alert.alert(
        'Faça login',
        'Você precisa entrar para comentar.',
        [
          {
            text: 'Entrar',
            onPress: () =>
              router.replace(
                '/login'
              ),
          },
          {
            text: 'Cancelar',
            style: 'cancel',
          },
        ]
      );

      return;
    }

    if (!text.trim()) {
      return;
    }

    const updated =
      await addComment(
        String(id),
        user,
        text
      );

    if (updated) {
      setPost(updated);
      setText('');
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
              color="#3D0404"
            />
          </TouchableOpacity>

          <Text
            style={styles.title}
          >
            COMENTÁRIOS
          </Text>

          <View
            style={{ width: 22 }}
          />
        </View>

        <ScrollView
          contentContainerStyle={
            styles.list
          }
          showsVerticalScrollIndicator={
            false
          }
        >

          {!post ||
          post.comments.length ===
            0 ? (
            <View
              style={styles.empty}
            >
              <Ionicons
                name="chatbubble-outline"
                size={45}
                color="#6A614D"
              />

              <Text
                style={
                  styles.emptyTitle
                }
              >
                Ainda não há comentários
              </Text>

              <Text
                style={styles.emptyText}
              >
                Seja o primeiro a contar
                o que achou dessa peça.
              </Text>
            </View>
          ) : (
            post.comments.map(
              comment => (
                <View
                  key={comment.id}
                  style={
                    styles.comment
                  }
                >
                  <View
                    style={
                      styles.avatar
                    }
                  >
                    <Ionicons
                      name="person"
                      size={17}
                      color="#2F524F"
                    />
                  </View>

                  <View
                    style={
                      styles.commentBody
                    }
                  >
                    <Text
                      style={
                        styles.author
                      }
                    >
                      {comment.authorName}
                    </Text>

                    <Text
                      style={
                        styles.commentText
                      }
                    >
                      {comment.text}
                    </Text>
                  </View>
                </View>
              )
            )
          )}

        </ScrollView>

        <View
          style={styles.composer}
        >
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            maxLength={1000}
            placeholder="Escreva um comentário..."
            placeholderTextColor="#907C60"
          />

          <TouchableOpacity
            style={styles.send}
            onPress={
              sendComment
            }
          >
            <Ionicons
              name="send"
              size={18}
              color="#F2E1C7"
            />
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      '#F2E1C7',
  },

  header: {
    height: 62,
    paddingHorizontal: 18,
    flexDirection: 'row',
    justifyContent:
      'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor:
      '#C8B58F',
  },

  title: {
    color: '#3D0404',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },

  list: {
    padding: 18,
    paddingBottom: 100,
  },

  empty: {
    alignItems: 'center',
    justifyContent:
      'center',
    minHeight: 400,
  },

  emptyTitle: {
    color: '#3D0404',
    fontSize: 17,
    fontWeight: '900',
    marginTop: 12,
  },

  emptyText: {
    color: '#644219',
    fontSize: 10,
    textAlign: 'center',
    maxWidth: 260,
    marginTop: 5,
    lineHeight: 15,
  },

  comment: {
    backgroundColor:
      '#E3D2B5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor:
      '#C8B58F',
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
  },

  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor:
      '#D9D9D9',
    alignItems: 'center',
    justifyContent:
      'center',
  },

  commentBody: {
    flex: 1,
    marginLeft: 9,
  },

  author: {
    color: '#3D0404',
    fontSize: 13,
    fontWeight: '900',
  },

  commentText: {
    color: '#644219',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 3,
  },

  composer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor:
      '#E3D2B5',
    borderTopWidth: 1,
    borderTopColor:
      '#C8B58F',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  input: {
    flex: 1,
    minHeight: 44,
    backgroundColor:
      '#F2E1C7',
    borderWidth: 1,
    borderColor:
      '#C8B58F',
    borderRadius: 10,
    paddingHorizontal: 12,
    color: '#3D0404',
    fontSize: 14,
  },

  send: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor:
      '#2F524F',
    alignItems: 'center',
    justifyContent:
      'center',
    marginLeft: 7,
  },
});