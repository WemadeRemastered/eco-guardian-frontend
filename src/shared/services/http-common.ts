import axios, { type AxiosInstance } from "axios";

export class HttpService {
    protected http: AxiosInstance;

    constructor() {
        this.http = axios.create({
            baseURL: "http://localhost:9080/api/v1",
            headers: {
                "Content-Type": "application/json",
                "Accept": "*/*",
            },
        });
        this.http.interceptors.request.use(
            (config) => {
                const auth0Data = localStorage.getItem("@@auth0spajs@@::KoXJKt39hQKpCInZVzyNyLhRVzD5meJh::@@user@@")
                if (auth0Data){
                    try{
                        const parsedData = JSON.parse(auth0Data);
                        const token = parsedData.id_token;
                        if (token) {
                            config.headers.Authorization = `Bearer ${token}`;
                        }
                    } catch (error) {
                        console.error("Error parsing Auth0 data:", error);
                    }
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );
    }
}
