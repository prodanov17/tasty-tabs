import styles from "./AuthForm.module.css";
import { useContext, useRef, useState } from "react";
import LoadingSpinner from "../UI/LoadingSpinner";
import AuthContext from "../../dataStorage/Auth-context";

const AuthForm = () => {
  const authCtx = useContext(AuthContext);
  const userName = useRef();
  const password = useRef();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(undefined);

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    const enteredUsername = userName.current.value;
    const enteredPassword = password.current.value;

    setIsLoading(true);
    setError(undefined);

    try {
      const response = await fetch("http://127.0.0.1:5002/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: enteredUsername,
          password: enteredPassword,
        }),
      });

      const data = await response.json();
      setIsLoading(false);

      if (!response.ok) {
        throw new Error(data.error || "Authentication failed!");
      }

      const expirationTime = new Date().getTime() + 60 * 60 * 1000; // 1 hour expiration
      authCtx.login(data.user.id, new Date(expirationTime).toISOString());
    } catch (error) {
      setIsLoading(false);
      setError(error.message);
    }
  };
  return (
    !authCtx.isLoggedIn && (
      <div className={styles.loginBox}>
        {!isLoading ? (
          <form onSubmit={onSubmitHandler}>
            <div className={styles.userBox}>
              <input type="text" required ref={userName} />
              <label>Username</label>
            </div>
            <div className={styles.userBox}>
              <input type="password" required ref={password} />
              <label>Password</label>
              {error && <p className="text-red-500 font-semibold">{error}</p>}
            </div>
            <center>
              <button type="submit">SEND</button>
            </center>
          </form>
        ) : (
          <LoadingSpinner />
        )}
      </div>
    )
  );

};

export default AuthForm;
