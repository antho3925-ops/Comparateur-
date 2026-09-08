import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import { Text } from 'react-native';

import { useAuth } from '../../src/auth/AuthContext';
import { couleurs } from '../../src/ui/theme';

function Icone({ glyphe, focused }: { glyphe: string; focused: boolean }) {
  return <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{glyphe}</Text>;
}

export default function AppLayout() {
  const { session, chargement, onboardingRequis } = useAuth();

  if (chargement) return null;
  if (!session) return <Redirect href="/(auth)/connexion" />;
  if (onboardingRequis) return <Redirect href="/(auth)/onboarding" />;

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: couleurs.fond },
        headerTintColor: couleurs.texte,
        tabBarStyle: {
          backgroundColor: couleurs.surface,
          borderTopColor: couleurs.bordure,
        },
        tabBarActiveTintColor: couleurs.accent,
        tabBarInactiveTintColor: couleurs.texteAttenue,
        sceneStyle: { backgroundColor: couleurs.fond },
      }}
    >
      <Tabs.Screen
        name="accueil"
        options={{
          title: 'Aujourd’hui',
          headerShown: false,
          tabBarIcon: ({ focused }) => <Icone glyphe="🍽️" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="exercices"
        options={{
          title: 'Exercices',
          headerShown: false,
          tabBarIcon: ({ focused }) => <Icone glyphe="🏋️" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="classements"
        options={{
          title: 'Classements',
          headerShown: false,
          tabBarIcon: ({ focused }) => <Icone glyphe="🏆" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profil"
        options={{
          title: 'Profil',
          headerShown: false,
          tabBarIcon: ({ focused }) => <Icone glyphe="👤" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
