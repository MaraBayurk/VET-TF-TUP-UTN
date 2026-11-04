import { useMemo, useState } from "react";
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
import type { PetItem } from "../types/pet";
import "../styles/PetsPage.scss";

const initialPets: PetItem[] = [
  {
    id_mascota: 1,
    id_cliente: 1,
    nombre: "Luna",
    especie: "Canina",
    raza: "Golden Retriever",
    fecha_nacimiento: "2021-03-12",
    sexo: "Hembra",
    observaciones: null,
    activo: true,
    cliente: {
      id_usuario: 1,
      nombre: "María",
      apellido: "González",
      numero_documento: "12.345.678",
    },
  },
  {
    id_mascota: 2,
    id_cliente: 2,
    nombre: "Simba",
    especie: "Felina",
    raza: "Europea",
    fecha_nacimiento: "2022-07-05",
    sexo: "Macho",
    observaciones: null,
    activo: true,
    cliente: {
      id_usuario: 2,
      nombre: "Pedro",
      apellido: "Ramírez",
      numero_documento: "23.456.789",
    },
  },
  {
    id_mascota: 3,
    id_cliente: 3,
    nombre: "Nala",
    especie: "Canina",
    raza: "Labrador",
    fecha_nacimiento: "2022-11-18",
    sexo: "Hembra",
    observaciones: "Control periódico",
    activo: true,
    cliente: {
      id_usuario: 3,
      nombre: "Lucía",
      apellido: "Fernández",
      numero_documento: "34.567.890",
    },
  },
  {
    id_mascota: 4,
    id_cliente: 4,
    nombre: "Mía",
    especie: "Felina",
    raza: "Siamés",
    fecha_nacimiento: "2024-01-20",
    sexo: "Hembra",
    observaciones: null,
    activo: true,
    cliente: {
      id_usuario: 4,
      nombre: "Sofía",
      apellido: "Vera",
      numero_documento: "11.222.333",
    },
  },
  {
    id_mascota: 5,
    id_cliente: 5,
    nombre: "Rocky",
    especie: "Canina",
    raza: "Mestizo",
    fecha_nacimiento: "2020-09-10",
    sexo: "Macho",
    observaciones: null,
    activo: true,
    cliente: {
      id_usuario: 5,
      nombre: "Carlos",
      apellido: "Méndez",
      numero_documento: "55.667.788",
    },
  },
  {
    id_mascota: 6,
    id_cliente: 6,
    nombre: "Kira",
    especie: "Felina",
    raza: "Maine Coon",
    fecha_nacimiento: "2021-05-22",
    sexo: "Hembra",
    observaciones: null,
    activo: true,
    cliente: {
      id_usuario: 6,
      nombre: "Ana",
      apellido: "Torres",
      numero_documento: "44.556.677",
    },
  },
  {
    id_mascota: 7,
    id_cliente: 7,
    nombre: "Toby",
    especie: "Canina",
    raza: "Bulldog Francés",
    fecha_nacimiento: "2023-02-14",
    sexo: "Macho",
    observaciones: null,
    activo: false,
    cliente: {
      id_usuario: 7,
      nombre: "Juan",
      apellido: "Pérez",
      numero_documento: "33.445.566",
    },
  },
  {
    id_mascota: 8,
    id_cliente: 8,
    nombre: "Olivia",
    especie: "Felina",
    raza: "Persa",
    fecha_nacimiento: "2024-06-30",
    sexo: "Hembra",
    observaciones: null,
    activo: true,
    cliente: {
      id_usuario: 8,
      nombre: "Valentina",
      apellido: "Ruiz",
      numero_documento: "66.778.899",
    },
  },
];

const ITEMS_PER_PAGE = 8;

function PetsPage() {
  const navigate = useNavigate();

  const [pets, setPets] = useState<PetItem[]>(initialPets);
  const [search, setSearch] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState("Todas");
  const [statusFilter, setStatusFilter] = useState("Activas");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredPets = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return pets.filter((pet) => {
      const ownerName =
        `${pet.cliente.nombre} ${pet.cliente.apellido}`.toLowerCase();

      const matchesSearch =
        pet.nombre.toLowerCase().includes(searchValue) ||
        ownerName.includes(searchValue) ||
        pet.cliente.numero_documento.includes(searchValue) ||
        (pet.raza ?? "").toLowerCase().includes(searchValue) ||
        pet.especie.toLowerCase().includes(searchValue);

      const matchesSpecies =
        speciesFilter === "Todas" || pet.especie === speciesFilter;

      const matchesStatus =
        statusFilter === "Todas" ||
        (statusFilter === "Activas" && pet.activo) ||
        (statusFilter === "Inactivas" && !pet.activo);

      return matchesSearch && matchesSpecies && matchesStatus;
    });
  }, [pets, search, speciesFilter, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPets.length / ITEMS_PER_PAGE),
  );

  const paginatedPets = filteredPets.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const activePets = pets.filter((pet) => pet.activo).length;
  const caninePets = pets.filter(
    (pet) => pet.activo && pet.especie === "Canina",
  ).length;
  const felinePets = pets.filter(
    (pet) => pet.activo && pet.especie === "Felina",
  ).length;

  const handleDeactivate = (selectedPet: PetItem) => {
    setPets((currentPets) =>
      currentPets.map((pet) =>
        pet.id_mascota === selectedPet.id_mascota
          ? { ...pet, activo: false }
          : pet,
      ),
    );
  };

  const clearFilters = () => {
    setSearch("");
    setSpeciesFilter("Todas");
    setStatusFilter("Activas");
    setCurrentPage(1);
  };

  const hasFilters =
    search !== "" || speciesFilter !== "Todas" || statusFilter !== "Activas";

  return (
    <section className="pets-page">
      <header className="pets-page__banner">
        <div className="pets-page__banner-content">
          <span className="pets-page__eyebrow">VET</span>
          <h1>Mascotas</h1>
          <p>
            Gestioná los pacientes y sus datos registrados en la veterinaria.
          </p>
        </div>

        <div className="pets-page__banner-decoration" aria-hidden="true">
          <PawPrint size={104} />
        </div>
      </header>

      <section className="pets-page__stats">
        <article className="pets-page__stat-card">
          <div className="pets-page__stat-icon pets-page__stat-icon--green">
            <PawPrint size={20} />
          </div>
          <div>
            <span>Mascotas activas</span>
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
              placeholder="Buscar por mascota, cliente o documento..."
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

          <label className="pets-page__filter">
            <span>Estado</span>
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="Activas">Activas</option>
              <option value="Inactivas">Inactivas</option>
              <option value="Todas">Todas</option>
            </select>
          </label>

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
            Nueva mascota
          </button>
        </div>

        <div className="pets-page__table-heading">
          <div>
            <h2>Pacientes registrados</h2>
            <p>Consultá y administrá las mascotas de tus clientes.</p>
          </div>
          <SlidersHorizontal size={18} />
        </div>

        <PetsTable pets={paginatedPets} onDeactivate={handleDeactivate} />

        <footer className="pets-page__pagination">
          <span>
            Mostrando{" "}
            {filteredPets.length === 0
              ? 0
              : (currentPage - 1) * ITEMS_PER_PAGE + 1}
            {" a "}
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredPets.length)}
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
