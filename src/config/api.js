const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  getAuthHeader() {
    const token = localStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
        ...options.headers,
      },
      ...options,
    };

    // Don't set Content-Type for FormData
    if (options.body instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth methods
  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async googleAuth(idToken) {
    return this.request('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // Posts methods
  async createPost(postData) {
    const formData = new FormData();
    formData.append('content', postData.content);
    if (postData.image) {
      formData.append('image', postData.image);
    }

    return this.request('/posts', {
      method: 'POST',
      body: formData,
    });
  }

  async getFeed(page = 1, limit = 10) {
    return this.request(`/posts/feed?page=${page}&limit=${limit}`);
  }

  async getPost(postId) {
    return this.request(`/posts/${postId}`);
  }

  async deletePost(postId) {
    return this.request(`/posts/${postId}`, {
      method: 'DELETE',
    });
  }

  async likePost(postId) {
    return this.request(`/posts/${postId}/like`, {
      method: 'POST',
    });
  }

  // Comments methods
  async getComments(postId, page = 1, limit = 20) {
    return this.request(`/comments/post/${postId}?page=${page}&limit=${limit}`);
  }

  async addComment(postId, content) {
    return this.request(`/comments/post/${postId}`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  async deleteComment(commentId) {
    return this.request(`/comments/${commentId}`, {
      method: 'DELETE',
    });
  }

  // Users methods
  async getUserProfile(userId) {
    return this.request(`/users/${userId}`);
  }

  async updateProfile(profileData) {
    const formData = new FormData();
    
    if (profileData.name) formData.append('name', profileData.name);
    if (profileData.bio) formData.append('bio', profileData.bio);
    if (profileData.profileImage) formData.append('profileImage', profileData.profileImage);

    return this.request('/users/profile', {
      method: 'PUT',
      body: formData,
    });
  }

  async followUser(userId) {
    return this.request(`/users/${userId}/follow`, {
      method: 'POST',
    });
  }

  async getUserSuggestions(limit = 10) {
    return this.request(`/users/suggestions/list?limit=${limit}`);
  }

  async searchUsers(query, limit = 20) {
    return this.request(`/users/search/${encodeURIComponent(query)}?limit=${limit}`);
  }
}

const apiClient = new ApiClient();
export default apiClient;