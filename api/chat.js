// api/chat.js
// Backend seguro para el chat INVI — pensado para desplegar en Vercel (gratis para este volumen).
// La clave de la API de Anthropic vive SOLO aquí, nunca en el HTML público.

export default async function handler(req, res) {
  // Cabeceras CORS primero de todo, para que la petición previa (OPTIONS) del
  // navegador no se rechace antes de llegar a comprobar el método.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Solo aceptar peticiones POST reales
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

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
