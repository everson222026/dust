import { ThemedIonicons as Ionicons, ThemedSafeAreaView as SafeAreaView, ThemedText as Text, ThemedView as View } from '../theme/SmartThemedComponents';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  Animated,
  Easing,
  Image,
  Platform,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';

import {
  getSession,
  User,
} from '../storage/storage';
import { recordMuseumVisit } from '../storage/museumFeatures';
import { AudioGuideCard, DailyPass } from '../components/museum/MuseumShowcase';
import { useMuseumAudio } from '../components/museum/MuseumAudioProvider';

export default function HomeScreen() {
  const router = useRouter();

  const { width } =
    useWindowDimensions();

  const isDesktop = width >= 900;
  const doorTravel = Math.min(width - 36, 560) / 2 + 4;
  const [scrollY] = useState(() => new Animated.Value(0));
  const { playEffect } = useMuseumAudio();

  const [user, setUser] =
    useState<User | null>(null);

  const [openingMuseum, setOpeningMuseum] =
    useState(false);
  const [visitorStats, setVisitorStats] = useState({ exhibitionsVisited: 0, daysStreak: 0 });

  const [leftDoor] = useState(
    () => new Animated.Value(0)
  );

  const [rightDoor] = useState(
    () => new Animated.Value(0)
  );

  const loadSession = async () => {
    const session = await getSession();
    setUser(session);
  };

  useFocusEffect(
    useCallback(() => {
      // Toda vez que a tela inicial ganha foco, as portas voltam à posição fechada.
      // Assim a animação pode acontecer novamente após voltar do acervo ou de outra tela.
      leftDoor.stopAnimation();
      rightDoor.stopAnimation();
      leftDoor.setValue(0);
      rightDoor.setValue(0);
      setOpeningMuseum(false);
      void loadSession();
      void recordMuseumVisit('sala-principal').then(stats => setVisitorStats({ exhibitionsVisited: stats.exhibitionsVisited.length, daysStreak: stats.daysStreak })).catch(() => undefined);

      return () => {
        // Ao sair do início, as portas se fecham. Ao voltar, o foco reinicia
        // os valores em zero para que possam abrir novamente.
        Animated.parallel([
          Animated.timing(leftDoor, {
            toValue: 0,
            duration: 240,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(rightDoor, {
            toValue: 0,
            duration: 240,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: Platform.OS !== 'web',
          }),
        ]).start();
      };
    }, [leftDoor, rightDoor])
  );

  async function openMuseum() {
    if (openingMuseum) {
      return;
    }

    setOpeningMuseum(true);
    playEffect('door');

    leftDoor.setValue(0);
    rightDoor.setValue(0);

    let duration = 650;
    try {
      const prefersReducedMotion = await AsyncStorage.getItem('@dust_reduce_motion');
      if (prefersReducedMotion === 'true') duration = 140;
    } catch {
      // Se não houver preferência salva, usa a animação padrão.
    }

    Animated.parallel([
      Animated.timing(leftDoor, {
        toValue: 1,
        duration,
        easing: Easing.out(
          Easing.cubic
        ),
        useNativeDriver: Platform.OS !== 'web',
      }),

      Animated.timing(rightDoor, {
        toValue: 1,
        duration,
        easing: Easing.out(
          Easing.cubic
        ),
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start(({ finished }) => {
      if (finished) {
        router.push('/acervo');
      } else {
        setOpeningMuseum(false);
      }
    });
  }

  const leftDoorX =
    leftDoor.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -doorTravel],
    });

  const rightDoorX =
    rightDoor.interpolate({
      inputRange: [0, 1],
      outputRange: [0, doorTravel],
    });

  function goToProfile() {
    router.push('/perfil');
  }

  return (
    <SafeAreaView style={styles.container}>
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: Platform.OS !== 'web' })}
        contentContainerStyle={[
          styles.page,
          isDesktop &&
            styles.pageDesktop,
        ]}
      >

        {/* HEADER */}

        <View
          style={[
            styles.header,
            isDesktop &&
              styles.headerDesktop,
          ]}
        >

          <TouchableOpacity
            style={styles.menuButton}
            onPress={() =>
              router.push('/menu')
            }
          >
            <Ionicons
              name="menu-outline"
              size={28}
              color="#2F524F"
            />
          </TouchableOpacity>

          {isDesktop && (
            <View
              style={styles.desktopBrand}
            >
              <Image
                source={require('../../assets/images/logo-dust.png')}
                style={
                  styles.desktopLogo
                }
                resizeMode="contain"
              />

              <View>
                <Text
                  style={
                    styles.desktopTitle
                  }
                >
                  MUSEU DO INUSITADO
                </Text>

                <Text
                  style={
                    styles.desktopSubtitle
                  }
                >
                  Onde nada serve para nada
                </Text>
              </View>
            </View>
          )}

          <View
            style={
              styles.desktopNavigation
            }
          >

            {isDesktop && (
              <>
                <NavItem
                  title="Museu"
                  active
                  onPress={() =>
                    router.replace('/home')
                  }
                />

                <NavItem
                  title="Acervo"
                  onPress={() =>
                    router.push('/acervo')
                  }
                />

                <NavItem
                  title="Explorar"
                  onPress={() =>
                    router.push('/explorar')
                  }
                />

                <NavItem
                  title="Perfil"
                  onPress={
                    goToProfile
                  }
                />
              </>
            )}

            <TouchableOpacity
              onPress={goToProfile}
              style={
                styles.profileButton
              }
            >
              <Ionicons
                name="person-circle-outline"
                size={32}
                color="#2F524F"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* HERO */}

        <View
          style={[
            styles.hero,
            isDesktop &&
              styles.heroDesktop,
          ]}
        >

          {/* TEXTO */}

          <View
            style={[
              styles.heroText,
              isDesktop &&
                styles.heroTextDesktop,
            ]}
          >

            {!isDesktop && (
              <Image
                source={require('../../assets/images/logo-dust.png')}
                style={styles.mainLogo}
                resizeMode="contain"
              />
            )}

            <Text
              style={styles.eyebrow}
            >
              UM MUSEU DIFERENTE
            </Text>

            <Text
              style={styles.title}
            >
              Onde nada serve para nada,
              {'\n'}
              mas tudo tem uma história.
            </Text>

            <Text
              style={styles.description}
            >
              Explore objetos estranhos,
              histórias curiosas e coisas
              que provavelmente deveriam
              ter sido jogadas fora.
            </Text>

            {/* BOTÕES */}

            <View
              style={
                styles.actions
              }
            >

              <ActionButton
                icon="enter-outline"
                title="ENTRAR NO MUSEU"
                subtitle="Descubra o acervo"
                background="#E3B86B"
                foreground="#3D0404"
                onPress={openMuseum}
              />

              <ActionButton
                icon="search-outline"
                title="EXPLORAR PEÇAS"
                subtitle="Encontre coisas incríveis"
                background="#595626"
                foreground="#FFFFFF"
                onPress={() => { playEffect('chime'); router.push('/explorar'); }}
              />

              <ActionButton
                icon="add-circle-outline"
                title="ADICIONAR MINHA COISA INÚTIL"
                subtitle="Faça parte do acervo"
                background="#2F524F"
                foreground="#FFFFFF"
                onPress={() => { playEffect('chime'); router.push('/criar-publicacao'); }}
              />

            </View>

            {/* USUÁRIO */}

            {user && (
              <TouchableOpacity
                style={
                  styles.userCard
                }
                onPress={
                  goToProfile
                }
              >

                <Ionicons
                  name="person-circle"
                  size={28}
                  color="#2F524F"
                />

                <View
                  style={
                    styles.userInfo
                  }
                >
                  <Text
                    style={
                      styles.userName
                    }
                  >
                    Olá, {user.name}
                  </Text>

                  <Text
                    style={
                      styles.userDescription
                    }
                  >
                    Acesse seu perfil e suas
                    publicações
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color="#644219"
                />

              </TouchableOpacity>
            )}

          </View>

          {/* MUSEU */}

          <Animated.View
            style={[
              styles.museumWrapper,
              isDesktop &&
                styles.museumWrapperDesktop,
              { transform: [{ translateY: scrollY.interpolate({ inputRange: [0, 680], outputRange: [0, -17], extrapolate: 'clamp' }) }] },
            ]}
          >

            <View
              style={
                styles.museumFrame
              }
            >

              <View style={styles.museumArtwork}>
                <View style={styles.museumArtworkFrame}>
                  <Image
                    source={require('../../assets/images/logo-dust.png')}
                    style={styles.museumLogo}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.museumArtworkTitle}>MUSEU DO INUSITADO</Text>
                <Text style={styles.museumArtworkSubtitle}>
                  Um acervo de coisas sem função e cheias de histórias.
                </Text>
                <Ionicons
                  name="sparkles-outline"
                  size={23}
                  color="#E3B86B"
                  style={styles.museumSparkle}
                />
              </View>

              {/* PORTAS */}

              <Animated.View
                pointerEvents="none"
                style={[
                  styles.door,
                  styles.leftDoor,
                  {
                    transform: [
                      {
                        translateX:
                          leftDoorX,
                      },
                    ],
                  },
                ]}
              >
                <View style={styles.leftDoorKnob} />
              </Animated.View>

              <Animated.View
                pointerEvents="none"
                style={[
                  styles.door,
                  styles.rightDoor,
                  {
                    transform: [
                      {
                        translateX:
                          rightDoorX,
                      },
                    ],
                  },
                ]}
              >
                <View style={styles.rightDoorKnob} />
              </Animated.View>

              <TouchableOpacity
                style={
                  styles.museumButton
                }
                onPress={
                  openMuseum
                }
                disabled={
                  openingMuseum
                }
              >

                <Text
                  style={
                    styles.museumButtonText
                  }
                >
                  ENTRAR NO MUSEU
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={17}
                  color="#3D0404"
                />

              </TouchableOpacity>

            </View>

          </Animated.View>

        </View>

        {/* INFORMAÇÃO */}

        <View
          style={
            styles.infoSection
          }
        >

          <Text
            style={
              styles.infoEyebrow
            }
          >
            O QUE É O DUST?
          </Text>

          <Text
            style={
              styles.infoTitle
            }
          >
            Um lugar para aquilo
            {'\n'}
            que não serve para nada.
          </Text>

          <Text
            style={
              styles.infoText
            }
          >
            No DUST, objetos esquecidos,
            estranhos ou completamente
            inúteis ganham uma história,
            um lugar no acervo e uma
            comunidade para apreciá-los.
          </Text>

        </View>

        <View style={styles.visitExperience}>
          <DailyPass stats={visitorStats} />
          <AudioGuideCard />
          <View style={styles.galleryShortcuts}>
            <QuickLink icon="albums-outline" title="Minha curadoria" subtitle="Salas particulares" onPress={() => { playEffect('chime'); router.push('/curadoria'); }} />
            <QuickLink icon="book-outline" title="Livro de visitas" subtitle="Deixe sua assinatura" onPress={() => { playEffect('chime'); router.push('/livro-de-visitas'); }} />
            <QuickLink icon="chatbubbles-outline" title="Conversar" subtitle="Mensagens da galeria" onPress={() => { playEffect('chime'); router.push('/mensagens'); }} />
          </View>
          <Text style={styles.demoCaption}>Retratos e publicações demonstrativos para dar vida às galerias.</Text>
        </View>

      </Animated.ScrollView>
    </SafeAreaView>
  );
}

