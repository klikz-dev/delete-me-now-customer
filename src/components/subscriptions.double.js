import React from "react";
import { Link } from "react-router-dom";
import { Container, Form } from "react-bootstrap";

import { useFormSwitch } from "../utils/form-switch.util";
import Checkout from "../utils/stripe.util";
import logo from "./../assets/images/logo-dark.png";

export default function Subscriptions() {
  const annualPay = useFormSwitch(false);

  return (
    <div
      className="row min-vh-100 w-100 m-0"
      style={{
        backgroundColor: "#00a9c5",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 100 60'%3E%3Cg %3E%3Crect fill='%2300a9c5' width='11' height='11'/%3E%3Crect fill='%2300a7c4' x='10' width='11' height='11'/%3E%3Crect fill='%2300a6c3' y='10' width='11' height='11'/%3E%3Crect fill='%2300a4c3' x='20' width='11' height='11'/%3E%3Crect fill='%2300a2c2' x='10' y='10' width='11' height='11'/%3E%3Crect fill='%2301a1c1' y='20' width='11' height='11'/%3E%3Crect fill='%23029fc0' x='30' width='11' height='11'/%3E%3Crect fill='%23039dbf' x='20' y='10' width='11' height='11'/%3E%3Crect fill='%23059cbe' x='10' y='20' width='11' height='11'/%3E%3Crect fill='%23079abd' y='30' width='11' height='11'/%3E%3Crect fill='%230998bc' x='40' width='11' height='11'/%3E%3Crect fill='%230b97bb' x='30' y='10' width='11' height='11'/%3E%3Crect fill='%230d95ba' x='20' y='20' width='11' height='11'/%3E%3Crect fill='%230f93b9' x='10' y='30' width='11' height='11'/%3E%3Crect fill='%231192b8' y='40' width='11' height='11'/%3E%3Crect fill='%231390b7' x='50' width='11' height='11'/%3E%3Crect fill='%23158eb6' x='40' y='10' width='11' height='11'/%3E%3Crect fill='%23178db5' x='30' y='20' width='11' height='11'/%3E%3Crect fill='%23188bb4' x='20' y='30' width='11' height='11'/%3E%3Crect fill='%231a89b3' x='10' y='40' width='11' height='11'/%3E%3Crect fill='%231c88b1' y='50' width='11' height='11'/%3E%3Crect fill='%231d86b0' x='60' width='11' height='11'/%3E%3Crect fill='%231f84af' x='50' y='10' width='11' height='11'/%3E%3Crect fill='%232083ae' x='40' y='20' width='11' height='11'/%3E%3Crect fill='%232281ac' x='30' y='30' width='11' height='11'/%3E%3Crect fill='%23237fab' x='20' y='40' width='11' height='11'/%3E%3Crect fill='%23257eaa' x='10' y='50' width='11' height='11'/%3E%3Crect fill='%23267ca8' x='70' width='11' height='11'/%3E%3Crect fill='%23277ba7' x='60' y='10' width='11' height='11'/%3E%3Crect fill='%232879a6' x='50' y='20' width='11' height='11'/%3E%3Crect fill='%232a77a4' x='40' y='30' width='11' height='11'/%3E%3Crect fill='%232b76a3' x='30' y='40' width='11' height='11'/%3E%3Crect fill='%232c74a1' x='20' y='50' width='11' height='11'/%3E%3Crect fill='%232d72a0' x='80' width='11' height='11'/%3E%3Crect fill='%232e719f' x='70' y='10' width='11' height='11'/%3E%3Crect fill='%232f6f9d' x='60' y='20' width='11' height='11'/%3E%3Crect fill='%23306d9c' x='50' y='30' width='11' height='11'/%3E%3Crect fill='%23316c9a' x='40' y='40' width='11' height='11'/%3E%3Crect fill='%23326a98' x='30' y='50' width='11' height='11'/%3E%3Crect fill='%23336997' x='90' width='11' height='11'/%3E%3Crect fill='%23346795' x='80' y='10' width='11' height='11'/%3E%3Crect fill='%23346594' x='70' y='20' width='11' height='11'/%3E%3Crect fill='%23356492' x='60' y='30' width='11' height='11'/%3E%3Crect fill='%23366291' x='50' y='40' width='11' height='11'/%3E%3Crect fill='%2337618f' x='40' y='50' width='11' height='11'/%3E%3Crect fill='%23375f8d' x='90' y='10' width='11' height='11'/%3E%3Crect fill='%23385d8c' x='80' y='20' width='11' height='11'/%3E%3Crect fill='%23385c8a' x='70' y='30' width='11' height='11'/%3E%3Crect fill='%23395a88' x='60' y='40' width='11' height='11'/%3E%3Crect fill='%233a5987' x='50' y='50' width='11' height='11'/%3E%3Crect fill='%233a5785' x='90' y='20' width='11' height='11'/%3E%3Crect fill='%233a5583' x='80' y='30' width='11' height='11'/%3E%3Crect fill='%233b5481' x='70' y='40' width='11' height='11'/%3E%3Crect fill='%233b5280' x='60' y='50' width='11' height='11'/%3E%3Crect fill='%233c517e' x='90' y='30' width='11' height='11'/%3E%3Crect fill='%233c4f7c' x='80' y='40' width='11' height='11'/%3E%3Crect fill='%233c4e7a' x='70' y='50' width='11' height='11'/%3E%3Crect fill='%233d4c79' x='90' y='40' width='11' height='11'/%3E%3Crect fill='%233d4b77' x='80' y='50' width='11' height='11'/%3E%3Crect fill='%233d4975' x='90' y='50' width='11' height='11'/%3E%3C/g%3E%3C/svg%3E")`,
        backgroundAttachment: "fixed",
        backgroundSize: "cover",
      }}
    >
      <Container
        className="d-flex flex-column justify-content-center"
        style={{ maxWidth: "1000px" }}
      >
        <Checkout
          content={
            <div className="mb-5">
              <img
                className="mb-4"
                src={logo}
                width="250"
                height="auto"
                alt="Deletemenow"
              />
              <h1>Double Plan</h1>
              <h4>Annual Protection for 2 People</h4>

              <hr />

              <h4>Change Your Plan</h4>
              <Link to="/subscriptions/solo" className="d-block ml-auto">
                Solo Plan
              </Link>
              <Link to="/subscriptions/family" className="d-block ml-auto">
                Family Plan
              </Link>
              <a
                href="https://www.deletemenow.com/service"
                rel="noreferrer"
                target="_blank"
                className="d-block ml-auto"
              >
                View All Plans
              </a>

              <hr />

              <div className="d-flex">
                <h4 className="text-navy">
                  {annualPay.checked ? (
                    <>
                      <sup>$</sup>
                      <span
                        className="d-inline-block"
                        style={{ fontSize: "2rem" }}
                      >
                        276
                      </span>
                    </>
                  ) : (
                    <>
                      <sup>$</sup>
                      <span
                        className="d-inline-block"
                        style={{ fontSize: "2rem" }}
                      >
                        22.
                      </span>
                      <sup>99</sup>
                    </>
                  )}
                </h4>

                <Form.Group className="ml-auto">
                  <Form.Check
                    className="font-weight-bold text-danger"
                    type="switch"
                    id="annualPay"
                    label="Pay Annually"
                    {...annualPay}
                  />
                </Form.Group>
              </div>

              <ul className="pl-4" style={{ listStyleType: "square" }}>
                <li>Billed annually ($276/year)</li>
                <li>For 2 person</li>
                <li>For 1 year</li>
                <li>U.S. residents only</li>
                <li>Automatically renews</li>
              </ul>
            </div>
          }
          priceId={
            annualPay.checked
              ? "price_1J0kDPGLa25NHdnwHBHBbmpD"
              : "price_1J0kDPGLa25NHdnwtXwI9qzP"
          }
        />
      </Container>
    </div>
  );
}
