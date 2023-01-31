import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import moment from "moment";
import { Container, Row, Col, Card, Form, Alert } from "react-bootstrap";

import { PageLoading } from "../utils/page-status.util";
import Breadcrumb from "../utils/breadcrumb.util";

import { FaEdit, FaTrash } from "react-icons/fa";

import {
  verifyTokenAsync,
  userLogoutAsync,
} from "../actions/auth-async.action";
import { setAuthToken } from "../services/auth.service";

import {
  customerGetService,
  customerGetMembersService,
  customerAddMemberService,
  customerUpdateMemberService,
  customerDeleteMemberService,
} from "../services/customer.service";

import { stripeGetSubscriptionService } from "../services/subscriptions.service";

export default function AccountSecurity() {
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
  const [customer, setCustomer] = useState({
    email: "",
    fName: "",
    lName: "",
    street1: "",
    city: "",
    state: "",
    zip: "",
    country: "US",
  });
  const [subscription, setSubscription] = useState({});

  const [pageError, setPageError] = useState("");
  const [pageLoading, setPageLoading] = useState(true);

  const [memberId, setMemberId] = useState("");

  const [members, setMembers] = useState([]);
  const [memberNumAvail, setMemberNumAvail] = useState(0);
  const [memberNumUsed, setMemberNumUsed] = useState(0);
  const [plan, setPlan] = useState("System Error. Please contact Support.");

  const [formShow, setFormShow] = useState(false);
  const [deletePopupShow, setDeletePopupShow] = useState(false);

  useEffect(() => {
    async function getData() {
      const customerData = await customerGetService(userId);
      if (customerData.error) {
        dispatch(userLogoutAsync());
      } else {
        setCustomer((customer) => ({ ...customer, ...customerData.data }));
      }

      const subscriptionData = await stripeGetSubscriptionService(
        customerData.data?.subscriptionId
      );
      if (subscriptionData.error) {
        setPageError("Internal Server Error.");
      } else {
        setSubscription(subscriptionData.data);
      }

      const membersData = await customerGetMembersService(userId);
      if (membersData.error) {
        setPageError("Internal Server Error.");
      } else {
        setMembers(membersData.data);
        setMemberNumUsed(membersData.data.length);
      }

      setPageLoading(false);
    }
    getData();

    switch (subscription.plan?.id) {
      case "price_1J0kDUGLa25NHdnwddahBdhv":
        setMemberNumAvail(1);
        setPlan("DeleteMeNow Solo Plan Monthly");
        break;

      case "price_1J0kDUGLa25NHdnwHDHLUyG0":
        setMemberNumAvail(1);
        setPlan("DeleteMeNow Solo Plan Yearly");
        break;

      case "price_1J18GpGLa25NHdnwxGkZCfhW":
        setMemberNumAvail(1);
        setPlan("DeleteMeNow Solo Plan Yearly");
        break;

      case "price_1J0kDPGLa25NHdnwtXwI9qzP":
        setMemberNumAvail(2);
        setPlan("DeleteMeNow Double Plan Monthly");
        break;

      case "price_1J0kDPGLa25NHdnwHBHBbmpD":
        setMemberNumAvail(2);
        setPlan("DeleteMeNow Double Plan Yearly");
        break;

      case "price_1J0kDJGLa25NHdnwwku4MWoQ":
        setMemberNumAvail(4);
        setPlan("DeleteMeNow Family Plan Monthly");
        break;

      case "price_1J0kDJGLa25NHdnw5WW4Ij1t":
        setMemberNumAvail(4);
        setPlan("DeleteMeNow Family Plan Yearly");
        break;

      default:
        break;
    }
  }, [dispatch, userId, subscription.plan?.id]);

  const [email, setEmail] = useState("");
  const [fName, setFName] = useState("");
  const [lName, setLName] = useState("");
  const [street1, setStreet1] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");

  const handleAddMemberSubmit = (e) => {
    e.preventDefault();

    const member = {
      masterId: userId,
      role: "member",
      email: email,
      fName: fName,
      lName: lName,
      street1: street1,
      city: city,
      state: state,
      zip: zip,
    };

    async function fetchData() {
      setPageLoading(true);

      const result = await customerAddMemberService(member);
      if (result.error) {
        setPageError("Server Error! Please retry...");
      } else {
        const membersData = await customerGetMembersService(userId);
        setMembers(membersData.data);
        setMemberNumUsed(membersData.data.length);
        setFormShow(false);
      }

      setPageLoading(false);
    }
    fetchData();
  };

  const handleUpdateMemberSubmit = (e) => {
    e.preventDefault();

    const member = {
      email: email,
      fName: fName,
      lName: lName,
      street1: street1,
      city: city,
      state: state,
      zip: zip,
    };

    async function fetchData() {
      setPageLoading(true);

      const result = await customerUpdateMemberService(memberId, member);
      if (result.error) {
        setPageError("Server Error! Please retry...");
      } else {
        const membersData = await customerGetMembersService(userId);
        setMembers(membersData.data);
        setFormShow(false);
      }

      setPageLoading(false);
    }
    fetchData();
  };

  const handleDeleteMemberSubmit = (e) => {
    e.preventDefault();

    async function fetchData() {
      setPageLoading(true);

      const result = await customerDeleteMemberService(memberId);
      if (result.error) {
        setPageError("Server Error! Please retry...");
      } else {
        const membersData = await customerGetMembersService(userId);
        setMembers(membersData.data);
        setMemberNumUsed(membersData.data.length);
        setFormShow(false);
        setDeletePopupShow(false);
      }

      setPageLoading(false);
    }
    fetchData();
  };

  const handleAddMember = () => {
    setMemberId("");
    setEmail("");
    setFName("");
    setLName("");
    setStreet1("");
    setCity("");
    setState("");
    setZip("");

    setFormShow(true);
  };

  const handleUpdateMember = (num) => {
    setMemberId(members[num]?._id);
    setEmail(members[num]?.email);
    setFName(members[num]?.fName);
    setLName(members[num]?.lName);
    setStreet1(members[num]?.street1);
    setCity(members[num]?.city);
    setState(members[num]?.state);
    setZip(members[num]?.zip);

    setFormShow(true);
  };

  const handleDeleteMember = (num) => {
    setMemberId(members[num]?._id);
    setDeletePopupShow(true);
  };

  const Member = (props) => (
    <Card className="p-4 mb-3">
      <div className="d-flex">
        <div>
          <p className="mb-1">
            {props.member.fName} {props.member.lName}{" "}
          </p>
          <small className="text-info">member account</small>
        </div>

        <div className="ml-auto">
          <FaEdit
            className="text-info"
            style={{ cursor: "pointer" }}
            onClick={() => handleUpdateMember(props.index)}
          />

          <FaTrash
            style={{ cursor: "pointer" }}
            className="text-danger ml-2"
            onClick={() => handleDeleteMember(props.index)}
          />
        </div>
      </div>
    </Card>
  );

  const membersList = (members) => {
    return members.map((member, index) => {
      return <Member member={member} key={index} index={index} />;
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

  const DeleteForm = () => {
    return (
      <>
        {deletePopupShow && (
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
                  className="text-white"
                  style={{ backgroundColor: "rgba(3, 169, 244, 0.6)" }}
                >
                  <h5 className="m-0 text-center">Delete the Member?</h5>
                </Card.Header>

                <Card.Body>
                  <p className="text-muted">{pageError}</p>

                  <button
                    className="btn btn-danger mr-2"
                    onClick={handleDeleteMemberSubmit}
                  >
                    Confirm
                  </button>

                  <button
                    className="btn btn-outline-green"
                    onClick={() => setDeletePopupShow(false)}
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
      <Container className="p-5">
        <Breadcrumb
          breadcrumb={{
            parentPath: "",
            parentLink: "",
            activePath: "Member Accounts",
            btnLink: "",
            btnText: "",
          }}
        />
        <h1 className="m-5 text-center">Member Accounts</h1>

        <Row>
          <Col>
            <Alert variant="primary">
              You have {memberNumUsed + 1} of {memberNumAvail}{" "}
              {memberNumAvail > 1 ? "accounts" : "account"} created.
            </Alert>

            <div className="mt-2">
              <Card className="shadow p-4">
                <h3>Your Plan</h3>
                <p className="font-weight-bold mb-0 text-info">{plan}</p>
              </Card>
            </div>
          </Col>

          <Col>
            <div className="text-right mb-4">
              <button
                className="btn btn-green"
                onClick={handleAddMember}
                disabled={memberNumAvail - 2 < memberNumUsed}
              >
                Add New Member Account
              </button>
            </div>

            <Card className="p-4 mb-3">
              <p className="mb-1">
                {customer.fName} {customer.lName}{" "}
              </p>
              <small className="text-info">main account</small>
            </Card>

            {membersList(members)}
          </Col>
        </Row>
      </Container>

      <PageLoading pageLoading={pageLoading} />
      <PageError />
      <DeleteForm />

      {formShow && (
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
              style={{ maxWidth: "100%", width: "400px" }}
            >
              <Card.Header className="bg-info text-white">
                <h5 className="m-0 text-center">Member Account Information</h5>
              </Card.Header>

              <Card.Body>
                <Form
                  autoComplete="off"
                  onSubmit={
                    memberId === ""
                      ? handleAddMemberSubmit
                      : handleUpdateMemberSubmit
                  }
                >
                  <Form.Group>
                    <Form.Control
                      required
                      id="email"
                      name="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email Address"
                    />
                  </Form.Group>

                  <Form.Group>
                    <Form.Control
                      required
                      id="fName"
                      name="fName"
                      type="text"
                      value={fName}
                      onChange={(e) => setFName(e.target.value)}
                      placeholder="First Name"
                    />
                  </Form.Group>

                  <Form.Group>
                    <Form.Control
                      id="lName"
                      name="lName"
                      type="text"
                      value={lName}
                      onChange={(e) => setLName(e.target.value)}
                      placeholder="Last Name"
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
                      value={street1}
                      onChange={(e) => setStreet1(e.target.value)}
                      placeholder="Street"
                    />
                  </Form.Group>

                  <Form.Group>
                    <Form.Control
                      required
                      id="city"
                      name="city"
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="City"
                    />
                  </Form.Group>

                  <Form.Group>
                    <Form.Control
                      required
                      id="state"
                      name="state"
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="State"
                    />
                  </Form.Group>

                  <Form.Group>
                    <Form.Control
                      required
                      id="zip"
                      name="zip"
                      type="text"
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      placeholder="Zip"
                    />
                  </Form.Group>

                  <div>
                    <button
                      className="btn btn-green m-0 mr-2 ml-auto"
                      type="submit"
                    >
                      {pageLoading ? "Processing..." : "Apply"}
                    </button>
                    <button
                      className="btn btn-outline-green"
                      onClick={() => setFormShow(false)}
                    >
                      Close
                    </button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}
