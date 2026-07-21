import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { ROLE_DASHBOARDS } from '../config/constants';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from 'users' table
  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return null;
      }
      return data;
    } catch (err) {
      console.error('Profile fetch error:', err);
      return null;
    }
  };

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    const initAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          const userProfile = await fetchProfile(currentSession.user.id);
          setProfile(userProfile);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          const userProfile = await fetchProfile(newSession.user.id);
          setProfile(userProfile);
        } else {
          setProfile(null);
        }

        if (event === 'SIGNED_OUT') {
          setProfile(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign up with email and password
  const signUp = async (email, password, metadata = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
    return { data, error };
  };

  // Sign in with email and password
  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  // Sign in with phone OTP
  const signInWithOtp = async (phone) => {
    const { data, error } = await supabase.auth.signInWithOtp({ phone });
    return { data, error };
  };

  // Verify OTP
  const verifyOtp = async (phone, token) => {
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms',
    });
    return { data, error };
  };

  // Sign in with Google OAuth
  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    return { data, error };
  };

  // Sign out
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
      setProfile(null);
      setSession(null);
    }
    return { error };
  };

  // Create or update user profile in 'users' table
  const setupProfile = async (profileData) => {
    if (!user) {
      console.error('setupProfile called but user is null — user may not be authenticated yet');
      return { data: null, error: { message: 'User is not authenticated. Please sign in first.' } };
    }

    console.log('setupProfile: Upserting profile for user', user.id, profileData);

    const { data, error } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        email: user.email,
        ...profileData,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.error('setupProfile error:', error);
    } else {
      console.log('setupProfile success:', data);
      setProfile(data);
    }

    return { data, error };
  };

  // Get the dashboard path for the current user's role
  const getDashboardPath = () => {
    if (!profile?.role) return '/profile-setup';
    return ROLE_DASHBOARDS[profile.role] || '/';
  };

  const value = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signInWithOtp,
    verifyOtp,
    signInWithGoogle,
    signOut,
    setupProfile,
    getDashboardPath,
    isAuthenticated: !!session,
    role: profile?.role || null,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
