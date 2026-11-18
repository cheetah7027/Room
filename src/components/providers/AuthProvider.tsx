"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Role } from "@/types";
import {
  Permission,
  Persona,
  PERSONAS,
  hasPermission as checkPermission,
  maskSensitiveData as maskData,
} from "@/lib/auth/rbac";

interface AuthContextType {
  persona: Persona;
  setPersona: (p: Persona) => void;
  switchRole: (role: Role) => void;
  isAuthenticated: boolean;
  login: (p?: Persona) => void;
  logout: () => void;
  can: (permission: Permission) => boolean;
  mask: (val: string | undefined | null, type: "phone" | "email" | "notes") => string;
  isOwner: boolean;
  isAdmin: boolean;
  isEventManager: boolean;
  isBrandManager: boolean;
  isOperations: boolean;
  isCreator: boolean;
  isGuest: boolean;
  isPlatformAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_PERSONA_KEY = "room_active_persona_id";
const STORAGE_AUTH_KEY = "room_auth_session";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [persona, setPersonaState] = useState<Persona>(PERSONAS[0]); // Default to Rahul Mehta
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  useEffect(() => {
    try {
      const authState = localStorage.getItem(STORAGE_AUTH_KEY);
      if (authState === "false") {
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(true);
      }

      const savedId = localStorage.getItem(STORAGE_PERSONA_KEY);
      if (savedId) {
        const found = PERSONAS.find((p) => p.id === savedId);
        if (found) {
          setPersonaState(found);
        }
      }
    } catch {
      // Ignore localStorage errors in SSR
    }
  }, []);

  const setPersona = (p: Persona) => {
    setPersonaState(p);
    try {
      localStorage.setItem(STORAGE_PERSONA_KEY, p.id);
    } catch {
      // Ignore
    }
  };

  const login = (targetPersona?: Persona) => {
    const p = targetPersona || persona || PERSONAS[0];
    setPersona(p);
    setIsAuthenticated(true);
    try {
      localStorage.setItem(STORAGE_AUTH_KEY, "true");
      localStorage.setItem(STORAGE_PERSONA_KEY, p.id);
    } catch {
      // Ignore
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.setItem(STORAGE_AUTH_KEY, "false");
    } catch {
      // Ignore
    }
  };

  const switchRole = (role: Role) => {
    const found = PERSONAS.find((p) => p.role === role);
    if (found) {
      setPersona(found);
    }
  };

  const can = (permission: Permission) => {
    if (!isAuthenticated) return false;
    return checkPermission(persona.role, permission);
  };

  const mask = (val: string | undefined | null, type: "phone" | "email" | "notes") => {
    return maskData(val, type, persona.role);
  };

  const isOwner = isAuthenticated && persona.role === "ORGANISATION_OWNER";
  const isAdmin = isAuthenticated && (persona.role === "ORGANISATION_ADMIN" || isOwner);
  const isEventManager = isAuthenticated && persona.role === "EVENT_MANAGER";
  const isBrandManager = isAuthenticated && persona.role === "BRAND_MANAGER";
  const isOperations = isAuthenticated && persona.role === "OPERATIONS_STAFF";
  const isCreator = isAuthenticated && persona.role === "CREATOR";
  const isGuest = isAuthenticated && persona.role === "GUEST";
  const isPlatformAdmin = isAuthenticated && persona.role === "PLATFORM_SUPER_ADMIN";

  return (
    <AuthContext.Provider
      value={{
        persona,
        setPersona,
        switchRole,
        isAuthenticated,
        login,
        logout,
        can,
        mask,
        isOwner,
        isAdmin,
        isEventManager,
        isBrandManager,
        isOperations,
        isCreator,
        isGuest,
        isPlatformAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
