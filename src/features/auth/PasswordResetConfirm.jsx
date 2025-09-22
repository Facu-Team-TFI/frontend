import { useNavigate, Link } from "react-router";
import { useState } from "react";
import { useEffect } from "react";
import { useRef } from "react";
import { useLocation } from "react-router";
import UserValidations from "./UserValidations";
import {
  notifyMissingFields,
  notifySuccessAdd,
} from "../../pages/notification/notification";

import fondo from "../../assets/fondo.png";

const PasswordResetConfirm = () => {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const confirmPasswordRef = useRef(null);
  const passwordRef = useRef(null);
  const refs = {
    passwordRef,
    confirmPasswordRef,
  };
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState("");

  //Obtenemos el token
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenFromUrl = params.get("token");

    if (!tokenFromUrl) {
      console.warn("Token no encontrado en la URL.");
    }

    setToken(tokenFromUrl || "");
  }, [location.search]);

  //Maneja constantemente los cambios de los inputs
  function changeHandler(event) {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    const newErrors = UserValidations({ datos: formData, refs }); // Hay que crear una variable extra, ya que el estado no se actualiza instantáneamente
    setErrors(newErrors);
    if (Object.keys(newErrors).length !== 0) {
      console.warn("Formulario inválido. No se enviará.");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:3000/auth/reset-password?token=${token}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.message || "Error desconocido al restablecer contraseña"
        );
      }

      const data = await res.json();

      if (!data.success) {
        notifyMissingFields(data.message);
        return;
      }

      notifySuccessAdd(data.message);
      setFormData({
        password: "",
        confirmPassword: "",
      });
      navigate("/");
    } catch (error) {
      console.log(error.message);
      notifyMissingFields("Error: " + error.message);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="w-full max-w-md mx-auto px-8 py-12 lg:w-1/2 flex flex-col justify-center">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <svg
            className="h-8 w-8 text-[#40250D]"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 0L10.59 1.41 18.17 9H0v2h18.17l-7.58 7.59L12 24l12-12L12 0z" />
          </svg>
        </div>

        {/* Heading */}
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Recupere su contraseña
        </h2>
        <p className="text-sm text-center text-[#40250D] mb-8">
          ¿No sos miembro?{" "}
          <Link
            to="/Register"
            className="font-semibold underline hover:opacity-80"
          >
            Unite a esta aventura
          </Link>
        </p>
        {/* Agregar link para volver al login */}

        {/* Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Nueva contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={changeHandler}
              ref={passwordRef}
              autoComplete="password"
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {errors.password && (
            <p className="text-red-600 text-sm">{errors.password}</p>
          )}

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Repita la contraseña
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={changeHandler}
              ref={confirmPasswordRef}
              autoComplete="confirmPassword"
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {errors.confirmPassword && (
            <p className="text-red-600 text-sm">{errors.confirmPassword}</p>
          )}

          <button
            type="submit"
            className="w-full bg-[#40250D] hover:bg-[#2f1a09] text-white font-semibold py-2 px-4 rounded"
          >
            Actualizar
          </button>
        </form>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:block lg:w-1/2">
        <img
          className="h-full w-[1490px] object-cover"
          src={fondo} // Cambia esto por el path de tu imagen
          alt="Login visual"
        />
      </div>
    </div>
  );
};

export default PasswordResetConfirm;
