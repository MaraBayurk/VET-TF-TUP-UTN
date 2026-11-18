import { CrearUsuarioDTO, ActualizarPerfilDTO } from './usuarios.dto';

export interface IUsuariosRepository {
    obtenerTodos(): Promise<any[]>;

    obtenerPorId(id: string): Promise<any | null>;

    eliminarLogicamente(id: string): Promise<boolean>;

    crear(usuario: CrearUsuarioDTO): Promise<number>;

    actualizarPerfil(
        idUsuario: number,
        idRol: number,
        datos: ActualizarPerfilDTO
    ): Promise<void>;
}