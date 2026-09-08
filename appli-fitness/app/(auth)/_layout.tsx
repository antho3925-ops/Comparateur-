import { Stack } from 'expo-router';

import { couleurs } from '../../src/ui/theme';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: couleurs.fond },
      }}
    />
  );
}
