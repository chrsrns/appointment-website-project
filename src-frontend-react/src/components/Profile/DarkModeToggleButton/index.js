import { useEffect, useRef, useState } from "react";
import { useCookies } from "react-cookie";
import { Button } from "react-bootstrap";

export const DarkModeToggleButton = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [cookies, setCookies] = useCookies(["darkmode"]);

  const cookiesRef = useRef();

  const handleDarkModeToggleClick = () => {
    setDarkMode(!darkMode);
    setCookies("darkmode", !darkMode);
  };
  useEffect(() => {
    cookiesRef.current = cookies.darkmode;
  });

  useEffect(() => {
    setDarkMode(cookiesRef.current);
    setCookies("darkmode", cookiesRef.current);
  }, [setCookies]);

  return (
    <Button onClick={handleDarkModeToggleClick}>
      {darkMode ? (
        <>
          <i className="bi bi-moon-stars-fill" /> Dark
        </>
      ) : (
        <>
          <i className="bi bi-brightness-high" /> Light
        </>
      )}
    </Button>

  )
}
