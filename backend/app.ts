import express, { Application } from 'express';
import 'dotenv/config';
import { setupSwagger } from './src/config/swagger';
import morgan from 'morgan';
import cors from 'cors';

// Importación de módulos de rutas
import authRoutes from './src/modules/auth/auth.routes';
import usuariosRoutes from './src/modules/usuarios/usuarios.routes';
import especialidadesRoutes from './src/modules/especialidades/especialidades.routes';
import mascotasRoutes from './src/modules/mascotas/mascotas.routes';
import horariosRoutes from './src/modules/agenda/horarios/horarios.routes';
import turnosRoutes from './src/modules/agenda/turnos/turnos.routes';
import clientesRoutes from './src/modules/clientes/clientes.routes';
import clinicalRoutes from './src/modules/clinical/clinical.routes';

const app: Application = express();


// MIDDLEWARES GLOBALES
app.use(express.json());
app.use(morgan('dev'));
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173'
}));

// <-- 2. Ejecutá Swagger ANTES de tus rutas
setupSwagger(app);

// RUTAS DE LA API
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/especialidades', especialidadesRoutes);
app.use('/api/mascotas', mascotasRoutes);
app.use('/api/horarios', horariosRoutes);
app.use('/api/turnos', turnosRoutes);
app.use('/api/atenciones', clinicalRoutes);

export default app;