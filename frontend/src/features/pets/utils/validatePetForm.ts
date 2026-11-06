interface PetFormData {
  nombre: string;
  especie: string;
  raza: string;
  fecha_nacimiento: string;
  sexo: string;
  observaciones: string;
}

export const validatePetForm = (
  formData: PetFormData,
): Partial<PetFormData> => {
  const errors: Partial<PetFormData> = {};

  if (!formData.nombre.trim()) {
    errors.nombre = "Ingresá el nombre de la mascota.";
  }

  if (!formData.especie) {
    errors.especie = "Seleccioná una especie.";
  }

  if (!formData.sexo) {
    errors.sexo = "Seleccioná el sexo.";
  }

  if (formData.fecha_nacimiento) {
    const birthDate = new Date(
      `${formData.fecha_nacimiento}T00:00:00`,
    );

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (birthDate > today) {
      errors.fecha_nacimiento =
        "La fecha de nacimiento no puede ser futura.";
    }
  }

  return errors;
};