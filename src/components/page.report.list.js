import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import moment from "moment";
import { Card, Container, Alert } from "react-bootstrap";

import { DownloadPdf } from "../utils/pdf.util";
import { PageLoading } from "../utils/page-status.util";
import Breadcrumb from "../utils/breadcrumb.util";

import {
  verifyTokenAsync,
  userLogoutAsync,
} from "../actions/auth-async.action";
import { setAuthToken } from "../services/auth.service";
import {
  removalGetReportListService,
  // removalGetPDFService,
} from "../services/removal.service";

export default function Reports() {
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

  const [reports, setReports] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setPageLoading(true);

      const reportList = await removalGetReportListService(userId);

      if (reportList.error) {
        dispatch(userLogoutAsync());
      } else {
        setReports(reportList.data);
      }

      setPageLoading(false);
    }
    fetchData();
  }, [dispatch, userId]);

  const Report = (props) => (
    <Card className="mb-5 border-0">
      <Card.Body className="bg-light-navy position-relative">
        <small
          className={`text-uppercase ${
            props.report.status === "completed"
              ? "bg-primary"
              : props.report.status === "progress"
              ? "bg-warning"
              : "bg-danger"
          } text-white p-1 position-absolute`}
          style={{ top: "0", right: "0" }}
        >
          {props.report.status}
        </small>
        <h4 className="text-navy mb-4">Privacy Report</h4>
        <p className="text-info">
          Created At{" "}
          {moment(new Date(props.report.created_at)).format("MMM DD, YYYY")}
        </p>
        <p className="mb-1">
          {props.report.customer?.fName} {props.report.customer?.mName}{" "}
          {props.report.customer?.lName},
        </p>
        <p className="mb-1">
          {props.report.customer?.street1}
          {props.report.customer?.street2 &&
            ", " + props.report.customer?.street2}
          , {props.report.customer?.city},{" "}
        </p>
        <p>
          {props.report.customer?.state} {props.report.customer?.zip}
        </p>

        <p className="text-danger">
          Last Updated{" "}
          {moment(new Date(props.report.updated_at)).format("MMM DD, YYYY")}
        </p>

        <div className="d-flex">
          <a
            href={`/reports/${props.report._id}`}
            className="btn btn-green mr-3"
          >
            View Report
          </a>

          <div className="ml-auto">
            <div className="mb-0">
              <DownloadPdf report={props.report} />
            </div>
          </div>
        </div>
      </Card.Body>

      <Card.Footer className="py-1 bg-navy border-0"></Card.Footer>
    </Card>
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
      <Container className="position-relative p-5">
        <Breadcrumb
          breadcrumb={{
            parentPath: "",
            parentLink: "",
            activePath: "Reports",
          }}
        />
        <h1 className="m-5 text-center text-navy text-uppercase">
          Your <span className="text-info">Privacy Reports</span>
        </h1>

        {reportList(reports)}
      </Container>

      <PageLoading pageLoading={pageLoading} />
    </>
  );
}
