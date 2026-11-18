import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, MoreVertical, Pencil, UserRoundX } from "lucide-react";
import ConfirmModal from "../../../components/commons/ConfirmModal/ConfirmModal";
import type { ClientRecord } from "../services/clientService";

interface Props { clients: ClientRecord[]; onDeactivate: (client: ClientRecord) => void }
function ClientsTable({ clients, onDeactivate }: Props) {
  const navigate = useNavigate();
  const [openId, setOpenId] = useState<number | null>(null);
  const [selected, setSelected] = useState<ClientRecord | null>(null);
  if (!clients.length) return <div className="clients-table__empty">No se encontraron clientes con los filtros seleccionados.</div>;
  return <>
    <div className="clients-table__wrapper"><table className="clients-table">
      <thead><tr><th>Nombre</th><th>Documento</th><th>Email</th><th>Teléfono</th><th>Mascotas</th><th>Estado</th><th>Acciones</th></tr></thead>
      <tbody>{clients.map(client => {
        const name = `${client.nombre} ${client.apellido}`;
        const active = Boolean(client.activo);
        return <tr key={client.id_cliente}>
          <td><div className="clients-table__identity"><span>{client.nombre[0]}{client.apellido[0]}</span><strong>{name}</strong></div></td>
          <td>{client.numero_documento}</td><td>{client.email}</td><td>{client.telefono || "—"}</td><td>{client.cantidad_mascotas ?? 0}</td>
          <td><span className={`clients-table__status clients-table__status--${active ? "activo" : "inactivo"}`}>{active ? "Activo" : "Inactivo"}</span></td>
          <td><div className="clients-table__actions"><button type="button" aria-label={`Opciones de ${name}`} onClick={() => setOpenId(openId === client.id_cliente ? null : client.id_cliente)}><MoreVertical size={18} /></button>
            {openId === client.id_cliente && <div className="clients-table__menu">
              <button type="button" onClick={() => { setOpenId(null); navigate(`/clientes/${client.id_cliente}`); }}><Eye size={15} />Detalle</button>
              <button type="button" onClick={() => { setOpenId(null); navigate(`/clientes/${client.id_cliente}/editar`); }}><Pencil size={15} />Editar</button>
              {active && <button type="button" onClick={() => { setOpenId(null); setSelected(client); }}><UserRoundX size={15} />Dar de baja</button>}
            </div>}
          </div></td>
        </tr>;
      })}</tbody>
    </table></div>
    <ConfirmModal isOpen={Boolean(selected)} title="Dar de baja cliente" description="¿Estás segura de que querés dar de baja a" highlightedText={`${selected?.nombre ?? ""} ${selected?.apellido ?? ""}?`} details="El cliente se marcará como inactivo. Se conservarán sus datos, mascotas, turnos e historial clínico." confirmText="Dar de baja" cancelText="Cancelar" onConfirm={() => { if (selected) onDeactivate(selected); setSelected(null); }} onCancel={() => setSelected(null)} />
  </>;
}
export default ClientsTable;
