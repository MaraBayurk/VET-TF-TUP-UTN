export const validarDatosRequeridos = (body: any): boolean => {
    const { nombre, apellido, numero_documento, email, password, id_rol } = body;
    
    // Retorna true solo si todos los campos base obligatorios están presentes
    return Boolean(nombre && apellido && numero_documento && email && password && id_rol);
};