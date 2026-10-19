import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  getSupabaseClient,
  isSupabaseConfigured,
} from '../lib/supabase';

const DEMO_SESSION_KEY = '@dust_demo_session';
const DEMO_USERS_KEY = '@dust_demo_users';
const DEMO_POSTS_KEY = '@dust_demo_posts';
const DEMO_ACTIVITIES_KEY = '@dust_demo_activities';
const DEMO_USER_ID = 'dust-visitante-local';

type LocalActivity = Activity & {
  recipientId: string;
};

export type User = {
  id: string;
  name: string;
  username: string;
  email: string;
  bio: string;
  photo: string;
  createdAt: number;
  following: string[];
  followers: string[];
};

export type Comment = {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: number;
};

export type Post = {
  id: string;
  authorId: string;
  authorName: string;
  title: string;
  description: string;
  category: string;
  image: string;
  whyUseless: string;
  history: string;
  location: string;
  condition: string;
  createdAt: number;
  likes: string[];
  comments: Comment[];
  savedBy: string[];
};

export type Activity = {
  id: string;
  type: 'follow' | 'like' | 'comment' | 'publication';
  actorId: string;
  actorName: string;
  targetUserId?: string;
  targetPostId?: string;
  message: string;
  createdAt: number;
  read: boolean;
};

export const CATEGORIES = [
  'Estranho',
  'Inútil',
  'Antigo',
  'Tecnologia',
  'Casa',
  'Curioso',
];

const demoUser: User = {
  id: DEMO_USER_ID,
  name: 'Visitante do Museu',
  username: 'visitante',
  email: '',
  bio: 'De passagem pelo Museu, em busca de coisas sem serventia e boas histórias.',
  photo: '',
  createdAt: Date.now() - 1000 * 60 * 60 * 24 * 15,
  following: ['dust-curadora-ana'],
  followers: ['dust-artur', 'dust-lia'],
};

const demoUsers: User[] = [
  demoUser,
  {
    id: 'dust-curadora-ana',
    name: 'Ana Desuso',
    username: 'anadesuso',
    email: '',
    bio: 'Curadora voluntária de objetos perdidos e ideias vencidas.',
    photo: '',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 35,
    following: ['dust-visitante-local'],
    followers: ['dust-visitante-local', 'dust-lia'],
  },
  {
    id: 'dust-artur',
    name: 'Artur Achados',
    username: 'arturachados',
    email: '',
    bio: 'Encontro utilidade em absolutamente nada.',
    photo: '',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 20,
    following: ['dust-visitante-local', 'dust-curadora-ana'],
    followers: ['dust-visitante-local'],
  },
  {
    id: 'dust-lia',
    name: 'Lia do Quase',
    username: 'liadoquase',
    email: '',
    bio: 'Colecionadora de peças que quase funcionam.',
    photo: '',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 9,
    following: ['dust-curadora-ana'],
    followers: ['dust-visitante-local', 'dust-curadora-ana'],
  },
];

