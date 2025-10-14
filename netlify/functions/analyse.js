import fetch from "node-fetch";

// Diese Funktion wird von Netlify automatisch erkannt
export async function handler(event) {
  try {
    // JSON aus dem Request (vom Browser)
    const { entries } = JSON.parse(event.body || "{}");

    if (!entries) {
      return { statusCode: 400, body: "Keine Einträge übergeben" };
    }

    // Anfrage an OpenAI schicken
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Du bist eine KI, die Stimmungseinträge analysiert und Trends erkennt. Gib eine kurze, freundliche Auswertung in natürlicher Sprache."
          },
          {
            role: "user",
            content: `Analysiere diese Stimmungseinträge:\n${JSON.stringify(entries)}`
          }
        ]
      })
    });

    const data = await response.json();

    // Die Antwort von OpenAI (Text)
    const summary = data.choices?.[0]?.message?.content || "Keine Analyse möglich.";

    // Ergebnis an den Browser zurückgeben
    return {
      statusCode: 200,
      body: JSON.stringify({ summary })
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: String(err) };
  }
}
