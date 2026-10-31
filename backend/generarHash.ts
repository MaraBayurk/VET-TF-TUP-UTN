import bcrypt from 'bcrypt';

const generar = async () => {
    // Generamos el hash real de la contraseña que usaste en Postman
    const hash = await bcrypt.hash('123456', 10);
    console.log('\n--- COPIA EL HASH DE ABAJO ---');
    console.log(hash);
    console.log('------------------------------\n');
};

generar();