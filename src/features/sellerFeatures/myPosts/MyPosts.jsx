import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { notifySuccessAdd } from "../../../pages/notification/notification";
import { toast } from "react-toastify";

const MyPosts = ({ posts, setPosts, onRefresh }) => {
  const [editingPost, setEditingPost] = useState(null);
  const [formData, setFormData] = useState({});

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [errorImg, setErrorImg] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!selectedFile) return;

    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);

    return () => {
      // Limpia la URL anterior cuando cambia el archivo o se desmonta el modal
      URL.revokeObjectURL(url);
    };
  }, [selectedFile]);

  const openEditor = (post) => {
    setEditingPost(post.ID_Publication);
    setFormData({ ...post });
  };

  const closeEditor = () => {
    setEditingPost(null);

    // Limpieza de estados y URL temporal
    setSelectedFile(null);
    setPreviewUrl(null);
    setErrorImg(null);

    // Resetear el valor del input para poder re-seleccionar el mismo archivo
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      const file = files?.[0];
      if (!file) return;

      // Validaciones
      if (!file.type.startsWith("image/")) {
        setErrorImg("El archivo seleccionado no es una imagen.");
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      const MAX_MB = 5;
      if (file.size > MAX_MB * 1024 * 1024) {
        setErrorImg(`La imagen supera ${MAX_MB} MB.`);
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      setErrorImg(null);
      setSelectedFile(file); // <- el useEffect generará la preview y hará cleanup
      return; // Importante: no actualizar formData en este branch
    }

    // Inputs de texto/number/select
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Helper chiquito para no repetir checks
  const appendIfSet = (fd, key, value) => {
    if (value !== undefined && value !== null && value !== "") {
      fd.append(key, String(value));
    }
  };

  // ÚNICA función de actualización: PUT multipart/form-data
  const updatePublication = async (id, ui, file) => {
    try {
      const fd = new FormData();

      // Campos que espera tu backend (con los mismos nombres que ya usás)
      appendIfSet(fd, "Title", ui.Title);
      appendIfSet(fd, "Brand", ui.Brand);

      // Price: normalizamos a número y mandamos como string si es válido
      if (ui.Price !== undefined && ui.Price !== "") {
        const n = parseFloat(ui.Price);
        if (!Number.isNaN(n)) fd.append("Price", String(n));
      }

      appendIfSet(fd, "State", ui.State);
      appendIfSet(fd, "DescriptionProduct", ui.DescriptionProduct);
      appendIfSet(fd, "Sku", ui.Sku);
      appendIfSet(fd, "ID_Category", ui.ID_Category);
      appendIfSet(fd, "ID_SubCategory", ui.ID_SubCategory);
      appendIfSet(fd, "ID_City", ui.ID_City);
      appendIfSet(fd, "ID_Sellers", ui.ID_Sellers);

      // Imagen: si hay archivo nuevo se manda; si no, mandamos la URL actual (si tu API lo permite)
      if (file instanceof File) {
        fd.append("Image", file); // <-- nombre del campo de archivo que espera tu API
      } else if (ui.ImageUrl) {
        fd.append("ImageUrl", ui.ImageUrl);
      }

      const res = await fetch(`http://localhost:3000/publications/${id}`, {
        method: "PUT",
        body: fd,
      });

      if (!res.ok) {
        throw new Error("Error al actualizar la publicación");
      }

      const updated = await res.json();
      return updated;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const handleSave = async () => {
    const updatedPost = await updatePublication(
      editingPost,
      formData,
      selectedFile, // es null si no se cambió la imagen
    );

    if (updatedPost) {
      setPosts((prev) =>
        prev.map((p) =>
          p.ID_Publication === editingPost ? { ...updatedPost } : p,
        ),
      );
      onRefresh?.();
      notifySuccessAdd("¡Actualización con éxito!");
      closeEditor();
    }
  };

  const handleDelete = async (id) => {
    const confirmToast = toast(
      ({ closeToast }) => (
        <div>
          <p>¿Estás seguro que querés eliminar esta publicación?</p>
          <div className="mt-2 flex justify-end gap-2">
            <button
              onClick={closeToast}
              className="bg-gray-300 text-black px-3 py-1 rounded hover:bg-gray-400"
            >
              Cancelar
            </button>
            <button
              onClick={async () => {
                await deletePublication(id);
                closeToast();
              }}
              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
            >
              Confirmar
            </button>
          </div>
        </div>
      ),
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        closeButton: false,
      },
    );
  };

  const deletePublication = async (id) => {
    try {
      const res = await fetch(`http://localhost:3000/publications/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error();

      setPosts((prev) => prev.filter((p) => p.ID_Publication !== id));
      notifySuccessAdd("¡Publicación eliminada!");
    } catch (err) {
      console.error(err);
      notifyError("No se pudo eliminar la publicación.");
    }
  };

  return (
    <div className="min-h-screen bg-[#FDE7B9] pt-24 pb-6 flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="bg-[#40250D] p-8 rounded-xl mb-24 text-center shadow-lg">
          <h2 className="text-4xl font-bold text-[#FDE7B9] font-poppins">
            Mis Publicaciones
          </h2>
        </div>
      </motion.div>

      {!posts || posts.length === 0 ? (
        <p className="text-[#401809] font-poppins text-xl">
          No hay publicaciones disponibles.
        </p>
      ) : (
        <div className="max-w-6xl w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 justify-items-center">
          {posts.map((post, index) => (
            <motion.div
              key={post.ID_Publication}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="relative bg-gradient-to-br from-[#FDE7B9] to-[#401809] rounded-xl border border-[#363738] shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <img
                src={post.ImageUrl}
                alt={post.Title}
                className="h-[290px] w-[290px] object-cover rounded-t-xl"
              />
              <div className="p-4 text-[#401809] font-poppins">
                <h2 className="text-xl font-bold mb-2">{post.Title}</h2>
                <p>
                  <strong>Marca:</strong> {post.Brand}
                </p>
                <p>
                  <strong>Precio:</strong> ${post.Price}
                </p>
                <p>
                  <strong>Estado:</strong> {post.State}
                </p>
              </div>

              <div className="absolute top-2 left-2 flex space-x-[130px]">
                <button
                  onClick={() => handleDelete(post.ID_Publication)}
                  className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition"
                  aria-label={`Eliminar publicación ${post.Title}`}
                >
                  Eliminar
                </button>
                <button
                  onClick={() => openEditor(post)}
                  className="bg-[#363738] text-[#FFE0C4] px-3 py-1 rounded-md hover:bg-[#292a2b] transition"
                  aria-label={`Editar publicación ${post.Title}`}
                >
                  Editar
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {editingPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#FDE7B9] rounded-xl p-8 shadow-2xl w-[90%] max-w-lg relative"
          >
            <button
              onClick={closeEditor}
              className="absolute top-4 right-4 text-[#401809] text-xl font-bold"
            >
              ×
            </button>
            <h3 className="text-2xl font-bold text-[#401809] mb-6 text-center font-poppins">
              Editar Publicación
            </h3>
            <div className="flex flex-col gap-3">
              <input
                name="Title"
                value={formData.Title || ""}
                onChange={handleChange}
                placeholder="Título"
                className="p-2 rounded border border-[#401809]"
              />
              <input
                name="Brand"
                value={formData.Brand || ""}
                onChange={handleChange}
                placeholder="Marca"
                className="p-2 rounded border border-[#401809]"
              />
              <input
                name="Price"
                value={formData.Price || ""}
                onChange={handleChange}
                placeholder="Precio"
                type="number"
                className="p-2 rounded border border-[#401809]"
              />
              {/* Imagen e input file alineados horizontalmente */}
              <div className="flex flex-row items-center gap-4 sm:gap-6">
                <div className="shrink-0">
                  <img
                    src={previewUrl || formData.ImageUrl}
                    alt="Previsualización de imagen de publicación"
                    className="
    h-40 w-40 object-cover rounded-md border border-black self-center
    [image-orientation:from-image]          
    bg-[#f5e9cf]                            
  "
                    onError={(e) => {
                      // Si la URL remota rompe, evitamos loop de error
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
                <div className="w-full flex-1">
                  <input
                    ref={fileInputRef}
                    id="image-input"
                    type="file"
                    name="Image"
                    accept="image/*"
                    onChange={handleChange}
                    aria-invalid={!!errorImg}
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
                  />
                </div>
              </div>

              <textarea
                name="DescriptionProduct"
                value={formData.DescriptionProduct || ""}
                onChange={handleChange}
                placeholder="Descripción"
                className="p-2 rounded border border-[#401809]"
              />
              <input
                name="Sku"
                value={formData.Sku || ""}
                onChange={handleChange}
                placeholder="SKU"
                className="p-2 rounded border border-[#401809]"
              />
              <select
                name="State"
                value={formData.State || ""}
                onChange={handleChange}
                className="p-2 rounded border border-[#401809]"
              >
                {/* Reparar este select */}
                <option value="nuevo">Nuevo</option>
                <option value="usado">Usado</option>
                <option value="Poco usado">Poco usado</option>
                <option value="Reparado">Reparado</option>
              </select>
              <button
                onClick={handleSave}
                className="mt-4 bg-[#401809] text-[#FDE7B9] px-4 py-2 rounded hover:bg-[#2e1005] transition"
              >
                Guardar cambios
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MyPosts;
