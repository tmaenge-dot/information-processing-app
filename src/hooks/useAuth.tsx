import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import logger from '../utils/logger';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  createdAt: string;
  isVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLocalhost: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  hasUnlimitedAccess: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if running on localhost for admin access
  const isLocalhost = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || 
     window.location.hostname === '127.0.0.1' ||
     window.location.hostname.includes('192.168.') ||
     window.location.hostname.includes('10.0.'));

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = () => {
      try {
        logger.info('Initializing authentication', 'Auth');
        // For demo purposes, always start logged out to show Sign In/Sign Up buttons
        // Users can login with demo credentials: any email + password123/demo123/123456/password
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
        logger.debug('Auth state reset for demo mode', 'Auth');
      } catch (error) {
        logger.error('Auth initialization error', 'Auth', error as Error);
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      logger.info('Login attempt', 'Auth', { email });
      // Simulate API call - in production, this would call your backend
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check for admin credentials
      if (email === 'admin@local.dev' && password === 'admin123') {
        const adminUser: User = {
          id: 'admin-001',
          email: 'admin@local.dev',
          name: 'Administrator',
          role: 'admin',
          createdAt: new Date().toISOString(),
          isVerified: true
        };

        setUser(adminUser);
        localStorage.setItem('user', JSON.stringify(adminUser));
        localStorage.setItem('authToken', 'admin-token-' + Date.now());
        
        logger.info('Admin login successful', 'Auth', { userId: adminUser.id });
        logger.event('user_login', 'Auth', { role: 'admin', email });
        return { success: true };
      }

      // Check registered users (in production, this would be handled by backend)
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const foundUser = registeredUsers.find((u: any) => u.email === email && u.password === password);

      if (foundUser) {
        const userObj: User = {
          id: foundUser.id,
          email: foundUser.email,
          name: foundUser.name,
          role: 'user',
          createdAt: foundUser.createdAt,
          isVerified: true
        };

        setUser(userObj);
        localStorage.setItem('user', JSON.stringify(userObj));
        localStorage.setItem('authToken', 'user-token-' + Date.now());
        
        logger.info('Registered user login successful', 'Auth', { userId: userObj.id });
        logger.event('user_login', 'Auth', { role: 'user', email });
        return { success: true };
      }

      // Demo mode: Accept any valid email with common passwords
      const demoPasswords = ['password123', 'demo123', '123456', 'password'];
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      if (emailRegex.test(email) && demoPasswords.includes(password)) {
        const demoUser: User = {
          id: 'demo-' + Date.now(),
          email: email,
          name: email.split('@')[0].replace(/[^a-zA-Z]/g, ' '),
          role: 'user',
          createdAt: new Date().toISOString(),
          isVerified: true
        };

        setUser(demoUser);
        localStorage.setItem('user', JSON.stringify(demoUser));
        localStorage.setItem('authToken', 'demo-token-' + Date.now());
        
        logger.info('Demo user login successful', 'Auth', { userId: demoUser.id });
        logger.event('user_login', 'Auth', { role: 'demo_user', email });
        return { success: true };
      }

      logger.warn('Login failed - invalid credentials', 'Auth', { email });
      return { success: false, error: 'Invalid email or password. Try: password123, demo123, 123456, or password' };
    } catch (error) {
      logger.error('Login error', 'Auth', error as Error, { email });
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const register = async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
    try {
      logger.info('Registration attempt', 'Auth', { email, name });
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if user already exists
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const existingUser = registeredUsers.find((u: any) => u.email === email);

      if (existingUser) {
        logger.warn('Registration failed - user already exists', 'Auth', { email });
        return { success: false, error: 'User with this email already exists' };
      }

      // Create new user
      const newUser = {
        id: 'user-' + Date.now(),
        email,
        password, // In production, this would be hashed
        name,
        role: 'user',
        createdAt: new Date().toISOString(),
        isVerified: true
      };

      registeredUsers.push(newUser);
      localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));

      // Auto-login the new user
      const userObj: User = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: 'user',
        createdAt: newUser.createdAt,
        isVerified: true
      };

      setUser(userObj);
      localStorage.setItem('user', JSON.stringify(userObj));
      localStorage.setItem('authToken', 'user-token-' + Date.now());

      logger.info('Registration successful', 'Auth', { userId: userObj.id });
      logger.event('user_registration', 'Auth', { email, name });
      return { success: true };
    } catch (error) {
      logger.error('Registration error', 'Auth', error as Error, { email });
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  };

  const logout = () => {
    logger.info('User logout', 'Auth', { userId: user?.id });
    logger.event('user_logout', 'Auth', { userId: user?.id, email: user?.email });
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
  };

  const hasUnlimitedAccess = (): boolean => {
    // Admin always has unlimited access
    if (user?.role === 'admin') return true;
    
    // Localhost access for development/admin
    if (isLocalhost) return true;
    
    return false;
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isLocalhost,
    login,
    register,
    logout,
    hasUnlimitedAccess
  };

  // Show loading spinner during auth initialization
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};