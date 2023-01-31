import React, { useState } from "react";
import { useHistory } from "react-router-dom";

import { useFormInput } from "../utils/form-input.util";
import { Form, Row, Col } from "react-bootstrap";

import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

import {
  stripeGetCustomerByEmailService,
  stripeAddCustomerService,
  stripeCreateSubscriptionService,
} from "../services/subscriptions.service";

import { customerRegisterService } from "../services/customer.service";

const CheckoutForm = (props) => {
  const stripe = useStripe();
  const elements = useElements();

  const history = useHistory();

  const [formError, setFormError] = useState("");
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  const fName = useFormInput("");
  const mName = useFormInput("");
  const lName = useFormInput("");
  const email = useFormInput("");
  const phone = useFormInput("");
  const password = useFormInput("");
  const confirmPW = useFormInput("");
  const street1 = useFormInput("");
  const street2 = useFormInput("");
  const city = useFormInput("");
  const state = useFormInput("");
  const zip = useFormInput("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setPaymentProcessing(true);

    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
    } else {
      setFormError("");

      if (password.value !== confirmPW.value) {
        setFormError("Password doesn't match.");
        setPaymentProcessing(false);
        return;
      }

      if (!stripe || !elements) {
        setFormError(
          "We are still collecting your information. Please wait a minute and try again or contact customer support."
        );
        setPaymentProcessing(false);
        return;
      }

      let customerId = "";
      let paymentMethodId = "";

      // Create Stripe Customer if not defined
      const customerData = await stripeGetCustomerByEmailService(email.value);
      if (!customerData.error) {
        customerId = customerData.data.id;
      } else {
        const newCustomerData = await stripeAddCustomerService(
          email.value,
          fName.value + " " + mName.value + " " + lName.value
        );
        if (!newCustomerData.error) {
          customerId = newCustomerData.data.id;
        } else {
          setFormError(
            "Invalid Information. Please refresh your page or contact support."
          );
          setPaymentProcessing(false);
          return;
        }
      }

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
      if (customerId !== "" && paymentMethodId !== "") {
        const subscriptionData = await stripeCreateSubscriptionService(
          customerId,
          paymentMethodId,
          props.priceId
        );

        if (subscriptionData.error) {
          setFormError(
            "We failed creating your subscription. Please try again or contact customer support center."
          );
          setPaymentProcessing(false);
          return;
        } else {
          const customerData = await customerRegisterService({
            fName: fName.value,
            mName: mName.value,
            lName: lName.value,
            email: email.value,
            phone: phone.value,
            password: password.value,
            street1: street1.value,
            street2: street2.value,
            city: city.value,
            state: state.value,
            zip: zip.value,
            customerId: customerId,
            subscriptionId: subscriptionData.data.id,
            paymentId: paymentMethodId,
          });
          if (customerData.error) {
            setFormError(
              "Internal Server Error. Please try again or contact customer support."
            );
            setPaymentProcessing(false);
            return;
          } else {
            history.push("/login");
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
      <Form onSubmit={handleSubmit}>
        <Row className="bg-white p-4">
          <Col>
            <Form.Row>
              <Form.Group as={Col}>
                <Form.Label>First Name</Form.Label>
                <Form.Control
                  required
                  id="fName"
                  name="fName"
                  type="text"
                  {...fName}
                />
              </Form.Group>

              <Form.Group as={Col}>
                <Form.Label>Middle Name</Form.Label>
                <Form.Control id="mName" name="mName" type="text" {...mName} />
              </Form.Group>

              <Form.Group as={Col}>
                <Form.Label>Last Name</Form.Label>
                <Form.Control id="lName" name="lName" type="text" {...lName} />
              </Form.Group>
            </Form.Row>

            <Form.Group>
              <Form.Label>Email</Form.Label>
              <Form.Control
                required
                id="email"
                name="email"
                type="email"
                {...email}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Phone</Form.Label>
              <Form.Control
                required
                id="phone"
                name="phone"
                type="phone"
                {...phone}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Password</Form.Label>
              <Form.Control
                required
                id="password"
                name="password"
                type="password"
                {...password}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                required
                id="confirmPW"
                name="confirmPW"
                type="password"
                {...confirmPW}
              />
            </Form.Group>

            <p className="mb-1">Primary Address</p>
            <Form.Row>
              <Form.Group as={Col}>
                <Form.Label>Street Address</Form.Label>
                <Form.Control
                  required
                  id="street1"
                  name="street1"
                  type="text"
                  {...street1}
                />
              </Form.Group>

              <Form.Group as={Col}>
                <Form.Label>Apt., Building, Floor, etc.</Form.Label>
                <Form.Control
                  id="street2"
                  name="street2"
                  type="text"
                  {...street2}
                />
              </Form.Group>
            </Form.Row>

            <Form.Row>
              <Form.Group as={Col}>
                <Form.Label>City</Form.Label>
                <Form.Control
                  required
                  id="city"
                  name="city"
                  type="text"
                  {...city}
                />
              </Form.Group>

              <Form.Group as={Col}>
                <Form.Label>State</Form.Label>
                <Form.Control
                  required
                  id="state"
                  name="state"
                  type="text"
                  {...state}
                />
              </Form.Group>

              <Form.Group as={Col}>
                <Form.Label>Zip</Form.Label>
                <Form.Control
                  required
                  id="zip"
                  name="zip"
                  type="text"
                  {...zip}
                />
              </Form.Group>
            </Form.Row>
          </Col>

          <Col>
            {props.content}

            <div className="border border-grey px-2 py-3 mb-4 bg-light shadow">
              <h5 className="mb-3">Pay with Credit Card</h5>
              <CardElement
                options={CARD_OPTIONS}
                className="p-2 border border-grey"
                onChange={(e) => {
                  setFormError(e.error === undefined ? "" : e.error.message);
                }}
              />
            </div>

            <div className="text-right">
              {formError && <p className="text-danger">{formError}</p>}

              <button
                className="btn btn-green"
                type="submit"
                disabled={
                  !stripe ||
                  !elements ||
                  (paymentProcessing && formError === "")
                }
              >
                {paymentProcessing && formError === ""
                  ? "Processing..."
                  : "Subscribe Now"}
              </button>
            </div>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default function Checkout(props) {
  const stripePromise = loadStripe(
    "pk_live_51Ie1dpGLa25NHdnwvdBrA0xV1ryAO3pDfNxZASrVg6iL3RzJygU3Lk2RMP4frjwugdryOjPNbnAFPL1J383QXTos00MPJ3fSF8"
  );

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm content={props.content} priceId={props.priceId} />
    </Elements>
  );
}
