import {
  TicketCreate,
  TicketUpdate,
  TicketResponse,
  TicketListResponse,
  TicketListParams
} from '../types/kanban';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZXhwIjoxNzYxMTM5NDc3LCJpYXQiOjE3NjEwNTMwNzd9.Tyumo_rjgFprYmMQtvh87mx5hv4KO55RUwwKMv1CIPA"
class TicketService {
  private getAuthHeaders(): HeadersInit {
    // const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  /**
   * 새로운 Ticket 생성
   */
  async createTicket(data: TicketCreate): Promise<TicketResponse> {
    const response = await fetch(`${API_BASE_URL}/api/tickets/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Failed to create ticket: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Ticket 목록 조회 (필터링 및 페이지네이션)
   */
  async listTickets(params?: TicketListParams): Promise<TicketListResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.project_id) queryParams.append('project_id', params.project_id.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.priority) queryParams.append('priority', params.priority);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const response = await fetch(
      `${API_BASE_URL}/api/tickets/?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: this.getAuthHeaders()
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to list tickets: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * 특정 Ticket 조회
   */
  async getTicket(ticketId: number): Promise<TicketResponse> {
    const response = await fetch(`${API_BASE_URL}/api/tickets/${ticketId}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to get ticket: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Ticket 정보 수정
   */
  async updateTicket(
    ticketId: number,
    data: TicketUpdate
  ): Promise<TicketResponse> {
    const response = await fetch(`${API_BASE_URL}/api/tickets/${ticketId}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Failed to update ticket: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Ticket 삭제
   */
  async deleteTicket(ticketId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/tickets/${ticketId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to delete ticket: ${response.statusText}`);
    }
  }
}

export const ticketService = new TicketService();
export default ticketService;