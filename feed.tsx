import {
    useFocusEffect,
    useRouter,
} from 'expo-router';

import {
    useCallback,
    useState,
} from 'react';

import {
    ScrollView,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';

import {
    getFeed,
    getSession,
    Post,
} from '../storage/storage';

import PublicationCard from '../components/PublicationCard';
import { ThemedSafeAreaView as SafeAreaView, ThemedText as Text, ThemedView as View } from '../theme/SmartThemedComponents';

export default function FeedScreen() {
  const router = useRouter();

  const [posts, setPosts] =
    useState<Post[]>([]);

  async function load() {
    const session =
      await getSession();

    if (!session) {
      return;
    }

    const result =
      await getFeed(
        session.id
      );

    setPosts(result);
  }

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  return (
    <SafeAreaView
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={
          styles.page
        }
        showsVerticalScrollIndicator={
          false
        }
      >

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
              style={styles.eyebrow}
            >
              MUSEU DO INUSITADO
            </Text>

            <Text
              style={
                styles.headerTitle
              }
            >
              Feed
            </Text>
          </View>

          <TouchableOpacity
            onPress={() =>
              router.push(
                '/atividades'
              )
            }
          >
            <Text
              style={styles.activity}
            >
              ♡
            </Text>
          </TouchableOpacity>
        </View>

        {posts.length === 0 ? (
          <View
            style={styles.empty}
          >
            <Text
              style={styles.emptyIcon}
            >
              ◌
            </Text>

            <Text
              style={
                styles.emptyTitle
              }
            >
              Seu feed está vazio
            </Text>

            <Text
              style={styles.emptyText}
            >
              Siga outros visitantes para
              acompanhar as novas peças
              que eles adicionarem ao museu.
            </Text>

            <TouchableOpacity
              style={
                styles.exploreButton
              }
              onPress={() =>
                router.push(
                  '/explorar'
                )
              }
            >
              <Text
                style={
                  styles.exploreText
                }
              >
                ENCONTRAR PESSOAS
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          posts.map(
            post => (
              <PublicationCard
                key={post.id}
                post={post}
                onPostRemoved={postId => setPosts(current => current.filter(item => item.id !== postId))}
                onPostUpdated={updated => setPosts(current => current.map(item => item.id === updated.id ? updated : item))}
              />
            )
          )
        )}

      </ScrollView>
    </SafeAreaView>
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
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
    marginBottom: 8,
  },

  headerCenter: {
    alignItems: 'center',
  },

  eyebrow: {
    color: '#595626',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },

  headerTitle: {
    color: '#3D0404',
    fontSize: 21,
    fontWeight: '900',
    marginTop: 2,
  },

  back: {
    color: '#3D0404',
    fontSize: 30,
  },

  activity: {
    color: '#3D0404',
    fontSize: 25,
  },

  empty: {
    minHeight: 500,
    justifyContent:
      'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },

  emptyIcon: {
    color: '#6A614D',
    fontSize: 50,
  },

  emptyTitle: {
    color: '#3D0404',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 8,
  },

  emptyText: {
    color: '#644219',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 6,
  },

  exploreButton: {
    marginTop: 18,
    backgroundColor:
      '#2F524F',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  exploreText: {
    color: '#F2E1C7',
    fontSize: 12,
    fontWeight: '900',
  },
});