/**
 * Connexion Apple et Google, toutes deux via Supabase Auth.
 *
 * Apple passe par le module natif (jeton d'identite -> signInWithIdToken).
 * Google passe par le navigateur systeme en PKCE : cela evite d'embarquer le
 * module natif Google Sign-In, et l'app reste lancable dans Expo Go.
 */

import * as AppleAuthentication from 'expo-apple-authentication';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import { supabase } from '../supabase/client';

WebBrowser.maybeCompleteAuthSession();

export class ConnexionAnnulee extends Error {
  constructor() {
    super('connexion_annulee');
    this.name = 'ConnexionAnnulee';
  }
}

export async function appleDisponible(): Promise<boolean> {
  if (Platform.OS !== 'ios') return false;
  return AppleAuthentication.isAvailableAsync();
}

export async function connexionApple(): Promise<void> {
  let identifiants: AppleAuthentication.AppleAuthenticationCredential;

  try {
    identifiants = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });
  } catch (erreur) {
    if ((erreur as { code?: string }).code === 'ERR_REQUEST_CANCELED') {
      throw new ConnexionAnnulee();
    }
    throw erreur;
  }

  if (!identifiants.identityToken) {
    throw new Error('jeton_apple_absent');
  }

  const { error } = await supabase.auth.signInWithIdToken({
    provider: 'apple',
    token: identifiants.identityToken,
  });

  if (error) throw error;
}

export async function connexionGoogle(): Promise<void> {
  const retour = Linking.createURL('/retour-connexion');

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: retour, skipBrowserRedirect: true },
  });

  if (error) throw error;
  if (!data.url) throw new Error('url_oauth_absente');

  const resultat = await WebBrowser.openAuthSessionAsync(data.url, retour);

  if (resultat.type !== 'success') throw new ConnexionAnnulee();

  // En PKCE, le fournisseur renvoie un code a echanger contre une session.
  const code = new URL(resultat.url).searchParams.get('code');
  if (!code) throw new Error('code_oauth_absent');

  const echange = await supabase.auth.exchangeCodeForSession(code);
  if (echange.error) throw echange.error;
}

export async function deconnexion(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
