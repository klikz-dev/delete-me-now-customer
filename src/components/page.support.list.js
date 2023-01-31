import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import moment from "moment";
import { Container, Card, Alert } from "react-bootstrap";

import { PageLoading } from "../utils/page-status.util";
import Breadcrumb from "../utils/breadcrumb.util";

import { verifyTokenAsync } from "../actions/auth-async.action";
import { setAuthToken } from "../services/auth.service";

import {
  supportGetUserIdByEmailService,
  supportGetTicketsByIdService,
} from "../services/support.service";

export default function Support() {
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

  const { username, name } = auth_obj.user;
  const [pageLoading, setPageLoading] = useState(true);

  const [supportId, setSupportId] = useState("");
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    async function fetchData() {
      setPageLoading(true);

      const supportIdData = await supportGetUserIdByEmailService(
        username,
        name
      );

      if (!supportIdData.error) {
        setSupportId(supportIdData.data);

        if (supportId !== "" && supportId !== undefined) {
          const ticketsData = await supportGetTicketsByIdService(supportId);

          if (!ticketsData.error) {
            setTickets(ticketsData.data);
          }
        }
      }

      setPageLoading(false);
    }
    fetchData();
  }, [dispatch, username, supportId, name]);

  const Ticket = (props) => (
    <Card className="mb-5 border-0">
      <Card.Body className="bg-light-blue position-relative">
        <small
          className={`text-uppercase ${
            props.ticket.status === "new"
              ? "bg-danger"
              : props.ticket.status === "open"
              ? "bg-primary"
              : "bg-warning"
          } text-white p-1 position-absolute`}
          style={{ top: "0", right: "0" }}
        >
          {props.ticket.status}
        </small>
        <h4 className="text-info">{props.ticket.raw_subject}</h4>
        <p className="text-navy">{props.ticket.description}</p>
        <Link
          to={`/supports/${props.ticket.id}`}
          className="btn btn-green mr-3"
        >
          Open Ticket
        </Link>
      </Card.Body>

      <Card.Footer className="py-1 bg-info border-0"></Card.Footer>
    </Card>
  );

  const ticketList = (tickets) => {
    return tickets
      .slice(0)
      .reverse()
      .map(function (ticket, index) {
        return <Ticket ticket={ticket} key={index} />;
      });
  };

  return (
    <>
      <Container className="position-relative p-5">
        <Breadcrumb
          breadcrumb={{
            parentPath: "",
            parentLink: "",
            activePath: "Tickets",
            btnLink: "/supports/new",
            btnText: "New Ticket",
          }}
        />

        <h1 className="m-5 text-center text-navy text-uppercase">
          Ticket <span className="text-info">List</span>
        </h1>

        {tickets.length !== 0 ? (
          ticketList(tickets)
        ) : (
          <div className="px-5">
            <Alert variant="primary" className="text-center">
              You have not tickets requested yet.
            </Alert>
          </div>
        )}
      </Container>

      <PageLoading pageLoading={pageLoading} />
    </>
  );
}
