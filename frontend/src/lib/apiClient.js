const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const buildUrl = (path) => {
  return API_BASE_URL ? `${API_BASE_URL}${path}` : path;
};

async function request(path, options = {}) {
  const url = buildUrl(path);
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export function getEntities(entityName) {
  return request(`/api/${entityName}`);
}

export function getEntityById(entityName, id) {
  return request(`/api/${entityName}/${id}`);
}

export function createEntity(entityName, payload) {
  return request(`/api/${entityName}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateEntity(entityName, id, payload) {
  return request(`/api/${entityName}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deleteEntity(entityName, id) {
  return request(`/api/${entityName}/${id}`, {
    method: 'DELETE',
  });
}
