import type { UserRole } from "../types/roles";
import type { PetItem } from "../types/pet";

export const canEditPet = (
  pet: PetItem,
  role: UserRole
): boolean => {
  if (!pet.activo) return false;

  return role === "ADMINISTRADOR" || role === "VETERINARIO";
};

export const canDeactivatePet = (
  pet: PetItem,
  role: UserRole
): boolean => {
  if (!pet.activo) return false;

  return role === "ADMINISTRADOR" || role === "VETERINARIO";
};