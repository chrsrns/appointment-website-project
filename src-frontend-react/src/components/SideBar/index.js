import { useCallback, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Button, ButtonGroup, Col } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { user_type } from "@prisma/client";

export const SideBar = () => {
  const [radios, setRadios] = useState([
    {
      name: "Dashboard",
      iconClass: "bi-columns-gap",
      value: "1",
      link: "/"
    },
    {
      name: "Appointments",
      iconClass: "bi-clipboard",
      value: "2",
      link: "/appointments",
    },
    {
      name: "Profile",
      iconClass: "bi-person-circle",
      value: "3",
      link: "/profile",
    },
  ]);

  const updateRadios = useCallback(() => {
    if (
      Cookies.get("usertype") === user_type.Admin &&
      !radios.some((e) => e.name === "Admin Tools")
    )
      setRadios((prevRadios) => [
        ...prevRadios,
        {
          name: "Admin Tools",
          iconClass: "bi-terminal",
          value: "6",
          link: "/admin",
        },
      ]);
    if (
      Cookies.get("usertype") === user_type.Clinic &&
      !radios.some((e) => e.name === "Medical Records")
    )
      setRadios((prevRadios) => [
        ...prevRadios,
        {
          name: "Medical Records",
          iconClass: "bi-bandaid",
          value: "5",
          link: "/medrecords",
        },
      ]);
    if (
      Cookies.get("usertype") === user_type.Guidance &&
      !radios.some((e) => e.name === "Guidance Records")
    )
      setRadios((prevRadios) => [
        ...prevRadios,
        {
          name: "Guidance Records",
          iconClass: "bi-exclamation-circle",
          value: "4",
          link: "/guidancerecords",
        },
      ]);
    console.log("updating sidebar");
  }, [radios]);

  useEffect(() => {
    updateRadios();
  }, [updateRadios]);

  return (
    <Col
      xs={6}
      lg={{ span: 3, order: "1" }}
      className="sidebar-offcanvas"
      id="sidebar"
    >
      <div>
        <ButtonGroup className="d-grid gap-2">
          {radios.map((radio, idx) => (
            <SidebarColBtn
              idx={idx}
              key={idx}
              name={radio.name}
              iconClass={radio.iconClass}
              value={radio.value}
              link={radio.link}
            />
          ))}
        </ButtonGroup>
      </div>
    </Col>
  );
};

const SidebarColBtn = ({ idx, name, iconClass, value, link }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Button
      key={idx}
      variant={link === location.pathname ? "primary" : "secondary"}
      name="radio"
      value={value}
      onClick={() => {
        navigate(link);
      }}
      size="lg"
      className="shadow-sm rounded-pill"
      style={{ fontSize: "1.5rem" }}
    >
      <i className={`bi ${iconClass} mx-2`}></i>
      {name}
    </Button>
  );
};
