import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { supabase } from '../supabase';
import type { Profile, Wallet, TabType } from '../types';
import { useT, type Language } from '../i18n';

function fallbackProfile(id: string): Profile {
  return {
    id: 'local-' + Date.now(),
    telegram_id: id,
    username: 'Player',
    first_name: 'Player',
    language: 'en',
    sound_on: true,
    verified: false,
    created_at: new Date().toISOString(),
  };
}

function fallbackWallet(): Wallet {
  return {
    id: 'local-' + Date.now(),
    user_id: 'local-' + Date.now(),
    main_balance: 100,
    play_balance: 50,
    created_at: new Date().toISOString(),
  };
}

interface AppState {
  profile: Profile | null;
  wallet: Wallet | null;
  language: Language;
  activeTab: TabType;
  loading: boolean;
  initialized: boolean;
  currentGameId: string | null;
}

interface AppContextType extends AppState {
  t: (key: string) => string;
  setLanguage: (lang: Language) => void;
  setActiveTab: (tab: TabType) => void;
  toggleSound: () => void;
  initialize: (telegramId: string) => Promise<void>;
  setCurrentGame: (gameId: string | null) => void;
  refreshWallet: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    profile: null,
    wallet: null,
    language: 'en',
    activeTab: 'game',
    loading: true,
    initialized: false,
    currentGameId: null,
  });

  const t = useT(state.language);

  const setLanguage = useCallback(async (lang: Language) => {
    setState(prev => ({ ...prev, language: lang }));
    if (state.profile) {
      await supabase.from('profiles').update({ language: lang }).eq('id', state.profile.id);
    }
  }, [state.profile]);

  const setActiveTab = useCallback((tab: TabType) => {
    setState(prev => ({ ...prev, activeTab: tab }));
  }, []);

  const toggleSound = useCallback(async () => {
    if (!state.profile) return;
    const newSound = !state.profile.sound_on;
    setState(prev => ({
      ...prev,
      profile: prev.profile ? { ...prev.profile, sound_on: newSound } : null,
    }));
    await supabase.from('profiles').update({ sound_on: newSound }).eq('id', state.profile.id);
  }, [state.profile]);

  const refreshWallet = useCallback(async () => {
    if (!state.profile) return;
    const { data } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', state.profile.id)
      .single();
    if (data) setState(prev => ({ ...prev, wallet: data as Wallet }));
  }, [state.profile]);

  const initialize = useCallback(async (telegramId: string) => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      // Try to fetch existing profile
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('telegram_id', telegramId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      let profile = existingProfile as Profile | null;

      if (!profile) {
        // Try to create new profile
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            telegram_id: telegramId,
            language: 'en',
            sound_on: true,
            verified: false,
          })
          .select()
          .single();

        if (createError) throw createError;

        if (newProfile) {
          profile = newProfile as Profile;
          // Try to create wallet
          await supabase.from('wallets').insert({
            user_id: profile.id,
            main_balance: 100,
            play_balance: 50,
          });
        }
      }

      if (profile) {
        const { data: wallet } = await supabase
          .from('wallets')
          .select('*')
          .eq('user_id', profile.id)
          .single();

        setState(prev => ({
          ...prev,
          profile,
          wallet: wallet as Wallet | null,
          language: (profile?.language as Language) || 'en',
          loading: false,
          initialized: true,
        }));
      } else {
        // Profile fetch/creation failed completely - show app with defaults
        setState(prev => ({
          ...prev,
          loading: false,
          initialized: true,
          profile: {
            id: 'local',
            telegram_id: telegramId,
            username: 'Player',
            first_name: 'Player',
            language: 'en',
            sound_on: true,
            verified: false,
            created_at: new Date().toISOString(),
          } as Profile,
          wallet: {
            id: 'local',
            user_id: 'local',
            main_balance: 100,
            play_balance: 50,
            created_at: new Date().toISOString(),
          } as Wallet,
        }));
      }
    } catch (err) {
      console.warn('Supabase initialization failed, using local fallback:', err);
      // Show app with default data regardless of error
      setState(prev => ({
        ...prev,
        loading: false,
        initialized: true,
        profile: {
          id: 'local-' + Date.now(),
          telegram_id: telegramId,
          username: 'Player',
          first_name: 'Player',
          language: 'en',
          sound_on: true,
          verified: false,
          created_at: new Date().toISOString(),
        } as Profile,
        wallet: {
          id: 'local-' + Date.now(),
          user_id: 'local-' + Date.now(),
          main_balance: 100,
          play_balance: 50,
          created_at: new Date().toISOString(),
        } as Wallet,
      }));
    }
  }, []);

  const setCurrentGame = useCallback((gameId: string | null) => {
    setState(prev => ({ ...prev, currentGameId: gameId }));
  }, []);

  return (
    <AppContext.Provider
      value={{
        ...state,
        t: t as (key: string) => string,
        setLanguage,
        setActiveTab,
        toggleSound,
        initialize,
        setCurrentGame,
        refreshWallet,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}