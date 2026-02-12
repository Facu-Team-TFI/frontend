import { useState, useEffect } from "react";
import PublicationFilters from "../../publicationFilters/PublicationFilters";
import PublicationCard from "../publicationCard/PublicationCard";
import { useSearch } from "../../../services/auth/SearchContext";
import { useSearchParams } from "react-router-dom";
import { IoArrowUpCircle } from "react-icons/io5";

const PublicationList = ({ publications }) => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const { searchTitle, searchOpen } = useSearch();

  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get("category"); // <- nombre correcto

  useEffect(() => {
    if (categoryParam && publications.length > 0) {
      const normalize = (str) =>
        str
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase();

      const categoryFound = publications.find(
        (p) =>
          p.Category?.CategoryName &&
          normalize(p.Category.CategoryName) === normalize(categoryParam),
      );

      if (categoryFound) {
        setSelectedCategory(categoryFound.Category.ID_Category.toString());
      }
    }
  }, [categoryParam, publications]);

  const filteredPublications = publications.filter((p) => {
    const matchCategory = selectedCategory
      ? p.Category?.ID_Category === parseInt(selectedCategory)
      : true;
    const matchSubcategory = selectedSubcategory
      ? p.SubCategory?.ID_SubCategory === parseInt(selectedSubcategory)
      : true;
    const matchProvince = selectedProvince
      ? p.City?.Province?.ID_Province === parseInt(selectedProvince)
      : true;
    const matchCity = selectedCity
      ? p.City?.ID_City === parseInt(selectedCity)
      : true;
    const matchState = selectedState ? p.State === selectedState : true;
    const matchTitle = searchTitle
      ? p.Title.toLowerCase().includes(searchTitle.toLowerCase())
      : true;

    return (
      matchCategory &&
      matchSubcategory &&
      matchProvince &&
      matchCity &&
      matchState &&
      matchTitle
    );
  });

  return (
    <div className="w-screen flex flex-col md:flex-row md:self-start md:justify-between items-center md:items-start md:px-4 py-4 max-w-[1500px] mx-auto gap-12 md:gap-8">
      <PublicationFilters
        publications={publications}
        selectedCategory={selectedCategory}
        selectedSubcategory={selectedSubcategory}
        selectedProvince={selectedProvince}
        selectedCity={selectedCity}
        selectedState={selectedState}
        onCategoryChange={setSelectedCategory}
        onSubcategoryChange={setSelectedSubcategory}
        onProvinceChange={setSelectedProvince}
        onCityChange={setSelectedCity}
        onStateChange={setSelectedState}
      />

      {/* Flecha flotante (solo mobile) */}
      <button
        onClick={() => {
          document.getElementById("filters")?.scrollIntoView({
            behavior: "smooth",
          });
        }}
        href="#filters"
        title="Ir a filtros"
        className={`
    sticky
    ${searchOpen ? "top-40" : "top-24"} mx-auto
    text-black/80
    md:hidden 
    z-40
    bg-none
    hover:text-black
    transition-all duration-200
    brightness-130
    active:scale-95
  `}
      >
        <IoArrowUpCircle size={50} />
      </button>

      <section className="flex justify-evenly items-center flex-wrap gap-6 max-w-[1200px] w-full">
        {filteredPublications.length > 0 ? (
          filteredPublications.map((publication) => (
            <PublicationCard
              key={publication.ID_Publication}
              id={publication.ID_Publication}
              title={publication.Title}
              description={publication.DescriptionProduct}
              img={publication.ImageUrl}
              price={publication.Price}
              status={publication.State}
              brand={publication.Brand}
              city={publication.City}
              category={publication.Category}
              subCategory={publication.SubCategory}
              id_seller={publication.ID_Sellers}
            />
          ))
        ) : (
          <p className="font-semibold">No se encontraron publicaciones.</p>
        )}
      </section>
    </div>
  );
};

export default PublicationList;
