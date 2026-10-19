import { ThemedIonicons as Ionicons, ThemedSafeAreaView as SafeAreaView, ThemedText as Text, ThemedView as View } from '../../theme/ThemedComponents';
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
    Image,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';

import {
    getPost,
    getSession,
    Post,
    toggleLike,
    toggleSaved,
    User,
} from '../../storage/storage';
import { goBackOrReplace } from '../../lib/navigation';

export default function PublicacaoScreen() {
  const router = useRouter();

  const { id } =
    useLocalSearchParams<{
      id: string;
    }>();

  const [post, setPost] =
    useState<Post | null>(null);

  const [user, setUser] =
    useState<User | null>(null);

  const load = useCallback(async () => {
    const found =
      await getPost(
        String(id)
      );

    const session =
      await getSession();

    setPost(found);
    setUser(session);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function like() {
    if (!post || !user) {
      return;
    }

    const updated =
      await toggleLike(
        post.id,
        user.id
      );

    if (updated) {
      setPost(updated);
    }
  }

  async function save() {
    if (!post || !user) {
      return;
    }

    const updated =
      await toggleSaved(
        post.id,
        user.id
      );

    if (updated) {
      setPost(updated);
    }
  }

  if (!post) {
    return (
      <SafeAreaView
        style={
          styles.container
        }
      >
        <View
          style={styles.notFound}
        >
          <Ionicons
            name="archive-outline"
            size={50}
            color="#644219"
          />

          <Text
            style={
              styles.notFoundTitle
            }
          >
            Peça não encontrada
          </Text>

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            onPress={() => goBackOrReplace(router, '/acervo')}
          >
            <Text
              style={
                styles.backText
              }
            >
              Voltar
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const liked =
    !!user &&
    post.likes.includes(
      user.id
    );

  const saved =
    !!user &&
    post.savedBy.includes(
      user.id
    );

  return (
    <SafeAreaView
      style={styles.container}
    >
      <ScrollView
        showsVerticalScrollIndicator={
          false
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
            style={styles.headerTitle}
          >
            PUBLICAÇÃO
          </Text>

          <TouchableOpacity
            onPress={save}
          >
            <Ionicons
              name={
                saved
                  ? 'bookmark'
                  : 'bookmark-outline'
              }
              size={22}
              color="#3D0404"
            />
          </TouchableOpacity>
        </View>

        {post.image ? (
          <Image
            source={{
              uri: post.image,
            }}
            style={styles.image}
          />
        ) : (
          <View
            style={
              styles.imagePlaceholder
            }
          >
            <Ionicons
              name="cube-outline"
              size={65}
              color="#644219"
            />
          </View>
        )}

        <View
          style={styles.content}
        >

          <View
            style={
              styles.categoryBadge
            }
          >
            <Text
              style={
                styles.categoryText
              }
            >
              {post.category}
            </Text>
          </View>

          <Text
            style={styles.title}
          >
            {post.title}
          </Text>

          <Text
            style={styles.author}
          >
            Publicado por {post.authorName}
          </Text>

          <Text
            style={styles.description}
          >
            {post.description}
          </Text>

          <InfoBlock
            title="POR QUE ISSO É INÚTIL?"
            text={
              post.whyUseless
            }
          />

          <InfoBlock
            title="HISTÓRIA"
            text={
              post.history
            }
          />

          <InfoBlock
            title="LOCAL"
            text={
              post.location
            }
          />

          <InfoBlock
            title="CONSERVAÇÃO"
            text={
              post.condition
            }
          />

          <View
            style={styles.actions}
          >
            <Action
              icon={
                liked
                  ? 'heart'
                  : 'heart-outline'
              }
              label={`${post.likes.length}`}
              active={liked}
              onPress={like}
            />

            <Action
              icon="chatbubble-outline"
              label={`${post.comments.length}`}
              onPress={() =>
                router.push({
                  pathname:
                    '/comentarios/[id]',
                  params: {
                    id: post.id,
                  },
                })
              }
            />

            <Action
              icon={
                saved
                  ? 'bookmark'
                  : 'bookmark-outline'
              }
              label="Salvar"
              active={saved}
              onPress={save}
            />
          </View>

          <TouchableOpacity
            style={
              styles.commentsButton
            }
            onPress={() =>
              router.push({
                pathname:
                  '/comentarios/[id]',
                params: {
                  id: post.id,
                },
              })
            }
          >
            <Text
              style={
                styles.commentsButtonText
              }
            >
              VER COMENTÁRIOS
            </Text>

            <Ionicons
              name="arrow-forward"
              size={17}
              color="#F2E1C7"
            />
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoBlock({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <View
      style={styles.infoBlock}
    >
      <Text
        style={styles.infoTitle}
      >
        {title}
      </Text>

      <Text
        style={styles.infoText}
      >
        {text}
      </Text>
    </View>
  );
}

function Action({
  icon,
  label,
  active,
  onPress,
}: {
  icon: any;
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.action}
      onPress={onPress}
    >
      <Ionicons
        name={icon}
        size={20}
        color={
          active
            ? '#3D0404'
            : '#644219'
        }
      />

      <Text
        style={styles.actionText}
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

  header: {
    height: 62,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
  },

  headerTitle: {
    color: '#3D0404',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },

  image: {
    width: '100%',
    height: 290,
    backgroundColor:
      '#D9D9D9',
  },

  imagePlaceholder: {
    height: 240,
    alignItems: 'center',
    justifyContent:
      'center',
    backgroundColor:
      '#D6C29D',
  },

  content: {
    padding: 18,
  },

  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor:
      '#2F524F',
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  categoryText: {
    color: '#F2E1C7',
    fontSize: 11,
    fontWeight: '900',
  },

  title: {
    color: '#3D0404',
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '900',
    marginTop: 9,
  },

  author: {
    color: '#776650',
    fontSize: 12,
    marginTop: 6,
  },

  description: {
    color: '#644219',
    fontSize: 15,
    lineHeight: 23,
    marginTop: 18,
  },

  infoBlock: {
    marginTop: 22,
    borderTopWidth: 1,
    borderTopColor:
      '#C8B58F',
    paddingTop: 13,
  },

  infoTitle: {
    color: '#595626',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  infoText: {
    color: '#644219',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 5,
  },

  actions: {
    marginTop: 22,
    paddingVertical: 13,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor:
      '#C8B58F',
    flexDirection: 'row',
    justifyContent:
      'space-around',
  },

  action: {
    alignItems: 'center',
    flexDirection: 'row',
  },

  actionText: {
    color: '#644219',
    fontSize: 12,
    marginLeft: 5,
  },

  commentsButton: {
    marginTop: 18,
    minHeight: 50,
    borderRadius: 11,
    backgroundColor:
      '#3D0404',
    alignItems: 'center',
    justifyContent:
      'center',
    flexDirection: 'row',
    gap: 7,
  },

  commentsButtonText: {
    color: '#F2E1C7',
    fontSize: 12,
    fontWeight: '900',
  },

  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent:
      'center',
  },

  notFoundTitle: {
    color: '#3D0404',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 10,
  },

  backText: {
    color: '#2F524F',
    fontSize: 11,
    fontWeight: '900',
    marginTop: 14,
  },
});