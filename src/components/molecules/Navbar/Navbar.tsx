import { useState } from "react";
import Modal from "@/components/atoms/Modal/Modal";
import { GoogleLogin } from "@react-oauth/google";
import ReCAPTCHA from "react-google-recaptcha";
import axios from "axios";
import { parseJwt } from "@/helper/helper";
import Alert from "@/components/atoms/Alert/Alert";
import NavbarAtom from "@/components/atoms/Navbar/Navbar";
import { setAuth } from "@/redux/reducers/auth.slice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { createSelector } from "@reduxjs/toolkit";

const authSelector = createSelector(
  [(state: RootState) => state.auth],
  (auth) => auth.authData
);

const Navbar = () => {
  const auth = useSelector(authSelector);
  const [isOpen, setIsOpen] = useState(false);
  const dispatch: AppDispatch = useDispatch();
  const [tab, setTab] = useState("signin");
  const [token, setToken] = useState<string | null>(null);
  const [alert, setAlert] = useState<{
    type: "danger" | "success";
    text: string;
  } | null>(null);
  const onChange = (value: string | null) => {
    setToken(value);
  };
  return (
    <>
      <NavbarAtom
        rightMenu={[
          ...(auth === null
            ? [
                {
                  menu: "Sign in / Sign up",
                  onClick: () => setIsOpen(true),
                },
              ]
            : [
                {
                  menu: auth.name,
                  children: [
                    {
                      menu: "Sign Out",
                      onClick: () => {
                        dispatch(setAuth(null));
                      },
                    },
                  ],
                },
              ]),
        ]}
      />
      <Modal
        isOpen={isOpen}
        toggle={() => setIsOpen(!isOpen)}
        backdrop="static"
      >
        <ul className="nav nav-tabs mb-2">
          <li role="presentation" className={tab === "signin" ? "active" : ""}>
            <a role="button" onClick={() => setTab("signin")}>
              Sign In
            </a>
          </li>
          <li role="presentation" className={tab === "signup" ? "active" : ""}>
            <a role="button" onClick={() => setTab("signup")}>
              Register
            </a>
          </li>
        </ul>

        {!!alert ? (
          <Alert color={alert.type} onClose={() => setAlert(null)}>
            {alert.text}
          </Alert>
        ) : null}

        {!!token ? (
          <GoogleLogin
            onSuccess={(credentialResponse) => {
              setAlert(null);
              const dt = parseJwt(credentialResponse.credential as string);
              Promise.all([
                axios({
                  url:
                    tab === "signin"
                      ? "https://wbvt.online/api-developer/v1/yusuf_basori/saved-place/login-with-provider"
                      : "https://wbvt.online/api-developer/v1/yusuf_basori/saved-place/register-with-provider",
                  method: "POST",
                  headers: {
                    "X-API-Key": import.meta.env.VITE_WEBIVERT_API_KEY,
                  },
                  data: {
                    ...(tab === "signin"
                      ? { username: dt.email, recaptcha: token }
                      : {
                          name: dt.name,
                          email: dt.email,
                          provider: "google",
                          id_by_provider: dt.sub,
                          recaptcha: token,
                        }),
                  },
                }),
              ])
                .then((response) => {
                  if (tab === "signin") {
                    setIsOpen(false);
                    response.forEach((element) => {
                      dispatch(
                        setAuth({
                          name: element.data.result.user.name,
                          token: element.data.result.token,
                          expires: element.data.result.expires,
                        })
                      );
                    });
                  } else {
                    setAlert({
                      type: "success",
                      text: "Register success! Continue to login!",
                    });
                  }
                  setToken(null);
                })
                .catch(() => {
                  setAlert({ type: "danger", text: "something went wrong!" });
                  setToken(null);
                });
            }}
            onError={() => {
              console.log("Login Failed");
            }}
          />
        ) : (
          <ReCAPTCHA
            sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
            onChange={onChange}
          />
        )}
      </Modal>
    </>
  );
};

export default Navbar;
