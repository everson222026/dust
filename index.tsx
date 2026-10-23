import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Animated,
  Alert,
  Image,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';

import { getSession, startDemoSession } from '../storage/storage';
import { isSupabaseConfigured } from '../lib/supabase';

export default function SplashScreen() {
  const router = useRouter();

  const [opacity] = useState(
    () => new Animated.Value(0)
  );

  const [scale] = useState(
    () => new Animated.Value(0.9)
  );

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),

      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        tension: 35,
        useNativeDriver: true,
      }),
    ]).start(async () => {
      try {
        const session = await getSession();
        if (!session && !isSupabaseConfigured()) {
          await startDemoSession();
        }
        setTimeout(() => router.replace('/home'), 500);
      } catch (error) {
        router.replace('/home');
        Alert.alert(
          'Não foi possível conectar ao Museu',
          error instanceof Error
            ? error.message
            : 'Verifique sua conexão e tente novamente.'
        );
      }
    });
  }, [opacity, router, scale]);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F2E1C7"
      />

      <Animated.View
        style={[
          styles.content,
          {
            opacity,
            transform: [{ scale }],
          },
        ]}
      >
        <Image
          source={require('../../assets/images/logo-dust.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2E1C7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  logo: {
    width: '82%',
    height: '55%',
  },
});