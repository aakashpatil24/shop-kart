import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { User } from "../types/api";
import { setAccessToken } from "../lib/tokenStore";
import { setOnAuthFailure } from "../lib/axios";
import {
  loginRequest,
  registerRequest,
  logoutRequest,
  refreshTokenRequest,
  meRequest,
} from "../services/auth.service";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    confirmPassword: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // lets the axios interceptor clear user state on a failed refresh, without
  // re-registering the callback on every render
  const userSetterRef = useRef(setUser);
  userSetterRef.current = setUser;

  useEffect(() => {
    setOnAuthFailure(() => userSetterRef.current(null));
  }, []);

  // trade the httpOnly refresh cookie for an access token, then load the user
  useEffect(() => {
    const silentLogin = async () => {
      try {
        const refreshResult = await refreshTokenRequest();
        setAccessToken(refreshResult.data.accessToken);
        const meResult = await meRequest();
        setUser(meResult.data.user);
      } catch {
        setAccessToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    silentLogin();
  }, []);

  const login = async (email: string, password: string) => {
    const result = await loginRequest({ email, password });
    setAccessToken(result.data.accessToken);
    setUser(result.data.user);
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    confirmPassword: string,
  ) => {
    await registerRequest({ name, email, password, confirmPassword });
  };

  const logout = async () => {
    try {
      await logoutRequest();
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// exports the hook alongside the provider; only affects Fast Refresh in dev
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
