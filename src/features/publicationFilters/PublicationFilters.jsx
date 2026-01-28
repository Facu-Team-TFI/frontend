import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const PublicationFilters = ({
  publications,
  selectedCategory,
  selectedSubcategory,
  selectedProvince,
  selectedCity,
  selectedState,
  onCategoryChange,
  onSubcategoryChange,
  onProvinceChange,
  onCityChange,
  onStateChange,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // 🔹 Listas de opciones únicas
  const provinces = [
    ...new Map(
      publications
        .map((p) => [p.City?.Province?.ID_Province, p.City?.Province?.Name])
        .filter(([id, name]) => id && name)
    ),
  ].map(([id, name]) => ({ id, name }));

  const cities = [
    ...new Map(
      publications
        .filter(
          (p) =>
            !selectedProvince ||
            p.City?.Province?.ID_Province === parseInt(selectedProvince)
        )
        .map((p) => [p.City?.ID_City, p.City?.Name])
        .filter(([id, name]) => id && name)
    ),
  ].map(([id, name]) => ({ id, name }));

  const categories = [
    ...new Map(
      publications.map((p) => [
        p.Category?.ID_Category,
        p.Category?.CategoryName,
      ])
    ),
  ].map(([id, name]) => ({ id, name }));

  const subcategories = [
    ...new Map(
      publications
        .filter((p) => p.Category?.ID_Category === parseInt(selectedCategory))
        .map((p) => [
          p.SubCategory?.ID_SubCategory,
          p.SubCategory?.NameSubCategory,
        ])
    ),
  ].map(([id, name]) => ({ id, name }));

  // 🔹 Cuando cambia la categoría
  const handleCategoryChange = (value) => {
    onCategoryChange(value);
    onSubcategoryChange("");

    // Actualizar la URL con el nombre de la categoría
    const params = new URLSearchParams(location.search);
    if (value) {
      const categoryObj = categories.find((c) => c.id === parseInt(value));
      if (categoryObj) params.set("category", categoryObj.name);
    } else {
      params.delete("category");
    }

    navigate(`${location.pathname}?${params.toString()}`);
  };

  return (
    <div
      id="filters"
      className="flex flex-col justify-start items-center h-full w-[70%] md:min-w-[250px] md:w-[23%] md:sticky md:left-4 md:top-24 space-y-4 "
    >
      <h2 className="w-full text-center text-3xl font-bold mb-4 border-b-2 border-black pb-2 uppercase tracking-wide">
        Filtros
      </h2>

      {/* 🔹 CATEGORÍAS */}
      <section className="w-full">
        <h3 className="text-lg font-bold mb-3 mt-5 pb-1">Por categorías:</h3>

        <div>
          <label className="block mb-1 font-medium text-gray-800">
            Categoría
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full min-w-0 p-2 rounded border border-gray-400 text-black 
             focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4">
          <label className="block mb-1 font-medium text-gray-800">
            Subcategoría
          </label>
          <select
            value={selectedSubcategory}
            onChange={(e) => onSubcategoryChange(e.target.value)}
            className="w-full min-w-0 p-2 rounded border border-gray-400 text-black 
             focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!selectedCategory}
          >
            <option value="">Todas</option>
            {subcategories.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* 🔹 UBICACIÓN */}
      <section className="mt-6 w-full">
        <h3 className="text-lg font-bold mb-2 pb-1">Por ubicación:</h3>

        <div>
          <label className="block mb-1 font-medium text-gray-800">
            Provincia
          </label>
          <select
            value={selectedProvince}
            onChange={(e) => {
              onProvinceChange(e.target.value);
              onCityChange("");
            }}
            className="w-full min-w-0 p-2 rounded border border-gray-400 text-black 
             focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas</option>
            {provinces.map((prov) => (
              <option key={prov.id} value={prov.id}>
                {prov.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4">
          <label className="block mb-1 font-medium text-gray-800">Ciudad</label>
          <select
            value={selectedCity}
            onChange={(e) => onCityChange(e.target.value)}
            className="w-full min-w-0 p-2 rounded border border-gray-400 text-black 
             focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!selectedProvince}
          >
            <option value="">Todas</option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* 🔹 ESTADO */}
      <section className="mt-6 w-full">
        <h3 className="text-lg font-bold mb-2 pb-1">Por estado:</h3>
        <select
          value={selectedState}
          onChange={(e) => onStateChange(e.target.value)}
          className="w-full min-w-0 p-2 rounded border border-gray-400 text-black 
             focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos</option>
          <option value="nuevo">Nuevo</option>
          <option value="usado">Usado</option>
          <option value="poco usado">Poco usado</option>
          <option value="reparado">Reparado</option>
        </select>
      </section>
    </div>
  );
};

export default PublicationFilters;
