// API base uses relative path — Next.js rewrites will proxy to backend
const API_BASE = '/api';
const API_HOST = '';  // Relative, since Next.js proxy handles it

class ApiService {
  static getToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('rpl_token');
    }
    return null;
  }

  static setToken(token) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('rpl_token', token);
    }
  }

  static removeToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('rpl_token');
      localStorage.removeItem('rpl_user');
    }
  }

  static getUser() {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('rpl_user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  }

  static setUser(user) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('rpl_user', JSON.stringify(user));
    }
  }

  static getImageUrl(path) {
    if (!path) return null;
    // Path is like /uploads/covers/filename.jpg — use relative so Next.js proxy handles it
    return path;
  }

  static async request(endpoint, options = {}) {
    const token = this.getToken();
    const headers = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Don't set Content-Type for FormData (browser does it automatically with boundary)
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const config = {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    };

    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  }

  // Auth
  static async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.data.token);
    this.setUser(data.data.user);
    return data;
  }

  static async register(name, email, password) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  }

  // Users
  static async getProfile() {
    return this.request('/users/me');
  }

  static async uploadProfilePicture(file) {
    const formData = new FormData();
    formData.append('profilePicture', file);
    return this.request('/users/profile-picture', {
      method: 'PUT',
      body: formData,
    });
  }

  // Books
  static async getBooks(params = {}) {
    const searchParams = new URLSearchParams();
    if (params.title) searchParams.set('title', params.title);
    if (params.categoryId) searchParams.set('categoryId', params.categoryId);
    const queryString = searchParams.toString();
    return this.request(`/books${queryString ? `?${queryString}` : ''}`);
  }

  static async createBook(formData) {
    return this.request('/books', {
      method: 'POST',
      body: formData,
    });
  }

  static async updateBook(id, formData) {
    return this.request(`/books/${id}`, {
      method: 'PUT',
      body: formData,
    });
  }

  static async deleteBook(id) {
    return this.request(`/books/${id}`, {
      method: 'DELETE',
    });
  }

  // Categories
  static async getCategories() {
    return this.request('/categories');
  }

  static async createCategory(name) {
    return this.request('/categories', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  static async updateCategory(id, name) {
    return this.request(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name }),
    });
  }

  static async deleteCategory(id) {
    return this.request(`/categories/${id}`, {
      method: 'DELETE',
    });
  }

  // Transactions
  static async getTransactions() {
    return this.request('/transactions');
  }

  static async borrowBook(bookId) {
    return this.request('/transactions/borrow', {
      method: 'POST',
      body: JSON.stringify({ bookId }),
    });
  }

  static async returnBook(transactionId) {
    return this.request(`/transactions/${transactionId}/return`, {
      method: 'PUT',
    });
  }
}

export default ApiService;
