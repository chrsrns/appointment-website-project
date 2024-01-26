import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { useCookies } from "react-cookie";
import "./index.css";

type JumbotronProps = {
  header: string;
  onSideBarToggleClick: () => any;
  children: React.ReactNode;
};

export const Jumbotron: React.FC<JumbotronProps> = ({ header, children }) => {
  const [cookies] = useCookies(["darkmode"]);

  const [isSideBarActive, setIsSideBarActive] = useState(false);
  const primaryColor = cookies.darkmode ? "#0250c4" : "#cfe2ff";
  const secondaryColor = cookies.darkmode ? "#6610f2" : "#dfcefb";

  useEffect(() => {
    const rowSidebarContainer = document.getElementById("sidebar-container");
    rowSidebarContainer.className = `row row-offcanvas row-offcanvas-left ${
      isSideBarActive ? "active" : ""
    }`;
  });

  return (
    <div
      className="position-relative jumbotron jumbotron-anim rounded-3 shadow-sm"
      ref={(node) => {
        if (node) {
          node.style.setProperty(
            "background-image",
            `linear-gradient(232deg, ${secondaryColor}, ${primaryColor})`,
            "important",
          );
        }
      }}
    >
      <p className="position-absolute top-0 start-0 float-start d-xl-none d-md-block">
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsSideBarActive(!isSideBarActive)}
        >
          <i className="bi bi-chevron-right"></i>
        </Button>
      </p>
      <h1>{header}</h1>
      <p>{children}</p>
    </div>
  );
};
