/**
 * Navigation bar component.
 */

import React from "react";
import { Link, Form } from "@remix-run/react";

const Nav = () => {
  return (
    <nav>
      <Link to="/workflows" className="nav__link">
        Workflows
      </Link>
      <Form className="nav__signout__container" action="/signout" method="post">
        <button className="nav__signout"> Sign Out</button>
      </Form>
    </nav>
  );
};

export default Nav;
