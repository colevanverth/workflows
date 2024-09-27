/**
 * Button component.
 */

import React from "react";
import trash from "../images/trash.svg";
import run from "../images/run.svg";
import plus from "../images/plus.svg";

const iconMap = {
  trash,
  run,
  plus,
};

const Button = ({ label, icon, color, onClick }) => {
  return (
    <button
      className={`workflow__button__${color ? "color" : "monotone"}`}
      type="submit"
      onClick={onClick}
    >
      {icon && (
        <img
          src={iconMap[icon]}
          alt={`Button ${label}`}
          width={16}
          height={16}
        />
      )}
      {label && <span className="button__label">{label}</span>}
    </button>
  );
};

export default Button;
