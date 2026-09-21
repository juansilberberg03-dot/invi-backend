# Poner el chat INVI a funcionar fuera de Claude

Ahora mismo el chat de la web llama directamente a `api.anthropic.com` desde el
navegador. Funciona dentro de Claude porque aquí la clave la pone Anthropic por
ti — en vuestro propio dominio no hay ninguna clave, así que el chat fallaría.

Esta carpeta es ese "puente" (backend) que sí puede guardar la clave de forma segura.

## 1. Consigue una clave de API de Anthropic

- Entra en https://console.anthropic.com
- Crea una cuenta (o usa la que ya tengáis) y ve a "API Keys"
- Genera una clave nueva y guárdala — no la pegues nunca en el HTML de la web

Esto tiene un coste de uso (por consulta al chat), separado de tu plan de Claude.ai.
Para el volumen de un chat de una ortopedia, suele ser pocos euros al mes.

## 2. Despliega esta carpeta en Vercel (gratis)

La forma más sencilla, sin usar la terminal:
1. Sube esta carpeta (`invi-backend/`) a un repositorio nuevo en GitHub.
2. Entra en https://vercel.com, conecta tu cuenta de GitHub e importa ese repositorio.
3. Antes de darle a "Deploy", en "Environment Variables" añade:
   - Nombre: `ANTHROPIC_API_KEY`
   - Valor: la clave que sacaste en el paso 1
4. Dale a "Deploy". En un minuto te da una URL parecida a:
   `https://invictum-invi-backend.vercel.app`

## 3. Conecta la web a este backend

Abre el HTML de la web, busca este bloque (función `sendChatMessage` o similar,
dentro de `initChat`):

**Antes:**
```js
const response = await fetch('https://api.anthropic.com/v1/messages', {
  method:'POST',
  headers:{ 'Content-Type':'application/json' },
  body: JSON.stringify({
    model:'claude-sonnet-4-6',
    max_tokens:500,
    system: CHAT_SYSTEM,
    messages: chatHistory
  })
});
```

**Después** (solo cambia la URL de la primera línea, el resto queda igual):
```js
const response = await fetch('https://invictum-invi-backend.vercel.app/api/chat', {
  method:'POST',
  headers:{ 'Content-Type':'application/json' },
  body: JSON.stringify({
    model:'claude-sonnet-4-6',
    max_tokens:500,
    system: CHAT_SYSTEM,
    messages: chatHistory
  })
});
```

Cambia `invictum-invi-backend.vercel.app` por la URL real que te haya dado Vercel.

Pégame ese HTML de vuelta (o dime que lo haga yo si me pasas la URL de Vercel) y
te lo dejo ya conectado.

## Qué hace este backend por ti

- Guarda tu clave de Anthropic sin exponerla nunca al navegador del visitante.
- Limita conversaciones muy largas (más de 20 mensajes) para evitar abusos.
- Si algo falla, devuelve un error controlado en vez de romper el chat.

## Qué NO hace (de momento)

- No limita cuántas veces puede escribir la misma persona por minuto — si el
  chat recibe mucho tráfico y te preocupa el gasto, dímelo y le añadimos un
  límite por IP.
- No guarda el historial de conversaciones en ningún sitio.
