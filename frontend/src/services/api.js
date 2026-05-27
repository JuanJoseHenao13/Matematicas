const API_BASE_URL = 'http://localhost:3000/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async register(username, email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ username, email, password })
      });
      const data = await response.json();
      if (data.success) {
        return { success: true, data: data.data };
      }
      return { success: false, error: data.error || 'Error en el registro' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async login(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (data.success) {
        return { success: true, data: data.data };
      }
      return { success: false, error: data.error || 'Error en el login' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getProfile() {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      const data = await response.json();
      if (data.success) {
        return { success: true, data: data.data };
      }
      return { success: false, error: data.error || 'Error al cargar el perfil' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async findMatch() {
    try {
      const response = await fetch(`${API_BASE_URL}/matchmaking/find`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({})
      });
      const data = await response.json();
      if (data.success) {
        return { success: true, data: data.data };
      }
      return { success: false, error: data.error || 'Error buscando partida' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async shoot(gameId, velocity, angleDegrees, direction, weaponId) {
    try {
      const response = await fetch(`${API_BASE_URL}/game/shoot`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          gameId,
          velocity,
          angleDegrees,
          direction,
          weaponId
        })
      });
      const data = await response.json();
      if (data.success) {
        return { success: true, data: data.data };
      }
      return { success: false, error: data.error || 'Error en el disparo' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  logout() {
    this.setToken(null);
  }
}

export default new ApiService();
