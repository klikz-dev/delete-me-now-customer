import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Alert } from "react-bootstrap";

import { customerVerifyService } from "../services/customer.service";

import logo from "../assets/images/logo-dark.png";

export default function AccountLogin() {
  const { id } = useParams();

  const [verifyText, setVerifyText] = useState("Processing...");

  useEffect(() => {
    async function process() {
      const verifiedData = await customerVerifyService(id);

      if (verifiedData.error) {
        setVerifyText(
          "Internal server error. Please try again later or contact customer support."
        );
      } else {
        setVerifyText("Your email address has been verified successfully.");
      }
    }
    process();
  }, [id]);

  return (
    <div className="row vh-100 w-100 m-0">
      <div className="col d-flex justify-content-center">
        <div style={{ width: "500px", margin: "auto" }}>
          <div className="text-center">
            <Link to="/">
              <img src={logo} width="220" height="auto" alt="C2 Keep" />
            </Link>
          </div>
          <div className="card-body text-center">
            <h5 className="text-center mb-3">
              <Alert variant="info" className="mt-3">
                {verifyText}
              </Alert>
            </h5>

            <Link to="/login" className="btn btn-green ml-3">
              Back to dashboard
            </Link>
          </div>
          <div className="text-right">
            <a
              href="https://www.deletemenow.com"
              target="_blank"
              rel="noopener noreferrer"
              className="mx-2"
            >
              www.deletemenow.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
