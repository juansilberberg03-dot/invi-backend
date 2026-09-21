// api/chat.js
// Backend seguro para el chat INVI — pensado para desplegar en Vercel (gratis para este volumen).
// La clave de la API de Anthropic vive SOLO aquí, nunca en el HTML público.
//
// PASOS PARA PONERLO EN MARCHA:
// 1. Crea una cuenta en vercel.com (gratis) y en console.anthropic.com (para tu clave de API).
// 2. Sube esta carpeta a un repositorio de GitHub, o instala Vercel CLI y ejecuta "vercel" dentro de ella.
// 3. En el panel de Vercel del proyecto, ve a Settings → Environment Variables y añade:
//      ANTHROPIC_API_KEY = tu_clave_real_aqui
// 4. Vercel te da una URL, por ejemplo: https://invictum-invi.vercel.app
// 5. En invictum-ortho.html, busca la función initChat() y cambia la llamada a
//    "https://api.anthropic.com/v1/messages" por "https://invictum-invi.vercel.app/api/chat"
//    (te dejo el bloque exacto a sustituir en INSTRUCCIONES.md).

export default async function handler(req, res) {
  // Solo aceptar peticiones POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  // Limitar quién puede llamar a este endpoint (pon aquí tu dominio real cuando lo tengas)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Falta configurar ANTHROPIC_API_KEY en Vercel' });
  }

  try {
    const { messages, system } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Falta el array "messages"' });
    }
    // Límite básico para evitar abuso/costes descontrolados
    if (messages.length > 20) {
      return res.status(400).json({ error: 'Conversación demasiado larga' });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 700,
        system: system || undefined,
        messages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Error de la API de Anthropic:', data);
      return res.status(response.status).json({ error: 'Error al contactar con el asistente' });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('Error en el proxy de chat:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
