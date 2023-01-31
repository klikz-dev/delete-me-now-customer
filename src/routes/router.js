import React from "react";
import { useSelector } from "react-redux";
import { BrowserRouter as Router, Switch, Redirect } from "react-router-dom";

import PrivateRoute from "./private.route";
import PublicRoute from "./public.route";

import Menu from "../components/menu";
import Header from "../components/header";
import Footer from "../components/footer";
import Login from "../components/login";
import Register from "../components/register";
import Verify from "../components/verify";
import PWForgot from "../components/pw-forgot";
import PWReset from "../components/pw-reset";
import PageDashboard from "../components/page.dashboard";
import AccountOrders from "../components/page.account.orders";
import AccountPayment from "../components/page.account.payment";
import AccountData from "../components/page.account.data";
import AccountSecurity from "../components/page.account.security";
import AccountMembers from "../components/page.account.members";
import ReportList from "../components/page.report.list";
import ReportDetail from "../components/page.report.detail";
import Alerts from "../components/page.alerts";
import SupportList from "../components/page.support.list";
import SupportDetail from "../components/page.support.detail";
import SupportNew from "../components/page.support.new";
import SubscriptionsSolo from "../components/subscriptions.solo";
import SubscriptionsDouble from "../components/subscriptions.double";
import SubscriptionsFamily from "../components/subscriptions.family";

export default function MainRouter() {
  const auth_obj = useSelector((state) => state.auth);
  const { isAuthenticated } = auth_obj;

  return (
    <div id="content" className="d-flex flex-row">
      <Router>
        {isAuthenticated && (
          <div
            className="page-left shadow vh-100 bg-white navigation"
            style={{ width: "270px", position: "fixed", top: "0", zIndex: "9" }}
          >
            <Menu />
          </div>
        )}

        <div
          className="page-right w-100 min-vh-100 d-flex flex-column"
          style={{ paddingLeft: isAuthenticated ? "270px" : "0" }}
        >
          {isAuthenticated && <Header />}
          <main>
            <Switch>
              <PublicRoute
                exact
                path="/login"
                component={Login}
                isAuthenticated={isAuthenticated}
              />

              <PublicRoute
                exact
                path="/register"
                component={Register}
                isAuthenticated={isAuthenticated}
              />

              <PublicRoute
                path="/pw-reset/:id"
                component={PWReset}
                isAuthenticated={isAuthenticated}
              />

              <PublicRoute
                path="/pw-forgot"
                component={PWForgot}
                isAuthenticated={isAuthenticated}
              />

              <PublicRoute
                exact
                path="/verify/:id"
                component={Verify}
                isAuthenticated={isAuthenticated}
              />

              <PublicRoute
                path="/subscriptions/solo"
                component={SubscriptionsSolo}
                isAuthenticated={isAuthenticated}
              />

              <PublicRoute
                path="/subscriptions/double"
                component={SubscriptionsDouble}
                isAuthenticated={isAuthenticated}
              />

              <PublicRoute
                path="/subscriptions/family"
                component={SubscriptionsFamily}
                isAuthenticated={isAuthenticated}
              />

              <PrivateRoute
                exact
                path="/"
                component={PageDashboard}
                isAuthenticated={isAuthenticated}
              />

              <PrivateRoute
                exact
                path="/account/orders"
                component={AccountOrders}
                isAuthenticated={isAuthenticated}
              />

              <PrivateRoute
                exact
                path="/account/members"
                component={AccountMembers}
                isAuthenticated={isAuthenticated}
              />

              <PrivateRoute
                exact
                path="/account/payment"
                component={AccountPayment}
                isAuthenticated={isAuthenticated}
              />

              <PrivateRoute
                exact
                path="/account/data"
                component={AccountData}
                isAuthenticated={isAuthenticated}
              />

              <PrivateRoute
                exact
                path="/account/security"
                component={AccountSecurity}
                isAuthenticated={isAuthenticated}
              />

              <PrivateRoute
                exact
                path="/reports"
                component={ReportList}
                isAuthenticated={isAuthenticated}
              />

              <PrivateRoute
                exact
                path="/reports/:id"
                component={ReportDetail}
                isAuthenticated={isAuthenticated}
              />

              <PrivateRoute
                exact
                path="/alerts"
                component={Alerts}
                isAuthenticated={isAuthenticated}
              />

              <PrivateRoute
                exact
                path="/supports"
                component={SupportList}
                isAuthenticated={isAuthenticated}
              />

              <PrivateRoute
                exact
                path="/supports/new"
                component={SupportNew}
                isAuthenticated={isAuthenticated}
              />

              <PrivateRoute
                exact
                path="/supports/:id"
                component={SupportDetail}
                isAuthenticated={isAuthenticated}
              />

              <Redirect to={isAuthenticated ? "/" : "/login"} />
            </Switch>
          </main>
          {isAuthenticated && <Footer />}
        </div>
      </Router>
    </div>
  );
}
