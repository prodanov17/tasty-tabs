import { useContext } from "react";
import AuthContext from "./Auth-context";

export const useAuth = () => {
    return useContext(AuthContext);
};


