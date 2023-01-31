import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Accordion, Button } from "react-bootstrap";

import logo from "./../assets/images/logo-dark.png";

import {
  FcHome,
  FcCustomerSupport,
  FcBusinessman,
  FcHighPriority,
  FcBullish,
} from "react-icons/fc";
import { FaFileInvoice } from "react-icons/fa";
import { MdSecurity } from "react-icons/md";
import { HiCreditCard, HiUserGroup } from "react-icons/hi";
import { VscReferences } from "react-icons/vsc";

export default function Menu() {
  const location = useLocation();

  const hideMenu = () => {
    document.getElementById("navbar-toggler").classList.add("collapsed");
    document.getElementById("responsive-navbar-nav").classList.remove("show");
  };

  return (
    <>
      <div className="w-100 px-3 py-3 pb-5 collapse-hide">
        <img src={logo} className="img-fluid" alt="Delete Me Now" />
      </div>

      <Link
        to="/"
        className={`btn w-100 px-4 py-3 m-0 text-left ${
          location.pathname === "/" ? "bg-info text-white" : "bg-white"
        }`}
        style={{ borderTop: "1px solid #cccccc" }}
        onClick={hideMenu}
      >
        <FcHome size="24" style={{ verticalAlign: "bottom" }} />
        <span className="ml-2" style={{ fontSize: "16px" }}>
          Dashboard
        </span>
      </Link>

      <Accordion className="w-100 btn m-0 p-0">
        <Accordion.Toggle
          as={Button}
          variant="link"
          className="btn w-100 m-0 text-left px-4 py-3"
          style={{ borderTop: "1px solid #cccccc" }}
          eventKey="2"
        >
          <FcBusinessman size="24" style={{ verticalAlign: "bottom" }} />
          <span className="ml-2 text-dark" style={{ fontSize: "16px" }}>
            Account Settings
          </span>
        </Accordion.Toggle>
        <Accordion.Collapse eventKey="2">
          <>
            <Link
              to="/account/security"
              className={`btn d-block w-100 px-4 py-3 m-0 text-left ${
                location.pathname === "/account/security"
                  ? "btn-info"
                  : "btn-white"
              }`}
              onClick={hideMenu}
              style={{ borderTop: "1px solid #cccccc" }}
            >
              <MdSecurity
                className="ml-2"
                size="20"
                color={
                  location.pathname === "/account/security"
                    ? "#FFFFFF"
                    : "#18356D"
                }
                style={{ verticalAlign: "bottom" }}
              />
              <span className="ml-2" style={{ fontSize: "16px" }}>
                Login & Security
              </span>
            </Link>

            <Link
              to="/account/members"
              className={`btn d-block w-100 px-4 py-3 m-0 text-left ${
                location.pathname === "/account/members"
                  ? "btn-info"
                  : "btn-white"
              }`}
              onClick={hideMenu}
            >
              <HiUserGroup
                className="ml-2"
                size="20"
                color={
                  location.pathname === "/account/members"
                    ? "#FFFFFF"
                    : "#18356D"
                }
                style={{ verticalAlign: "bottom" }}
              />
              <span className="ml-2" style={{ fontSize: "16px" }}>
                Members
              </span>
            </Link>

            <Link
              to="/account/data"
              className={`btn d-block w-100 px-4 py-3 m-0 text-left ${
                location.pathname === "/account/data" ? "btn-info" : "btn-white"
              }`}
              onClick={hideMenu}
            >
              <VscReferences
                className="ml-2"
                size="20"
                color={
                  location.pathname === "/account/data" ? "#FFFFFF" : "#18356D"
                }
                style={{ verticalAlign: "bottom" }}
              />
              <span className="ml-2" style={{ fontSize: "16px" }}>
                My Data Sheet
              </span>
            </Link>

            <Link
              to="/account/orders"
              className={`btn d-block w-100 px-4 py-3 m-0 text-left ${
                location.pathname === "/account/orders"
                  ? "btn-info"
                  : "btn-white"
              }`}
              onClick={hideMenu}
            >
              <FaFileInvoice
                className="ml-2"
                size="20"
                color={
                  location.pathname === "/account/orders"
                    ? "#FFFFFF"
                    : "#18356D"
                }
                style={{ verticalAlign: "bottom" }}
              />
              <span className="ml-2" style={{ fontSize: "16px" }}>
                Orders & Invoices
              </span>
            </Link>

            <Link
              to="/account/payment"
              className={`btn d-block w-100 px-4 py-3 m-0 text-left ${
                location.pathname === "/account/payment"
                  ? "btn-info"
                  : "btn-white"
              }`}
              onClick={hideMenu}
            >
              <HiCreditCard
                className="ml-2"
                size="20"
                color={
                  location.pathname === "/account/payment"
                    ? "#FFFFFF"
                    : "#18356D"
                }
                style={{ verticalAlign: "bottom" }}
              />
              <span className="ml-2" style={{ fontSize: "16px" }}>
                Payment Options
              </span>
            </Link>
          </>
        </Accordion.Collapse>
      </Accordion>

      <Link
        to="/reports"
        className={`btn w-100 px-4 py-3 m-0 text-left ${
          location.pathname === "/reports" ? "bg-info text-white" : "bg-white"
        }`}
        style={{ borderTop: "1px solid #cccccc" }}
        onClick={hideMenu}
      >
        <FcBullish size="24" style={{ verticalAlign: "bottom" }} />
        <span className="ml-2" style={{ fontSize: "16px" }}>
          Privacy Report
        </span>
      </Link>

      <Link
        to="/alerts"
        className={`btn w-100 px-4 py-3 m-0 text-left ${
          location.pathname === "/alerts" ? "bg-info text-white" : "bg-white"
        }`}
        style={{ borderTop: "1px solid #cccccc" }}
        onClick={hideMenu}
      >
        <FcHighPriority size="24" style={{ verticalAlign: "bottom" }} />
        <span className="ml-2" style={{ fontSize: "16px" }}>
          Alerts
        </span>
      </Link>

      <Link
        to="/supports"
        className={`btn w-100 px-4 py-3 m-0 text-left ${
          location.pathname === "/supports" ? "btn-info" : "btn-white"
        }`}
        style={{ borderTop: "1px solid #cccccc" }}
        onClick={hideMenu}
      >
        <FcCustomerSupport size="24" style={{ verticalAlign: "bottom" }} />
        <span className="ml-2" style={{ fontSize: "16px" }}>
          Support
        </span>
      </Link>
    </>
  );
}
