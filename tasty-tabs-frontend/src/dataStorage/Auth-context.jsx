/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback, useContext, useMemo } from "react";
import { getUser } from "./api";
let logoutTimer;

const AuthContext = React.createContext({
    token: "",
    isLoggedIn: false,
    user: null,
    login: (token, expirationTime) => { },
    logout: () => { },
});

const calculateRemainingTime = (expirationTime) => {
    const currentTime = new Date().getTime();
    const adjExpirationTime = new Date(expirationTime).getTime();
    return adjExpirationTime - currentTime;
};

const retrieveStoredToken = () => {
    const storedToken = localStorage.getItem("user_id");
    const storedExpirationDate = localStorage.getItem("expirationTime");

    if (!storedToken || !storedExpirationDate) {
        return null;
    }

    const remainingTime = calculateRemainingTime(storedExpirationDate);

    if (remainingTime <= 6000) {
        localStorage.removeItem("user_id");
        localStorage.removeItem("expirationTime");
        return null;
    }

    return {
        token: storedToken,
        duration: remainingTime,
    };
};

export const AuthContextProvider = (props) => {
    // Compute stored token data only once when the component mounts.
    const tokenData = useMemo(() => retrieveStoredToken(), []);
    const initialToken = tokenData ? tokenData.token : null;

    const [token, setToken] = useState(initialToken);
    const [user, setUser] = useState(null);

    const userIsLoggedIn = !!token;

    const logoutHandler = useCallback(() => {
        setToken(null);
        setUser(null);
        localStorage.removeItem("user_id");
        localStorage.removeItem("expirationTime");
        if (logoutTimer) {
            clearTimeout(logoutTimer);
        }
    }, []);

    // Memoize fetchUser so its reference remains stable.
    const fetchUser = useCallback(async (user_id) => {
        try {
            const response = await getUser(user_id);
            setUser(response.user);
        } catch (error) {
            console.error("Error fetching user:", error);
        }
    }, []);

    const loginHandler = useCallback(
        async (token, expirationTime) => {
            setToken(token);
            localStorage.setItem("user_id", token);
            localStorage.setItem("expirationTime", expirationTime);
            await fetchUser(token);
            const remainingTime = calculateRemainingTime(expirationTime);
            logoutTimer = setTimeout(logoutHandler, remainingTime);
        },
        [fetchUser, logoutHandler]
    );

    // On mount: if we have token data, set the logout timer.
    useEffect(() => {
        if (tokenData) {
            logoutTimer = setTimeout(logoutHandler, tokenData.duration);
        }
    }, [tokenData, logoutHandler]);

    // Only fetch user if token exists and user is not yet set.
    useEffect(() => {
        if (token && !user) {
            fetchUser(token);
        }
    }, [token, user, fetchUser]);

    const contextValue = {
        token,
        isLoggedIn: userIsLoggedIn,
        user,
        login: loginHandler,
        logout: logoutHandler,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {props.children}
        </AuthContext.Provider>
    );
};

export default AuthContext;


