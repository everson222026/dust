import { ThemedIonicons as Ionicons, ThemedSafeAreaView as SafeAreaView, ThemedText as Text, ThemedView as View } from '../theme/ThemedComponents';
import {
    useLocalSearchParams,
    useRouter,
} from 'expo-router';
import {
    useCallback,
    useEffect,
    useState,
} from 'react';

import {
    ScrollView,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';

import {
    findUser,
    getUsers,
    User,
} from '../storage/storage';
import { goBackOrReplace } from '../lib/navigation';

export default function SeguidoresScreen() {
  const router = useRouter();

  const {
    userId,
    mode,
  } =
    useLocalSearchParams<{
      userId: string;
      mode: string;
    }>();

  const [owner, setOwner] =
    useState<User | null>(null);

  const [users, setUsers] =
    useState<User[]>([]);

  const load = useCallback(async () => {
    const target =
      await findUser(
        String(userId)
      );

    const all =
      await getUsers();

    if (!target) {
      return;
    }

    const ids =
      mode === 'following'
        ? target.following
        : target.followers;

    const result =
      all.filter(user =>
        ids.includes(user.id)
      );

    setOwner(target);
    setUsers(result);
  }, [mode, userId]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      load();
    }, 0);

    return () => clearTimeout(timeout);
  }, [load]);

  const title =
    mode === 'following'
      ? 'SEGUINDO'
      : 'SEGUIDORES';

  return (
    <SafeAreaView
      style={styles.container}
    >
      <View
        style={styles.header}
      >
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          onPress={() => goBackOrReplace(router, '/perfil')}
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
          {title}
        </Text>

        <View
          style={{ width: 22 }}
        />
      </View>

      <ScrollView
        contentContainerStyle={
          styles.page
        }
      >
        <Text
          style={styles.subtitle}
        >
          {owner?.name}
        </Text>

        {users.length === 0 ? (
          <View
            style={styles.empty}
          >
            <Ionicons
              name="people-outline"
              size={45}
              color="#6A614D"
            />

            <Text
              style={
                styles.emptyTitle
              }
            >
              {mode ===
              'following'
                ? 'Ainda não segue ninguém'
                : 'Ainda não possui seguidores'}
            </Text>
          </View>
        ) : (
          users.map(
            user => (
              <TouchableOpacity
                key={user.id}
                style={styles.user}
                onPress={() =>
                  router.push({
                    pathname:
                      '/usuario/[id]',
                    params: {
                      id: user.id,
                    },
                  })
                }
              >
                <View
                  style={styles.avatar}
                >
                  <Ionicons
                    name="person"
                    size={19}
                    color="#2F524F"
                  />
                </View>

                <View
                  style={styles.info}
                >
                  <Text
                    style={
                      styles.userName
                    }
                  >
                    {user.name}
                  </Text>

                  <Text
                    style={
                      styles.userEmail
                    }
                  >
                    @{user.username}
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={17}
                  color="#644219"
                />
              </TouchableOpacity>
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

  header: {
    height: 60,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
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

  page: {
    padding: 18,
    paddingBottom: 40,
  },

  subtitle: {
    color: '#644219',
    fontSize: 12,
    marginBottom: 14,
  },

  user: {
    minHeight: 62,
    borderRadius: 11,
    backgroundColor:
      '#E3D2B5',
    borderWidth: 1,
    borderColor:
      '#C8B58F',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginBottom: 8,
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor:
      '#D9D9D9',
    alignItems: 'center',
    justifyContent:
      'center',
  },

  info: {
    flex: 1,
    marginLeft: 10,
  },

  userName: {
    color: '#3D0404',
    fontSize: 11,
    fontWeight: '900',
  },

  userEmail: {
    color: '#776650',
    fontSize: 11,
    marginTop: 3,
  },

  empty: {
    minHeight: 350,
    alignItems: 'center',
    justifyContent:
      'center',
  },

  emptyTitle: {
    color: '#3D0404',
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 9,
  },
});