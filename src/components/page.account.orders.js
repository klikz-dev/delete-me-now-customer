import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import moment from "moment";
import Table from "react-bootstrap/Table";
import { Container, Card, Row, Col, Form } from "react-bootstrap";
import Avatar from "react-avatar";
import { useFormSelect } from "../utils/form-select.util";
import { useFormInput } from "../utils/form-input.util";

import { PageLoading } from "../utils/page-status.util";
import Breadcrumb from "../utils/breadcrumb.util";

import {
  verifyTokenAsync,
  userLogoutAsync,
} from "../actions/auth-async.action";
import { setAuthToken } from "../services/auth.service";

import {
  customerGetService,
  customerUpdateDataService,
} from "../services/customer.service";

import {
  stripeGetSubscriptionService,
  stripeGetPaymentByIdService,
  stripeGetInvoicesService,
  stripeCancelSubscriptionService,
} from "../services/subscriptions.service";

export default function AccountOrders() {
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
  const [invoices, setInvoices] = useState([]);

  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const [showCancelForm, setShowCancelForm] = useState(false);

  const cancelOption = useFormSelect("not-need");
  const differentService = useFormInput("");
  const otherReason = useFormInput("");

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

      if (customer.subscriptionId !== undefined) {
        const invoicesData = await stripeGetInvoicesService(
          customer.subscriptionId
        );

        if (!invoicesData.error) {
          setInvoices(invoicesData.data);
        }
      }

      setPageLoading(false);
    }
    fetchData();
  }, [dispatch, userId, customer.paymentId, customer.subscriptionId]);

  const Invoice = (props) => (
    <tr>
      <td>{props.invoice.number}</td>
      <td>${props.invoice.subtotal / 100}</td>
      <td className="text-capitalize">{props.invoice.status}</td>
      <td>{props.invoice.billing_reason}</td>
      <td>
        {moment(new Date(props.invoice.created * 1000)).format("MMM DD, YYYY")}
      </td>
      <td>
        {moment(new Date(props.invoice.period_end * 1000)).format(
          "MMM DD, YYYY"
        )}
      </td>
    </tr>
  );

  const invoiceList = (invoices) => {
    return invoices.map(function (invoice, index) {
      return <Invoice invoice={invoice} index={index} key={index} />;
    });
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

  const cancelSubscription = async (e) => {
    e.preventDefault();

    const subscriptionData = await stripeCancelSubscriptionService(
      customer.subscriptionId
    );
    if (subscriptionData.error) {
      setPageError("Something went wrong... Please contact customer support.");
    } else {
      setPageLoading(true);

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

      if (customer.subscriptionId !== undefined) {
        const invoicesData = await stripeGetInvoicesService(
          customer.subscriptionId
        );

        if (!invoicesData.error) {
          setInvoices(invoicesData.data);
        }
      }

      setShowCancelForm(false);
      setPageLoading(false);
    }

    let cancelNote = "";
    switch (cancelOption.selected) {
      case "not-need":
        cancelNote = "I no longer need the service";
        break;

      case "expensive":
        cancelNote = "Service is too expensive";
        break;

      case "different":
        cancelNote = "Different Service: " + differentService.value;
        break;

      case "other":
        cancelNote = "Other: " + otherReason.value;
        break;

      default:
        break;
    }

    const customerData = await customerUpdateDataService({
      _id: userId,
      cancelNote: cancelNote,
    });

    if (customerData.error) {
      dispatch(userLogoutAsync());
    } else {
      setCustomer(customerData.data);
    }
  };

  return (
    <>
      <Container className="p-5">
        <Breadcrumb
          breadcrumb={{
            parentPath: "",
            parentLink: "",
            activePath: "Invoices",
            btnLink: "",
            btnText: "",
          }}
        />

        <Row>
          <Col lg="8">
            <Card className="shadow">
              <div className="p-4 border-bottom">
                <div className="d-flex mb-4">
                  <Avatar
                    name={`${customer.fName} ${customer.lName}`}
                    round={true}
                    size={60}
                    className="mt-1"
                  />
                  <div className="d-inline-block ml-3">
                    <h5 className="mb-1">
                      {customer.fName} {customer.lName}
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
                    <p className="text-center text-navy mb-1">Next Bill Date</p>
                    <h5 className="text-center mb-0 text-capitalize">
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
                    </h5>
                  </Col>

                  <Col>
                    <p className="text-center text-navy mb-1">
                      Next Bill Amount
                    </p>
                    <h5 className="text-center mb-0">
                      {subscription.status !== "active" &&
                      subscription.status !== "trialing" ? (
                        <>No subscription</>
                      ) : (
                        <>${subscription.plan.amount / 100}</>
                      )}
                    </h5>
                  </Col>

                  <Col>
                    <p className="text-center text-navy mb-1">Payment Method</p>
                    <h5 className="text-center mb-0">
                      {payment.card !== undefined ? (
                        <>
                          {payment.card.brand} ending in {payment.card.last4}
                        </>
                      ) : (
                        <>No payment method</>
                      )}
                    </h5>
                  </Col>
                </Row>
              </div>
            </Card>
          </Col>
          <Col lg="4">
            <Card className="shadow mb-3">
              <div className="p-4">
                <h6 className="mb-3">Address</h6>
                <p className="mb-0">
                  {customer.fName} {customer.lName}
                </p>
                <p className="mb-0">
                  {customer.street1}, {customer.street2}
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
                <p className="mb-0">
                  {subscription.status !== "active" &&
                  subscription.status !== "trialing" ? (
                    <a
                      href="https://deletemenow.com/service/"
                      className="btn btn-green"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Subscribe Now
                    </a>
                  ) : (
                    <button
                      className="btn btn-danger"
                      onClick={() => setShowCancelForm(true)}
                    >
                      Cancel Subscription
                    </button>
                  )}
                </p>
              </div>
            </Card>
          </Col>
        </Row>

        <h1 className="m-5 text-center text-navy text-uppercase">
          <span className="text-info">Invoices</span>
        </h1>

        <Card className="shadow">
          {subscription.status !== "active" &&
          subscription.status !== "trialing" ? (
            <p className="text-center mt-3">No upcoming invoices</p>
          ) : (
            <Table responsive className="m-0">
              <thead className="bg-navy text-white">
                <tr>
                  <th>ID</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Billing Reason</th>
                  <th>Created Date</th>
                  <th>Completed Date</th>
                </tr>
              </thead>

              <tbody>{invoiceList(invoices)}</tbody>
            </Table>
          )}
        </Card>
      </Container>

      {showCancelForm && (
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
            <Card
              className="shadow"
              style={{ maxWidth: "90%", width: "500px" }}
            >
              <Card.Header className="bg-danger">
                <h5 className="m-0 text-center text-white">
                  Cancel Subscription
                </h5>
              </Card.Header>

              <Card.Body>
                <p className="text-muted">Reason for cancellation</p>

                <div className="mb-4">
                  <Form.Check
                    className="mr-5"
                    type="radio"
                    name="cancelOption"
                    value="not-need"
                    label="I no longer need the service."
                    checked={cancelOption.selected === "not-need"}
                    {...cancelOption}
                  />
                  <Form.Check
                    className="mr-5"
                    type="radio"
                    name="cancelOption"
                    value="expensive"
                    label="Service is too expensive."
                    checked={cancelOption.selected === "expensive"}
                    {...cancelOption}
                  />
                  <Form.Check
                    className="mr-5"
                    type="radio"
                    name="cancelOption"
                    value="different"
                    label="I want a different service."
                    checked={cancelOption.selected === "different"}
                    {...cancelOption}
                  />
                  {cancelOption.selected === "different" && (
                    <Form.Group className="mt-2 ml-3">
                      <Form.Control
                        required
                        id="differentService"
                        name="differentService"
                        type="text"
                        placeholder="What type of service?"
                        {...differentService}
                      />
                    </Form.Group>
                  )}
                  <Form.Check
                    className="mr-5"
                    type="radio"
                    name="cancelOption"
                    value="other"
                    label="Other reason."
                    checked={cancelOption.selected === "other"}
                    {...cancelOption}
                  />
                  {cancelOption.selected === "other" && (
                    <Form.Group className="mt-2 ml-3">
                      <Form.Control
                        required
                        id="otherReason"
                        name="otherReason"
                        type="text"
                        placeholder="Reason for Cancelling"
                        {...otherReason}
                      />
                    </Form.Group>
                  )}
                </div>

                <button
                  className="btn btn-danger mr-2"
                  onClick={cancelSubscription}
                >
                  Cancel
                </button>

                <button
                  className="btn btn-outline-green"
                  onClick={() => setShowCancelForm(false)}
                >
                  Close
                </button>
              </Card.Body>
            </Card>
          </div>
        </div>
      )}

      <PageError />
      <PageLoading pageLoading={pageLoading} />
    </>
  );
}