function createDemoPosts(): Post[] {
  const now = Date.now();
  return [
    {
      id: 'dust-peca-tecla',
      authorId: 'dust-curadora-ana',
      authorName: 'Ana Desuso',
      title: 'A tecla que não pertencia a teclado algum',
      description:
        'Uma tecla solitária, encontrada na gaveta dos cabos sem destino. Nunca descobrimos de que aparelho ela escapou.',
      category: 'Tecnologia',
      image: '',
      whyUseless:
        'Sem teclado, sem aparelho e sem a menor pista do que faria se fosse pressionada.',
      history:
        'Ficou três anos na recepção do museu antes de ganhar uma etiqueta própria.',
      location: 'Gaveta dos cabos, sala 2',
      condition: 'Levemente empoeirada',
      createdAt: now - 1000 * 60 * 34,
      likes: ['dust-visitante-local', 'dust-artur', 'dust-lia'],
      comments: [
        {
          id: 'dust-comentario-tecla',
          postId: 'dust-peca-tecla',
          authorId: 'dust-artur',
          authorName: 'Artur Achados',
          text: 'Tenho uma parecida. Talvez sejam primas distantes.',
          createdAt: now - 1000 * 60 * 22,
        },
      ],
      savedBy: ['dust-visitante-local'],
    },
    {
      id: 'dust-peca-manual',
      authorId: 'dust-artur',
      authorName: 'Artur Achados',
      title: 'Manual de instruções de um objeto desconhecido',
      description:
        'O manual chegou antes do objeto. As páginas ensinam a apertar um botão que, até hoje, ninguém encontrou.',
      category: 'Curioso',
      image: '',
      whyUseless:
        'É impossível seguir as instruções sem saber a que objeto elas pertencem.',
      history:
        'Achado dentro de uma caixa vazia, cuidadosamente embrulhada para presente.',
      location: 'Caixa de achados e perdidos',
      condition: 'Completo, embora pouco esclarecedor',
      createdAt: now - 1000 * 60 * 60 * 2,
      likes: ['dust-curadora-ana', 'dust-lia'],
      comments: [],
      savedBy: [],
    },
    {
      id: 'dust-peca-tampa',
      authorId: 'dust-lia',
      authorName: 'Lia do Quase',
      title: 'Uma tampa à procura do seu pote',
      description:
        'Ela fecha quase tudo. “Quase” é justamente o motivo de estar aqui.',
      category: 'Casa',
      image: '',
      whyUseless:
        'Nenhum pote conhecido aceita essa tampa sem deixar escapar alguma coisa.',
      history:
        'Apareceu depois de uma mudança. Seu pote pode estar em outra cidade, ou dimensão.',
      location: 'Armário da cozinha',
      condition: 'Inteira e otimista',
      createdAt: now - 1000 * 60 * 60 * 7,
      likes: ['dust-visitante-local'],
      comments: [],
      savedBy: [],
    },
    {
      id: 'dust-peca-pedra',
      authorId: 'dust-curadora-ana',
      authorName: 'Ana Desuso',
      title: 'Pedra de bolso para nenhuma ocasião',
      description:
        'Uma pedra lisa, confortável na mão e sem compromisso com qualquer tarefa.',
      category: 'Inútil',
      image: '',
      whyUseless:
        'Não serve como peso de papel: a mesa já tem peso suficiente.',
      history:
        'Foi carregada no bolso por meses até alguém perguntar por quê.',
      location: 'Calçada perto do Museu',
      condition: 'Surpreendentemente sólida',
      createdAt: now - 1000 * 60 * 60 * 29,
      likes: ['dust-artur'],
      comments: [],
      savedBy: [],
    },
  ];
}

async function getDemoUsers(): Promise<User[]> {
  const stored = await AsyncStorage.getItem(DEMO_USERS_KEY);
  if (stored) {
    return JSON.parse(stored) as User[];
  }

  await AsyncStorage.setItem(
    DEMO_USERS_KEY,
    JSON.stringify(demoUsers)
  );
  return demoUsers;
}

async function saveDemoUsers(users: User[]) {
  await AsyncStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users));
}

async function getDemoPosts(): Promise<Post[]> {
  const stored = await AsyncStorage.getItem(DEMO_POSTS_KEY);
  if (stored) {
    return (JSON.parse(stored) as Post[]).sort(
      (first, second) => second.createdAt - first.createdAt
    );
  }

  const posts = createDemoPosts();
  await AsyncStorage.setItem(DEMO_POSTS_KEY, JSON.stringify(posts));
  return posts;
}

async function saveDemoPosts(posts: Post[]) {
  await AsyncStorage.setItem(DEMO_POSTS_KEY, JSON.stringify(posts));
}

