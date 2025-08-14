// API configuration and service functions
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-domain.com' 
  : 'http://localhost:8000'; // Adjust port if your backend uses different port

// API client with error handling
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Authentication endpoints
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async signup(email: string, password: string, name: string) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  // User endpoints
  async getProfile(token: string) {
    return this.request('/user/profile', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async updateProfile(token: string, userData: any) {
    return this.request('/user/profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });
  }

  // Files endpoints (for future use)
  async getFiles(token: string) {
    return this.request('/files', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async downloadFile(fileId: string, token: string) {
    return this.request(`/files/${fileId}/download`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  // Credits endpoints (for future use)
  async getCredits(token: string) {
    return this.request('/user/credits', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async purchaseCredits(token: string, amount: number) {
    return this.request('/credits/purchase', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ amount }),
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export individual functions for easier imports
export const authApi = {
  login: apiClient.login.bind(apiClient),
  signup: apiClient.signup.bind(apiClient),
  logout: apiClient.logout.bind(apiClient),
};

export const userApi = {
  getProfile: apiClient.getProfile.bind(apiClient),
  updateProfile: apiClient.updateProfile.bind(apiClient),
  getCredits: apiClient.getCredits.bind(apiClient),
};

export const filesApi = {
  getFiles: apiClient.getFiles.bind(apiClient),
  downloadFile: apiClient.downloadFile.bind(apiClient),
};

export const creditsApi = {
  getCredits: apiClient.getCredits.bind(apiClient),
  purchaseCredits: apiClient.purchaseCredits.bind(apiClient),
};

// Type definitions (adjust based on your backend response structure)
export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'user';
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  credits: number;
}

export interface ApiError {
  message: string;
  code?: string;
}