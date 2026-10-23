import { ThemedIonicons as Ionicons, ThemedSafeAreaView as SafeAreaView, ThemedText as Text, ThemedView as View } from '../theme/SmartThemedComponents';
import {
  useFocusEffect,
  useRouter,
} from 'expo-router';
import {
  useCallback,
  useState,
} from 'react';

import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import {
  getPosts,
  getSession,
  logout,
  Post,
  User,
} from '../storage/storage';
import { PublicationActions } from '../components/PublicationCard';
import ImageLightbox from '../components/ImageLightbox';
import { useAppTheme } from '../theme/ThemeContext';

export default function PerfilScreen() {
  const router = useRouter();
  const { isDark, palette } = useAppTheme();

  const [user, setUser] =
    useState<User | null>(null);

  const [posts, setPosts] =
    useState<Post[]>([]);

  const [loading, setLoading] = useState(true);
  const [photoPreviewVisible, setPhotoPreviewVisible] = useState(false);

  async function load() {
    try {
      const session = await getSession();
      setUser(session);

      if (session) {
        const allPosts = await getPosts();
        setPosts(allPosts.filter(post => post.authorId === session.id));
      } else {
        setPosts([]);
      }
    } catch (error) {
      Alert.alert(
        'Não foi possível carregar o perfil',
        error instanceof Error ? error.message : 'Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  async function handleLogout() {
    try {
      await logout();
      router.replace('/home');
    } catch (error) {
      Alert.alert(
        'Não foi possível sair da conta',
        error instanceof Error ? error.message : 'Tente novamente.'
      );
    }
  }

  if (!user) {
    return (
      <SafeAreaView
        style={styles.container}
      >
        <View
          style={styles.guestPage}
        >
          <View style={styles.guestIcon}>
            <Ionicons name="person-outline" size={40} color="#2F524F" />
          </View>
          <Text style={styles.guestTitle}>
            {loading ? 'Carregando perfil...' : 'Você está visitando como convidado'}
          </Text>
          {!loading && (
            <>
              <Text style={styles.guestDescription}>
                Entre ou crie uma conta para publicar peças, seguir visitantes e
                guardar seus itens favoritos.
              </Text>
              <Text style={styles.guestDescription}>
                Login e cadastro estão disponíveis em modo demonstrativo para a apresentação; nenhuma conta real será criada.
              </Text>
              <TouchableOpacity
                style={styles.guestPrimaryButton}
                onPress={() => router.push({ pathname: '/login', params: { mode: 'login' } })}
              >
                <Text style={styles.guestPrimaryText}>ENTRAR NA MINHA CONTA</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.guestSecondaryButton}
                onPress={() => router.push({ pathname: '/login', params: { mode: 'register' } })}
              >
                <Text style={styles.guestSecondaryText}>CRIAR CONTA</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.container}
    >
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.page
        }
      >

        {/* HEADER */}

        <View
          style={styles.header}
        >
          <View style={{ width: 22 }} />

          <Text
            style={styles.headerTitle}
          >
            MEU PERFIL
          </Text>

          <TouchableOpacity
            onPress={() =>
              router.push(
                '/configuracoes'
              )
            }
          >
            <Ionicons
              name="settings-outline"
              size={21}
              color="#3D0404"
            />
          </TouchableOpacity>
        </View>

        {/* PERFIL */}

        <View
          style={styles.profile}
        >
          {user.photo ? (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Ampliar foto do perfil"
              onPress={() => setPhotoPreviewVisible(true)}
              activeOpacity={0.9}
            >
              <Image
                source={{ uri: user.photo }}
                style={styles.avatar}
              />
            </TouchableOpacity>
          ) : (
            <View style={styles.avatar}>
              <Ionicons
                name="person"
                size={38}
                color="#2F524F"
              />
            </View>
          )}

          <Text
            style={styles.name}
          >
            {user.name}
          </Text>

          <Text
            style={styles.email}
          >
            @{user.username}
          </Text>

          {user.bio ? (
            <Text
              style={styles.bio}
            >
              {user.bio}
            </Text>
          ) : null}

          {user.id === 'dust-visitante-local' && (
            <View style={styles.accountAccess}>
              <Text style={styles.accountAccessTitle}>
                Quer usar sua própria conta?
              </Text>
              <Text style={styles.accountAccessDescription}>
                Login e cadastro são simulados nesta versão de apresentação.
              </Text>
              <View style={styles.accountAccessActions}>
                <TouchableOpacity
                  style={styles.accountAccessButton}
                  onPress={() =>
                    router.push({ pathname: '/login', params: { mode: 'login' } })
                  }
                >
                  <Text style={styles.accountAccessButtonText}>ENTRAR</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.accountAccessButton}
                  onPress={() =>
                    router.push({ pathname: '/login', params: { mode: 'register' } })
                  }
                >
                  <Text style={styles.accountAccessButtonText}>CADASTRAR</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View
            style={styles.stats}
          >
            <Stat
              number={posts.length}
              label="PUBLICAÇÕES"
            />

            <Stat
              number={
                user.followers.length
              }
              label="SEGUIDORES"
              onPress={() =>
                router.push({
                  pathname:
                    '/seguidores',
                  params: {
                    userId:
                      user.id,
                    mode:
                      'followers',
                  },
                })
              }
            />

            <Stat
              number={
                user.following.length
              }
              label="SEGUINDO"
              onPress={() =>
                router.push({
                  pathname:
                    '/seguidores',
                  params: {
                    userId:
                      user.id,
                    mode:
                      'following',
                  },
                })
              }
            />
          </View>
        </View>

        {/* BOTÕES */}

        <View
          style={styles.actions}
        >
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: palette.accent, borderColor: palette.gold }]}
            onPress={() =>
              router.push(
                '/criar-publicacao'
              )
            }
          >
            <Ionicons
              name="add-outline"
              size={18}
              color={palette.background}
            />

            <Text
              style={
                [styles.actionButtonText, { color: palette.background }]
              }
            >
              NOVA PEÇA
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, { backgroundColor: palette.raised, borderColor: palette.border }]}
            onPress={() =>
              router.push(
                '/editar-perfil'
              )
            }
          >
            <Ionicons
              name="create-outline"
              size={18}
              color={palette.accent}
            />

            <Text
              style={
                [styles.secondaryButtonText, { color: palette.text }]
              }
            >
              EDITAR
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, { backgroundColor: palette.raised, borderColor: palette.border }]}
            onPress={() =>
              router.push('/salvos')
            }
          >
            <Ionicons
              name="bookmark-outline"
              size={18}
              color={palette.accent}
            />

            <Text
              style={[styles.secondaryButtonText, { color: palette.text }]}
            >
              ITENS SALVOS
            </Text>
          </TouchableOpacity>
        </View>

        {/* PUBLICAÇÕES */}

        <Text
          style={styles.sectionTitle}
        >
          MINHAS PUBLICAÇÕES
        </Text>

        {posts.length === 0 ? (
          <View
            style={styles.empty}
          >
            <Ionicons
              name="cube-outline"
              size={44}
              color="#6A614D"
            />

            <Text
              style={styles.emptyTitle}
            >
              Você ainda não publicou nada
            </Text>

            <Text
              style={styles.emptyText}
            >
              Coloque sua primeira
              inutilidade no museu.
            </Text>
          </View>
        ) : (
          posts.map(
            post => (
              <View key={post.id} style={styles.profilePostWrap}>
              <TouchableOpacity
                style={[styles.postRow, styles.postRowWithMenu, isDark && styles.darkPostRow]}
                onPress={() =>
                  router.push({
                    pathname: '/publicacao/[id]',
                    params: { id: post.id },
                  })
                }
              >
                <View
                  style={
                    styles.postIcon
                  }
                >
                  <Ionicons
                    name="cube-outline"
                    size={23}
                    color="#2F524F"
                  />
                </View>

                <View
                  style={
                    styles.postInfo
                  }
                >
                  <Text
                    style={[styles.postTitle, isDark && styles.darkPostText]}
                  >
                    {post.title}
                  </Text>

                  <Text
                    style={[styles.postDescription, isDark && styles.darkPostDescription]}
                    numberOfLines={1}
                  >
                    {post.description}
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={17}
                  color="#644219"
                />
              </TouchableOpacity>
              <PublicationActions
                post={post}
                onPostRemoved={postId => setPosts(current => current.filter(item => item.id !== postId))}
                onPostUpdated={updated => setPosts(current => current.map(item => item.id === updated.id ? updated : item))}
              />
              </View>
            )
          )
        )}

        {/* SAIR */}

        <TouchableOpacity
          style={styles.logout}
          onPress={handleLogout}
        >
          <Ionicons
            name="log-out-outline"
            size={18}
            color="#3D0404"
          />

          <Text
            style={styles.logoutText}
          >
            SAIR DA CONTA
          </Text>
        </TouchableOpacity>

      </ScrollView>
      <ImageLightbox
        visible={photoPreviewVisible}
        uri={user.photo}
        title={user.name}
        onClose={() => setPhotoPreviewVisible(false)}
      />
    </SafeAreaView>
  );
}

