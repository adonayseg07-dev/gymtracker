# GymTracker

App web (React + Vite + Supabase) para rutinas, entrenamientos y progreso.

## 1. Supabase
1. Crea un proyecto en https://supabase.com.
2. SQL Editor → pega y ejecuta `supabase/schema.sql` (tablas, índices y RLS).
3. Authentication → Providers → Email. Para pruebas rápidas puedes desactivar "Confirm email".
4. Project Settings → API: copia **Project URL** y la clave **anon public**. Nunca uses la `service_role` en el frontend.

## 2. Replit
1. Create Repl → Import → sube el ZIP descomprimido (o arrastra los archivos).
2. Tools → Secrets: agrega `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` con los valores del paso anterior.
3. Terminal: `npm install` y luego Run (`npm run dev`, puerto 5000).
4. Para publicar: Deploy → Autoscale/Cloud Run (usa `npm run build` y `npm run preview`).
En local: copia `.env.example` a `.env` y completa los valores.

## Estado y pendientes
- Funciona: registro/login, perfil, equipo, biblioteca (27 ejercicios), rutinas manuales (crear/editar/eliminar), modo entrenamiento con guardado automático, historial, gráficos y panel.
- NO incluido aún: generador de rutinas con IA. Requiere una Supabase Edge Function que llame a la API de un modelo con la clave guardada como secreto del servidor (nunca en el frontend), recibiendo perfil + equipo + ejercicios disponibles.
- La biblioteca es ampliable en `src/data.js`.

## Versión instalable (PWA) y uso sin conexión
- **Publicar:** en Replit usa Deploy (HTTPS es obligatorio para instalar). `npm run dev` NO activa el modo sin conexión; para probarlo localmente usa `npm run build && npm run preview`.
- **Instalar en Android (Chrome):** menú ⋮ → Instalar app / Añadir a pantalla de inicio.
- **Instalar en iPhone (Safari):** botón Compartir → Añadir a pantalla de inicio.
- **Sin conexión:** abre la app una vez con internet (se guarda en el dispositivo). Después puedes ver rutinas y ejercicios, entrenar y registrar series sin señal. Los cambios se guardan en el dispositivo y se envían a Supabase al reconectar (se muestra un aviso arriba).
- **Límites:** no se puede iniciar sesión ni crear cuenta sin conexión; si dos dispositivos editan lo mismo sin conexión, gana el último que sincroniza; si borras los datos del navegador antes de sincronizar, esos cambios se pierden.
