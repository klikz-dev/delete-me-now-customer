import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useParams } from "react-router-dom";
import moment from "moment";
import { Container, Card, Form, Alert } from "react-bootstrap";

import { PageLoading } from "../utils/page-status.util";
import Breadcrumb from "../utils/breadcrumb.util";
import { useFormInput } from "../utils/form-input.util";
import { useFormSwitch } from "../utils/form-switch.util";

import {
  verifyTokenAsync,
  userLogoutAsync,
} from "../actions/auth-async.action";
import { setAuthToken } from "../services/auth.service";

import {
  supportGetUserIdByEmailService,
  supportGetTicketService,
  supportGetCommentsService,
  supportUpdateTicketService,
} from "../services/support.service";

import { HiOutlineArrowLeft } from "react-icons/hi";

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

  const { id } = useParams();

  const { username, name } = auth_obj.user;
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [validated, setValidated] = useState(false);

  const [ticketUserId, setTicketUserId] = useState("");
  const [ticket, setTicket] = useState({});
  const [comments, setComments] = useState([]);

  const comment = useFormInput("");
  const status = useFormSwitch(ticket.status === "solved" ? true : false);

  useEffect(() => {
    async function fetchData() {
      setPageLoading(true);

      const ticketUserIdData = await supportGetUserIdByEmailService(
        username,
        name
      );
      if (ticketUserIdData.error) {
        dispatch(userLogoutAsync());
      } else {
        setTicketUserId(ticketUserIdData.data);
      }

      const ticketData = await supportGetTicketService(id);

      if (!ticketData.error) {
        setTicket(ticketData.data);
      }

      const commentsData = await supportGetCommentsService(id);

      if (!commentsData.error) {
        setComments(commentsData.data);
      }

      setPageLoading(false);
    }
    fetchData();
  }, [dispatch, username, id, name]);

  const Comment = (props) => (
    <div className="mb-4 border-bottom pb-3 position-relative">
      <h6 className="text-info">
        {props.comment.author_id !== ticketUserId ? "Operator" : "You"}
      </h6>
      <p className="text-navy">{props.comment.body}</p>

      <small
        className={`bg-white text-info p-1 position-absolute mt-1 mr-1`}
        style={{ top: "0", right: "0" }}
      >
        {moment(new Date(props.comment.created_at)).format(
          "MMM DD, YYYY, HH:mm:ss"
        )}
      </small>
    </div>
  );

  const commentList = (comments) => {
    return comments.map(function (comment, index) {
      return <Comment comment={comment} key={index} />;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
    } else {
      const ticket = {
        comment: { body: comment.value, author_id: ticketUserId },
        public: true,
        status: status.checked ? "solved" : "open",
      };

      setPageLoading(true);
      const data = await supportUpdateTicketService(id, ticket);
      if (data.error) {
        setPageError("Server Error! Please retry...");
      } else {
        const ticketData = await supportGetTicketService(id);

        if (!ticketData.error) {
          setTicket(ticketData.data);
        }

        const commentsData = await supportGetCommentsService(id);

        if (!commentsData.error) {
          setComments(commentsData.data);
        }
      }
      setPageLoading(false);
    }

    setValidated(true);
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
                <Card.Header className="bg-info">
                  <h5 className="m-0 text-white">It's not you. It's us...</h5>
                </Card.Header>

                <Card.Body>
                  <Alert variant="danger">
                    Something went wrong. Please try again later.
                  </Alert>

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
            parentPath: "Tickets",
            parentLink: "/supports",
            activePath: "Ticket #" + id,
          }}
        />

        <h1 className="m-5 text-center text-navy text-uppercase">
          Your Ticket <span className="text-info">#{id}</span>
        </h1>

        <Link to="/supports" className="btn btn-outline-info mb-3">
          <HiOutlineArrowLeft size="20" className="align-middle" />
        </Link>

        <Card className="mb-5 border-0">
          <Card.Header className="bg-info border-0 text-white position-relative">
            <h4>{ticket.subject}</h4>
            <small
              className={`text-uppercase ${
                ticket.status === "new"
                  ? "bg-danger"
                  : ticket.status === "open"
                  ? "bg-primary"
                  : "bg-warning"
              } text-white p-1 position-absolute`}
              style={{ top: "0", right: "0" }}
            >
              {ticket.status}
            </small>
          </Card.Header>
          <Card.Body className="bg-light-blue position-relative">
            {commentList(comments)}

            <Form
              autoComplete="off"
              noValidate
              validated={validated}
              onSubmit={handleSubmit}
            >
              <Form.Group>
                <Form.Label>New Comment</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  id="comment"
                  name="comment"
                  type="text"
                  {...comment}
                />
              </Form.Group>

              <Form.Group>
                <Form.Check
                  type="switch"
                  id="status"
                  label="Mark as solved"
                  {...status}
                />
              </Form.Group>

              <button className="btn btn-green m-0 mr-2 ml-auto" type="submit">
                Send
              </button>
            </Form>
          </Card.Body>
        </Card>
      </Container>

      <PageError />
      <PageLoading pageLoading={pageLoading} />
    </>
  );
}
