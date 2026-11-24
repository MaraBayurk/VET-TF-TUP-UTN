import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  PawPrint,
  Dog,
  Cat,
  SlidersHorizontal,
  X,
} from "lucide-react";

import PetsTable from "../components/PetsTable";
import usePetsList from "../hooks/usePetsList";
import type { PetItem } from "../../../types/pet";
import type { UserRole } from "../../../types/roles";
import { getAuthUser } from "../../auth/services/authStorage";
import { deactivatePet, getPets } from "../services/petService";
import "../styles/PetsPage.scss";

function PetsPage() {
  const navigate = useNavigate();
  const [pets, setPets] = useState<PetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const roleValue = getAuthUser()?.rol?.toLocaleUpperCase("es") ?? "CLIENTE";
  const role: UserRole = roleValue === "ADMINISTRADOR" || roleValue === "VETERINARIO" ? roleValue : "CLIENTE";
  const isStaff = role !== "CLIENTE";
  const loadPets = async () => {
    setLoading(true);
    setError("");
    try { setPets(await getPets()); }
    catch (e) { setError(e instanceof Error ? e.message : "No se pudieron cargar las mascotas"); }
    finally { setLoading(false); }
  };
  useEffect(() => {
    let active = true;
    getPets().then(data => { if (active) setPets(data); })
      .catch(reason => { if (active) setError(reason instanceof Error ? reason.message : "No se pudieron cargar las mascotas"); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const {
    search,
    setSearch,
    speciesFilter,
    setSpeciesFilter,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    filteredPets,
    paginatedPets,
    totalPages,
    activePets,
    caninePets,
    felinePets,
    clearFilters,
    hasFilters,
    itemsPerPage,
  } = usePetsList(pets);

  const handleDeactivate = async (pet: PetItem) => {
    setActionError("");
    try { await deactivatePet(pet.id_mascota); await loadPets(); }
    catch (e) { setActionError(e instanceof Error ? e.message : "No se pudo dar de baja la mascota"); }
  };

  return (
    <section className="pets-page">
      <header className="pets-page__banner">
        <div className="pets-page__banner-content">
          <span className="pets-page__eyebrow">VET</span>
          <h1>Mascotas</h1>
          <p>
            {isStaff
              ? "Gestioná los pacientes y sus datos registrados en la veterinaria."
              : "Consultá las mascotas asociadas a tu cuenta."}
          </p>
        </div>

        <div className="pets-page__banner-decoration" aria-hidden="true">
          <PawPrint size={104} />
        </div>
      </header>

      {error && <div role="alert" className="pets-page__error">{error}<button type="button" onClick={() => void loadPets()}>Reintentar</button></div>}
      {actionError && <div role="alert" className="pets-page__error">{actionError}</div>}

      <section className="pets-page__stats">
        <article className="pets-page__stat-card">
          <div className="pets-page__stat-icon pets-page__stat-icon--green">
            <PawPrint size={20} />
          </div>
          <div>
            <span>{isStaff ? "Mascotas activas" : "Mis mascotas"}</span>
            <strong>{activePets}</strong>
          </div>
        </article>

        <article className="pets-page__stat-card">
          <div className="pets-page__stat-icon pets-page__stat-icon--blue">
            <Dog size={20} />
          </div>
          <div>
            <span>Caninas</span>
            <strong>{caninePets}</strong>
          </div>
        </article>

        <article className="pets-page__stat-card">
          <div className="pets-page__stat-icon pets-page__stat-icon--purple">
            <Cat size={20} />
          </div>
          <div>
            <span>Felinas</span>
            <strong>{felinePets}</strong>
          </div>
        </article>
      </section>

      <section className="pets-page__panel">
        <div className="pets-page__toolbar">
          <label className="pets-page__search">
            <Search size={17} />
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setCurrentPage(1);
              }}
              placeholder={isStaff ? "Buscar por mascota, cliente o documento..." : "Buscar por nombre o especie..."}
            />
          </label>

          <label className="pets-page__filter">
            <span>Especie</span>
            <select
              value={speciesFilter}
              onChange={(event) => {
                setSpeciesFilter(event.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="Todas">Todas</option>
              <option value="Canina">Canina</option>
              <option value="Felina">Felina</option>
              <option value="Otra">Otra</option>
            </select>
          </label>

          {isStaff && <label className="pets-page__filter">
            <span>Estado</span>
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="Activas">Activas</option>
              {isStaff && <><option value="Inactivas">Inactivas</option><option value="Todas">Todas</option></>}
            </select>
          </label>}

          {hasFilters && (
            <button
              type="button"
              className="pets-page__clear"
              onClick={clearFilters}
            >
              <X size={14} />
              Limpiar filtros
            </button>
          )}

          <button
            type="button"
            className="pets-page__new-button"
            onClick={() => navigate("/mascotas/nueva")}
          >
            <Plus size={17} />
            {role === "CLIENTE" ? "Registrar mascota" : "Nueva mascota"}
          </button>
        </div>

        <div className="pets-page__table-heading">
          <div>
            <h2>{isStaff ? "Pacientes registrados" : "Mis mascotas"}</h2>
            <p>{isStaff ? "Consultá y administrá las mascotas de tus clientes." : "Consultá la información de tus mascotas registradas."}</p>
          </div>
          <SlidersHorizontal size={18} />
        </div>

        {loading ? <p role="status" className="pets-page__loading">Cargando mascotas…</p> : <PetsTable pets={paginatedPets} onDeactivate={handleDeactivate} role={role} />}

        <footer className="pets-page__pagination">
          <span>
            Mostrando{" "}
            {filteredPets.length === 0
              ? 0
              : (currentPage - 1) * itemsPerPage + 1}
            {" a "}
            {Math.min(currentPage * itemsPerPage, filteredPets.length)}
            {" de "}
            {filteredPets.length} mascotas
          </span>

          <div className="pets-page__pagination-controls">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((page) => page - 1)}
              aria-label="Página anterior"
            >
              ‹
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (page) => (
                <button
                  type="button"
                  key={page}
                  className={currentPage === page ? "active" : ""}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ),
            )}

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((page) => page + 1)}
              aria-label="Página siguiente"
            >
              ›
            </button>
          </div>
        </footer>
      </section>
    </section>
  );
}

export default PetsPage;
