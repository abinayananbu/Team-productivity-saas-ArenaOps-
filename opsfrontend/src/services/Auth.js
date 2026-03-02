
export const isAuthenticated = () => {
    return !!localStorage.getItem("access");
};

export const logOut = () => {
    localStorage.removeItem("access");  // Redirect to login page
    window.location.href = "/" 
};

