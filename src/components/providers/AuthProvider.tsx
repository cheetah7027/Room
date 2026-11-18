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

const STORAGE_KEY = "room_active_persona_id";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [persona, setPersonaState] = useState<Persona>(PERSONAS[0]); // Default to Rahul Mehta (Organisation Owner)

  useEffect(() => {
    try {
      const savedId = localStorage.getItem(STORAGE_KEY);
      if (savedId) {
        const found = PERSONAS.find((p) => p.id === savedId);
        if (found) {
          setPersonaState(found);
        }
      }
    } catch {
      // Ignore localStorage errors in SSR or restricted environments
    }
  }, []);

  const setPersona = (p: Persona) => {
    setPersonaState(p);
    try {
      localStorage.setItem(STORAGE_KEY, p.id);
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
    return checkPermission(persona.role, permission);
  };

  const mask = (val: string | undefined | null, type: "phone" | "email" | "notes") => {
    return maskData(val, type, persona.role);
  };

  const isOwner = persona.role === "ORGANISATION_OWNER";
  const isAdmin = persona.role === "ORGANISATION_ADMIN" || isOwner;
  const isEventManager = persona.role === "EVENT_MANAGER";
  const isBrandManager = persona.role === "BRAND_MANAGER";
  const isOperations = persona.role === "OPERATIONS_STAFF";
  const isCreator = persona.role === "CREATOR";
  const isGuest = persona.role === "GUEST";
  const isPlatformAdmin = persona.role === "PLATFORM_SUPER_ADMIN";

  return (
    <AuthContext.Provider
      value={{
        persona,
        setPersona,
        switchRole,
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
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
