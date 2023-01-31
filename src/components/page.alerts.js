import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import moment from "moment";
import { Container, Card, Alert, Row, Col } from "react-bootstrap";

import { PageLoading } from "../utils/page-status.util";
import Breadcrumb from "../utils/breadcrumb.util";

import { verifyTokenAsync } from "../actions/auth-async.action";
import { setAuthToken } from "../services/auth.service";
import {
  customerGetAlertsService,
  customerSolveAlertService,
} from "../services/customer.service";
import { removalUpdateProcesService } from "../services/removal.service";

export default function Alerts() {
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

  const [alerts, setAlerts] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    async function fetchData() {
      setPageLoading(true);

      const alertList = await customerGetAlertsService(userId);

      if (!alertList.error) {
        setAlerts(alertList.data);
      }

      setPageLoading(false);
    }
    fetchData();
  }, [dispatch, userId]);

  const solveAlert = async (alert) => {
    setPageLoading(true);

    await customerSolveAlertService(alert.customerId, alert._id);

    const alertList = await customerGetAlertsService(userId);

    if (!alertList.error) {
      setAlerts(alertList.data);
    }

    setAlerts(alertList.data);

    setPageLoading(false);
  };

  const handleSolve = async (alert) => {
    const updateProcess = await removalUpdateProcesService(alert.processId, {
      status: "verified",
    });
    if (!updateProcess.error) {
      solveAlert(alert);
    }
  };

  const handleReport = async (alert) => {
    const updateProcess = await removalUpdateProcesService(alert.processId, {
      status: "not-received",
    });
    if (!updateProcess.error) {
      solveAlert(alert);
    }
  };

  const AlertCard = (props) => (
    <Card
      className="mb-4"
      style={{ borderBottom: "1px solid rgba(0,0,0,.125)" }}
    >
      <Card.Header>
        <div className="d-flex">
          <h6>
            {!props.alert.status && (
              <div
                style={{ borderRadius: "50%", padding: "5px" }}
                className="mr-2 bg-info d-inline-block"
              ></div>
            )}
            {props.alert.title}
          </h6>
          <small className="ml-auto">
            {moment(new Date(props.alert.created_at)).format("MMM DD, YYYY")}
          </small>
        </div>
        <small>
          {props.alert.customer?.fName} {props.alert.customer?.mName}{" "}
          {props.alert.customer?.lName}
        </small>{" "}
        <small className="text-info font-weight-bold">
          ({props.alert.customer?.email})
        </small>
      </Card.Header>

      <Card.Body>
        <p>{props.alert.content}</p>

        {props.alert.type === "action" && (
          <>
            <button
              disabled={props.alert.status}
              className={`mr-3 btn ${
                props.alert.status ? "btn-navy" : "btn-outline-navy"
              }`}
              onClick={() => handleSolve(props.alert)}
            >
              {props.alert.status ? "Done" : "I've done this"}
            </button>

            <button
              disabled={props.alert.status}
              className={`mr-3 btn ${
                props.alert.status ? "btn-green" : "btn-outline-green"
              }`}
              onClick={() => handleReport(props.alert)}
            >
              Email/SMS not Received
            </button>
          </>
        )}
      </Card.Body>
    </Card>
  );

  const actionList = (alertsPromise) => {
    let length = 0;
    let actions = [];
    alertsPromise.forEach((alerts) => {
      alerts.forEach((alert) => {
        if (alert.type === "action") {
          length++;
          actions.push(alert);
        }
      });
    });

    if (length === 0) {
      return (
        <Alert variant="primary" className="mt-3 text-center">
          You have no Actions required yet.
        </Alert>
      );
    } else {
      return actions.map(function (alert, index) {
        return <AlertCard alert={alert} eventKey={index + 1} key={index} />;
      });
    }
  };

  const notificationList = (alertsPromise) => {
    let length = 0;
    let notifications = [];
    alertsPromise.forEach((alerts) => {
      alerts.forEach((alert) => {
        if (alert.type === "notification") {
          length++;
          notifications.push(alert);
        }
      });
    });

    if (length === 0) {
      return (
        <Alert variant="primary" className="mt-3 text-center">
          You have no Notifications yet.
        </Alert>
      );
    } else {
      return notifications.map(function (alert, index) {
        return <AlertCard alert={alert} eventKey={index + 1} key={index} />;
      });
    }
  };

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

  return (
    <>
      <Container className="position-relative p-5">
        <Breadcrumb
          breadcrumb={{
            parentPath: "",
            parentLink: "",
            activePath: "Alerts",
            btnLink: "",
            btnText: "",
          }}
        />

        <Row>
          <Col>
            <h1 className="m-5 text-center">Alerts</h1>
            {actionList(alerts)}
          </Col>

          <Col>
            <h1 className="m-5 text-center">Notifications</h1>
            {notificationList(alerts)}
          </Col>
        </Row>
      </Container>

      <PageError />
      <PageLoading pageLoading={pageLoading} />
    </>
  );
}
