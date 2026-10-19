import { ThemedIonicons as Ionicons, ThemedSafeAreaView as SafeAreaView, ThemedText as Text, ThemedView as View } from '../../theme/ThemedComponents';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import PostCard from '../../components/PostCard';
import { goBackOrReplace } from '../../lib/navigation';
import {
  findUser,
  getPosts,
  getSession,
  Post,
  toggleFollow,
  User,
} from '../../storage/storage';

export default function UsuarioScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [visitor, session, allPosts] = await Promise.all([
        findUser(String(id)),
        getSession(),
        getPosts(),
      ]);
      setUser(visitor);
      setCurrentUser(session);
      setPosts(allPosts.filter(post => post.authorId === String(id)));
    } catch (error) {
      Alert.alert(
        'Não foi possível abrir o perfil',
        error instanceof Error ? error.message : 'Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function follow() {
    if (!currentUser || !user) {
      router.push('/login');
      return;
    }
    try {
      setWorking(true);
      const result = await toggleFollow(currentUser.id, user.id);
      if (result) {
        setCurrentUser(result.current);
        setUser(result.target);
      }
    } catch (error) {
      Alert.alert(
        'Não foi possível atualizar',
        error instanceof Error ? error.message : 'Tente novamente.'
      );
    } finally {
      setWorking(false);
    }
  }

  const following = currentUser?.following.includes(String(id)) ?? false;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.page}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            accessibilityLabel="Voltar"
            onPress={() => goBackOrReplace(router, '/explorar')}
          >
            <Ionicons name="arrow-back" size={22} color="#3D0404" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>VISITANTE</Text>
          <View style={styles.spacer} />
        </View>

        {loading ? (
          <Text style={styles.empty}>Abrindo o perfil...</Text>
        ) : !user ? (
          <Text style={styles.empty}>Visitante não encontrado.</Text>
        ) : (
          <>
            <View style={styles.profile}>
              {user.photo ? (
                <Image source={{ uri: user.photo }} style={styles.avatar} />
              ) : (
                <View style={styles.avatar}>
                  <Ionicons name="person" size={36} color="#2F524F" />
                </View>
              )}
              <Text style={styles.name}>{user.name}</Text>
              <Text style={styles.username}>@{user.username}</Text>
              {!!user.bio && <Text style={styles.bio}>{user.bio}</Text>}

              {currentUser?.id !== user.id && (
                <TouchableOpacity
                  style={[
                    styles.followButton,
                    following && styles.followingButton,
                  ]}
                  onPress={follow}
                  disabled={working}
                >
                  <Ionicons
                    name={following ? 'checkmark' : 'person-add-outline'}
                    size={16}
                    color={following ? '#2F524F' : '#F2E1C7'}
                  />
                  <Text
                    style={[
                      styles.followText,
                      following && styles.followingText,
                    ]}
                  >
                    {working ? 'AGUARDE...' : following ? 'SEGUINDO' : 'SEGUIR'}
                  </Text>
                </TouchableOpacity>
              )}

              <View style={styles.stats}>
                <Stat number={posts.length} label="PEÇAS" />
                <Stat number={user.followers.length} label="SEGUIDORES" />
                <Stat number={user.following.length} label="SEGUINDO" />
              </View>
            </View>

            <Text style={styles.sectionTitle}>PEÇAS NO ACERVO</Text>
            {posts.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons name="cube-outline" size={35} color="#644219" />
                <Text style={styles.empty}>Este visitante ainda não publicou peças.</Text>
              </View>
            ) : (
              posts.map(post => <PostCard key={post.id} post={post} />)
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ number, label }: { number: number; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statNumber}>{number}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2E1C7' },
  page: { padding: 18, paddingBottom: 40 },
  header: {
    height: 46,
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
  spacer: { width: 22 },
  profile: { alignItems: 'center', paddingVertical: 18 },
  avatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#D6C29D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { color: '#3D0404', fontSize: 22, fontWeight: '900', marginTop: 10 },
  username: { color: '#2F524F', fontSize: 11, marginTop: 2 },
  bio: {
    color: '#644219',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 10,
    maxWidth: 440,
  },
  followButton: {
    minHeight: 40,
    minWidth: 135,
    borderRadius: 9,
    backgroundColor: '#2F524F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginTop: 14,
  },
  followingButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#2F524F',
  },
  followText: { color: '#F2E1C7', fontSize: 12, fontWeight: '900' },
  followingText: { color: '#2F524F' },
  stats: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    marginTop: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#C8B58F',
  },
  stat: { alignItems: 'center', minWidth: 75 },
  statNumber: { color: '#3D0404', fontSize: 17, fontWeight: '900' },
  statLabel: { color: '#776650', fontSize: 11, fontWeight: '800', marginTop: 3 },
  sectionTitle: {
    color: '#595626',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginBottom: 11,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 26,
    backgroundColor: '#E3D2B5',
    borderRadius: 13,
  },
  empty: { color: '#644219', textAlign: 'center', marginTop: 8 },
});
