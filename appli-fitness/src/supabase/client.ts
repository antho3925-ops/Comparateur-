import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

import { SUPABASE_ANON_KEY, SUPABASE_URL } from '../config';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    // PKCE : le flux recommande pour une app mobile (pas de secret embarque).
    flowType: 'pkce',
    persistSession: true,
    // Une app mobile ne recoit pas de callback OAuth dans l'URL de la page :
    // les jetons arrivent par le lien de retour, qu'on traite a la main.
    detectSessionInUrl: false,
  },
});
