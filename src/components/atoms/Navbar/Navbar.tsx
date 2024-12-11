import React, { useState } from "react";
import { NavLink } from "react-router-dom";

interface IMenu {
  menu: string;
  onClick?: () => void;
  to?: string;
  children?: IMenu[];
}

interface IProps {
  rightMenu?: IMenu[];
}
const Navbar: React.FC<IProps> = ({ rightMenu = [] }) => {
  const [openDropdown, setOpenDropdown] = useState<null | number>(null);
  const renderRightMenu = (arr: IMenu[], index: number) =>
    arr.map((item, key) => (
      <React.Fragment key={key}>
        <li
          className={
            item.children?.length ?? 0 > 0
              ? `dropdown ${openDropdown === index + key ? "open" : ""}`
              : ""
          }
        >
          {item.children?.length ?? 0 > 0 ? (
            <>
              <a
                role="button"
                className={
                  item.children?.length ?? 0 > 0 ? "dropdown-toggle" : ""
                }
                onClick={() =>
                  openDropdown === index + key
                    ? setOpenDropdown(null)
                    : setOpenDropdown(index + key)
                }
              >
                {item.menu} <span className="caret"></span>
              </a>
              <ul className="dropdown-menu">
                {renderRightMenu(item.children ?? [], arr.length + index + key)}
              </ul>
            </>
          ) : !!item.onClick ? (
            <a
              role="button"
              onClick={() => {
                setOpenDropdown(null);
                return item.onClick?.();
              }}
            >
              {item.menu}
            </a>
          ) : !!item.to ? (
            <NavLink to={item.to} onClick={() => setOpenDropdown(null)}>
              {item.menu}
            </NavLink>
          ) : (
            <a role="button" onClick={() => setOpenDropdown(null)}>
              {item.menu}
            </a>
          )}
        </li>
      </React.Fragment>
    ));
  return (
    <>
      <nav className="navbar navbar-default">
        <div className="container-fluid">
          <div className="navbar-header">
            <button
              type="button"
              className="navbar-toggle collapsed"
              data-toggle="collapse"
              data-target="#bs-example-navbar-collapse-1"
              aria-expanded="false"
            >
              <span className="sr-only">Toggle navigation</span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
            </button>
            <NavLink className="navbar-brand" to="/">
              Brand
            </NavLink>
          </div>

          <div
            className="collapse navbar-collapse"
            id="bs-example-navbar-collapse-1"
          >
            <ul className="nav navbar-nav navbar-right">
              {renderRightMenu(rightMenu, 0)}
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
