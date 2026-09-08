/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

interface ThemeContextType {
  modoEscuro: boolean;
  setModoEscuro: (ativo: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);

export function ThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [modoEscuro, setModoEscuroState] = useState(false);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    const temaSalvo = localStorage.getItem("tutorai_tema");

    if (temaSalvo === "dark") {
      setModoEscuroState(true);
    } else if (temaSalvo === "light") {
      setModoEscuroState(false);
    } else {
      const prefereEscuro = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;

      setModoEscuroState(prefereEscuro);
    }

    setCarregado(true);
  }, []);

  useEffect(() => {
    if (!carregado) return;

    const html = document.documentElement;

    if (modoEscuro) {
      html.classList.add("dark");
      html.style.colorScheme = "dark";
      localStorage.setItem("tutorai_tema", "dark");
    } else {
      html.classList.remove("dark");
      html.style.colorScheme = "light";
      localStorage.setItem("tutorai_tema", "light");
    }
  }, [modoEscuro, carregado]);

  function setModoEscuro(ativo: boolean) {
    setModoEscuroState(ativo);
  }

  return (
    <ThemeContext.Provider
      value={{
        modoEscuro,
        setModoEscuro,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme deve ser usado dentro de ThemeProvider"
    );
  }

  return context;
}