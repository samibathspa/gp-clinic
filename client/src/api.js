// Reusable functions for talking to the Express API.
// Prompt: "reusable sendGETRequest and sendRequest
// helpers using fetch with async/await and error handling".

// GET request -> parsed JSON. Throws an Error with the server's message on failure.
export async function sendGETRequest(url) {
  return sendRequest(url, 'GET');
}

// Any method (POST, DELETE...) with an optional JSON body
export async function sendRequest(url, method = 'GET', body) {
  let response;
  try {
    response = await fetch(url, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Could not reach the server. Is it running?');
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || `Request failed (${response.status})`);
    error.status = response.status;
    error.fields = data.fields || {};
    throw error;
  }
  return data;
}
