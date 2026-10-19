import { Href, useRouter } from 'expo-router';

type AppRouter = ReturnType<typeof useRouter>;

export function goBackOrReplace(router: AppRouter, fallback: Href = '/home') {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace(fallback);
  }
}
