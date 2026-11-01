import express, { Application } from 'express';
import 'dotenv/config';

// Importación de módulos de rutas
import authRoutes from './src/modules/auth/auth.routes';
import usuariosRoutes from './src/modules/usuarios/usuarios.routes';
import especialidadesRoutes from './src/modules/especialidades/especialidades.routes';
import mascotasRoutes from './src/modules/mascotas/mascotas.routes';

const app: Application = express();


// MIDDLEWARES GLOBALES
app.use(express.json());


// RUTAS DE LA API
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/especialidades', especialidadesRoutes);
app.use('/api/mascotas', mascotasRoutes);

// INICIALIZACIÓN DEL SERVIDOR
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

export default app;