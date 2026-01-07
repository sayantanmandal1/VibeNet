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
    console.log('🌐 API Request:', { url, method: options.method || 'GET', body: options.body });
    
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
      console.log('📡 API Response:', { status: response.status, statusText: response.statusText, url });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ API Error Response:', { status: response.status, errorData });
        
        // Handle specific error cases
        if (response.status === 401) {
          // Token expired or invalid - clear auth and redirect to login
          localStorage.removeItem('authToken');
          window.location.href = '/login';
          throw new Error('Authentication required. Please log in again.');
        }
        
        if (response.status === 404) {
          throw new Error(errorData.error || 'Resource not found');
        }
        
        if (response.status === 403) {
          throw new Error(errorData.error || 'Access denied');
        }
        
        if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        }
        
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('✅ API Success Response:', responseData);
      return responseData;
    } catch (error) {
      console.error('💥 API request failed:', error);
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

  async getCurrentUserProfile() {
    return this.request('/users/profile');
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

  async getUserProfileByUsername(username) {
    return this.request(`/users/profile/${username}`);
  }

  async checkUsernameAvailability(username) {
    return this.request('/users/check-username', {
      method: 'POST',
      body: JSON.stringify({ username }),
    });
  }

  async checkEmailAvailability(email) {
    return this.request('/auth/check-email', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async updateProfile(profileData) {
    const formData = new FormData();
    
    if (profileData.name) formData.append('name', profileData.name);
    if (profileData.username) formData.append('username', profileData.username);
    if (profileData.email) formData.append('email', profileData.email);
    if (profileData.phoneNumber) formData.append('phoneNumber', profileData.phoneNumber);
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
    return this.request(`/users/suggestions?limit=${limit}`);
  }

  async searchUsers(query, limit = 20) {
    return this.request(`/users/search/${encodeURIComponent(query)}?limit=${limit}`);
  }

  // Friends methods
  async sendFriendRequest(userId) {
    return this.request(`/friends/request/${userId}`, {
      method: 'POST',
    });
  }

  async acceptFriendRequest(requestId) {
    return this.request(`/friends/accept/${requestId}`, {
      method: 'PUT',
    });
  }

  async declineFriendRequest(requestId) {
    return this.request(`/friends/decline/${requestId}`, {
      method: 'PUT',
    });
  }

  async removeFriend(friendId) {
    return this.request(`/friends/${friendId}`, {
      method: 'DELETE',
    });
  }

  async getFriendRequests() {
    return this.request('/friends/requests');
  }

  async getFriendsList() {
    return this.request('/friends/list');
  }

  async getFriendshipStatus(userId) {
    return this.request(`/friends/status/${userId}`);
  }
}

const apiClient = new ApiClient();
export default apiClient;