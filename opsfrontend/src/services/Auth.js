
export const isAuthenticated = () => {
    return !!localStorage.getItem("access_token");
};

export const logOut = () => {
    localStorage.removeItem("access_token");
    window.location.href = "/";  // Redirect to home page
};

