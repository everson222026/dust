import { ThemedIonicons as Ionicons, ThemedSafeAreaView as SafeAreaView, ThemedText as Text, ThemedTextInput as TextInput, ThemedView as View } from '../theme/SmartThemedComponents';
import {
    useFocusEffect,
    useRouter,
} from 'expo-router';
import {
    useCallback,
    useMemo,
    useState,
} from 'react';

import {
    ScrollView,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';

import {
    CATEGORIES,
  getHistoricalEra,
    getPosts,
    Post,
} from '../storage/storage';
import PublicationCard from '../components/PublicationCard';
import { HistoryEraFilter, HistoricalTimeline, RestorationLoader } from '../components/museum/MuseumShowcase';
import ImmersiveGallery from '../components/museum/ImmersiveGallery';
import { recordMuseumVisit } from '../storage/museumFeatures';
import { useAppTheme } from '../theme/ThemeContext';

export default function AcervoScreen() {
  const router = useRouter();
  const { palette } = useAppTheme();

  const [posts, setPosts] =
    useState<Post[]>([]);

  const [search, setSearch] =
    useState('');

  const [category, setCategory] =
    useState('');
  const [era, setEra] = useState<HistoryEraFilter>('Todas');
  const [viewMode, setViewMode] = useState<'walk' | 'list'>('walk');
  const [loading, setLoading] = useState(true);

  async function loadPosts() {
    setLoading(true);
    try {
      setPosts(await getPosts());
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      void loadPosts();
      void recordMuseumVisit('acervo');
    }, [])
  );

  const filteredPosts =
    useMemo(() => {
      const term =
        search.trim().toLowerCase();

      return posts.filter(post => {
        const matchesSearch =
          !term ||
          post.title
            .toLowerCase()
            .includes(term) ||
          post.description
            .toLowerCase()
            .includes(term) ||
          post.authorName
            .toLowerCase()
            .includes(term);

        const matchesCategory =
          !category ||
          post.category === category;

        const matchesEra = era === 'Todas' || getHistoricalEra(post) === era;

        return (
          matchesSearch &&
          matchesCategory &&
          matchesEra
        );
      });
    }, [
      posts,
      search,
      category,
      era,
    ]);

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

          <View
            style={
              styles.headerCenter
            }
          >
            <Text
              style={
                styles.eyebrow
              }
            >
              MUSEU DO INUSITADO
            </Text>

            <Text
              style={
                styles.headerTitle
              }
            >
              Acervo
            </Text>
          </View>

          <TouchableOpacity
            onPress={() =>
              router.push(
                '/explorar'
              )
            }
          >
            <Ionicons
              name="search-outline"
              size={22}
              color="#3D0404"
            />
          </TouchableOpacity>
        </View>

        {/* PESQUISA */}

        <View
          style={styles.search}
        >
          <Ionicons
            name="search-outline"
            size={17}
            color="#644219"
          />

          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={
              setSearch
            }
            placeholder="Pesquisar objetos, histórias ou pessoas..."
            placeholderTextColor="#907C60"
          />
        </View>

        <HistoricalTimeline value={era} onChange={setEra} />

        {/* CATEGORIAS */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.categories
          }
        >
          <CategoryButton
            title="Todos"
            active={!category}
            onPress={() =>
              setCategory('')
            }
          />

          {CATEGORIES.map(
            item => (
              <CategoryButton
                key={item}
                title={item}
                active={
                  category === item
                }
                onPress={() =>
                  setCategory(item)
                }
              />
            )
          )}
        </ScrollView>

        <View style={[styles.viewSwitcher, { backgroundColor: palette.raised, borderColor: palette.border }]}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityState={{ selected: viewMode === 'walk' }}
            onPress={() => setViewMode('walk')}
            style={[styles.viewOption, viewMode === 'walk' && { backgroundColor: palette.accent }]}
          >
            <Ionicons name="walk-outline" size={16} color={viewMode === 'walk' ? palette.background : palette.secondary} />
            <Text style={[styles.viewOptionText, { color: viewMode === 'walk' ? palette.background : palette.secondary }]}>Passeio imersivo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityState={{ selected: viewMode === 'list' }}
            onPress={() => setViewMode('list')}
            style={[styles.viewOption, viewMode === 'list' && { backgroundColor: palette.accent }]}
          >
            <Ionicons name="grid-outline" size={15} color={viewMode === 'list' ? palette.background : palette.secondary} />
            <Text style={[styles.viewOptionText, { color: viewMode === 'list' ? palette.background : palette.secondary }]}>Quadros</Text>
          </TouchableOpacity>
        </View>

        {/* CONTADOR */}

        <View
          style={styles.countRow}
        >
          <Text
            style={
              styles.countText
            }
          >
            {filteredPosts.length}{' '}
            {filteredPosts.length ===
            1
              ? 'peça'
              : 'peças'} no acervo
          </Text>
        </View>

        {/* ACERVO */}

        {loading ? (
          <RestorationLoader label="Revelando peças do acervo" />
        ) : filteredPosts.length ===
        0 ? (
          <EmptyState
            onPress={() =>
              router.push(
                '/criar-publicacao'
              )
            }
          />
        ) : viewMode === 'walk' ? (
          <ImmersiveGallery
            posts={filteredPosts}
            onOpen={post => router.push({ pathname: '/publicacao/[id]', params: { id: post.id } })}
          />
        ) : (
          <View
            style={styles.list}
          >
            {filteredPosts.map(
              post => (
                <PublicationCard
                  key={post.id}
                  post={post}
                  onPress={() =>
                    router.push({
                      pathname: '/publicacao/[id]',
                      params: { id: post.id },
                    })
                  }
                  onPostRemoved={postId => setPosts(current => current.filter(item => item.id !== postId))}
                  onPostUpdated={updated => setPosts(current => current.map(item => item.id === updated.id ? updated : item))}
                />
              )
            )}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
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
      style={[
        styles.category,
        active &&
          styles.categoryActive,
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.categoryText,
          active &&
            styles.categoryTextActive,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

function EmptyState({
  onPress,
}: {
  onPress: () => void;
}) {
  return (
    <View
      style={styles.empty}
    >
      <Ionicons
        name="archive-outline"
        size={55}
        color="#6A614D"
      />

      <Text
        style={styles.emptyTitle}
      >
        O acervo está vazio
      </Text>

      <Text
        style={styles.emptyText}
      >
        Seja o primeiro a colocar
        uma coisa inútil no museu.
      </Text>

      <TouchableOpacity
        style={styles.emptyButton}
        onPress={onPress}
      >
        <Ionicons
          name="add"
          size={17}
          color="#F2E1C7"
        />

        <Text
          style={
            styles.emptyButtonText
          }
        >
          ADICIONAR PEÇA
        </Text>
      </TouchableOpacity>
    </View>
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
    paddingBottom: 40,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
    marginBottom: 17,
  },

  headerCenter: {
    alignItems: 'center',
  },

  eyebrow: {
    color: '#595626',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.1,
  },

  headerTitle: {
    color: '#3D0404',
    fontSize: 23,
    fontWeight: '900',
    marginTop: 3,
  },

  search: {
    height: 48,
    borderRadius: 11,
    backgroundColor:
      '#E3D2B5',
    borderWidth: 1,
    borderColor:
      '#C8B58F',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
  },

  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: '#3D0404',
    fontSize: 14,
  },

  categories: {
    paddingVertical: 14,
    gap: 7,
  },

  category: {
    backgroundColor:
      '#D9D9D9',
    borderRadius: 9,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  categoryActive: {
    backgroundColor:
      '#2F524F',
  },

  categoryText: {
    color: '#644219',
    fontSize: 12,
    fontWeight: '800',
  },

  categoryTextActive: {
    color: '#FFFFFF',
  },

  countRow: {
    marginBottom: 10,
  },

  countText: {
    color: '#595626',
    fontSize: 12,
    fontWeight: '800',
  },

  list: {
    gap: 12,
  },

  viewSwitcher: { flexDirection: 'row', borderWidth: 1, borderRadius: 12, padding: 4, gap: 4, marginTop: 1, marginBottom: 15 },
  viewOption: { flex: 1, minHeight: 37, borderRadius: 9, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  viewOptionText: { fontSize: 10, fontWeight: '800' },

  empty: {
    minHeight: 430,
    alignItems: 'center',
    justifyContent:
      'center',
    paddingHorizontal: 35,
  },

  emptyTitle: {
    color: '#3D0404',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 12,
  },

  emptyText: {
    color: '#644219',
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
    marginTop: 6,
  },

  emptyButton: {
    marginTop: 18,
    backgroundColor:
      '#2F524F',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  emptyButtonText: {
    color: '#F2E1C7',
    fontSize: 11,
    fontWeight: '900',
    marginLeft: 4,
  },
});
