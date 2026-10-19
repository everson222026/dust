const requiredVariables = [
  'EXPO_PUBLIC_SUPABASE_URL',
  'EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
];

const missingVariables = requiredVariables.filter(
  variable => !process.env[variable]
);

if (missingVariables.length > 0) {
  console.error(
    `Configure estas variáveis de ambiente no projeto Vercel: ${missingVariables.join(', ')}`
  );
  process.exit(1);
}
