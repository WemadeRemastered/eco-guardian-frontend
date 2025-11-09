import {HttpService} from "../../../shared/services/http-common.ts";
export class ProfileService extends HttpService{

    async updateProfile(id: number, request: any) {
        return await this.http.put(`/profiles/${id}`, request,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
    }

    async getProfileByEmail(email: string) {
        return await this.http.get(`/profiles`, { params: { email } });
    }
}