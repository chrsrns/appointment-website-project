import { useCookies } from "react-cookie";
import "./index.css";

type JumbotronProps = {
  header: string;
  children: React.ReactNode;
};

export const Jumbotron: React.FC<JumbotronProps> = ({ header, children }) => {
  const [cookies] = useCookies(["darkmode"]);
  const primaryColor = cookies.darkmode ? "#0250c4" : "#cfe2ff";
  const secondaryColor = cookies.darkmode ? "#6610f2" : "#dfcefb";

  return (
    <div
      className="jumbotron jumbotron-anim rounded-3 shadow-sm"
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
      <h1>{header}</h1>
      <p>{children}</p>
    </div>
  );
};
