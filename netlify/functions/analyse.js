
export async function handler(event) {
  try {
    const { entries } = JSON.parse(event.body || "{}");
console.log(entries);
    if (!entries) {
      return { statusCode: 400, body: "Keine Einträge übergeben" };
    }

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
              "Du bist eine KI, die Stimmungseinträge analysiert und Trends erkennt. Du bekommst Objekte, die mood und symptoms enthalten. mood ist von 1-5. wobei 1 das schlechteste und 5 das beste ist.
              Gib eine kurze, freundliche Auswertung in natürlicher Sprache."
          },
          {
            role: "user",
            content: `Analysiere diese Stimmungseinträge:\n${JSON.stringify(entries)}`
          }
        ]
      })
    });

    const data = await response.json();

    const summary = data.choices?.[0]?.message?.content || "Keine Analyse möglich.";

    return {
      statusCode: 200,
      body: JSON.stringify({ summary })
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: String(err) };
  }
}




