import { useEffect, useState, useRef } from "react";
import {
  notifySuccessAdd,
  notifyMissingFields,
} from "../../pages/notification/notification";
import { useAuth } from "../../services/auth/AuthContext";
import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";

const initialState = {
  name: "",
  brand: "",
  price: "",
  condition: "",
  provinceId: "",
  cityId: "",
  categoryId: "",
  subCategoryId: "",
  description: "",
  image: null,
  //   image: "",
};

const PublicationFormSeller = ({ onRefresh }) => {
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);

  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [provinciasRes, categoriasRes] = await Promise.all([
          fetch("http://localhost:3000/provincias-ciudades"),
          fetch("http://localhost:3000/categorias"),
        ]);
        const provincias = await provinciasRes.json();
        const categorias = await categoriasRes.json();

        setProvinces(provincias);
        setCategories(categorias);
      } catch (error) {
        console.error("Error al cargar provincias o categorías", error);
      }
    };

    fetchInitialData();
  }, []);

  // Generar / limpiar la URL de preview cada vez que cambia formData.image
  useEffect(() => {
    // Si no hay archivo o no es File, quitamos preview
    if (!(formData.image instanceof File)) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(formData.image);
    setPreviewUrl(url);

    // Cleanup: revocar URL cuando cambia el archivo o se desmonta
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [formData.image]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      notifyMissingFields(`¡Completo los campos requeridos!`);
      return;
    }

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("brand", formData.brand);
      data.append("price", parseFloat(formData.price));
      data.append("condition", formData.condition);
      data.append("provinceId", formData.provinceId);
      data.append("cityId", formData.cityId);
      data.append("categoryId", formData.categoryId);
      data.append("subCategoryId", formData.subCategoryId);
      data.append("description", formData.description);
      data.append("sellerId", user.seller?.id);

      if (formData.image instanceof File) {
        data.append("image", formData.image);
      }

      const response = await fetch("http://localhost:3000/publications", {
        method: "POST",
        body: data, // ⚠️ sin headers manuales
      });

      if (!response.ok) throw new Error("Error en la publicación");
      notifySuccessAdd(`¡${formData.name} publicada con éxito!`);

      // Reset del form + preview + input file
      setFormData(initialState);
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      onRefresh();
      navigate("/vender");
    } catch (err) {
      console.error(err);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim())
      newErrors.name = "El nombre del instrumento es obligatorio.";
    if (!formData.brand.trim()) newErrors.brand = "La marca es obligatoria.";
    if (formData.price === "" || isNaN(Number(formData.price)))
      newErrors.price = "El precio debe ser un número válido.";
    if (!formData.condition)
      newErrors.condition = "Selecciona la condición del instrumento.";
    if (!formData.provinceId)
      newErrors.provinceId = "Selecciona una provincia.";
    if (!formData.categoryId) newErrors.categoryId = "Selecciona la categoría.";
    if (!formData.subCategoryId)
      newErrors.subCategoryId = "Selecciona la subcategoría.";
    if (!formData.description.trim())
      newErrors.description = "La descripción es obligatoria.";
    if (!formData.image) newErrors.image = "La imagen es obligatoria.";
    if (formData.image) {
      const file = formData.image;

      // Comprobar que sea instancia de File (viene de input[type=file])
      if (!(file instanceof File)) {
        newErrors.image = "Formato de imagen inválido.";
      }
    }
    return newErrors;
  };

  const handleProvinceChange = async (e) => {
    const selectedProvinceId = e.target.value;
    setFormData({ ...formData, provinceId: selectedProvinceId, cityId: "" });

    try {
      const res = await fetch(
        `http://localhost:3000/ciudades/${selectedProvinceId}`,
      );
      const data = await res.json();
      setCities(data);
    } catch (err) {
      console.error("Error al cargar ciudades", err);
    }
  };

  const handleCategoryChange = async (e) => {
    const selectedCategoryId = e.target.value;
    setFormData({
      ...formData,
      categoryId: selectedCategoryId,
      subCategoryId: "",
    });

    try {
      const res = await fetch(
        `http://localhost:3000/${selectedCategoryId}/subcategorias`,
      );
      const data = await res.json();
      setSubCategories(data);
    } catch (err) {
      console.error("Error al cargar subcategorías", err);
    }
  };

  const handleChange = (e) => {
    const { name, value, files, type } = e.target;

    if (type === "file") {
      const file = files?.[0];
      if (!file) return;

      // Validaciones reales
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          image: "El archivo no es una imagen.",
        }));
        if (fileInputRef.current) fileInputRef.current.value = "";
        setFormData((prev) => ({ ...prev, image: null }));
        setPreviewUrl(null);
        return;
      }
      const MAX_MB = 5;
      if (file.size > MAX_MB * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          image: `La imagen supera ${MAX_MB} MB.`,
        }));
        if (fileInputRef.current) fileInputRef.current.value = "";
        setFormData((prev) => ({ ...prev, image: null }));
        setPreviewUrl(null);
        return;
      }

      // OK
      setErrors((prev) => {
        const { image, ...rest } = prev;
        return rest;
      });
      setFormData((prev) => ({ ...prev, image: file }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div
      className="relative"
      style={{
        maxWidth: "700px",
        margin: "2rem auto",
        padding: "2rem",
        paddingTop: "10px",
        borderRadius: "12px",
        backgroundColor: "#FDE7B9",
        border: "2px solid brown",
      }}
    >
      <ArrowLeft
        className="w-8 h-8 cursor-pointer absolute left-4 top-8 -translate-y-1/2"
        onClick={() => navigate(-1)}
      />
      <h2
        style={{
          textAlign: "center",
          marginBottom: "2.9rem",
          fontSize: "26px",
        }}
      >
        Publicar Instrumento Musical
      </h2>
      <form
        onSubmit={handleSubmit}
        noValidate
        style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
      >
        <label>
          Nombre del instrumento*:
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            style={inputStyle(errors.name)}
          />
          {errors.name && <span style={errorStyle}>{errors.name}</span>}
        </label>

        <label>
          Marca:
          <input
            type="text"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            style={inputStyle(errors.brand)}
          />
          {errors.brand && <span style={errorStyle}>{errors.brand}</span>}
        </label>

        <label>
          Precio:
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            style={inputStyle(errors.price)}
          />
          {errors.price && <span style={errorStyle}>{errors.price}</span>}
        </label>

        <label>
          Condición:
          <select
            name="condition"
            value={formData.condition}
            onChange={handleChange}
            style={inputStyle(errors.condition)}
          >
            <option value="">Seleccione una opción</option>
            <option value="nuevo">Nuevo</option>
            <option value="usado">Usado</option>
            <option value="poco usado">Poco Usado</option>
            <option value="reparado">Reparado</option>
          </select>
          {errors.condition && (
            <span style={errorStyle}>{errors.condition}</span>
          )}
        </label>

        <label>
          Provincia:
          <select
            name="provinceId"
            value={formData.provinceId || ""}
            onChange={handleProvinceChange}
            style={inputStyle(errors.provinceId)}
          >
            <option value="">Selecciona una provincia</option>
            {provinces.map((prov) => (
              <option key={prov.ID_Province} value={prov.ID_Province}>
                {prov.Name}
              </option>
            ))}
          </select>
          {errors.provinceId && (
            <span style={errorStyle}>{errors.provinceId}</span>
          )}
        </label>

        <label>
          Ciudad:
          <select
            name="cityId"
            value={formData.cityId || ""}
            onChange={handleChange}
            disabled={cities.length === 0}
            style={inputStyle(errors.cityId)}
          >
            <option value="">
              {cities.length === 0
                ? "Seleccione una provincia primero"
                : "Selecciona una ciudad"}
            </option>
            {cities.map((city) => (
              <option key={city.ID_City} value={city.ID_City}>
                {city.Name}
              </option>
            ))}
          </select>
          {errors.cityId && <span style={errorStyle}>{errors.cityId}</span>}
        </label>

        <label>
          Categoría:
          <select
            name="categoryId"
            value={formData.categoryId || ""}
            onChange={handleCategoryChange}
            style={inputStyle(errors.categoryId)}
            disabled={categories.length === 0}
          >
            <option value="">
              {categories.length === 0
                ? "Cargando categorías..."
                : "Selecciona una categoría"}
            </option>
            {categories.map((cat) => (
              <option key={cat.ID_Category} value={cat.ID_Category}>
                {cat.CategoryName}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <span style={errorStyle}>{errors.categoryId}</span>
          )}
        </label>

        <label>
          Subcategoría:
          <select
            name="subCategoryId"
            value={formData.subCategoryId}
            onChange={handleChange}
            style={inputStyle(errors.subCategoryId)}
            disabled={!subCategories.length}
          >
            <option value="">
              {subCategories.length === 0
                ? "Cargando categorías..."
                : "Selecciona una subcategoría"}
            </option>
            {subCategories.map((sub) => (
              <option key={sub.ID_SubCategory} value={sub.ID_SubCategory}>
                {sub.NameSubCategory}
              </option>
            ))}
          </select>
          {errors.subCategoryId && (
            <span style={errorStyle}>{errors.subCategoryId}</span>
          )}
        </label>

        <label>
          Descripción:
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            style={inputStyle(errors.description)}
          />
          {errors.description && (
            <span style={errorStyle}>{errors.description}</span>
          )}
        </label>

        <label>
          Imagen:
          {previewUrl && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "0.5rem",
                marginBottom: "0.5rem",
              }}
            >
              <img
                src={previewUrl}
                alt="Previsualización"
                style={{
                  height: 160,
                  width: 160,
                  objectFit: "cover",
                  borderRadius: 8,
                  border: "1px solid #000",
                  background: "#f5e9cf",
                }}
                onError={(e) => {
                  if (e.currentTarget.dataset.fallback !== "1") {
                    e.currentTarget.src =
                      "data:image/svg+xml;charset=utf-8," +
                      encodeURIComponent(
                        `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><rect width='100%' height='100%' fill='#f5e9cf'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#6b4a3a' font-size='12'>Imagen no disponible</text></svg>`,
                      );
                    e.currentTarget.dataset.fallback = "1";
                  }
                }}
              />
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            name="image"
            accept="image/*"
            onChange={handleChange}
            aria-invalid={!!errors.image}
            className="
    block w-full text-sm text-[#401809]
    file:mr-4 file:py-2 file:px-4
    file:rounded-md file:border-0
    file:text-sm file:font-medium
    file:bg-[#401809] file:text-[#FDE7B9]
    hover:file:bg-[#2e1005]
    file:cursor-pointer cursor-pointer
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2e1005]
    bg-[#FDF3D9] border border-[#401809] rounded-md p-1
            "
            style={{
              marginTop: "0.5rem",
            }}
          />
          {errors.image && <span style={errorStyle}>{errors.image}</span>}
        </label>

        <button
          type="submit"
          style={{
            backgroundColor: "#59382C",
            color: "#fff",
            padding: "0.75rem",
            border: "none",
            borderRadius: "8px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Publicar
        </button>
      </form>
    </div>
  );
};

const inputStyle = (hasError) => ({
  width: "100%",
  padding: "10px",
  borderRadius: "6px",
  border: hasError ? "2px solid red" : "1px solid #ccc",
  marginTop: "0.5rem",
  boxSizing: "border-box",
});

const errorStyle = {
  color: "red",
  fontSize: "0.875rem",
  marginTop: "0.25rem",
  display: "block",
};

export default PublicationFormSeller;
