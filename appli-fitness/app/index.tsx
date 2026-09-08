import { Redirect } from 'expo-router';
import { View } from 'react-native';

import { useAuth } from '../src/auth/AuthContext';
import { SUPABASE_CONFIGURE } from '../src/config';
import { Chargement, Ecran, Message, Titre } from '../src/ui/composants';

/** Aiguillage : connexion -> onboarding -> application. */
export default function Aiguillage() {
  const { session, chargement, onboardingRequis } = useAuth();

  if (!SUPABASE_CONFIGURE) {
    return (
      <Ecran>
        <Titre>Configuration incomplete</Titre>
        <Message
          ton="info"
          texte={
            'Renseignez EXPO_PUBLIC_SUPABASE_URL et EXPO_PUBLIC_SUPABASE_ANON_KEY ' +
            'dans un fichier .env, puis relancez `npx expo start -c`.'
          }
        />
      </Ecran>
    );
  }

  if (chargement) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Chargement libelle="Chargement..." />
      </View>
    );
  }

  if (!session) return <Redirect href="/(auth)/connexion" />;
  if (onboardingRequis) return <Redirect href="/(auth)/onboarding" />;
  return <Redirect href="/(app)/accueil" />;
}
