import { HttpService } from "../../../shared/services/http-common.ts";

export class PlantService extends HttpService {
  async getPlantsByUserId(userId: number): Promise<any> {
    try {
      return await this.http.get(`/plants?userId=${userId}`);
    } catch (error) {
      console.error("Error fetching plant by ID:", error);
      throw error;
    }
  }

  async getPlantById(id: number): Promise<any> {
    try {
      console.log("Fetching plant with ID:", id);
      const response = await this.http.get(`/plants/${id}`);
      console.log("Plant data received:", response.data);
      return response.data;
      
    } catch (error) {
      console.error("Error fetching plant by ID:", error);
      throw error;
    }
  }

  async createPlant(request: any): Promise<any> {
    try {
      return await this.http.post("/plants", request, {
        headers: {
          "Content-Type": "multipart/form-data",

        },
      });
    } catch (error: any) {
      console.error("Error creating plant:", error);
      throw error;
    }
  }

  async updatePlant(id: number, request: any): Promise<boolean> {
    try {
      const response = await this.http.put(`/plants/${id}`, request);
      return response.status === 200;
    } catch (error) {
      console.error("Error updating plant:", error);
      return false;
    }
  }

  async deletePlant(id: number): Promise<boolean> {
    try {
      const response = await this.http.delete(`/plants/${id}`);
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }
}