function NavItem({
  title,
  active,
  onPress,
}: {
  title: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.navItem,
        active &&
          styles.navItemActive,
      ]}
    >
      <Text
        style={[
          styles.navText,
          active &&
            styles.navTextActive,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

function QuickLink({ icon, title, subtitle, onPress }: { icon: any; title: string; subtitle: string; onPress: () => void }) {
  return (
    <TouchableOpacity accessibilityRole="button" onPress={onPress} style={styles.quickLink}>
      <Ionicons name={icon} size={19} color="#D5AC62" />
      <Text style={styles.quickLinkTitle}>{title}</Text>
      <Text style={styles.quickLinkSubtitle}>{subtitle}</Text>
    </TouchableOpacity>
  );
}

function ActionButton({
  icon,
  title,
  subtitle,
  background,
  foreground,
  onPress,
}: {
  icon: any;
  title: string;
  subtitle: string;
  background: string;
  foreground: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.actionButton,
        { backgroundColor: background },
      ]}
      onPress={onPress}
      activeOpacity={0.85}
    >

      <Ionicons
        name={icon}
        size={23}
        color={foreground}
      />

      <View
        style={
          styles.actionText
        }
      >
        <Text
          style={[
            styles.actionTitle,
            { color: foreground },
          ]}
        >
          {title}
        </Text>

        <Text
          style={[
            styles.actionSubtitle,
            { color: foreground },
          ]}
        >
          {subtitle}
        </Text>
      </View>

      <Ionicons
        name="arrow-forward"
        size={18}
        color={foreground}
      />

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
    paddingBottom: 40,
  },

  pageDesktop: {
    paddingHorizontal: 45,
    maxWidth: 1400,
    alignSelf: 'center',
    width: '100%',
  },

  header: {
    minHeight: 60,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerDesktop: {
    paddingHorizontal: 0,
    minHeight: 74,
  },

  menuButton: {
    padding: 5,
  },

  desktopBrand: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  desktopLogo: {
    width: 58,
    height: 48,
    marginRight: 10,
  },

  desktopTitle: {
    color: '#2F524F',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.6,
  },

  desktopSubtitle: {
    marginTop: 2,
    color: '#644219',
    fontSize: 10,
  },

  desktopNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  navItem: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 9,
  },

  navItemActive: {
    backgroundColor: '#2F524F',
  },

  navText: {
    color: '#644219',
    fontSize: 11,
    fontWeight: '800',
  },

  navTextActive: {
    color: '#F2E1C7',
  },

  profileButton: {
    marginLeft: 8,
  },

  hero: {
    paddingHorizontal: 18,
    paddingTop: 5,
  },

  heroDesktop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 45,
    paddingTop: 30,
    paddingHorizontal: 0,
  },

  heroText: {
    alignItems: 'center',
  },

  heroTextDesktop: {
    flex: 1,
    alignItems: 'flex-start',
  },

  mainLogo: {
    width: 220,
    height: 145,
    marginTop: 5,
    marginBottom: 5,
  },

  eyebrow: {
    marginTop: 8,
    color: '#595626',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.2,
  },

  title: {
    marginTop: 7,
    color: '#3D0404',
    fontSize: 31,
    lineHeight: 39,
    fontWeight: '900',
    textAlign: 'center',
  },

  description: {
    marginTop: 12,
    color: '#644219',
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'center',
    maxWidth: 520,
  },

  actions: {
    width: '100%',
    marginTop: 21,
    gap: 10,
  },

  actionButton: {
    minHeight: 60,
    borderRadius: 12,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },

  actionText: {
    flex: 1,
    marginLeft: 12,
  },

  actionTitle: {
    fontSize: 13,
    fontWeight: '900',
  },

  actionSubtitle: {
    fontSize: 12,
    marginTop: 3,
    opacity: 0.8,
  },

  museumWrapper: {
    marginTop: 25,
    paddingHorizontal: 10,
  },

  museumWrapperDesktop: {
    flex: 1,
    marginTop: 0,
    paddingHorizontal: 0,
  },

  museumFrame: {
    width: '100%',
    maxWidth: 560,
    aspectRatio: 1.08,
    borderRadius: 22,
    overflow: 'hidden',
    alignSelf: 'center',
    backgroundColor: '#2F524F',
  },

  museumArtwork: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },

  museumArtworkFrame: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: '#F2E1C7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 5,
    borderColor: '#E3B86B',
  },

  museumLogo: {
    width: 148,
    height: 148,
    borderRadius: 74,
  },

  museumArtworkTitle: {
    marginTop: 18,
    color: '#F2E1C7',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1.1,
    textAlign: 'center',
  },

  museumArtworkSubtitle: {
    marginTop: 6,
    maxWidth: 260,
    color: '#E8D7BC',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },

  museumSparkle: {
    position: 'absolute',
    top: 20,
    right: 22,
  },

  door: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '51%',
    backgroundColor: '#796044',
    borderColor: '#A78A61',
    borderWidth: 2,
  },

  leftDoor: {
    left: 0,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.25)',
  },

  rightDoor: {
    right: 0,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.25)',
  },

  leftDoorKnob: {
    position: 'absolute',
    right: 12,
    top: '49%',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E3B86B',
  },

  rightDoorKnob: {
    position: 'absolute',
    left: 12,
    top: '49%',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E3B86B',
  },

  museumButton: {
    position: 'absolute',
    bottom: 15,
    left: 18,
    right: 18,
    minHeight: 48,
    borderRadius: 10,
    backgroundColor: '#E3B86B',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },

  museumButtonText: {
    color: '#3D0404',
    fontSize: 13,
    fontWeight: '900',
  },

  userCard: {
    width: '100%',
    maxWidth: 520,
    minHeight: 63,
    marginTop: 17,
    borderRadius: 12,
    backgroundColor: '#E3D2B5',
    borderWidth: 1,
    borderColor: '#C8B58F',
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
  },

  userInfo: {
    flex: 1,
    marginLeft: 9,
  },

  userName: {
    color: '#3D0404',
    fontSize: 13,
    fontWeight: '900',
  },

  userDescription: {
    color: '#644219',
    fontSize: 12,
    marginTop: 3,
  },

  infoSection: {
    marginTop: 40,
    marginHorizontal: 18,
    padding: 22,
    borderTopWidth: 1,
    borderTopColor: '#C8B58F',
  },

  infoEyebrow: {
    color: '#595626',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.2,
  },

  infoTitle: {
    marginTop: 6,
    color: '#3D0404',
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '900',
  },

  infoText: {
    marginTop: 9,
    color: '#644219',
    fontSize: 14,
    lineHeight: 22,
    maxWidth: 600,
  },
  visitExperience: { marginHorizontal: 18, marginTop: 7, marginBottom: 28, gap: 11, maxWidth: 650, alignSelf: 'center', width: '100%' },
  galleryShortcuts: { flexDirection: 'row', gap: 8 },
  quickLink: { flex: 1, minHeight: 83, padding: 10, borderRadius: 12, backgroundColor: '#49351A', justifyContent: 'center' },
  quickLinkTitle: { color: '#FFF8EA', fontFamily: 'serif', fontSize: 11, fontWeight: '700', marginTop: 7 },
  quickLinkSubtitle: { color: '#D7CDBB', fontSize: 8, marginTop: 2 },
  demoCaption: { color: '#817566', fontSize: 9, textAlign: 'center' },
});
