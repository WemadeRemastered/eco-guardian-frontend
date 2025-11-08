import { defineStore } from "pinia";
import router from "../../../router";
import { AuthService } from "../../infrastructure/services/auth.service";
import type { UserData } from "../../../public/utils/interfaces/user-data";
import { getClaimType } from "../../../public/utils/helpers/decodeTokenHelper.ts";

const authService = new AuthService();

const getInitialUserData = () => {
  try {
    const auth0User = localStorage.getItem("auth0_user");
    if (auth0User) {
      const parsed = JSON.parse(auth0User);
      return {
        user: parsed,
        role: parsed.role || "GUEST",
        id: parsed.id || "",
        isEnterprise: parsed.role === "Business",
        isSpecialist: parsed.role === "Specialist",
        isAdmin: parsed.role === "Admin"
      };
    }

    const token = localStorage.getItem("token");
    if (token) {
      const role = getClaimType("role", token) || "GUEST";
      return {
        user: localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")!) : null,
        role: role,
        id: getClaimType("sid", token) || "",
        isEnterprise: role === "Business",
        isSpecialist: role === "Specialist",
        isAdmin: role === "Admin"
      };
    }

    return {
      user: null,
      role: "GUEST",
      id: "",
      isEnterprise: false,
      isSpecialist: false,
      isAdmin: false
    };
  } catch (error) {
    console.error("Error loading user data:", error);
    return {
      user: null,
      role: "GUEST",
      id: "",
      isEnterprise: false,
      isSpecialist: false,
      isAdmin: false
    };
  }
};

const initialData = getInitialUserData();

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: initialData.user,
    role: initialData.role,
    id: initialData.id,
    isEnterprise: initialData.isEnterprise,
    isSpecialist: initialData.isSpecialist,
    isAdmin: initialData.isAdmin,
    userData: {} as UserData,
  }),
  actions: {
    async login(email: string, password: string) {
      try {
        const response = await authService.signIn(email, password);
        console.log("Login successful, response:", response.data);
        localStorage.setItem("user", JSON.stringify(response.data));
        localStorage.setItem("token", response.data.token);

        this.updateUserState();
      } catch (error) {
        console.error("Error during login:", error);
        throw error;
      }
    },

    async register({ email, password, roleId }: { email: string; password: string; roleId: number }): Promise<any> {
      try {
        const response = await authService.signUp(email, password, roleId);
        await this.login(email, password);
        return response.data;
      } catch (error) {
        console.error("Error during signup:", error);
        throw error;
      }
    },

    setUserData(user: UserData) {
      this.userData = user;
    },

    updateUserState() {
      const token = localStorage.getItem("token");
      if (token) {
        this.role = getClaimType("role", token) || "GUEST";
        this.id = getClaimType("sid", token) || "";
        this.isEnterprise = this.role === "Business";
        this.isSpecialist = this.role === "Specialist";
        this.isAdmin = this.role === "Admin";
      }
    },

    logout() {
      this.user = null;
      this.role = "GUEST";
      this.id = "";
      this.isEnterprise = false;
      this.isSpecialist = false;
      this.isAdmin = false;

      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("reloaded");
      localStorage.removeItem("auth0_user");

      router.push("/login");
    },
  },
});