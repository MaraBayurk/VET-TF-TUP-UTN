import { createContext, useContext } from "react";

export const AuthSessionContext = createContext(false);

export function useAuthSessionExpired(): boolean {
  return useContext(AuthSessionContext);
}
