export const handleDarkMode = () => {
    console.log("in handle dark mode")
    const htmlElm = document.getElementsByTagName("html")[0];
    const isDarkMode = localStorage?.getItem("idDarkMode");
    if (JSON.parse(isDarkMode)) {
      htmlElm.classList.remove("dark");
      localStorage.setItem("idDarkMode", false);
    } else {
      htmlElm.classList.add("dark");
      localStorage.setItem("idDarkMode", true);
    }
  };


