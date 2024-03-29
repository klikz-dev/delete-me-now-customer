import React, { useEffect } from "react";
import { useHistory, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import { Button } from "react-bootstrap";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import moment from "moment";
import { FiLogOut, FiSettings } from "react-icons/fi";
import logo_white from "./../assets/images/logo-white.png";

import {
  verifyTokenAsync,
  userLogoutAsync,
} from "../actions/auth-async.action";
import { setAuthToken } from "../services/auth.service";

import Menu from "../components/menu";

export default function Header() {
  /*
   * Private Page Token Verification Module.
   */
  const auth_obj = useSelector((state) => state.auth);
  const { token, expiredAt } = auth_obj;
  const dispatch = useDispatch();
  useEffect(() => {
    setAuthToken(token);
    const verifyTokenTimer = setTimeout(() => {
      dispatch(verifyTokenAsync(true));
    }, moment(expiredAt).diff() - 10 * 1000);
    return () => {
      clearTimeout(verifyTokenTimer);
    };
  }, [expiredAt, token, dispatch]);
  /* ----------------------- */

  const history = useHistory();

  const { name } = auth_obj.user;

  const handleLogout = () => {
    dispatch(userLogoutAsync());
    history.push("/");
  };

  return (
    <header>
      <Navbar
        collapseOnSelect
        expand="lg"
        className="ml-auto d-flex flex-row justify-content-end pr-4 bg-info py-3 shadow"
      >
        <h4 className="mr-auto text-white mb-0 px-lg-5 custom--mobile-hide">
          <strong>Welcome, {name}</strong>
        </h4>
        <Navbar.Brand className="custom--desktop-hide mr-auto">
          <img src={logo_white} alt="Delete Me Now" />
        </Navbar.Brand>
        <Navbar.Toggle
          id="navbar-toggler"
          aria-controls="responsive-navbar-nav"
        />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="mr-auto custom--desktop-hide my-4">
            <Menu />
          </Nav>
          <Nav className="ml-auto navbar-nav d-flex flex-row">
            <Link to="/account/security" className="d-block ml-auto">
              <Button className="px-2" variant="info">
                <FiSettings size={24} className="text-white" />
              </Button>
            </Link>

            <Button
              className="px-2"
              variant="info"
              onClick={handleLogout}
              style={{ width: "40px" }}
            >
              <FiLogOut size={24} className="text-white" />
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    </header>
  );
}
