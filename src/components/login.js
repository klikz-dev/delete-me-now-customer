import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";

import { Form } from "react-bootstrap";

import { userLoginAsync } from "../actions/auth-async.action";
import { useFormInput } from "../utils/form-input.util";

import logo from "./../assets/images/logo-dark.png";

export default function AccountLogin() {
  const auth_obj = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const { loginLoading, loginError } = auth_obj;

  const email = useFormInput("");
  const password = useFormInput("");

  const handleLogin = () => {
    if (email.value !== "" && password.value !== "")
      dispatch(userLoginAsync(email.value, password.value));
  };

  return (
    <div
      className="row vh-100 vw-100 m-0"
      style={{
        backgroundColor: "#00a9c5",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 100 60'%3E%3Cg %3E%3Crect fill='%2300a9c5' width='11' height='11'/%3E%3Crect fill='%2300a7c4' x='10' width='11' height='11'/%3E%3Crect fill='%2300a6c3' y='10' width='11' height='11'/%3E%3Crect fill='%2300a4c3' x='20' width='11' height='11'/%3E%3Crect fill='%2300a2c2' x='10' y='10' width='11' height='11'/%3E%3Crect fill='%2301a1c1' y='20' width='11' height='11'/%3E%3Crect fill='%23029fc0' x='30' width='11' height='11'/%3E%3Crect fill='%23039dbf' x='20' y='10' width='11' height='11'/%3E%3Crect fill='%23059cbe' x='10' y='20' width='11' height='11'/%3E%3Crect fill='%23079abd' y='30' width='11' height='11'/%3E%3Crect fill='%230998bc' x='40' width='11' height='11'/%3E%3Crect fill='%230b97bb' x='30' y='10' width='11' height='11'/%3E%3Crect fill='%230d95ba' x='20' y='20' width='11' height='11'/%3E%3Crect fill='%230f93b9' x='10' y='30' width='11' height='11'/%3E%3Crect fill='%231192b8' y='40' width='11' height='11'/%3E%3Crect fill='%231390b7' x='50' width='11' height='11'/%3E%3Crect fill='%23158eb6' x='40' y='10' width='11' height='11'/%3E%3Crect fill='%23178db5' x='30' y='20' width='11' height='11'/%3E%3Crect fill='%23188bb4' x='20' y='30' width='11' height='11'/%3E%3Crect fill='%231a89b3' x='10' y='40' width='11' height='11'/%3E%3Crect fill='%231c88b1' y='50' width='11' height='11'/%3E%3Crect fill='%231d86b0' x='60' width='11' height='11'/%3E%3Crect fill='%231f84af' x='50' y='10' width='11' height='11'/%3E%3Crect fill='%232083ae' x='40' y='20' width='11' height='11'/%3E%3Crect fill='%232281ac' x='30' y='30' width='11' height='11'/%3E%3Crect fill='%23237fab' x='20' y='40' width='11' height='11'/%3E%3Crect fill='%23257eaa' x='10' y='50' width='11' height='11'/%3E%3Crect fill='%23267ca8' x='70' width='11' height='11'/%3E%3Crect fill='%23277ba7' x='60' y='10' width='11' height='11'/%3E%3Crect fill='%232879a6' x='50' y='20' width='11' height='11'/%3E%3Crect fill='%232a77a4' x='40' y='30' width='11' height='11'/%3E%3Crect fill='%232b76a3' x='30' y='40' width='11' height='11'/%3E%3Crect fill='%232c74a1' x='20' y='50' width='11' height='11'/%3E%3Crect fill='%232d72a0' x='80' width='11' height='11'/%3E%3Crect fill='%232e719f' x='70' y='10' width='11' height='11'/%3E%3Crect fill='%232f6f9d' x='60' y='20' width='11' height='11'/%3E%3Crect fill='%23306d9c' x='50' y='30' width='11' height='11'/%3E%3Crect fill='%23316c9a' x='40' y='40' width='11' height='11'/%3E%3Crect fill='%23326a98' x='30' y='50' width='11' height='11'/%3E%3Crect fill='%23336997' x='90' width='11' height='11'/%3E%3Crect fill='%23346795' x='80' y='10' width='11' height='11'/%3E%3Crect fill='%23346594' x='70' y='20' width='11' height='11'/%3E%3Crect fill='%23356492' x='60' y='30' width='11' height='11'/%3E%3Crect fill='%23366291' x='50' y='40' width='11' height='11'/%3E%3Crect fill='%2337618f' x='40' y='50' width='11' height='11'/%3E%3Crect fill='%23375f8d' x='90' y='10' width='11' height='11'/%3E%3Crect fill='%23385d8c' x='80' y='20' width='11' height='11'/%3E%3Crect fill='%23385c8a' x='70' y='30' width='11' height='11'/%3E%3Crect fill='%23395a88' x='60' y='40' width='11' height='11'/%3E%3Crect fill='%233a5987' x='50' y='50' width='11' height='11'/%3E%3Crect fill='%233a5785' x='90' y='20' width='11' height='11'/%3E%3Crect fill='%233a5583' x='80' y='30' width='11' height='11'/%3E%3Crect fill='%233b5481' x='70' y='40' width='11' height='11'/%3E%3Crect fill='%233b5280' x='60' y='50' width='11' height='11'/%3E%3Crect fill='%233c517e' x='90' y='30' width='11' height='11'/%3E%3Crect fill='%233c4f7c' x='80' y='40' width='11' height='11'/%3E%3Crect fill='%233c4e7a' x='70' y='50' width='11' height='11'/%3E%3Crect fill='%233d4c79' x='90' y='40' width='11' height='11'/%3E%3Crect fill='%233d4b77' x='80' y='50' width='11' height='11'/%3E%3Crect fill='%233d4975' x='90' y='50' width='11' height='11'/%3E%3C/g%3E%3C/svg%3E")`,
        backgroundAttachment: "fixed",
        backgroundSize: "cover",
      }}
    >
      <div className="col d-flex justify-content-center">
        <div
          className="card shadow p-4"
          style={{ width: "400px", margin: "auto" }}
        >
          <div className="text-center p-4">
            <Link to="/">
              <img src={logo} width="250" height="auto" alt="Deletemenow" />
            </Link>
          </div>
          <div className="card-body">
            <h3>Login</h3>
            <p className="pb-3">Continue to your DeleteMeNow account.</p>

            <Form autoComplete="off">
              <Form.Group>
                <Form.Label>Username or Email Address</Form.Label>
                <Form.Control
                  autoComplete="off"
                  id="email"
                  type="email"
                  icon="envelope"
                  {...email}
                />
              </Form.Group>

              <Form.Group>
                <Form.Label>Password</Form.Label>
                <Form.Control
                  autoComplete="off"
                  id="password"
                  type="password"
                  {...password}
                />
              </Form.Group>

              <button
                className="btn btn-navy"
                color="outline-info"
                onClick={handleLogin}
                disabled={loginLoading}
              >
                {loginLoading ? "Loading..." : "Login"}
              </button>
              <a href="/pw-forgot" className="ml-3">
                Forgot password?
              </a>
              {loginError && (
                <p className="text-danger">
                  Invalid username or password. Try again.
                </p>
              )}
            </Form>
            <p className="mt-4">
              New to DeleteMeNow?{" "}
              <a
                href="https://deletemenow.com/service/"
                target="_blank"
                rel="noreferrer"
              >
                Get Started
              </a>
            </p>
          </div>
          <div className="text-right p-4">
            <a
              href="https://deletemenow.com/contact-us/"
              className="mx-2"
              target="_blank"
              rel="noreferrer"
            >
              Help
            </a>
            <a
              href="https://deletemenow.com/privacy-policy/"
              className="mx-2"
              target="_blank"
              rel="noreferrer"
            >
              Privacy
            </a>
            <a
              href="https://deletemenow.com/terms-of-use/"
              className="mx-2"
              target="_blank"
              rel="noreferrer"
            >
              Terms
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
