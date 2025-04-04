import { useContext, createContext, type PropsWithChildren } from 'react';
import { useStorageState } from './useStorageState';

const AuthContext = createContext<{
  signin: (username: string, password: string) => void;
  signout: () => void;
  session?: string | null;
  isLoading: boolean;
}>({
  signin: () => {},
  signout: () => {},
  session: null,
  isLoading: false,
});

export function useSession() {
  const value = useContext(AuthContext);

  if (process.env.NODE_ENV !== 'production') {
    if (!value) {
      throw new Error('useSession must be used within a SessionProvider');
    }
  }

  return value;
}
export function SessionProvider({children}: PropsWithChildren){
    const [[isLoading, session], setSession] = useStorageState('session');
    return (
        <AuthContext.Provider
        value= {{
            signin: () => {
              //route to where sign in is (i think???)
                //go to the database: get the username and password, check if user is authenticated
                //if authenticated, update session with new token for the session
            },
            signout: () => {
                setSession(null);
            },
            session, isLoading,
        }}>{children}</AuthContext.Provider>

    );
}
