import { IUsuariosRepository } from './usuarios.repository.interface';
import { UsuariosRepository } from './usuarios.repository';

export const usuariosRepository: IUsuariosRepository =

new UsuariosRepository();