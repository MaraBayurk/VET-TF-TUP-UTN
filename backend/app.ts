import express, { Application } from 'express';
import 'dotenv/config';
import { setupSwagger } from './src/config/swagger';


// Importación de módulos de rutas
import authRoutes from './src/modules/auth/auth.routes';
import usuariosRoutes from './src/modules/usuarios/usuarios.routes';
import especialidadesRoutes from './src/modules/especialidades/especialidades.routes';
import mascotasRoutes from './src/modules/mascotas/mascotas.routes';
import horariosRoutes from './src/modules/agenda/horarios.routes';
import turnosRoutes from './src/modules/agenda/turnos.routes';

const app: Application = express();


// MIDDLEWARES GLOBALES
app.use(express.json());

// <-- 2. Ejecutá Swagger ANTES de tus rutas
setupSwagger(app);

// RUTAS DE LA API
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/especialidades', especialidadesRoutes);
app.use('/api/mascotas', mascotasRoutes);
app.use('/api/horarios', horariosRoutes);
app.use('/api/turnos', turnosRoutes);

// INICIALIZACIÓN DEL SERVIDOR
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

export default app;