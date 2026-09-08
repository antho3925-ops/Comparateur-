import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { FournisseurAbonnement } from '../src/abonnement/AbonnementContext';
import { FournisseurAuth } from '../src/auth/AuthContext';
import { couleurs } from '../src/ui/theme';

export default function RacineLayout() {
  return (
    <SafeAreaProvider>
      <FournisseurAuth>
        <FournisseurAbonnement>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: couleurs.fond },
              headerTintColor: couleurs.texte,
              contentStyle: { backgroundColor: couleurs.fond },
            }}
          >
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(app)" options={{ headerShown: false }} />
            <Stack.Screen
              name="photo"
              options={{ presentation: 'fullScreenModal', headerShown: false }}
            />
            <Stack.Screen name="correction" options={{ title: 'Verifier le repas' }} />
            <Stack.Screen
              name="paywall"
              options={{ presentation: 'modal', title: 'Passer a la vitesse superieure' }}
            />
          </Stack>
        </FournisseurAbonnement>
      </FournisseurAuth>
    </SafeAreaProvider>
  );
}