async function getDemoActivities(): Promise<LocalActivity[]> {
  const stored = await AsyncStorage.getItem(DEMO_ACTIVITIES_KEY);
  if (stored) {
    return JSON.parse(stored) as LocalActivity[];
  }

  const activities: LocalActivity[] = [
    {
      id: 'dust-atividade-seguir',
      type: 'follow',
      actorId: 'dust-artur',
      actorName: 'Artur Achados',
      targetUserId: DEMO_USER_ID,
      message: 'Artur Achados começou a seguir você.',
      createdAt: Date.now() - 1000 * 60 * 9,
      read: false,
      recipientId: DEMO_USER_ID,
    },
    {
      id: 'dust-atividade-curtida',
      type: 'like',
      actorId: 'dust-lia',
      actorName: 'Lia do Quase',
      targetPostId: 'dust-peca-tampa',
      message: 'Lia do Quase curtiu uma publicação.',
      createdAt: Date.now() - 1000 * 60 * 24,
      read: false,
      recipientId: DEMO_USER_ID,
    },
  ];

  await AsyncStorage.setItem(
    DEMO_ACTIVITIES_KEY,
    JSON.stringify(activities)
  );
  return activities;
}

async function addDemoActivity(
  data: Omit<LocalActivity, 'id' | 'createdAt' | 'read'>
) {
  const activities = await getDemoActivities();
  activities.unshift({
    ...data,
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
    read: false,
  });
  await AsyncStorage.setItem(
    DEMO_ACTIVITIES_KEY,
    JSON.stringify(activities.slice(0, 100))
  );
}

function throwIfError(
  error: { message: string } | null,
  operation: string
) {
  if (error) {
    throw new Error(`${operation}: ${error.message}`);
  }
}

function requireData<T>(data: T | null, operation: string): T {
  if (data === null) {
    throw new Error(`${operation}: o Supabase não retornou dados.`);
  }
  return data;
}

function mapProfile(
  profile: {
    id: string;
    username: string;
    display_name: string;
    bio: string;
    photo_url: string;
    created_at: string;
  },
  follows: {
    follower_id: string;
    following_id: string;
  }[] = [],
  email = ''
): User {
  return {
    id: profile.id,
    name: profile.display_name,
    username: profile.username,
    email,
    bio: profile.bio,
    photo: profile.photo_url,
    createdAt: Date.parse(profile.created_at),
    following: follows
      .filter(follow => follow.follower_id === profile.id)
      .map(follow => follow.following_id),
    followers: follows
      .filter(follow => follow.following_id === profile.id)
      .map(follow => follow.follower_id),
  };
}

export async function signIn(email: string, password: string) {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Entre como visitante para usar o Museu sem criar uma conta.'
    );
  }

  const { data, error } =
    await getSupabaseClient().auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

  throwIfError(error, 'Não foi possível entrar');

  if (!data.session) {
    throw new Error('Não foi possível iniciar a sessão.');
  }

  return getSession();
}

export async function signUp(
  email: string,
  password: string,
  name: string
) {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'O cadastro requer um projeto Supabase configurado.'
    );
  }

  const { data, error } =
    await getSupabaseClient().auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          display_name: name.trim(),
        },
      },
    });

  throwIfError(error, 'Não foi possível criar a conta');

  return Boolean(data.session);
}

export async function startDemoSession(): Promise<User> {
  const users = await getDemoUsers();
  const visitor = users.find(user => user.id === DEMO_USER_ID);
  if (!visitor) {
    throw new Error('Não foi possível iniciar a visita local.');
  }

  await getDemoPosts();
  await getDemoActivities();
  await AsyncStorage.setItem(
    DEMO_SESSION_KEY,
    JSON.stringify(visitor)
  );

  return visitor;
}

