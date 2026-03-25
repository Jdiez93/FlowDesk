# 🚀 FlowDesk

**FlowDesk** es una plataforma de alto rendimiento dedicada a la **visualización y gestión de flujos de trabajo**. Construida con un enfoque en la velocidad, el procesamiento en servidor y una experiencia de usuario fluida.

**Live Demo:** [https://flow-desk-murex.vercel.app/](https://flow-desk-murex.vercel.app/)

---

## 🛠️ Stack Tecnológico

Este proyecto utiliza herramientas de vanguardia para maximizar la eficiencia en el desarrollo y la optimización en el cliente:

* **Astro:** Framework principal para lograr una carga ultrarrápida mediante renderizado híbrido (SSR).
* **Supabase:** Backend-as-a-Service para la gestión de autenticación y base de datos PostgreSQL.
* **React:** Biblioteca para la construcción de componentes de interfaz dinámicos y dashboards.
* **TypeScript:** Tipado estático para garantizar la robustez y escalabilidad del código.
* **Tailwind CSS:** Framework de utilidades para un diseño moderno, responsivo y mantenible.

---

## ✨ Características Principales

* **⚡ Server-Side Rendering (SSR):** Generación de páginas en el servidor para entrega inmediata de datos.
* **🔐 Autenticación Segura:** Gestión de usuarios e inicio de sesión protegido mediante Supabase Auth.
* **📊 Dashboard de Analíticas:** Visualización de métricas críticas con componentes interactivos.
* **📱 Diseño Adaptive:** Interfaz totalmente optimizada para dispositivos móviles, tablets y desktop.
* **🛡️ Type Safe:** Desarrollo seguro mediante interfaces y tipos personalizados de TypeScript.

---

## 📂 Estructura del Proyecto

```bash
src/
├── components/     # Componentes React y Astro (.astro, .tsx)
├── layouts/        # Plantillas base para las páginas
├── lib/            # Configuración de clientes (Supabase, API)
├── pages/          # Enrutamiento basado en archivos (Astro Router)
├── styles/         # Configuraciones globales de Tailwind
public/             # Activos estáticos (imágenes, fuentes)
astro.config.mjs    # Configuración de Astro y adaptadores (Vercel)
