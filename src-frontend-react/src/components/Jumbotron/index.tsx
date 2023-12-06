import { Button } from "react-bootstrap";
import { useCookies } from "react-cookie";
import "./index.css";

type JumbotronProps = {
  header: string;
  onSideBarToggleClick: () => any;
  children: React.ReactNode;
};

export const Jumbotron: React.FC<JumbotronProps> = ({
  header,
  onSideBarToggleClick,
  children,
}) => {
  const [cookies] = useCookies(["darkmode"]);
  const primaryColor = cookies.darkmode ? "#0250c4" : "#cfe2ff";
  const secondaryColor = cookies.darkmode ? "#6610f2" : "#dfcefb";

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
        <Button variant="primary" size="sm" onClick={onSideBarToggleClick}>
          <i className="bi bi-chevron-right"></i>
        </Button>
      </p>
      <h1>{header}</h1>
      <p>{children}</p>
    </div>
  );
};
