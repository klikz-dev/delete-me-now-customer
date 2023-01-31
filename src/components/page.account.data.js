import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import moment from "moment";
import { Container, Row, Col, Card, Form, Tabs, Tab } from "react-bootstrap";

import { PageLoading } from "../utils/page-status.util";
import { useFormInput } from "../utils/form-input.util";
import Breadcrumb from "../utils/breadcrumb.util";

import {
  verifyTokenAsync,
  userLogoutAsync,
} from "../actions/auth-async.action";
import { setAuthToken } from "../services/auth.service";

import {
  customerGetService,
  customerGetDataSheetService,
  customerUpdateDataService,
  customerGetMembersService,
} from "../services/customer.service";

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

  const masterId = auth_obj.user?.userId;
  const masterName = auth_obj.user?.name;
  const [userId, setUserId] = useState(masterId);

  const [members, setMembers] = useState([]);

  const [customer, setCustomer] = useState({
    email: "",
    phone: "",
    fName: "",
    mName: "",
    lName: "",
    street1: "",
    street2: "",
    city: "",
    state: "",
    zip: "",
    country: "US",
  });
  const email = useFormInput(customer.email);
  const phone = useFormInput(customer.phone);
  const fName = useFormInput(customer.fName);
  const mName = useFormInput(customer.mName);
  const lName = useFormInput(customer.lName);
  const street1 = useFormInput(customer.street1);
  const street2 = useFormInput(customer.street2);
  const city = useFormInput(customer.city);
  const state = useFormInput(customer.state);
  const zip = useFormInput(customer.zip);
  const country = useFormInput(customer.country);

  const [dataSheet, setDataSheet] = useState({
    customerId: userId,
    altNames: [],
    altAddresses: [],
    altPhones: [],
    altEmails: [],
    relatives: [],
    employers: [],
    affiliation: "",
    ethnicity: "",
  });

  const [pageError, setPageError] = useState("");
  const [pageLoading, setPageLoading] = useState(true);
  const [showThankyou, setShowThankyou] = useState(false);
  const [validated, setValidated] = useState(false);
  const [tabKey, setTabKey] = useState("personal");
  const [isMaxNameNum, setIsMaxNameNum] = useState(false);
  const [isMaxEmailNum, setIsMaxEmailNum] = useState(false);
  const [isMaxPhoneNum, setIsMaxPhoneNum] = useState(false);
  const [isMaxAddressNum, setIsMaxAddressNum] = useState(false);
  const [isMaxRelativeNum, setIsMaxRelativeNum] = useState(false);
  const [isMaxEmployerNum, setIsMaxEmployerNum] = useState(false);

  const [affiliation, setAffiliation] = useState("");
  const [ethnicity, setEthnicity] = useState("");
  const [notificationEmail, setNotificationEmail] = useState("");
  const [notificationSMS, setNotificationSMS] = useState("");

  useEffect(() => {
    async function getData() {
      const membersData = await customerGetMembersService(masterId);
      if (membersData.error) {
        setPageError("Internal Server Error.");
      } else {
        setMembers(membersData.data);
      }

      const customerData = await customerGetService(userId);
      if (customerData.error) {
        dispatch(userLogoutAsync());
      } else {
        setCustomer((customer) => ({ ...customer, ...customerData.data }));
      }

      const customerDataSheetData = await customerGetDataSheetService(userId);
      if (!customerDataSheetData.error) {
        setDataSheet((dataSheet) => ({
          ...dataSheet,
          ...customerDataSheetData.data,
        }));

        setAffiliation(customerDataSheetData.data.affiliation);
        setEthnicity(customerDataSheetData.data.ethnicity);
        setNotificationEmail(customerDataSheetData.data.notificationEmail);
        setNotificationSMS(customerDataSheetData.data.notificationSMS);
      }

      setPageLoading(false);
    }
    getData();
  }, [dispatch, masterId, userId]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
    } else {
      const customer = {
        email: email.value,
        phone: phone.value,
        fName: fName.value,
        mName: mName.value,
        lName: lName.value,
        street: street1.value,
        street2: street2.value,
        city: city.value,
        state: state.value,
        zip: zip.value,
        country: country.value,
      };

      const altNamesArray = updateAltValues(dataSheet).altNames;
      const altEmailsArray = updateAltValues(dataSheet).altEmails;
      const altPhonesArray = updateAltValues(dataSheet).altPhones;
      const altAddressesArray = updateAltValues(dataSheet).altAddresses;
      const relativesArray = updateAltValues(dataSheet).relatives;
      const employersArray = updateAltValues(dataSheet).employers;

      async function processData() {
        setPageLoading(true);

        const dataSheetResult = await customerUpdateDataService({
          ...dataSheet,
          ...customer,
          altNames: altNamesArray,
          altEmails: altEmailsArray,
          altPhones: altPhonesArray,
          altAddresses: altAddressesArray,
          relatives: relativesArray,
          employers: employersArray,
          affiliation: affiliation,
          ethnicity: ethnicity,
          notificationEmail: notificationEmail,
          notificationSMS: notificationSMS,
        });

        if (dataSheetResult.error) {
          setPageError("Data update has been failed. Please try again.");
        } else {
          const customerDataSheetData = await customerGetDataSheetService(
            userId
          );
          if (!customerDataSheetData.error) {
            setDataSheet((dataSheet) => ({
              ...dataSheet,
              ...customerDataSheetData.data,
            }));

            setAffiliation(customerDataSheetData.data.affiliation);
            setEthnicity(customerDataSheetData.data.ethnicity);
            setNotificationEmail(customerDataSheetData.data.notificationEmail);
            setNotificationSMS(customerDataSheetData.data.notificationSMS);
          }

          setShowThankyou(true);
        }

        setPageLoading(false);
      }
      processData();
    }

    setValidated(true);
  };

  const ThankyouPopup = () => {
    return (
      <>
        {showThankyou && (
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
                <Card.Header className="bg-info text-white">
                  <h5 className="m-0 text-center">Sucess</h5>
                </Card.Header>

                <Card.Body>
                  <p className="text-muted">
                    The customer has been updated successfully.
                  </p>

                  <button
                    className="btn btn-outline-green"
                    onClick={() => setShowThankyou(false)}
                  >
                    OK
                  </button>
                </Card.Body>
              </Card>
            </div>
          </div>
        )}
      </>
    );
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

  const AltName = (props) => {
    const index = props.index;

    return (
      <Form.Row data-index={index}>
        <Form.Group as={Col}>
          <Form.Label>First Name</Form.Label>
          <Form.Control
            required
            name="fName[]"
            type="text"
            defaultValue={props.altName.fName}
          />
          <Form.Control.Feedback type="invalid">
            Invalid first name.
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group as={Col}>
          <Form.Label>Middle Name</Form.Label>
          <Form.Control
            name="mName[]"
            type="text"
            defaultValue={props.altName.mName}
          />
        </Form.Group>

        <Form.Group as={Col}>
          <Form.Label>Last Name</Form.Label>
          <Form.Control
            name="lName[]"
            type="text"
            defaultValue={props.altName.lName}
          />
        </Form.Group>

        <button
          className="btn btn-danger"
          onClick={removeAltName}
          style={{ height: "40px", marginTop: "auto", marginBottom: "1rem" }}
        >
          x
        </button>
      </Form.Row>
    );
  };

  const altNames = (altNames) => {
    if (altNames !== undefined) {
      return altNames.map((altName, index) => {
        return <AltName altName={altName} key={index} index={index} />;
      });
    } else {
      return <></>;
    }
  };

  const addAltName = (e) => {
    e.preventDefault();

    let altNamesArray = updateAltValues(dataSheet).altNames;

    setDataSheet({
      ...dataSheet,
      altNames: [...altNamesArray, { fName: "", mName: "", lName: "" }],
    });

    if (dataSheet.altNames.length > 3) {
      setIsMaxNameNum(true);
    }
  };

  const removeAltName = (e) => {
    e.preventDefault();

    const index = e.target.parentNode.dataset.index;
    let altNamesArray = updateAltValues(dataSheet).altNames;

    altNamesArray.splice(index, 1);
    setDataSheet({
      ...dataSheet,
      altNames: altNamesArray,
    });
  };

  const AltEmail = (props) => {
    const index = props.index;

    return (
      <Form.Row data-index={index}>
        <Form.Group as={Col}>
          <Form.Label>Email Address</Form.Label>
          <Form.Control
            required
            name="email[]"
            type="email"
            defaultValue={props.altEmail}
          />
          <Form.Control.Feedback type="invalid">
            Invalid email address.
          </Form.Control.Feedback>
        </Form.Group>

        <button
          className="btn btn-danger"
          onClick={removeAltEmail}
          style={{
            height: "40px",
            marginTop: "auto",
            marginBottom: "1rem",
          }}
        >
          x
        </button>
      </Form.Row>
    );
  };

  const altEmails = (altEmails) => {
    if (altEmails !== undefined) {
      return altEmails.map((altEmail, index) => {
        return <AltEmail altEmail={altEmail} key={index} index={index} />;
      });
    } else {
      return <></>;
    }
  };

  const addAltEmail = (e) => {
    e.preventDefault();

    let altEmailsArray = updateAltValues(dataSheet).altEmails;

    setDataSheet({
      ...dataSheet,
      altEmails: [...altEmailsArray, ""],
    });

    if (dataSheet.altEmails.length > 3) {
      setIsMaxEmailNum(true);
    }
  };

  const removeAltEmail = (e) => {
    e.preventDefault();

    const index = e.target.parentNode.dataset.index;
    let altEmailsArray = updateAltValues(dataSheet).altEmails;

    altEmailsArray.splice(index, 1);
    setDataSheet({
      ...dataSheet,
      altEmails: altEmailsArray,
    });
  };

  const AltPhone = (props) => {
    const index = props.index;

    return (
      <Form.Row data-index={index}>
        <Form.Group as={Col}>
          <Form.Label>Phone Number</Form.Label>
          <Form.Control
            required
            name="phone[]"
            type="phone"
            defaultValue={props.altPhone}
          />
          <Form.Control.Feedback type="invalid">
            Invalid phone number.
          </Form.Control.Feedback>
        </Form.Group>

        <button
          className="btn btn-danger"
          onClick={removeAltPhone}
          style={{
            height: "40px",
            marginTop: "auto",
            marginBottom: "1rem",
          }}
        >
          x
        </button>
      </Form.Row>
    );
  };

  const altPhones = (altPhones) => {
    if (altPhones !== undefined) {
      return altPhones.map((altPhone, index) => {
        return <AltPhone altPhone={altPhone} key={index} index={index} />;
      });
    } else {
      return <></>;
    }
  };

  const addAltPhone = (e) => {
    e.preventDefault();

    let altPhonesArray = updateAltValues(dataSheet).altPhones;

    setDataSheet({
      ...dataSheet,
      altPhones: [...altPhonesArray, ""],
    });

    if (dataSheet.altPhones.length > 3) {
      setIsMaxPhoneNum(true);
    }
  };

  const removeAltPhone = (e) => {
    e.preventDefault();

    const index = e.target.parentNode.dataset.index;
    let altPhonesArray = updateAltValues(dataSheet).altPhones;

    altPhonesArray.splice(index, 1);
    setDataSheet({
      ...dataSheet,
      altPhones: altPhonesArray,
    });
  };

  const AltAddress = (props) => {
    const index = props.index;

    return (
      <Form.Row data-index={index}>
        <Form.Group as={Col}>
          <Form.Label>Address</Form.Label>

          <Form.Group>
            <Form.Control
              required
              name="street1[]"
              type="text"
              defaultValue={props.altAddress.street1}
              placeholder="Address"
            />
            <Form.Control.Feedback type="invalid">
              Invalid street address.
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Row>
            <Form.Group as={Col}>
              <Form.Control
                name="street2[]"
                type="text"
                defaultValue={props.altAddress.street2}
                placeholder="Apt / Unit / Building"
              />
            </Form.Group>

            <Form.Group as={Col}>
              <Form.Control
                required
                name="city[]"
                type="text"
                defaultValue={props.altAddress.city}
                placeholder="City"
              />
              <Form.Control.Feedback type="invalid">
                Invalid city name.
              </Form.Control.Feedback>
            </Form.Group>
          </Form.Row>

          <Form.Row>
            <Form.Group as={Col}>
              <Form.Control
                required
                name="state[]"
                type="text"
                defaultValue={props.altAddress.state}
                placeholder="State"
              />
              <Form.Control.Feedback type="invalid">
                Invalid state name.
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group as={Col}>
              <Form.Control
                required
                name="zip[]"
                type="text"
                defaultValue={props.altAddress.zip}
                placeholder="Zip Code"
              />
              <Form.Control.Feedback type="invalid">
                Invalid Zipcode.
              </Form.Control.Feedback>
            </Form.Group>
          </Form.Row>
        </Form.Group>

        <button
          className="btn btn-danger"
          onClick={removeAltAddress}
          style={{
            height: "40px",
            marginTop: "1.5rem",
            marginBottom: "auto",
          }}
        >
          x
        </button>
      </Form.Row>
    );
  };

  const altAddresses = (altAddresses) => {
    if (altAddresses !== undefined) {
      return altAddresses.map((altAddress, index) => {
        return <AltAddress altAddress={altAddress} key={index} index={index} />;
      });
    } else {
      return <></>;
    }
  };

  const addAltAddress = (e) => {
    e.preventDefault();

    let altAddressesArray = updateAltValues(dataSheet).altAddresses;

    setDataSheet({
      ...dataSheet,
      altAddresses: [
        ...altAddressesArray,
        { street1: "", street2: "", city: "", state: "", zip: "" },
      ],
    });

    if (dataSheet.altAddresses.length > 3) {
      setIsMaxAddressNum(true);
    }
  };

  const removeAltAddress = (e) => {
    e.preventDefault();

    const index = e.target.parentNode.dataset.index;
    let altAddressesArray = updateAltValues(dataSheet).altAddresses;

    altAddressesArray.splice(index, 1);
    setDataSheet({
      ...dataSheet,
      altAddresses: altAddressesArray,
    });
  };

  const Relative = (props) => {
    const index = props.index;

    return (
      <Form.Row data-index={index}>
        <Form.Group as={Col}>
          <Form.Label>Relative</Form.Label>
          <Form.Control
            required
            name="relative[]"
            type="text"
            defaultValue={props.relative}
          />
          <Form.Control.Feedback type="invalid">
            Invalid relative.
          </Form.Control.Feedback>
        </Form.Group>

        <button
          className="btn btn-danger"
          onClick={removeRelative}
          style={{
            height: "40px",
            marginTop: "auto",
            marginBottom: "1rem",
          }}
        >
          x
        </button>
      </Form.Row>
    );
  };

  const relatives = (relatives) => {
    if (relatives !== undefined) {
      return relatives.map((relative, index) => {
        return <Relative relative={relative} key={index} index={index} />;
      });
    } else {
      return <></>;
    }
  };

  const addRelative = (e) => {
    e.preventDefault();

    let relativesArray = updateAltValues(dataSheet).relatives;

    setDataSheet({
      ...dataSheet,
      relatives: [...relativesArray, ""],
    });

    if (dataSheet.relatives.length > 3) {
      setIsMaxRelativeNum(true);
    }
  };

  const removeRelative = (e) => {
    e.preventDefault();

    const index = e.target.parentNode.dataset.index;
    let relativesArray = updateAltValues(dataSheet).relatives;

    relativesArray.splice(index, 1);
    setDataSheet({
      ...dataSheet,
      relatives: relativesArray,
    });
  };

  const Employer = (props) => {
    const index = props.index;

    return (
      <Form.Row data-index={index}>
        <Form.Group as={Col}>
          <Form.Label>Employer</Form.Label>
          <Form.Control
            required
            name="employer[]"
            type="text"
            defaultValue={props.employer}
          />
          <Form.Control.Feedback type="invalid">
            Invalid employer.
          </Form.Control.Feedback>
        </Form.Group>

        <button
          className="btn btn-danger"
          onClick={removeEmployer}
          style={{
            height: "40px",
            marginTop: "auto",
            marginBottom: "1rem",
          }}
        >
          x
        </button>
      </Form.Row>
    );
  };

  const employers = (employers) => {
    if (employers !== undefined) {
      return employers.map((employer, index) => {
        return <Employer employer={employer} key={index} index={index} />;
      });
    } else {
      return <></>;
    }
  };

  const addEmployer = (e) => {
    e.preventDefault();

    let employersArray = updateAltValues(dataSheet).employers;

    setDataSheet({
      ...dataSheet,
      employers: [...employersArray, ""],
    });

    if (dataSheet.employers.length > 3) {
      setIsMaxEmployerNum(true);
    }
  };

  const removeEmployer = (e) => {
    e.preventDefault();

    const index = e.target.parentNode.dataset.index;
    let employersArray = updateAltValues(dataSheet).employers;

    employersArray.splice(index, 1);
    setDataSheet({
      ...dataSheet,
      employers: employersArray,
    });
  };

  const updateAltValues = (altValues) => {
    for (let index = 0; index < altValues.altNames.length; index++) {
      altValues.altNames[index].fName =
        document.getElementsByName("fName[]")[index].value;
      altValues.altNames[index].mName =
        document.getElementsByName("mName[]")[index].value;
      altValues.altNames[index].lName =
        document.getElementsByName("lName[]")[index].value;
    }

    for (let index = 0; index < altValues.altEmails.length; index++) {
      altValues.altEmails[index] =
        document.getElementsByName("email[]")[index].value;
    }

    for (let index = 0; index < altValues.altPhones.length; index++) {
      altValues.altPhones[index] =
        document.getElementsByName("phone[]")[index].value;
    }

    for (let index = 0; index < altValues.altAddresses.length; index++) {
      altValues.altAddresses[index].street1 =
        document.getElementsByName("street1[]")[index].value;
      altValues.altAddresses[index].street2 =
        document.getElementsByName("street2[]")[index].value;
      altValues.altAddresses[index].city =
        document.getElementsByName("city[]")[index].value;
      altValues.altAddresses[index].state =
        document.getElementsByName("state[]")[index].value;
      altValues.altAddresses[index].zip =
        document.getElementsByName("zip[]")[index].value;
    }

    for (let index = 0; index < altValues.relatives.length; index++) {
      altValues.relatives[index] =
        document.getElementsByName("relative[]")[index].value;
    }

    for (let index = 0; index < altValues.employers.length; index++) {
      altValues.employers[index] =
        document.getElementsByName("employer[]")[index].value;
    }

    return altValues;
  };

  const handleTabSwitch = (k) => {
    let dataSheetArray = updateAltValues(dataSheet);

    setDataSheet(dataSheetArray);

    setTabKey(k);
  };

  const notificationEmailList = () => {
    return dataSheet.altEmails.map((email) => {
      return <option value={email}>{email}</option>;
    });
  };

  const notificationSMSList = () => {
    return dataSheet.altPhones.map((phone) => {
      return <option value={phone}>{phone}</option>;
    });
  };

  const MemberOption = (props) => (
    <option value={props.member?._id}>
      {props.member.fName} {props.member.lName}
    </option>
  );

  const memberOptionList = (members) => {
    return members.map((member, index) => {
      return <MemberOption member={member} key={index} index={index} />;
    });
  };

  return (
    <>
      <Container className="p-5">
        <Breadcrumb
          breadcrumb={{
            parentPath: "",
            parentLink: "",
            activePath: "My Data Sheet",
            btnLink: "",
            btnText: "",
          }}
        />
        <h1 className="m-5 text-center">My Data Sheet</h1>

        <Row>
          <Col>
            <select
              className="py-1 px-2"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            >
              <option value={masterId}>{masterName}</option>
              {memberOptionList(members)}
            </select>
          </Col>
        </Row>

        <hr />

        <Row className="mb-5">
          <Col>
            <Form
              autoComplete="off"
              noValidate
              validated={validated}
              onSubmit={handleSubmit}
            >
              <Tabs
                id="controlled-tab-example"
                activeKey={tabKey}
                onSelect={(k) => handleTabSwitch(k)}
              >
                <Tab
                  eventKey="personal"
                  title="Personal Information"
                  className="py-4 px-3"
                >
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
                      <Form.Control.Feedback type="invalid">
                        Invalid first name.
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group as={Col}>
                      <Form.Label>Middle Name</Form.Label>
                      <Form.Control
                        id="mName"
                        name="mName"
                        type="text"
                        {...mName}
                      />
                    </Form.Group>

                    <Form.Group as={Col}>
                      <Form.Label>Last Name</Form.Label>
                      <Form.Control
                        id="lName"
                        name="lName"
                        type="text"
                        {...lName}
                      />
                    </Form.Group>

                    <button
                      className="btn btn-danger"
                      onClick={removeAltName}
                      disabled={true}
                      style={{
                        opacity: "0",
                        height: "40px",
                        marginTop: "auto",
                        marginBottom: "1rem",
                      }}
                    >
                      -
                    </button>
                  </Form.Row>

                  {altNames(dataSheet.altNames)}

                  <button
                    className="btn btn-info"
                    onClick={addAltName}
                    disabled={isMaxNameNum}
                  >
                    Add alternative names +
                  </button>

                  <hr className="my-5" />

                  <Row>
                    <Col>
                      <Form.Row>
                        <Form.Group as={Col}>
                          <Form.Label>Email Address</Form.Label>
                          <Form.Control
                            required
                            id="email"
                            name="email"
                            type="email"
                            {...email}
                          />
                          <Form.Control.Feedback type="invalid">
                            Invalid email address.
                          </Form.Control.Feedback>
                        </Form.Group>

                        <button
                          className="btn btn-danger"
                          onClick={removeAltEmail}
                          disabled={true}
                          style={{
                            opacity: "0",
                            height: "40px",
                            marginTop: "auto",
                            marginBottom: "1rem",
                          }}
                        >
                          -
                        </button>
                      </Form.Row>

                      {altEmails(dataSheet.altEmails)}

                      <button
                        className="btn btn-info"
                        onClick={addAltEmail}
                        disabled={isMaxEmailNum}
                      >
                        Add alternative emails +
                      </button>
                    </Col>

                    <Col>
                      <Form.Row>
                        <Form.Group as={Col}>
                          <Form.Label>Phone Number</Form.Label>
                          <Form.Control
                            required
                            id="phone"
                            name="phone"
                            type="phone"
                            {...phone}
                          />
                          <Form.Control.Feedback type="invalid">
                            Invalid phone address.
                          </Form.Control.Feedback>
                        </Form.Group>

                        <button
                          className="btn btn-danger"
                          onClick={removeAltPhone}
                          disabled={true}
                          style={{
                            opacity: "0",
                            height: "40px",
                            marginTop: "auto",
                            marginBottom: "1rem",
                          }}
                        >
                          -
                        </button>
                      </Form.Row>

                      {altPhones(dataSheet.altPhones)}

                      <button
                        className="btn btn-info"
                        onClick={addAltPhone}
                        disabled={isMaxPhoneNum}
                      >
                        Add alternative phones +
                      </button>
                    </Col>
                  </Row>
                </Tab>
                <Tab
                  eventKey="addresses"
                  title="Addresses"
                  className="py-4 px-3"
                >
                  <Form.Label>Address</Form.Label>

                  <Form.Group>
                    <Form.Control
                      required
                      id="address"
                      name="address"
                      type="text"
                      {...street1}
                      placeholder="Address"
                    />
                    <Form.Control.Feedback type="invalid">
                      Invalid street address.
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Row>
                    <Form.Group as={Col}>
                      <Form.Control
                        id="street2"
                        name="street2"
                        type="text"
                        {...street2}
                        placeholder="Apt / Unit / Building"
                      />
                    </Form.Group>

                    <Form.Group as={Col}>
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
                  </Form.Row>

                  <Form.Row>
                    <Form.Group as={Col}>
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
                    <Form.Group as={Col}>
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
                  </Form.Row>

                  {altAddresses(dataSheet.altAddresses)}

                  <button
                    className="btn btn-info"
                    onClick={addAltAddress}
                    disabled={isMaxAddressNum}
                  >
                    Add alternative addresses +
                  </button>
                </Tab>

                <Tab
                  eventKey="additional"
                  title="Additional Information"
                  className="py-4 px-3"
                >
                  <Row>
                    <Col>
                      <Form.Group>
                        <Form.Label>Political Affiliation</Form.Label>
                        <Form.Control
                          as="select"
                          id="affiliation"
                          name="affiliation"
                          value={affiliation}
                          onChange={(e) => setAffiliation(e.target.value)}
                        >
                          <option value="" selected={affiliation === ""}>
                            Choose One
                          </option>
                          <option value="republican">Republican</option>
                          <option value="independent">Independent</option>
                          <option value="democrat">Democrat</option>
                          <option value="other">Other</option>
                        </Form.Control>
                      </Form.Group>

                      <hr />

                      {relatives(dataSheet.relatives)}

                      <button
                        className="btn btn-info"
                        onClick={addRelative}
                        disabled={isMaxRelativeNum}
                      >
                        Add Relative +
                      </button>
                    </Col>

                    <Col>
                      <Form.Group>
                        <Form.Label>Ethnicity</Form.Label>
                        <Form.Control
                          as="select"
                          id="ethnicity"
                          name="ethnicity"
                          value={ethnicity}
                          onChange={(e) => setEthnicity(e.target.value)}
                        >
                          <option value="" selected={ethnicity === ""}>
                            Choose One
                          </option>
                          <option value="white">White</option>
                          <option value="native">Native American</option>
                          <option value="african">African American</option>
                          <option value="asian">Asian American</option>
                          <option value="hispanic">Hispanic American</option>
                          <option value="other">Other</option>
                        </Form.Control>
                      </Form.Group>

                      <hr />

                      {employers(dataSheet.employers)}

                      <button
                        className="btn btn-info"
                        onClick={addEmployer}
                        disabled={isMaxEmployerNum}
                      >
                        Add Employer +
                      </button>
                    </Col>
                  </Row>
                </Tab>

                <Tab
                  eventKey="notification"
                  title="Notifications"
                  className="py-4 px-3"
                >
                  <Row className="pt-5">
                    <Col>
                      <Form.Group>
                        <Form.Label>Notification Email</Form.Label>
                        <Form.Control
                          as="select"
                          id="notificationEmail"
                          name="notificationEmail"
                          value={notificationEmail}
                          onChange={(e) => setNotificationEmail(e.target.value)}
                        >
                          <option value="" selected={notificationEmail === ""}>
                            Choose One
                          </option>
                          <option value={customer.email}>
                            {customer.email}
                          </option>
                          {notificationEmailList()}
                        </Form.Control>
                      </Form.Group>
                    </Col>

                    <Col>
                      <Form.Group>
                        <Form.Label>Notification SMS</Form.Label>
                        <Form.Control
                          as="select"
                          id="notificationSMS"
                          name="notificationSMS"
                          value={notificationSMS}
                          onChange={(e) => setNotificationSMS(e.target.value)}
                        >
                          <option value="" selected={notificationSMS === ""}>
                            Choose One
                          </option>
                          <option value={customer.phone}>
                            {customer.phone}
                          </option>
                          {notificationSMSList()}
                        </Form.Control>
                      </Form.Group>
                    </Col>
                  </Row>
                </Tab>
              </Tabs>

              <Row>
                <Col className="d-flex pt-3">
                  <button className="btn btn-green m-0 ml-auto" type="submit">
                    Update
                  </button>
                </Col>
              </Row>
            </Form>
          </Col>
        </Row>
      </Container>

      <PageLoading pageLoading={pageLoading} />
      <PageError />
      <ThankyouPopup />
    </>
  );
}
