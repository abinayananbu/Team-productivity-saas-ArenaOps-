
export const isAuthenticated = () => {
    return !!localStorage.getItem("access");
};

export const logOut = () => {
    localStorage.removeItem("access_token");
    window.location.href = "/";  // Redirect to login page
};

