import React, { useState } from "react";
import Layout from "./../../components/Layout";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import "../../styles/AuthStyles.css";
import { useAuth } from "../../context/auth";

// The user visits /login, and React renders Login.js.
// The user enters their email and password.
// Clicking "LOGIN":
// Triggers handleSubmit().

// Sends a POST request to /api/v1/auth/login.
// If the login is successful:
// Stores auth in localStorage.
// Redirects to /dashboard or /.

// If it fails, an error message is displayed.
// If the user refreshes the page, the auth in localStorage restores the login state.


// arrow function, equivalent to function Login() {
//  xxx
// }
const Login = () => {
  // define the states - Hook in React
  // when states change, React will re-render the UI automatically
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // useAuth() is a customized hook, to store the user + token globally
  const [auth, setAuth] = useAuth();
  
  // for jumping between pages
  const navigate = useNavigate();
  // to get the current page URL - location.state
  const location = useLocation();
  
  // form function
  const handleSubmit = async (e) => {
    // triggered when the user clicks lOGIN
    // prevent default refreshing, otherwise the page will be reloaded, and the React state is lost
    // we want to use axios to send requests from the FE, without refreshing
    e.preventDefault();
    try {
      // send email + password to BE using the API URL (refer to server.js), which calls authRoute.js, then calls authController.js
      // await will wait for the result
      const res = await axios.post("/api/v1/auth/login", {
        email,
        password,
      });
      if (res && res.data.success) {
        // the success notification uses short-circuit to prevent type error
        // but in this case not necessary as there is an if-statement before this
        toast.success(res.data && res.data.message, {
          duration: 5000,
          icon: "🙏",
          style: {
            background: "green",
            color: "white",
          },
        });
        // update auth
        // ... is used to keep other attributes, and only update what is specified
        // otherwise other attributes will be lost
        setAuth({
            ...auth,
            user: res.data.user,
            token: res.data.token,
        });
        // localStorage - to keep user online even if they refresh
        localStorage.setItem("auth", JSON.stringify(res.data));
        // go back to the current page if it exists, otherwise homepage
        navigate(location.state || "/");
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.log(error);
      // toast is like notification msg
      toast.error("Something went wrong");
    }
  };

  // render the UI
  return (
    <Layout title="Login - Ecommerce App">
      <div className="form-container " style={{ minHeight: "90vh" }}>
        <form onSubmit={handleSubmit}>
          <h4 className="title">LOGIN FORM</h4>

          <div className="mb-3">
            <input
              type="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
              id="exampleInputEmail1"
              placeholder="Enter Your Email "
              required
            />
          </div>
          <div className="mb-3">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control"
              id="exampleInputPassword1"
              placeholder="Enter Your Password"
              required
            />
          </div>

          {/* forgot password shows 404 => no Route defined in App.js */}
          {/* added Route, and an extra ForgotPassword.js file in the same folder */}
          <div className="mb-3">
            <button
              type="button"
              className="btn forgot-btn"
              onClick={() => {
                navigate("/forgot-password");
              }}
            >
              Forgot Password
            </button>
          </div>
          
          {/* should disable the button when email or password is empty? */}
          {/*  disabled={!email || !password} */}
          {/* not necessarily needed, as the input fields are already marked with required */}
          <button type="submit" className="btn btn-primary">
            LOGIN
          </button>
        </form>
      </div>
    </Layout>
  );
};

// used in Login.test.js - import
export default Login;