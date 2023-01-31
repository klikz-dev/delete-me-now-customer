import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import moment from "moment";

import { Container, Form, Row, Col } from "react-bootstrap";

import Breadcrumb from "../utils/breadcrumb.util";
import { useFormInput } from "../utils/form-input.util";

import {
  verifyTokenAsync,
  userLogoutAsync,
} from "../actions/auth-async.action";
import { setAuthToken } from "../services/auth.service";

import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

import {
  stripeGetSubscriptionService,
  stripeUpdateSubscriptionService,
  stripeGetPaymentByIdService,
} from "../services/subscriptions.service";

import {
  customerGetService,
  customerUpdateDataService,
} from "../services/customer.service";

const CheckoutForm = () => {
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

  const stripe = useStripe();
  const elements = useElements();

  const [formError, setFormError] = useState("");
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  const fName = useFormInput(
    customer.b_fName ? customer.b_fName : customer.fName
  );
  const lName = useFormInput(
    customer.b_fName ? customer.b_lName : customer.lName
  );
  const street1 = useFormInput(
    customer.b_fName ? customer.b_street1 : customer.street1
  );
  const street2 = useFormInput(
    customer.b_fName ? customer.b_street2 : customer.street2
  );
  const city = useFormInput(customer.b_fName ? customer.b_city : customer.city);
  const state = useFormInput(
    customer.b_fName ? customer.b_state : customer.state
  );
  const zip = useFormInput(customer.b_fName ? customer.b_zip : customer.zip);

  useEffect(() => {
    async function fetchData() {
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
    }
    fetchData();
  }, [dispatch, userId, customer.subscriptionId, customer.paymentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setPaymentProcessing(true);

    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
    } else {
      setFormError("");

      if (!stripe || !elements) {
        setFormError(
          "We are still collecting your information. Please wait a minute and try again or contact customer support."
        );
        setPaymentProcessing(false);
        return;
      }

      let paymentMethodId = "";

      // Create Payment Method
      const cardElement = elements.getElement(CardElement);

      const paymentMethodData = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
      });

      if (!paymentMethodData.error) {
        paymentMethodId = paymentMethodData.paymentMethod.id;
      }

      // Create Subscription
      if (customer.subscriptionId !== undefined && paymentMethodId !== "") {
        const subscriptionData = await stripeUpdateSubscriptionService(
          customer.customerId,
          paymentMethodId,
          subscription.latest_invoice
        );

        if (subscriptionData.error) {
          setFormError(
            "We failed creating your subscription. Please try again or contact customer support center."
          );
          setPaymentProcessing(false);
          return;
        } else {
          const customerData = await customerUpdateDataService({
            ...customer,
            customerId: customer.customerId,
            paymentId: paymentMethodId,
            b_fName: fName.value,
            b_lName: lName.value,
            b_street1: street1.value,
            b_street2: street2.value,
            b_city: city.value,
            b_state: state.value,
            b_zip: zip.value,
          });

          if (customerData.error) {
            setFormError(
              "Internal Server Error. Please try again or contact customer support."
            );
            setPaymentProcessing(false);
            return;
          } else {
            setCustomer(customerData.data);
            window.location.reload();
          }
        }
      }
    }
  };

  const CARD_OPTIONS = {
    iconStyle: "solid",
    style: {
      base: {
        iconColor: "#33b5e5",
        color: "#000000",
        fontWeight: 400,
        fontSize: "16px",
        fontSmoothing: "antialiased",
        ":-webkit-autofill": { color: "#263238" },
        "::placeholder": { color: "#212529" },
      },
      invalid: {
        iconColor: "#CC0000",
        color: "#ff4444",
      },
    },
  };

  return (
    <>
      <>
        <Container className="position-relative py-5 px-5">
          <Breadcrumb
            breadcrumb={{
              parentPath: "",
              parentLink: "",
              activePath: "Payment Options",
              btnLink: "",
              btnText: "",
            }}
          />

          <h1 className="m-5 text-center">Payment Options</h1>

          <Form onSubmit={handleSubmit}>
            <Row>
              <Col className="p-4">
                <div className="px-2 py-3">
                  <h5 className="text-center text-navy">
                    Default Payment Method
                  </h5>
                  <h3 className="text-center text-info mb-0">
                    {payment.card !== undefined ? (
                      <>
                        {payment.card.brand} ending in {payment.card.last4}
                      </>
                    ) : (
                      <>No payment method</>
                    )}
                  </h3>
                </div>

                <Row className="bg-white p-4">
                  <Col>
                    <div className="border border-grey px-2 py-3 mb-4 bg-light shadow">
                      <h5 className="mb-3">Update Payment Method</h5>
                      <CardElement
                        options={CARD_OPTIONS}
                        className="p-2 border border-grey"
                        onChange={(e) => {
                          setFormError(
                            e.error === undefined ? "" : e.error.message
                          );
                        }}
                      />
                    </div>
                  </Col>
                </Row>
              </Col>

              <Col className="p-4">
                <div className="px-2 py-3">
                  <h3 className="text-center text-navy">Billing Address</h3>

                  <Form.Group>
                    <Form.Label>First Name</Form.Label>
                    <Form.Control
                      required
                      id="fName"
                      name="fName"
                      type="text"
                      {...fName}
                    />
                    <Form.Control.Feedback type="invalid">
                      Invalid first name.
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group>
                    <Form.Label>Last Name</Form.Label>
                    <Form.Control
                      id="lName"
                      name="lName"
                      type="text"
                      {...lName}
                    />
                  </Form.Group>

                  <hr />

                  <Form.Label>Address</Form.Label>

                  <Form.Group>
                    <Form.Control
                      required
                      id="street1"
                      name="street1"
                      type="text"
                      {...street1}
                      placeholder="Address"
                    />
                    <Form.Control.Feedback type="invalid">
                      Invalid address.
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group>
                    <Form.Control
                      id="street2"
                      name="street2"
                      type="text"
                      {...street2}
                      placeholder="Apt., Buliding, Floor, etc."
                    />
                  </Form.Group>

                  <Form.Group>
                    <Form.Control
                      required
                      id="city"
                      name="city"
                      type="text"
                      {...city}
                      placeholder="City"
                    />
                    <Form.Control.Feedback type="invalid">
                      Invalid city name.
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group>
                    <Form.Control
                      required
                      id="state"
                      name="state"
                      type="text"
                      {...state}
                      placeholder="State"
                    />
                    <Form.Control.Feedback type="invalid">
                      Invalid state name.
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group>
                    <Form.Control
                      required
                      id="zip"
                      name="zip"
                      type="text"
                      {...zip}
                      placeholder="Zip Code"
                    />
                    <Form.Control.Feedback type="invalid">
                      Invalid Zipcode.
                    </Form.Control.Feedback>
                  </Form.Group>

                  {formError && <p className="text-danger">{formError}</p>}

                  <div className="text-right">
                    <button
                      className="btn btn-green"
                      type="submit"
                      disabled={!stripe || !elements || paymentProcessing}
                    >
                      Update Payment Method
                    </button>
                  </div>
                </div>
              </Col>
            </Row>
          </Form>
        </Container>
      </>
    </>
  );
};

export default function Checkout() {
  const stripePromise = loadStripe(
    "pk_live_51Ie1dpGLa25NHdnwvdBrA0xV1ryAO3pDfNxZASrVg6iL3RzJygU3Lk2RMP4frjwugdryOjPNbnAFPL1J383QXTos00MPJ3fSF8"
  );

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
}
