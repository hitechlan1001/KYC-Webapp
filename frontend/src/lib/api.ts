// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081';

function authHeaders() {
  const token = localStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const api = {
  // Auth endpoints
  login: (username: string, password: string) =>
    fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    }),
  logout: () =>
    fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: { ...authHeaders() },
    }),
  verify: () =>
    fetch(`${API_BASE_URL}/api/auth/verify`, { headers: { ...authHeaders() } }),

  // KYC endpoints
  submitKYC: (formData: FormData, options?: RequestInit) => 
    fetch(`${API_BASE_URL}/api/kyc/submit`, {
      method: 'POST',
      body: formData,
      ...(options || {}),
    }),

  getKYCStatus: (submissionId: string) =>
    fetch(`${API_BASE_URL}/api/kyc/status/${submissionId}`),

  getKYCSubmissions: (params: URLSearchParams) =>
    fetch(`${API_BASE_URL}/api/kyc/submissions?${params}`, { headers: { ...authHeaders() } }),

  getKYCSubmission: (id: number) =>
    fetch(`${API_BASE_URL}/api/kyc/submission/${id}`, { headers: { ...authHeaders() } }),

  updateKYCStatus: (id: number, data: { status: string; verificationNotes: string }) =>
    fetch(`${API_BASE_URL}/api/kyc/submission/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
      },
      body: JSON.stringify(data),
    }),

  downloadFile: (submissionId: string, fileType: string) =>
    fetch(`${API_BASE_URL}/api/kyc/file/${submissionId}/${fileType}`, { headers: { ...authHeaders() } }),
};

