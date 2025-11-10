import { defineStore } from "pinia";
import router from "../../../router";
import type { UserData } from "../../../public/utils/interfaces/user-data";

const getInitialUserData = () => {
  try {
    const auth0User = localStorage.getItem("auth0_user");
    if (auth0User) {
      const parsed = JSON.parse(auth0User);
      return {
        user: parsed,
        email: parsed.email,
        role: parsed.role || "GUEST",
        id: parsed.id || "",
        isEnterprise: parsed.role === "Business",
        isSpecialist: parsed.role === "Specialist",
        isAdmin: parsed.role === "Admin"
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
    email: initialData.email,
    id: initialData.id,
    isEnterprise: initialData.isEnterprise,
    isSpecialist: initialData.isSpecialist,
    isAdmin: initialData.isAdmin,
    userData: {} as UserData,
  }),
  actions: {

    setUserData(user: UserData) {
      this.userData = user;
    },


    logout() {
      this.user = null;
      this.role = "GUEST";
      this.id = "";
      this.isEnterprise = false;
      this.isSpecialist = false;
      this.isAdmin = false;

      localStorage.clear();

      router.push("/login");
    },
  },
});