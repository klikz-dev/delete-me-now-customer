import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import moment from "moment";
import { Container, Form, Row, Col, Card, Table } from "react-bootstrap";
import Avatar from "react-avatar";

import { PageLoading } from "../utils/page-status.util";
import Breadcrumb from "../utils/breadcrumb.util";
import { DownloadPdf } from "../utils/pdf.util";

import {
  verifyTokenAsync,
  userLogoutAsync,
} from "../actions/auth-async.action";
import { setAuthToken } from "../services/auth.service";
import { customerGetService } from "../services/customer.service";
import {
  removalGetReportService,
  removalGetProcessListService,
} from "../services/removal.service";

import { HiOutlineArrowLeft } from "react-icons/hi";

export default function Customers() {
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

  const { id } = useParams();

  const [report, setReport] = useState({});
  const [processes, setProcesses] = useState([]);
  // const [pdf, setPdf] = useState("");
  const [customer, setCustomer] = useState({
    fName: "",
    mName: "",
    lName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    created_at: "",
    updated_at: "",
    currency: "",
    default_card: "",
    deleted_at: "",
    ip_address: "",
    note: "",
  });
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setPageLoading(true);

      const reportData = await removalGetReportService(id);

      if (reportData.error) {
        dispatch(userLogoutAsync());
      } else {
        setReport(reportData.data);
      }

      const processData = await removalGetProcessListService(id);
      if (!processData.error) {
        setProcesses(processData.data);
      }

      if (report.customerId !== undefined) {
        const customerData = await customerGetService(report.customerId);
        if (!customerData.error) {
          setCustomer(customerData.data);
        }
      }

      setPageLoading(false);
    }
    fetchData();
  }, [dispatch, id, report.customerId]);

  const Process = (props) => (
    <tr>
      <td>{props.process.broker.site}</td>
      <td>
        <p className="mb-0">
          <span>Name: </span>
          {props.process.records.name}
        </p>
        <p className="mb-0">
          <span>Age: </span>
          {props.process.records.age}
        </p>
        <p className="mb-0">
          <span>Past Address: </span>
          {props.process.records.past}
        </p>
        <p className="mb-0">
          <span>Family Members: </span>
          {props.process.records.family}
        </p>
      </td>
      <td>{props.process.broker.wait}</td>
      <td>
        {props.process.status === "send" ? (
          <span className="text-warning">In Progress</span>
        ) : props.process.status === "sent" ? (
          <span className="text-info">OptOut Sent</span>
        ) : props.process.status === "waiting" ? (
          <span className="text-info">Awaiting Customer Verification</span>
        ) : props.process.status === "not-found" ? (
          <span className="text-danger">Customer Not Found</span>
        ) : props.process.status === "not-received" ? (
          <span className="text-danger">Email/SMS not Received</span>
        ) : props.process.status === "verified" ? (
          <span className="text-info">Email/SMS Verified</span>
        ) : (
          <span className="text-primary">Completed</span>
        )}
      </td>
    </tr>
  );

  const processList = (processes) => {
    if (processes.length !== 0) {
      return processes.map(function (process, index) {
        return <Process process={process} eventKey={index + 1} key={index} />;
      });
    } else {
      return <></>;
    }
  };

  return (
    <>
      <Container className="position-relative p-5">
        <Breadcrumb
          breadcrumb={{
            parentPath: "Privacy Reports",
            parentLink: "/reports",
            activePath: "#DMN" + id,
            btnLink: "",
            btnText: "",
          }}
        />

        <div className="mb-3">
          <div className="mr-auto">
            <Link to="/reports" className="btn btn-outline-info">
              <HiOutlineArrowLeft size="20" className="align-middle" />
            </Link>

            <h4 className="d-inline-block mb-0 ml-3 align-middle">
              Privacy Report #DMN{id}
            </h4>
          </div>

          <div></div>
        </div>

        <Form autoComplete="off">
          <Row>
            <Col lg="8">
              <Card className="shadow">
                <div className="p-4 border-bottom">
                  <div className="d-flex mb-4">
                    <Avatar
                      name={`${customer.fName} ${customer.mName} ${customer.lName}`}
                      round={true}
                      size={60}
                      className="mt-1"
                    />
                    <div className="d-inline-block ml-3">
                      <h5 className="mb-1">
                        {customer.fName} {customer.mName} {customer.lName}
                      </h5>
                      <p className="mb-1">
                        {customer.city}, {customer.state}
                      </p>
                      <p className="mb-1">
                        Member since{" "}
                        {moment(new Date(customer.created_at)).format(
                          "MMM DD, YYYY"
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <Row>
                    <Col>
                      <p className="text-center text-navy mb-1">Status</p>
                      <h5 className="text-center mb-0 text-capitalize">
                        {report.status}
                      </h5>
                    </Col>

                    <Col>
                      <p className="text-center text-navy mb-1">Date Created</p>
                      <h5 className="text-center mb-0">
                        {moment(new Date(report.created_at)).format(
                          "MMM DD, YYYY"
                        )}
                      </h5>
                    </Col>

                    <Col>
                      <p className="text-center text-navy mb-1">Last Updated</p>
                      <h5 className="text-center mb-0">
                        {moment(new Date(report.updated_at)).format(
                          "MMM DD, YYYY"
                        )}
                      </h5>
                    </Col>
                  </Row>
                </div>
              </Card>
            </Col>
            <Col lg="4">
              <Card className="shadow">
                <div className="p-4">
                  <h6 className="mb-3">Address</h6>
                  <p className="mb-0">
                    {customer.fName} {customer.mName} {customer.lName}
                  </p>
                  <p className="mb-0">
                    {customer.street1}
                    {customer.street2 && ", " + customer.street2}
                  </p>
                  <p className="mb-0">
                    {customer.city} {customer.state} {customer.zip}
                  </p>
                  <p className="mb-0">
                    {customer.country === "US" && "Unitd States"}
                  </p>
                  <p className="mb-0">{customer.phone}</p>
                </div>
              </Card>

              <Card className="shadow">
                <div className="p-4">
                  <h6 className="mb-3">Actions</h6>
                  <div className="mb-0">
                    {!pageLoading && <DownloadPdf report={report} />}
                  </div>
                </div>
              </Card>
            </Col>
          </Row>

          <h1 className="m-5 text-center text-navy text-uppercase">
            Removal <span className="text-info">Processes</span>
          </h1>

          <Table striped bordered>
            <thead className="bg-navy text-white">
              <tr>
                <th style={{ width: "220px" }}>Site</th>
                <th>Records</th>
                <th style={{ width: "180px" }}>Waiting</th>
                <th style={{ width: "140px" }}>Status</th>
              </tr>
            </thead>

            <tbody>{processList(processes)}</tbody>
          </Table>
        </Form>
      </Container>

      <PageLoading pageLoading={pageLoading} />
    </>
  );
}