export async function getSession(): Promise<User | null> {
  if (!isSupabaseConfigured()) {
    const stored = await AsyncStorage.getItem(DEMO_SESSION_KEY);
    if (!stored) {
      return null;
    }

    const session = JSON.parse(stored) as User;
    const users = await getDemoUsers();
    return users.find(user => user.id === session.id) ?? session;
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.getSession();

  throwIfError(error, 'Não foi possível carregar a sessão');

  const authUser = data.session?.user;
  if (!authUser) {
    return null;
  }

  const [{ data: profile, error: profileError }, { data: follows, error: followsError }] =
    await Promise.all([
      supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle(),
      supabase
        .from('follows')
        .select('*')
        .or(`follower_id.eq.${authUser.id},following_id.eq.${authUser.id}`),
    ]);

  throwIfError(profileError, 'Não foi possível carregar o perfil');
  throwIfError(followsError, 'Não foi possível carregar os contatos');

  if (!profile) {
    throw new Error(
      'O perfil desta conta ainda não foi criado. Verifique a migração do Supabase.'
    );
  }

  return mapProfile(
    profile,
    requireData(follows, 'Não foi possível carregar os contatos'),
    authUser.email ?? ''
  );
}

export async function logout() {
  if (!isSupabaseConfigured()) {
    await AsyncStorage.removeItem(DEMO_SESSION_KEY);
    return;
  }

  const { error } = await getSupabaseClient().auth.signOut();
  throwIfError(error, 'Não foi possível sair da conta');
}

export async function getUsers(): Promise<User[]> {
  if (!isSupabaseConfigured()) {
    return getDemoUsers();
  }

  const supabase = getSupabaseClient();
  const [{ data: profiles, error: profilesError }, { data: follows, error: followsError }] =
    await Promise.all([
      supabase.from('profiles').select('*').order('display_name'),
      supabase.from('follows').select('*'),
    ]);

  throwIfError(profilesError, 'Não foi possível carregar os visitantes');
  throwIfError(followsError, 'Não foi possível carregar os contatos');

  return requireData(
    profiles,
    'Não foi possível carregar os visitantes'
  ).map(profile =>
    mapProfile(
      profile,
      requireData(follows, 'Não foi possível carregar os contatos')
    )
  );
}

export async function findUser(id: string): Promise<User | null> {
  if (!isSupabaseConfigured()) {
    const users = await getDemoUsers();
    return users.find(user => user.id === id) ?? null;
  }

  const { data: profile, error } = await getSupabaseClient()
    .from('profiles')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  throwIfError(error, 'Não foi possível localizar o visitante');

  if (!profile) {
    return null;
  }

  const { data: follows, error: followsError } = await getSupabaseClient()
    .from('follows')
    .select('*')
    .or(`follower_id.eq.${id},following_id.eq.${id}`);

  throwIfError(followsError, 'Não foi possível carregar os contatos');

  return mapProfile(
    profile,
    requireData(follows, 'Não foi possível carregar os contatos')
  );
}

export async function updateProfile(
  userId: string,
  updates: Pick<User, 'name' | 'bio' | 'photo'>
) {
  if (!isSupabaseConfigured()) {
    const users = await getDemoUsers();
    const index = users.findIndex(user => user.id === userId);
    if (index === -1) {
      throw new Error('O perfil local não foi encontrado.');
    }

    users[index] = {
      ...users[index],
      name: updates.name.trim(),
      bio: updates.bio.trim(),
      photo: updates.photo.trim(),
    };
    await saveDemoUsers(users);
    await AsyncStorage.setItem(
      DEMO_SESSION_KEY,
      JSON.stringify(users[index])
    );
    return users[index];
  }

  const { error } = await getSupabaseClient()
    .from('profiles')
    .update({
      display_name: updates.name.trim(),
      bio: updates.bio.trim(),
      photo_url: updates.photo.trim(),
    })
    .eq('id', userId);

  throwIfError(error, 'Não foi possível salvar o perfil');

  return getSession();
}

export async function getPosts(): Promise<Post[]> {
  if (!isSupabaseConfigured()) {
    const posts = await getDemoPosts();
    const session = await getSession();
    const users = await getDemoUsers();
    const usersById = new Map(users.map(user => [user.id, user]));
    return posts.map(post => ({
      ...post,
      authorName: usersById.get(post.authorId)?.name ?? post.authorName,
      savedBy: session && post.savedBy.includes(session.id)
        ? [session.id]
        : [],
    }));
  }

  const supabase = getSupabaseClient();
  const { data: rows, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

  throwIfError(error, 'Não foi possível carregar o acervo');

  const posts = requireData(rows, 'Não foi possível carregar o acervo');
  if (posts.length === 0) {
    return [];
  }

  const postIds = posts.map(post => post.id);
  const [likesResult, commentsResult, users, session] =
    await Promise.all([
      supabase.from('likes').select('*').in('post_id', postIds),
      supabase
        .from('comments')
        .select('*')
        .in('post_id', postIds)
        .order('created_at'),
      getUsers(),
      getSession(),
    ]);

  throwIfError(likesResult.error, 'Não foi possível carregar as curtidas');
  throwIfError(commentsResult.error, 'Não foi possível carregar os comentários');

  const savedPostIds = new Set<string>();
  if (session) {
    const { data: savedRows, error: savedError } = await supabase
      .from('saved_posts')
      .select('*')
      .in('post_id', postIds)
      .eq('user_id', session.id);

    throwIfError(savedError, 'Não foi possível carregar os itens salvos');
    requireData(savedRows, 'Não foi possível carregar os itens salvos')
      .forEach(saved => savedPostIds.add(saved.post_id));
  }

  const likes = requireData(
    likesResult.data,
    'Não foi possível carregar as curtidas'
  );
  const comments = requireData(
    commentsResult.data,
    'Não foi possível carregar os comentários'
  );
  const usersById = new Map(users.map(user => [user.id, user]));

  return posts.map(post => ({
    id: post.id,
    authorId: post.author_id,
    authorName: usersById.get(post.author_id)?.name ?? 'Visitante',
    title: post.title,
    description: post.description,
    category: post.category,
    image: post.image_url,
    whyUseless: post.why_useless,
    history: post.history,
    location: post.location,
    condition: post.condition,
    createdAt: Date.parse(post.created_at),
    likes: likes
      .filter(like => like.post_id === post.id)
      .map(like => like.user_id),
    comments: comments
      .filter(comment => comment.post_id === post.id)
      .map(comment => ({
        id: comment.id,
        postId: comment.post_id,
        authorId: comment.author_id,
        authorName: usersById.get(comment.author_id)?.name ?? 'Visitante',
        text: comment.text,
        createdAt: Date.parse(comment.created_at),
      })),
    savedBy: session && savedPostIds.has(post.id) ? [session.id] : [],
  }));
}

export async function createPost(
  post: Omit<
    Post,
    'id' | 'createdAt' | 'likes' | 'comments' | 'savedBy'
  >
) {
  if (!isSupabaseConfigured()) {
    const posts = await getDemoPosts();
    const created: Post = {
      ...post,
      id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: post.title.trim(),
      description: post.description.trim(),
      createdAt: Date.now(),
      likes: [],
      comments: [],
      savedBy: [],
    };

    posts.unshift(created);
    await saveDemoPosts(posts);
    await addDemoActivity({
      recipientId: created.authorId,
      type: 'publication',
      actorId: created.authorId,
      actorName: created.authorName,
      targetPostId: created.id,
      message: `${created.authorName} adicionou uma peça ao acervo local.`,
    });
    return created;
  }

  const { data, error } = await getSupabaseClient()
    .from('posts')
    .insert({
      author_id: post.authorId,
      title: post.title.trim(),
      description: post.description.trim(),
      category: post.category,
      image_url: post.image.trim(),
      why_useless: post.whyUseless.trim(),
      history: post.history.trim(),
      location: post.location.trim(),
      condition: post.condition.trim(),
    })
    .select('id')
    .single();

  throwIfError(error, 'Não foi possível publicar a peça');

  const created = await getPost(
    requireData(data, 'Não foi possível publicar a peça').id
  );
  if (!created) {
    throw new Error('A peça foi publicada, mas não pôde ser carregada.');
  }

  return created;
}

export async function getPost(id: string): Promise<Post | null> {
  const posts = await getPosts();
  return posts.find(post => post.id === id) ?? null;
}

export async function toggleLike(postId: string, userId: string) {
  if (!isSupabaseConfigured()) {
    const posts = await getDemoPosts();
    const post = posts.find(item => item.id === postId);
    if (!post) {
      return null;
    }

    const alreadyLiked = post.likes.includes(userId);
    post.likes = alreadyLiked
      ? post.likes.filter(id => id !== userId)
      : [...post.likes, userId];
    await saveDemoPosts(posts);

    if (!alreadyLiked && post.authorId !== userId) {
      const actor = (await getDemoUsers()).find(user => user.id === userId);
      if (actor) {
        await addDemoActivity({
          recipientId: post.authorId,
          type: 'like',
          actorId: actor.id,
          actorName: actor.name,
          targetPostId: post.id,
          message: `${actor.name} curtiu sua peça.`,
        });
      }
    }

    return {
      ...post,
      authorName:
        (await findUser(post.authorId))?.name ?? post.authorName,
    };
  }

  const supabase = getSupabaseClient();
  const { data: existing, error: lookupError } = await supabase
    .from('likes')
    .select('post_id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .maybeSingle();

  throwIfError(lookupError, 'Não foi possível verificar a curtida');

  if (existing) {
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId);
    throwIfError(error, 'Não foi possível remover a curtida');
  } else {
    const { error } = await supabase
      .from('likes')
      .insert({ post_id: postId, user_id: userId });
    throwIfError(error, 'Não foi possível curtir a peça');
  }

  return getPost(postId);
}

export async function toggleSaved(postId: string, userId: string) {
  if (!isSupabaseConfigured()) {
    const posts = await getDemoPosts();
    const post = posts.find(item => item.id === postId);
    if (!post) {
      return null;
    }

    post.savedBy = post.savedBy.includes(userId)
      ? post.savedBy.filter(id => id !== userId)
      : [...post.savedBy, userId];
    await saveDemoPosts(posts);
    return post;
  }

  const supabase = getSupabaseClient();
  const { data: existing, error: lookupError } = await supabase
    .from('saved_posts')
    .select('post_id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .maybeSingle();

  throwIfError(lookupError, 'Não foi possível verificar os itens salvos');

  if (existing) {
    const { error } = await supabase
      .from('saved_posts')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId);
    throwIfError(error, 'Não foi possível remover o item salvo');
  } else {
    const { error } = await supabase
      .from('saved_posts')
      .insert({ post_id: postId, user_id: userId });
    throwIfError(error, 'Não foi possível salvar a peça');
  }

  return getPost(postId);
}

export async function addComment(
  postId: string,
  user: User,
  text: string
) {
  if (!isSupabaseConfigured()) {
    const posts = await getDemoPosts();
    const post = posts.find(item => item.id === postId);
    if (!post) {
      return null;
    }

    const comment: Comment = {
      id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      postId,
      authorId: user.id,
      authorName: user.name,
      text: text.trim(),
      createdAt: Date.now(),
    };
    post.comments.push(comment);
    await saveDemoPosts(posts);

    if (post.authorId !== user.id) {
      await addDemoActivity({
        recipientId: post.authorId,
        type: 'comment',
        actorId: user.id,
        actorName: user.name,
        targetPostId: post.id,
        message: `${user.name} comentou em sua peça.`,
      });
    }

    return post;
  }

  const { error } = await getSupabaseClient()
    .from('comments')
    .insert({
      post_id: postId,
      author_id: user.id,
      text: text.trim(),
    });

  throwIfError(error, 'Não foi possível enviar o comentário');
  return getPost(postId);
}

export async function toggleFollow(
  currentUserId: string,
  targetUserId: string
) {
  if (currentUserId === targetUserId) {
    return null;
  }

  if (!isSupabaseConfigured()) {
    const users = await getDemoUsers();
    const current = users.find(user => user.id === currentUserId);
    const target = users.find(user => user.id === targetUserId);
    if (!current || !target) {
      return null;
    }

    const isFollowing = current.following.includes(target.id);
    current.following = isFollowing
      ? current.following.filter(id => id !== target.id)
      : [...current.following, target.id];
    target.followers = isFollowing
      ? target.followers.filter(id => id !== current.id)
      : [...target.followers, current.id];
    await saveDemoUsers(users);

    if (!isFollowing) {
      await addDemoActivity({
        recipientId: target.id,
        type: 'follow',
        actorId: current.id,
        actorName: current.name,
        targetUserId: current.id,
        message: `${current.name} começou a seguir você.`,
      });
    }

    return {
      current,
      target,
      following: !isFollowing,
    };
  }

  const supabase = getSupabaseClient();
  const { data: existing, error: lookupError } = await supabase
    .from('follows')
    .select('follower_id')
    .eq('follower_id', currentUserId)
    .eq('following_id', targetUserId)
    .maybeSingle();

  throwIfError(lookupError, 'Não foi possível verificar o acompanhamento');

  if (existing) {
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', currentUserId)
      .eq('following_id', targetUserId);
    throwIfError(error, 'Não foi possível deixar de seguir');
  } else {
    const { error } = await supabase
      .from('follows')
      .insert({
        follower_id: currentUserId,
        following_id: targetUserId,
      });
    throwIfError(error, 'Não foi possível seguir o visitante');
  }

  const [current, target] = await Promise.all([
    findUser(currentUserId),
    findUser(targetUserId),
  ]);

  if (!current || !target) {
    throw new Error('Não foi possível atualizar os perfis.');
  }

  return {
    current,
    target,
    following: !existing,
  };
}

export async function getFeed(userId: string) {
  const user = await findUser(userId);
  if (!user) {
    return [];
  }

  const allowedAuthors = new Set([
    userId,
    ...user.following,
  ]);

  return (await getPosts()).filter(post =>
    allowedAuthors.has(post.authorId)
  );
}

export async function getSavedPosts(userId: string) {
  return (await getPosts()).filter(post =>
    post.savedBy.includes(userId)
  );
}

export async function getActivities(): Promise<Activity[]> {
  const user = await getSession();
  if (!user) {
    return [];
  }

  if (!isSupabaseConfigured()) {
    return (await getDemoActivities())
      .filter(activity => activity.recipientId === user.id)
      .sort((first, second) => second.createdAt - first.createdAt)
      .map(({ recipientId: _recipientId, ...activity }) => activity);
  }

  const { data: rows, error } = await getSupabaseClient()
    .from('activities')
    .select('*')
    .eq('recipient_id', user.id)
    .order('created_at', { ascending: false });

  throwIfError(error, 'Não foi possível carregar as atividades');

  const users = await getUsers();
  const usersById = new Map(users.map(visitor => [visitor.id, visitor]));

  return requireData(
    rows,
    'Não foi possível carregar as atividades'
  ).map(activity => ({
    id: activity.id,
    type: activity.type,
    actorId: activity.actor_id,
    actorName: usersById.get(activity.actor_id)?.name ?? 'Visitante',
    targetUserId: activity.target_user_id ?? undefined,
    targetPostId: activity.target_post_id ?? undefined,
    message: activity.message,
    createdAt: Date.parse(activity.created_at),
    read: activity.read,
  }));
}

export async function markActivitiesRead() {
  const user = await getSession();
  if (!user) {
    return;
  }

  if (!isSupabaseConfigured()) {
    const activities = await getDemoActivities();
    const updated = activities.map(activity =>
      activity.recipientId === user.id
        ? { ...activity, read: true }
        : activity
    );
    await AsyncStorage.setItem(
      DEMO_ACTIVITIES_KEY,
      JSON.stringify(updated)
    );
    return;
  }

  const { error } = await getSupabaseClient()
    .from('activities')
    .update({ read: true })
    .eq('recipient_id', user.id)
    .eq('read', false);

  throwIfError(error, 'Não foi possível atualizar as atividades');
}
