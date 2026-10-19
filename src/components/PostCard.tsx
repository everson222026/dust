import { ThemedIonicons as Ionicons, ThemedText as Text, ThemedView as View } from '../theme/ThemedComponents';
import { useRouter } from 'expo-router';

import {
    Image,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';

import {
    Post,
} from '../storage/storage';

export default function PostCard({
  post,
  onPress,
}: {
  post: Post;
  onPress?: () => void;
}) {
  const router = useRouter();

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      style={styles.card}
      onPress={onPress ?? (() =>
        router.push({
          pathname: '/publicacao/[id]',
          params: { id: post.id },
        }))}
    >
      <View style={styles.authorRow}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={17} color="#2F524F" />
        </View>
        <View style={styles.authorDetails}>
          <Text style={styles.authorName}>{post.authorName}</Text>
          <Text style={styles.categoryText}>{post.category} · Museu do Inusitado</Text>
        </View>
        <Ionicons name="ellipsis-horizontal" size={19} color="#644219" />
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
            styles.placeholder
          }
        >
          <Ionicons
            name="cube-outline"
            size={45}
            color="#644219"
          />
        </View>
      )}

      <View
        style={styles.body}
      >
        <Text
          style={styles.title}
        >
          {post.title}
        </Text>

        <Text
          numberOfLines={2}
          style={
            styles.description
          }
        >
          {post.description}
        </Text>

        <View
          style={styles.footer}
        >
          <View
            style={styles.metric}
          >
            <Ionicons
              name="heart-outline"
              size={15}
              color="#3D0404"
            />

            <Text
              style={styles.metricText}
            >
              {post.likes.length}
            </Text>
          </View>

          <View
            style={styles.metric}
          >
            <Ionicons
              name="chatbubble-outline"
              size={14}
              color="#3D0404"
            />

            <Text
              style={styles.metricText}
            >
              {post.comments.length}
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={17}
            color="#644219"
            style={{
              marginLeft:
                'auto',
            }}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor:
      '#E3D2B5',
    borderRadius: 14,
    borderWidth: 1,
    borderColor:
      '#C8B58F',
    overflow: 'hidden',
    marginBottom: 12,
  },

  image: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor:
      '#D9D9D9',
  },

  placeholder: {
    height: 170,
    alignItems: 'center',
    justifyContent:
      'center',
    backgroundColor:
      '#D6C29D',
  },

  body: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 13,
  },

  authorRow: {
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
  },

  avatar: {
    width: 37,
    height: 37,
    borderRadius: 19,
    backgroundColor: '#D6C29D',
    borderWidth: 1,
    borderColor: '#C8B58F',
    alignItems: 'center',
    justifyContent: 'center',
  },

  authorDetails: {
    flex: 1,
    marginLeft: 10,
  },

  authorName: {
    color: '#3D0404',
    fontSize: 14,
    fontWeight: '800',
  },

  categoryText: {
    color: '#776650',
    fontSize: 11,
    marginTop: 2,
  },

  title: {
    color: '#3D0404',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 8,
  },

  description: {
    color: '#644219',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 5,
  },

  author: {
    color: '#776650',
    fontSize: 12,
    marginTop: 8,
  },

  footer: {
    borderTopWidth: 1,
    borderTopColor:
      '#C8B58F',
    marginTop: 10,
    paddingTop: 9,
    flexDirection: 'row',
    alignItems: 'center',
  },

  metric: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 19,
  },

  metricText: {
    color: '#644219',
    fontSize: 12,
    marginLeft: 4,
  },
});