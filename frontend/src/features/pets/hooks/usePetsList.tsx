import { useMemo, useState } from "react";
import type { PetItem } from "../../../types/pet";

const ITEMS_PER_PAGE = 8;

function usePetsList(initialPets: PetItem[]) {
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
    search !== "" ||
    speciesFilter !== "Todas" ||
    statusFilter !== "Activas";

  return {
    pets,
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
    handleDeactivate,
    clearFilters,
    hasFilters,
    itemsPerPage: ITEMS_PER_PAGE,
  };
}

export default usePetsList;