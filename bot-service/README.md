# EvilTokkii Twitch Bot 24/7

Servicio en la nube 24/7 para el canal de Twitch **#eviltokkii** utilizando la cuenta bot **@Eviltokki_exe**.

## Funcionalidades 24/7
- **Mensajes Programados Continuos**: Envía mensajes periódicos con soporte de Anuncios Oficiales (`/announce`) y control de tráfico.
- **Cumpleaños de Viewers**: Detecta automáticamente en tiempo real cuando el cumpleañero escribe en el chat y le envía su saludo.
- **Sincronización en Tiempo Real con Supabase**: Cualquier cambio hecho desde el Builder se actualiza al instante en el bot sin reiniciar.
- **Servidor Healthcheck**: Incluye endpoint `GET /` para monitoreo continuo.

## Despliegue Gratuito en Render.com / Railway
1. Sube este repositorio a GitHub.
2. En [render.com](https://render.com), crea un **New Web Service** conectado a este repositorio con directorio raíz `bot-service`.
3. ¡Listo! El bot estará activo 24/7 los 365 días del año.
