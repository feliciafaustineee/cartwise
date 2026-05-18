export async function fetcher(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
    });

    const data = await response.json();

    return {
      ok: response.ok,
      data,
    };
  } catch (error) {
    console.error("Fetcher Error:", error);

    return {
      ok: false,
      data: {
        error: "Cannot connect to server.",
      },
    };
  }
}