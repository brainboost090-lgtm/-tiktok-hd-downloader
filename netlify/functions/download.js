exports.handler = async () => {
  return {
    statusCode: 501,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      error: "Download service is not configured yet"
    })
  };
};
