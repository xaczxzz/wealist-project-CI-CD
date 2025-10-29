
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZXhwIjoxNzYxMTQwMTQyLCJpYXQiOjE3NjEwNTM3NDJ9.hLA-qgb4RfyEkSUM1Iymivp1GdxWzlRst34SNbAhznU"

class HealthService {
    static checkHealth() {
        throw new Error('Method not implemented.');
    }
    private getAuthHeaders(): HeadersInit {
        return {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        };
      }

     async checkHealth(): Promise<Response> {
        const response = await fetch(
          `${API_BASE_URL}/health`,
          {
            method: 'GET',
            headers: this.getAuthHeaders()
          }
        );
    
        if (!response.ok) {
          throw new Error(`Failed to list workspaces: ${response.statusText}`);
        }
    
        return response.json();
      }
    
    
}


export const healthService = new HealthService();
export default healthService;