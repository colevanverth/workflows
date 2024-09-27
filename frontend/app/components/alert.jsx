/**
 * Modal alert for when the workflow is run.
 */

import React from "react";

const Alert = ({ message, color }) => {
  return <div className={`alert__${color}`}>{message}</div>;
};

export default Alert;
