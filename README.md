🚀 FlowDesk
FlowDesk es una plataforma moderna de gestión y análisis de flujos de trabajo diseñada para ofrecer una experiencia de usuario rápida, intuitiva y eficiente. Construida con el framework Astro y potenciada por Supabase, la aplicación permite gestionar datos en tiempo real con un rendimiento óptimo.

✨ Características
SSR (Server-Side Rendering): Renderizado en el servidor mediante Astro para una velocidad de carga superior.

Autenticación Robusta: Gestión de usuarios segura integrada con Supabase Auth.

Dashboard de Analíticas: Visualización de datos interactiva utilizando componentes de gráficos optimizados.

Base de Datos en Tiempo Real: Persistencia de datos inmediata con PostgreSQL vía Supabase.

Diseño Responsivo: Interfaz adaptativa diseñada para ofrecer la mejor experiencia en cualquier dispositivo.

🛠️ Stack Tecnológico
Frontend: Astro + React/Tailwind CSS

Backend as a Service: Supabase (Auth & Database)

Despliegue: Vercel

Gráficos: Recharts / Lucide Icons

⚙️ Configuración Local
Clonar el repositorio:

Bash
git clone https://github.com/Jdiez93/FlowDesk.git
cd FlowDesk
Instalar dependencias:

Bash
npm install
Variables de Entorno:
Crea un archivo .env en la raíz del proyecto y añade tus credenciales:

Fragmento de código
SUPABASE_URL=tu_url_de_supabase
SUPABASE_ANON_KEY=tu_llave_anon_de_supabase
Ejecutar en desarrollo:

Bash
npm run dev
📦 Despliegue
El proyecto está configurado para desplegarse automáticamente en Vercel al hacer push a la rama main.

Nota: Es indispensable configurar las variables de entorno en el panel de Vercel (Settings > Environment Variables) para que el adaptador @astrojs/vercel funcione correctamente con Supabase.

Desarrollado con ❤️ por Jdiez93
Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
