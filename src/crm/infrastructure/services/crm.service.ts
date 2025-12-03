import { HttpService } from "../../../shared/services/http-common";
import { QuestionAssemblerService, type CreateQuestionFormRequest } from "./question-assembler.service";

export class CrmService extends HttpService {

  //In this endpoint we need to send FormData
  public async postQuestion(question: CreateQuestionFormRequest): Promise<any> {
   
    
    // Use the FormData method for proper multipart/form-data upload
    const formData = QuestionAssemblerService.toFormDataRequest(question);
    
    try {
      const response = await this.http.post('questions', formData,{
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const transformedQuestion = QuestionAssemblerService.toDomainModel(response.data);

      return {
        success: true,
        data: transformedQuestion
      };
    } catch (error: any) {
      
      if (error.response) {
        console.error("Response error:", error.response.status, error.response.data);
      } else if (error.request) {
        console.error("Request error:", error.request);
      } else {
        console.error("Unknown error:", error.message);
      }
      
      return {
        success: false,
        error: true,
        details: {
          message: error.message || 'Unknown error',
          status: error.response?.status || 0,
          data: error.response?.data || null
        }
      };
    }
  }

  //Gets all questions from the CRM
  public async getConsulting(): Promise<any> {
    try {
      // Realizar la solicitud GET a la API
      const response = await this.http.get(`questions`);

      // Usar el assembler para transformar los datos en objeto Question
      const questions = QuestionAssemblerService.toDomainModelArray(response.data);
      console.log("Transformed questions:", questions);
      return questions;
    } catch (error) {
      console.error("Error fetching crm:", error);
      throw error;
    }
  }
  //Gets one specific question by its ID
  public async getAnswersByQuestionId(questionId: number): Promise<any> {
    try {
      const response = await this.http.get(`questions/${questionId}/answers`);
      console.log("Response from getAnswersByQuestionId (raw data):", response.data);

      // Return a structured result so callers always receive a predictable shape
      return {
        success: true,
        status: response.status,
        data: response.data ?? null
      };
    } catch (error: any) {
      console.error("Error fetching answers by question ID:", error);
      if (error.response) {
        console.error("Response error:", error.response.status, error.response.data);
      } else if (error.request) {
        console.error("Request error:", error.request);
      } else {
        console.error("Unknown error:", error.message);
      }

      return {
        success: false,
        status: error.response?.status || 0,
        error: true,
        data: null,
        details: error.response?.data || error.message
      };
    }
  };

//Posts an answer to a specific question by its ID
  public async postAnswer(answer: any, questionId: number): Promise<any> {
   
    const postAnswer = answer;
    console.log("Transformed question request:", postAnswer);
    
    try {
      const response = await this.http.post(`questions/${questionId}/answers`, postAnswer);
      console.log("Success! Response from consulting service:", response.data);
      return {
        success: true,

        data: response.data
      };
    } catch (error: any) {
      console.error("Error answering in service:", error);
      
      if (error.response) {
        console.error("Response error:", error.response.status, error.response.data);
      } else if (error.request) {
        console.error("Request error:", error.request);
      } else {
        console.error("Unknown error:", error.message);
      }
      
      return {
        success: false,
        error: true,
        details: {
          message: error.message || 'Unknown error',
          status: error.response?.status || 0,
          data: error.response?.data || null
        }
      };
    }
  }

  //Gets questions by plant ID GET
  public async getQuestionsByPlantId(plantId: number): Promise<any> {
    try {
      const response = await this.http.get(`questions/plant/${plantId}`);
      console.log("Questions fetched:", response.data);
      return QuestionAssemblerService.toDomainModelArray(response.data);
    } catch (error) {
      console.error("Error fetching questions by plant ID:", error);
      throw error;
    }
  }

  //Gets questions by user ID GET
  public async getQuestionsByUserId(userId: number): Promise<any> {
    try {
      const response = await this.http.get(`questions/user/${userId}`);
      console.log("Questions fetched:", response.data);
      return QuestionAssemblerService.toDomainModelArray(response.data);
    } catch (error) {
      console.error("Error fetching questions by user ID:", error);
      throw error;
    }
  }

}
