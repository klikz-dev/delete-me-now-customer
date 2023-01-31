import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import moment from "moment";
import { Container, Card, Row, Col, Alert } from "react-bootstrap";

import { PageLoading } from "../utils/page-status.util";
import Breadcrumb from "../utils/breadcrumb.util";
import { DownloadPdf } from "../utils/pdf.util";

import {
  verifyTokenAsync,
  userLogoutAsync,
} from "../actions/auth-async.action";
import { setAuthToken } from "../services/auth.service";

import {
  customerGetService,
  customerGetAlertsService,
} from "../services/customer.service";

import {
  stripeGetSubscriptionService,
  stripeGetPaymentByIdService,
} from "../services/subscriptions.service";

import { removalGetReportListService } from "../services/removal.service";

import { IoNotificationsOutline } from "react-icons/io5";
import { FcDataProtection, FcBullish } from "react-icons/fc";

export default function Dashboard() {
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

  const { userId } = auth_obj.user;

  const [customer, setCustomer] = useState({});
  const [subscription, setSubscription] = useState([]);
  const [payment, setPayment] = useState({});

  const [reports, setReports] = useState([]);

  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const [alertLength, setAlertLength] = useState(0);

  useEffect(() => {
    async function fetchData() {
      setPageLoading(true);

      if (userId !== undefined) {
        const customerData = await customerGetService(userId);

        if (customerData.error) {
          dispatch(userLogoutAsync());
        } else {
          setCustomer(customerData.data);
        }
      }

      if (customer.subscriptionId !== undefined) {
        const subscriptionData = await stripeGetSubscriptionService(
          customer.subscriptionId
        );

        if (!subscriptionData.error) {
          setSubscription(subscriptionData.data);
        }
      }

      if (customer.paymentId !== undefined) {
        const paymentData = await stripeGetPaymentByIdService(
          customer.paymentId
        );

        if (!paymentData.error) {
          setPayment(paymentData.data);
        }
      }

      const alertList = await customerGetAlertsService(userId);

      if (!alertList.error) {
        let len = 0;
        alertList.data.forEach((alerts) => {
          alerts.forEach((alert) => {
            if (!alert.status && alert.type === "action") {
              len++;
            }
          });
        });
        setAlertLength(len);
      }

      const reportList = await removalGetReportListService(userId);

      if (!reportList.error) {
        setReports(reportList.data);
      }

      setPageLoading(false);
    }
    fetchData();
  }, [dispatch, userId, customer.subscriptionId, customer.paymentId]);

  const PageError = () => {
    return (
      <>
        {pageError && (
          <div
            className="position-fixed w-100 h-100 custom--desktop-padding-left-270"
            style={{ zIndex: "1000", top: "0", left: "0", minHeight: "100vh" }}
          >
            <div
              className="d-flex flex-column justify-content-center align-items-center w-100 h-100 px-3"
              style={{
                backgroundColor: "rgba(255, 255, 255, .8)",
              }}
            >
              <Card className="shadow" style={{ maxWidth: "500px" }}>
                <Card.Header
                  style={{ backgroundColor: "rgba(3, 169, 244, 0.6)" }}
                >
                  <h5 className="m-0 text-center">Error</h5>
                </Card.Header>

                <Card.Body>
                  <p className="text-muted">{pageError}</p>

                  <button
                    className="btn btn-outline-green"
                    onClick={() => setPageError("")}
                  >
                    Close
                  </button>
                </Card.Body>
              </Card>
            </div>
          </div>
        )}
      </>
    );
  };

  const Report = (props) => (
    <Col className="text-center" md={6} lg={3}>
      <Card>
        <Card.Header
          className={`${
            props.report.status === "completed"
              ? "bg-primary"
              : props.report.status === "progress"
              ? "bg-warning"
              : "bg-light-navy text-dark"
          } text-white`}
        >
          Privacy Report
        </Card.Header>
        <Card.Body>
          <h6 className="text-navy">
            {props.report.status === "completed"
              ? "Completed"
              : props.report.status === "progress"
              ? "In Progress"
              : "In Queue"}
          </h6>
          <div>
            {props.report.status === "completed" ? (
              <p className="mb-0">
                <small className="text-info">Report created at</small>
              </p>
            ) : props.report.status === "progress" ? (
              <p className="mb-0">
                <small className="text-info">Last updated at</small>
              </p>
            ) : (
              <p className="mb-0">
                <small className="text-info">Coming around</small>
              </p>
            )}{" "}
            {moment(new Date(props.report.updated_at)).format("MMM DD, YYYY")}
            <Link
              className="btn btn-green mt-3"
              to={`/reports/${props.report._id}`}
            >
              View Report
            </Link>
            <hr />
          </div>

          <div className="pt-2 mb-0">
            <DownloadPdf report={props.report} />
          </div>
        </Card.Body>
      </Card>
    </Col>
  );

  const reportList = (reports) => {
    if (reports.length === 0) {
      <div className="px-5">
        <Alert variant="info" className="text-center">
          Your first Privacy Report is coming soon. Stay tuned...
        </Alert>
      </div>;
    } else {
      return reports.map(function (report, index) {
        if (report.archived || report.deleted) {
          return <div key={index}></div>;
        } else {
          return (
            <Report
              report={report}
              eventKey={index + 1}
              index={index}
              key={index}
            />
          );
        }
      });
    }
  };

  return (
    <>
      <Container className="position-relative py-5 px-5">
        <Breadcrumb
          breadcrumb={{
            parentPath: "",
            parentLink: "",
            activePath: "Dashboard",
            btnLink: "",
            btnText: "",
          }}
        />

        <h1 className="m-5 text-center">Dashboard</h1>

        <Card className="p-4">
          <Card.Body>
            <Row>
              <Col className="d-flex">
                <div className="position-relative mr-4">
                  <IoNotificationsOutline size="60" />
                  <span
                    className="position-absolute bg-danger text-white"
                    style={{
                      top: "0",
                      right: "0",
                      padding: "0 8px",
                      borderRadius: "50%",
                    }}
                  >
                    {alertLength}
                  </span>
                </div>

                <div className="">
                  <h3>Alerts & Notifications</h3>
                  <p className="mb-0">There are {alertLength} unread alerts.</p>
                </div>
              </Col>

              <Col className="text-right">
                <Link className="btn btn-green mt-3" to="/alerts">
                  View All
                </Link>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <Card className="mt-5 p-4">
          <Card.Body>
            <Row>
              <Col className="d-flex">
                <div className="position-relative mr-4">
                  <FcDataProtection size="60" />
                </div>

                <div className="">
                  <h3>Subscription Status</h3>
                  {subscription.status !== "active" &&
                  subscription.status !== "trialing" ? (
                    <p className="mb-0 font-weight-bold text-danger">
                      You have No subscription yet
                    </p>
                  ) : (
                    <p className="mb-0 font-weight-bold text-danger">
                      You are protected!
                    </p>
                  )}
                </div>
              </Col>

              <Col className="text-right">
                <Link className="btn btn-green mt-3" to="/account/orders">
                  View Details
                </Link>
              </Col>
            </Row>

            <div className="px-5 mt-5">
              <Row>
                <Col>
                  <h5 className="text-center text-navy">Next Bill Date</h5>
                  <p className="text-center text-navy mb-0">
                    {subscription.status !== "active" &&
                    subscription.status !== "trialing" ? (
                      <>No subscription</>
                    ) : (
                      <>
                        {moment(
                          new Date(subscription?.current_period_end * 1000)
                        ).format("MMM DD, YYYY")}
                      </>
                    )}
                  </p>
                </Col>

                <Col>
                  <h5 className="text-center text-navy">Next Bill Amount</h5>
                  <p className="text-center text-navy mb-0">
                    {subscription.status !== "active" &&
                    subscription.status !== "trialing" ? (
                      <>No subscription</>
                    ) : (
                      <>${subscription.plan.amount / 100}</>
                    )}
                  </p>
                </Col>

                <Col>
                  <h5 className="text-center text-navy">Payment Method</h5>
                  <p className="text-center text-navy mb-0">
                    {payment.card !== undefined ? (
                      <>
                        {payment.card.brand} ending in {payment.card.last4}
                      </>
                    ) : (
                      <>No payment method</>
                    )}
                  </p>
                </Col>
              </Row>
            </div>
          </Card.Body>
        </Card>

        <Card className="mt-5 p-4">
          <Card.Body>
            <Row>
              <Col className="d-flex">
                <div className="position-relative mr-4">
                  <FcBullish size="60" />
                </div>

                <div className="">
                  <h3>Privacy Report</h3>
                  <p className="mb-0">
                    Your next report will come in about 50 days
                  </p>
                </div>
              </Col>

              <Col className="text-right">
                <Link className="btn btn-green mt-3" to="/reports">
                  View All
                </Link>
              </Col>
            </Row>

            <div className="px-5 mt-5">
              <Row>{reportList(reports)}</Row>
            </div>
          </Card.Body>
        </Card>
      </Container>

      <PageError />
      <PageLoading pageLoading={pageLoading} />
    </>
  );
}
