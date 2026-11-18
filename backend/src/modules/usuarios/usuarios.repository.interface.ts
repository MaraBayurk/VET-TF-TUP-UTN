import { CrearUsuarioDTO, ActualizarPerfilDTO, ActualizarUsuarioDTO } from './usuarios.dto';

export interface IUsuariosRepository {
    obtenerTodos(): Promise<any[]>;

    obtenerPorId(id: string): Promise<any | null>;

    eliminarLogicamente(id: string): Promise<boolean>;

    crear(usuario: CrearUsuarioDTO): Promise<number>;

    actualizar(id: string, usuario: ActualizarUsuarioDTO): Promise<boolean>;

    obtenerRoles(): Promise<any[]>;

    obtenerEspecialidades(): Promise<any[]>;

    actualizarPerfil(
        idUsuario: number,
        datos: ActualizarPerfilDTO
    ): Promise<void>;
}
