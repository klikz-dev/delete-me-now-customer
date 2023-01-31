import axios from "axios";

export const customerRegisterService = async (customer) => {
  try {
    return await axios.post(`${window.$server_url}/customer/add`, {
      customer: customer,
    });
  } catch (err) {
    return {
      error: true,
      errMsg: err.message,
    };
  }
};

export const customerGetService = async (_id) => {
  try {
    return await axios.get(`${window.$server_url}/customer/get/${_id}`);
  } catch (err) {
    return {
      error: true,
      errMsg: err.message,
    };
  }
};

export const customerGetDataSheetService = async (_id) => {
  try {
    return await axios.get(`${window.$server_url}/customer/getdata/${_id}`);
  } catch (err) {
    return {
      error: true,
      errMsg: err.message,
    };
  }
};

export const customerGetMembersService = async (_id) => {
  try {
    return await axios.get(`${window.$server_url}/customer/members/${_id}`);
  } catch (err) {
    return {
      error: true,
      errMsg: err.message,
    };
  }
};

export const customerAddMemberService = async (member) => {
  try {
    return await axios.post(`${window.$server_url}/customer/members/new`, {
      member: member,
    });
  } catch (err) {
    return {
      error: true,
      errMsg: err.message,
    };
  }
};

export const customerUpdateMemberService = async (id, member) => {
  try {
    return await axios.patch(
      `${window.$server_url}/customer/members/update/${id}`,
      {
        member: member,
      }
    );
  } catch (err) {
    return {
      error: true,
      errMsg: err.message,
    };
  }
};

export const customerDeleteMemberService = async (id) => {
  try {
    return await axios.delete(
      `${window.$server_url}/customer/members/delete/${id}`
    );
  } catch (err) {
    return {
      error: true,
      errMsg: err.message,
    };
  }
};

export const customerDeleteService = async (_id) => {
  try {
    return await axios.delete(`${window.$server_url}/customer/delete/${_id}`);
  } catch (err) {
    return {
      error: true,
      errMsg: err.message,
    };
  }
};

export const customerUpdateService = async (customer) => {
  try {
    return await axios.patch(`${window.$server_url}/customer/update`, customer);
  } catch (err) {
    return {
      error: true,
      errMsg: err.message,
    };
  }
};

export const customerUpdateDataService = async (customerDataSheet) => {
  try {
    return await axios.patch(`${window.$server_url}/customer/updatedata`, {
      customerDataSheet: customerDataSheet,
    });
  } catch (err) {
    return {
      error: true,
      errMsg: err.message,
    };
  }
};

export const customerVerifyService = async (id) => {
  try {
    return await axios.patch(`${window.$server_url}/customer/verify/${id}`);
  } catch (err) {
    return {
      error: true,
      errMsg: err.message,
    };
  }
};

export const customerGetInvoicesService = async (customerId) => {
  try {
    return await axios.get(
      `${window.$server_url}/customer/invoices/${customerId}`
    );
  } catch (err) {
    return {
      error: true,
      errMsg: err.message,
    };
  }
};

export const customerGetCardsService = async (customerId) => {
  try {
    return await axios.get(
      `${window.$server_url}/customer/cards/${customerId}`
    );
  } catch (err) {
    return {
      error: true,
      errMsg: err.message,
    };
  }
};

export const customerGetSubscriptionsService = async (customerId) => {
  try {
    return await axios.get(
      `${window.$server_url}/customer/subscriptions/${customerId}`
    );
  } catch (err) {
    return {
      error: true,
      errMsg: err.message,
    };
  }
};

export const customerUnsubscribeService = async (customerId) => {
  try {
    return await axios.post(`${window.$server_url}/customer/unsubscribe`, {
      customerId: customerId,
    });
  } catch (err) {
    return {
      error: true,
      errMsg: err.message,
    };
  }
};

export const customerGetAlertsService = async (customerId) => {
  try {
    return await axios.get(`${window.$server_url}/alerts/${customerId}`);
  } catch (err) {
    return {
      error: true,
      errMsg: err.message,
    };
  }
};

export const customerSolveAlertService = async (customerId, alertId) => {
  try {
    return await axios.post(`${window.$server_url}/alerts/solve`, {
      customerId: customerId,
      alertId: alertId,
    });
  } catch (err) {
    return {
      error: true,
      errMsg: err.message,
    };
  }
};
