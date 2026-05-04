export const parseError = async (response) => {
  const clone = response.clone();
  let data;

  try {
    data = await response.json();
  } catch {
    const text = await clone.text();
    const titleMatch = text.match(/<title>(.*?)<\/title>/i);

    if (titleMatch?.[1]) {
      return titleMatch[1].replace(/\s*\(\d+\s.*\)$/, "");
    }

    return `Erreur serveur (${response.status})`;
  }

  // 1. erreur simple backend (ex: InvalidOperationException)
  if (data?.message) {
    return data.message;
  }

  // 2. erreurs de validation ASP.NET (ModelState)
  if (typeof data === "object") {
    return Object.entries(data)
      .map(([field, errors]) =>
        Array.isArray(errors)
          ? errors.map(err => `${field}: ${err}`).join("\n")
          : `${field}: ${errors}`
      )
      .join("\n");
  }

  return "Erreur inconnue";
};
