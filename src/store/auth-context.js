import React, { useState, useEffect, useCallback } from "react";
let logoutTimer;

const AuthContext = React.createContext({
  token: "",
  isLoggedIn: false,
  login: (token) => {},
  logout: () => {},
});

const remainingTimeHelper = (expTime) => {
  const currenTS = new Date().getTime();
  const exprTS = new Date(expTime).getTime();
  const remTime = exprTS - currenTS;
  return remTime;
};

const retrieveStoredToken = () => {
  const storedToken = localStorage.getItem("authToken");
  const storedExpirationDate = localStorage.getItem("expirationTime");

  const remainingTime = remainingTimeHelper(storedExpirationDate);

  if (remainingTime <= 6000) {
    localStorage.removeItem("authToken");
    localStorage.removeItem("expirationTime");
    return null;
  }

  return {
    token: storedToken,
    duration: remainingTime,
  };
};

export const AuthContextProvider = (props) => {
  const tokenData = retrieveStoredToken();

  let initialToken;
  if (tokenData) {
    initialToken = tokenData.token;
  }
  const [token, setToken] = useState(initialToken);

  const isUserLoggedIn = !!token;

  const logoutHandler = useCallback(() => {
    setToken(null);
    // localStorage.clear()
    localStorage.removeItem("authToken"); //both local storage method works in this case
    localStorage.removeItem("expirationTime");
    if (logoutTimer) {
      clearTimeout(logoutTimer);
    }
  },[]);

  const loginHandler = (token, expirationTime) => {
    setToken(token);
    localStorage.setItem("authToken", token);
    localStorage.setItem("expirationTime", expirationTime);
    const remainingTime = remainingTimeHelper(expirationTime);
    logoutTimer = setTimeout(logoutHandler, remainingTime);
  };

  const contextValue = {
    token: token,
    isLoggedIn: isUserLoggedIn,
    login: loginHandler,
    logout: logoutHandler,
  };

  useEffect(() => {
    if (tokenData) {
      logoutTimer = setTimeout(logoutHandler, tokenData.duration);
    }
  }, [tokenData,logoutHandler]);

  return (
    <AuthContext.Provider value={contextValue}>
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