function Stat({
  number,
  label,
  onPress,
}: {
  number: number;
  label: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.stat}
      disabled={!onPress}
      onPress={onPress}
    >
      <Text
        style={styles.statNumber}
      >
        {number}
      </Text>

      <Text
        style={styles.statLabel}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      '#F2E1C7',
  },

  page: {
    padding: 18,
    paddingBottom: 45,
  },

  header: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
  },

  headerTitle: {
    color: '#3D0404',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },

  profile: {
    alignItems: 'center',
    paddingTop: 14,
  },

  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor:
      '#D9D9D9',
    alignItems: 'center',
    justifyContent:
      'center',
    borderWidth: 2,
    borderColor:
      '#C8B58F',
  },

  name: {
    color: '#3D0404',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 10,
  },

  email: {
    color: '#776650',
    fontSize: 12,
    marginTop: 3,
  },

  bio: {
    color: '#644219',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 16,
    maxWidth: 310,
    marginTop: 8,
  },

  accountAccess: {
    width: '100%',
    maxWidth: 420,
    marginTop: 16,
    padding: 13,
    borderRadius: 12,
    backgroundColor: '#E3D2B5',
    alignItems: 'center',
  },

  accountAccessTitle: {
    color: '#3D0404',
    fontSize: 13,
    fontWeight: '900',
  },

  accountAccessDescription: {
    color: '#644219',
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 4,
  },

  accountAccessActions: {
    width: '100%',
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },

  accountAccessButton: {
    minHeight: 38,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#2F524F',
  },

  accountAccessButtonText: {
    color: '#F2E1C7',
    fontSize: 10,
    fontWeight: '900',
  },

  stats: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 35,
  },

  stat: {
    alignItems: 'center',
  },

  statNumber: {
    color: '#3D0404',
    fontSize: 19,
    fontWeight: '900',
  },

  statLabel: {
    color: '#595626',
    fontSize: 11,
    fontWeight: '900',
    marginTop: 3,
  },

  actions: {
    flexDirection: 'row',
    gap: 9,
    marginTop: 22,
  },

  actionButton: {
    flex: 1,
    height: 46,
    borderRadius: 10,
    backgroundColor:
      '#2F524F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'center',
  },

  actionButtonText: {
    color: '#F2E1C7',
    fontSize: 11,
    fontWeight: '900',
    marginLeft: 6,
  },

  secondaryButton: {
    flex: 1,
    height: 46,
    borderRadius: 10,
    backgroundColor:
      '#E3D2B5',
    borderWidth: 1,
    borderColor:
      '#C8B58F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'center',
  },

  secondaryButtonText: {
    color: '#2F524F',
    fontSize: 11,
    fontWeight: '900',
    marginLeft: 6,
  },

  sectionTitle: {
    color: '#595626',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginTop: 28,
    marginBottom: 10,
  },

  darkPostRow: {
    backgroundColor: '#292722',
    borderColor: '#514B40',
  },

  darkPostText: { color: '#FFFFFF' },
  darkPostDescription: { color: '#E0DCD3' },

  profilePostWrap: {
    position: 'relative',
    marginBottom: 8,
  },

  postRowWithMenu: {
    paddingRight: 52,
    marginBottom: 0,
  },

  postRow: {
    minHeight: 65,
    backgroundColor:
      '#E3D2B5',
    borderRadius: 11,
    borderWidth: 1,
    borderColor:
      '#C8B58F',
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  postIcon: {
    width: 42,
    height: 42,
    borderRadius: 9,
    backgroundColor:
      '#D9D9D9',
    alignItems: 'center',
    justifyContent:
      'center',
  },

  postInfo: {
    flex: 1,
    marginHorizontal: 9,
  },

  postTitle: {
    color: '#3D0404',
    fontSize: 14,
    fontWeight: '900',
  },

  postDescription: {
    color: '#644219',
    fontSize: 12,
    marginTop: 3,
  },

  empty: {
    minHeight: 220,
    backgroundColor:
      '#E3D2B5',
    borderRadius: 13,
    alignItems: 'center',
    justifyContent:
      'center',
    padding: 25,
  },

  emptyTitle: {
    color: '#3D0404',
    fontSize: 14,
    fontWeight: '900',
    marginTop: 9,
  },

  emptyText: {
    color: '#644219',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 5,
  },

  logout: {
    height: 48,
    marginTop: 25,
    borderRadius: 10,
    borderWidth: 1,
    borderColor:
      '#C8B58F',
    alignItems: 'center',
    justifyContent:
      'center',
    flexDirection: 'row',
  },

  logoutText: {
    color: '#3D0404',
    fontSize: 9,
    fontWeight: '900',
    marginLeft: 6,
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent:
      'center',
  },

  title: {
    color: '#3D0404',
    fontSize: 20,
    fontWeight: '900',
  },

  guestPage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 35,
  },

  guestIcon: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#E3D2B5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 17,
  },

  guestTitle: {
    color: '#3D0404',
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
  },

  guestDescription: {
    maxWidth: 340,
    color: '#644219',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 10,
  },

  guestPrimaryButton: {
    width: '100%',
    maxWidth: 360,
    minHeight: 50,
    borderRadius: 10,
    backgroundColor: '#2F524F',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
    paddingHorizontal: 16,
  },

  guestPrimaryText: {
    color: '#F2E1C7',
    fontSize: 12,
    fontWeight: '900',
  },

  guestSecondaryButton: {
    width: '100%',
    maxWidth: 360,
    minHeight: 50,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2F524F',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    paddingHorizontal: 16,
  },

  guestSecondaryText: {
    color: '#2F524F',
    fontSize: 12,
    fontWeight: '900',
  },
});
