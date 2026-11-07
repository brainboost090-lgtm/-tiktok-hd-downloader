exports.handler = async (event) => {
  const raw = event.queryStringParameters?.url;

  if (!raw) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "TikTok URL is required" })
    };
  }

  try {
    const input = new URL(raw);

    const allowed = (host) =>
      host === "tiktok.com" || host.endsWith(".tiktok.com");

    if (!allowed(input.hostname)) {
      throw new Error("Only TikTok URLs are allowed");
    }

    const response = await fetch(input.href, {
      redirect: "follow",
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    const finalUrl = new URL(response.url);

    if (!allowed(finalUrl.hostname)) {
      throw new Error("Invalid redirect");
    }

    return {
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url: finalUrl.href })
    };

  } catch (error) {
    return {
      statusCode: 502,
      body: JSON.stringify({
        error: "TikTok short link could not be resolved"
      })
    };
  }
};
