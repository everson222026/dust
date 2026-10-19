import { ThemedIonicons as Ionicons, ThemedSafeAreaView as SafeAreaView, ThemedText as Text, ThemedView as View } from '../theme/ThemedComponents';
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
  Activity,
  getActivities,
  markActivitiesRead,
} from '../storage/storage';
import { goBackOrReplace } from '../lib/navigation';

export default function AtividadesScreen() {
  const router = useRouter();

  const [activities, setActivities] =
    useState<Activity[]>([]);

  async function load() {
    const result =
      await getActivities();

    setActivities(result);

    await markActivitiesRead();
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
      <View
        style={styles.header}
      >
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          onPress={() => goBackOrReplace(router, '/home')}
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
          ATIVIDADES
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
        {activities.length ===
        0 ? (
          <View
            style={styles.empty}
          >
            <Ionicons
              name="notifications-outline"
              size={45}
              color="#6A614D"
            />

            <Text
              style={
                styles.emptyTitle
              }
            >
              Nenhuma atividade ainda
            </Text>

            <Text
              style={styles.emptyText}
            >
              Quando você publicar,
              curtir, comentar ou seguir
              alguém, tudo aparecerá aqui.
            </Text>
          </View>
        ) : (
          activities.map(
            activity => (
              <TouchableOpacity
                key={activity.id}
                style={[
                  styles.item,
                  !activity.read &&
                    styles.unread,
                ]}
                onPress={() => {
                  if (
                    activity.targetPostId
                  ) {
                    router.push({
                      pathname:
                        '/publicacao/[id]',
                      params: {
                        id:
                          activity.targetPostId,
                      },
                    });
                  }

                  if (
                    activity.targetUserId
                  ) {
                    router.push({
                      pathname:
                        '/usuario/[id]',
                      params: {
                        id:
                          activity.targetUserId,
                      },
                    });
                  }
                }}
              >
                <View
                  style={
                    styles.icon
                  }
                >
                  <Ionicons
                    name={
                      activity.type ===
                      'follow'
                        ? 'person-add-outline'
                        : activity.type ===
                            'like'
                          ? 'heart-outline'
                          : activity.type ===
                              'comment'
                            ? 'chatbubble-outline'
                            : 'add-circle-outline'
                    }
                    size={18}
                    color="#2F524F"
                  />
                </View>

                <View
                  style={
                    styles.body
                  }
                >
                  <Text
                    style={
                      styles.message
                    }
                  >
                    {activity.message}
                  </Text>

                  <Text
                    style={
                      styles.date
                    }
                  >
                    {new Date(
                      activity.createdAt
                    ).toLocaleString(
                      'pt-BR'
                    )}
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={16}
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

  headerTitle: {
    color: '#3D0404',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },

  page: {
    padding: 18,
    paddingBottom: 40,
  },

  item: {
    minHeight: 70,
    backgroundColor:
      '#E3D2B5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor:
      '#C8B58F',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  unread: {
    borderColor:
      '#E3B86B',
    borderWidth: 2,
  },

  icon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor:
      '#D9D9D9',
    alignItems: 'center',
    justifyContent:
      'center',
  },

  body: {
    flex: 1,
    marginHorizontal: 9,
  },

  message: {
    color: '#3D0404',
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '700',
  },

  date: {
    color: '#776650',
    fontSize: 11,
    marginTop: 5,
  },

  empty: {
    minHeight: 430,
    alignItems: 'center',
    justifyContent:
      'center',
    paddingHorizontal: 30,
  },

  emptyTitle: {
    color: '#3D0404',
    fontSize: 16,
    fontWeight: '900',
    marginTop: 10,
  },

  emptyText: {
    color: '#644219',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 5,
  },
});