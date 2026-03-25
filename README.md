🚀 FlowDesk
Una plataforma de alto rendimiento para la gestión y analítica de flujos de trabajo, construida con un enfoque en la velocidad de respuesta, integración de datos en tiempo real y una arquitectura moderna de servidor.

Live Demo: https://flow-desk-murex.vercel.app/

🛠️ Stack Tecnológico
Este proyecto utiliza herramientas de vanguardia para garantizar escalabilidad y un rendimiento óptimo:

Astro: Framework principal para un renderizado híbrido (SSR) ultrarrápido.

Supabase: Backend-as-a-Service para gestión de autenticación y base de datos PostgreSQL.

React: Biblioteca para la construcción de dashboards e interfaces dinámicas.

TypeScript: Tipado estático para asegurar un código robusto y libre de errores.

Tailwind CSS: Framework de utilidades para un diseño moderno y totalmente responsivo.

✨ Características Principales
⚡ Server-Side Rendering (SSR): Generación de páginas en el servidor para una entrega inmediata de datos dinámicos.

🔐 Auth Segura: Flujo completo de registro e inicio de sesión gestionado por Supabase.

📊 Dashboard Interactivo: Visualización de métricas críticas mediante componentes de analítica optimizados.

📱 Diseño Adaptive: Interfaz fluida y optimizada para dispositivos móviles, tablets y desktop.

🛡️ Type Safe: Desarrollo protegido mediante interfaces y modelos de datos rigurosos.

📂 Estructura del Proyecto
Bash
src/
├── components/     # Componentes React y Astro (.astro, .tsx)
├── layouts/        # Plantillas base y envoltorios de página
├── lib/            # Configuración de clientes (Supabase, etc.)
├── pages/          # Enrutamiento basado en archivos (Astro Router)
├── styles/         # Directivas globales de Tailwind y CSS
public/             # Activos estáticos (imágenes, iconos, fuentes)
astro.config.mjs    # Configuración de Astro y adaptadores (Vercel)
🚀 Instalación y Configuración
Para replicar este entorno localmente, sigue estos pasos:

Clonar y acceder:

Bash
git clone https://github.com/Jdiez93/FlowDesk.git
cd FlowDesk
Instalar dependencias:

Bash
npm install
Variables de Entorno: Crea un archivo .env con tus credenciales de Supabase:

Fragmento de código
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
Levantar el proyecto:

Bash
npm run dev
Desarrollado con precisión técnica por Jdiez93
