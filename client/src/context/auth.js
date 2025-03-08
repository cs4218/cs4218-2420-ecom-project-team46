// added in import React here, which is required because AuthProvider is a React component.
import React, { useState, useContext, createContext, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState({
        user: null,
        token: "",
    });

    // Problem: If auth.token is empty, axios might send an invalid Authorization header.
    // axios.defaults.headers.common["Authorization"] = auth?.token;
    useEffect(() => {
        if (auth?.token) {
            axios.defaults.headers.common["Authorization"] = auth.token;
        } else {
            delete axios.defaults.headers.common["Authorization"];
        }
    }, [auth]);

    // remove the "eslint-disable-next-line" by using functional updates to avoid stale closures.
    useEffect(() => {
        const data = localStorage.getItem("auth");
        if (data) {
            try {
                const parseData = JSON.parse(data);
                setAuth(prevAuth => ({
                    ...prevAuth,
                    user: parseData.user,
                    token: parseData.token,
                }));
            } catch (error) {
                console.error("Error parsing auth from localStorage:", error);
            }
        }
    }, []);

    return (
        <AuthContext.Provider value={[auth, setAuth]}>
            {children}
        </AuthContext.Provider>
    );
};

// custom hook
const useAuth = () => useContext(AuthContext);

export {useAuth, AuthProvider};