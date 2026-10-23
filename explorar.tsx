import { ThemedIonicons as Ionicons, ThemedSafeAreaView as SafeAreaView, ThemedText as Text, ThemedTextInput as TextInput, ThemedView as View } from '../theme/SmartThemedComponents';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import PublicationCard from '../components/PublicationCard';
import ImageLightbox from '../components/ImageLightbox';
import {
  CATEGORIES,
  getPosts,
  getSession,
  getUsers,
  Post,
  toggleFollow,
  User,
} from '../storage/storage';

type Tab = 'pecas' | 'visitantes';

export default function ExplorarScreen() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [tab, setTab] = useState<Tab>('pecas');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [busyUserId, setBusyUserId] = useState('');
  const [previewImageUri, setPreviewImageUri] = useState<string | null>(null);
  const [previewImageTitle, setPreviewImageTitle] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');

    try {
      const [allPosts, allUsers, session] = await Promise.all([
        getPosts(),
        getUsers(),
        getSession(),
      ]);

      setPosts(allPosts);
      setUsers(allUsers);
      setCurrentUser(session);
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar o acervo.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const term = normalize(search.trim());
  const visiblePosts = useMemo(
    () =>
      posts.filter(post => {
        const matchesCategory =
          !category || post.category === category;
        const searchableText = normalize(
          [
            post.title,
            post.description,
            post.whyUseless,
            post.authorName,
            post.category,
          ].join(' ')
        );

        return matchesCategory && searchableText.includes(term);
      }),
    [posts, category, term]
  );

  const visibleUsers = useMemo(
    () =>
      users.filter(user => {
        if (user.id === currentUser?.id) {
          return false;
        }

        return normalize(
          `${user.name} ${user.username} ${user.bio}`
        ).includes(term);
      }),
    [users, currentUser, term]
  );

  async function handleFollow(targetId: string) {
    if (!currentUser) {
      router.push('/login');
      return;
    }

    try {
      setBusyUserId(targetId);
      const result = await toggleFollow(currentUser.id, targetId);
      if (result) {
        setCurrentUser(result.current);
        setUsers(current =>
          current.map(visitor =>
            visitor.id === result.target.id
              ? result.target
              : visitor
          )
        );
      }
    } catch (error) {
      Alert.alert(
        'Não foi possível atualizar',
        error instanceof Error
          ? error.message
          : 'Tente novamente.'
      );
    } finally {
      setBusyUserId('');
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.page}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={{ width: 38 }} />

          <View style={styles.headerTitleWrap}>
            <Text style={styles.eyebrow}>MUSEU DO INUSITADO</Text>
            <Text style={styles.title}>Explorar</Text>
          </View>

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Ver atividades"
            onPress={() => router.push('/atividades')}
            style={styles.backButton}
          >
            <Ionicons
              name="notifications-outline"
              size={21}
              color="#3D0404"
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>
          Encontre peças improváveis e pessoas que também colecionam histórias.
        </Text>

        <View style={styles.search}>
          <Ionicons name="search-outline" size={19} color="#644219" />
          <TextInput
            accessibilityLabel="Pesquisar peças e visitantes"
            style={styles.input}
            value={search}
            onChangeText={setSearch}
            placeholder="Pesquisar peças ou visitantes..."
            placeholderTextColor="#907C60"
            returnKeyType="search"
            autoCorrect={false}
          />
          {search.length > 0 && (
            <TouchableOpacity
              accessibilityLabel="Limpar busca"
              onPress={() => setSearch('')}
            >
              <Ionicons name="close-circle" size={18} color="#907C60" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.tabs}>
          <TabButton
            title={`Peças (${visiblePosts.length})`}
            active={tab === 'pecas'}
            onPress={() => setTab('pecas')}
          />
          <TabButton
            title={`Visitantes (${visibleUsers.length})`}
            active={tab === 'visitantes'}
            onPress={() => setTab('visitantes')}
          />
        </View>

        {tab === 'pecas' && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categories}
          >
            <CategoryButton
              title="Todas"
              active={!category}
              onPress={() => setCategory('')}
            />
            {CATEGORIES.map(item => (
              <CategoryButton
                key={item}
                title={item}
                active={category === item}
                onPress={() => setCategory(item)}
              />
            ))}
          </ScrollView>
        )}

        {loading ? (
          <View style={styles.feedback}>
            <ActivityIndicator color="#2F524F" />
            <Text style={styles.feedbackText}>Abrindo as vitrines...</Text>
          </View>
        ) : loadError ? (
          <View style={styles.feedback}>
            <Ionicons name="cloud-offline-outline" size={34} color="#644219" />
            <Text style={styles.emptyTitle}>Não foi possível explorar</Text>
            <Text style={styles.feedbackText}>{loadError}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={load}>
              <Text style={styles.retryText}>TENTAR NOVAMENTE</Text>
            </TouchableOpacity>
          </View>
        ) : tab === 'pecas' && visiblePosts.length > 0 ? (
          <View style={styles.results}>
            {visiblePosts.map(post => (
              <PublicationCard
                key={post.id}
                post={post}
                onPostRemoved={postId => setPosts(current => current.filter(item => item.id !== postId))}
                onPostUpdated={updated => setPosts(current => current.map(item => item.id === updated.id ? updated : item))}
              />
            ))}
          </View>
        ) : tab === 'visitantes' && visibleUsers.length > 0 ? (
          <View style={styles.results}>
            {visibleUsers.map(visitor => {
              const following =
                currentUser?.following.includes(visitor.id) ?? false;

              return (
                <View
                  key={visitor.id}
                  style={styles.userCard}
                >
                  <TouchableOpacity
                    activeOpacity={0.82}
                    style={styles.userDetails}
                    onPress={() =>
                      router.push({
                        pathname: '/usuario/[id]',
                        params: { id: visitor.id },
                      })
                    }
                  >
                    {visitor.photo ? (
                      <TouchableOpacity
                        accessibilityRole="button"
                        accessibilityLabel={`Ampliar foto de ${visitor.name}`}
                        activeOpacity={0.9}
                        onPress={event => {
                          event.stopPropagation();
                          setPreviewImageUri(visitor.photo);
                          setPreviewImageTitle(visitor.name);
                        }}
                      >
                        <Image
                          source={{ uri: visitor.photo }}
                          style={styles.avatar}
                        />
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.avatar}>
                        <Ionicons
                          name="person"
                          size={22}
                          color="#2F524F"
                        />
                      </View>
                    )}
                    <View style={styles.userInfo}>
                      <Text style={styles.userName}>{visitor.name}</Text>
                      <Text style={styles.username}>@{visitor.username}</Text>
                      {!!visitor.bio && (
                        <Text numberOfLines={2} style={styles.bio}>
                          {visitor.bio}
                        </Text>
                      )}
                      <Text style={styles.followers}>
                        {visitor.followers.length} seguidores
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel={
                      following
                        ? `Deixar de seguir ${visitor.name}`
                        : `Seguir ${visitor.name}`
                    }
                    style={[
                      styles.followButton,
                      following && styles.followingButton,
                    ]}
                    disabled={busyUserId === visitor.id}
                    onPress={() => handleFollow(visitor.id)}
                  >
                    <Text
                      style={[
                        styles.followText,
                        following && styles.followingText,
                      ]}
                    >
                      {busyUserId === visitor.id
                        ? '...'
                        : following
                          ? 'SEGUINDO'
                          : 'SEGUIR'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.feedback}>
            <Ionicons
              name={tab === 'pecas' ? 'cube-outline' : 'people-outline'}
              size={42}
              color="#6A614D"
            />
            <Text style={styles.emptyTitle}>
              {search || category
                ? 'Nada encontrado por aqui'
                : tab === 'pecas'
                  ? 'O acervo ainda está vazio'
                  : 'Você chegou primeiro'}
            </Text>
            <Text style={styles.feedbackText}>
              {tab === 'pecas'
                ? 'Mude os filtros ou seja a primeira pessoa a adicionar uma peça.'
                : 'Convide alguém para visitar o Museu e compartilhar suas descobertas.'}
            </Text>
            {tab === 'pecas' && (
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => router.push('/criar-publicacao')}
              >
                <Text style={styles.retryText}>ADICIONAR UMA PEÇA</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
      <ImageLightbox
        visible={Boolean(previewImageUri)}
        uri={previewImageUri}
        title={previewImageTitle}
        onClose={() => setPreviewImageUri(null)}
      />
    </SafeAreaView>
  );
}

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function TabButton({
  title,
  active,
  onPress,
}: {
  title: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[styles.tab, active && styles.activeTab]}
    >
      <Text style={[styles.tabText, active && styles.activeTabText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

function CategoryButton({
  title,
  active,
  onPress,
}: {
  title: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={[styles.category, active && styles.activeCategory]}
      onPress={onPress}
    >
      <Text style={[styles.categoryText, active && styles.activeCategoryText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2E1C7',
  },
  page: {
    flexGrow: 1,
    padding: 18,
    paddingBottom: 38,
  },
  header: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
  },
  headerTitleWrap: {
    alignItems: 'center',
  },
  eyebrow: {
    color: '#595626',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  title: {
    color: '#3D0404',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 2,
  },
  subtitle: {
    color: '#644219',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
  },
  search: {
    minHeight: 49,
    marginTop: 18,
    borderRadius: 11,
    backgroundColor: '#E3D2B5',
    borderWidth: 1,
    borderColor: '#C8B58F',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    gap: 8,
  },
  input: {
    flex: 1,
    color: '#3D0404',
    fontSize: 12,
    paddingVertical: 10,
  },
  tabs: {
    flexDirection: 'row',
    marginTop: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#C8B58F',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 11,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#2F524F',
  },
  tabText: {
    color: '#776650',
    fontSize: 11,
    fontWeight: '800',
  },
  activeTabText: {
    color: '#2F524F',
  },
  categories: {
    gap: 8,
    paddingTop: 13,
    paddingBottom: 5,
  },
  category: {
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#E3D2B5',
    borderWidth: 1,
    borderColor: '#C8B58F',
  },
  activeCategory: {
    backgroundColor: '#2F524F',
    borderColor: '#2F524F',
  },
  categoryText: {
    color: '#644219',
    fontSize: 12,
    fontWeight: '700',
  },
  activeCategoryText: {
    color: '#F2E1C7',
  },
  results: {
    marginTop: 16,
  },
  feedback: {
    minHeight: 280,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 26,
  },
  feedbackText: {
    color: '#644219',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 7,
  },
  emptyTitle: {
    color: '#3D0404',
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 10,
  },
  retryButton: {
    marginTop: 17,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 9,
    backgroundColor: '#2F524F',
  },
  retryText: {
    color: '#F2E1C7',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3D2B5',
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#C8B58F',
    padding: 12,
    marginBottom: 10,
  },
  avatar: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 23,
    backgroundColor: '#D6C29D',
  },
  userDetails: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    marginLeft: 11,
    marginRight: 8,
  },
  userName: {
    color: '#3D0404',
    fontSize: 12,
    fontWeight: '900',
  },
  username: {
    color: '#2F524F',
    fontSize: 12,
    marginTop: 2,
  },
  bio: {
    color: '#644219',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 5,
  },
  followers: {
    color: '#776650',
    fontSize: 11,
    marginTop: 5,
  },
  followButton: {
    minWidth: 77,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 9,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: '#2F524F',
  },
  followingButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#2F524F',
  },
  followText: {
    color: '#F2E1C7',
    fontSize: 11,
    fontWeight: '900',
  },
  followingText: {
    color: '#2F524F',
  },
});
