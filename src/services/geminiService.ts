export async function extractProductInfo(url: string) {
  try {
    const response = await fetch("/api/extract-product", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch product info from proxy");
    }

    return await response.json();
  } catch (error) {
    console.error("Gemini Proxy Fetch Error:", error);
    return null;
  }
}
