import { useEffect, useState } from "react";

interface IProps {
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  toggle: () => void;
  isOpen: boolean;
  backdrop?: "static";
  size?: "lg" | "sm" | "";
}

const Modal: React.FC<IProps> = ({
  title,
  children,
  footer,
  toggle,
  isOpen,
  backdrop,
  size = "",
}) => {
  const [isShow, setIsShow] = useState(false);
  const [isShow2nd, setIsShow2nd] = useState(false);

  const handleOnClose = () => {
    setIsShow2nd(false);
    setTimeout(() => {
      toggle();
      setIsShow(false);
    }, 500);
  };

  useEffect(() => {
    if (isOpen) {
      setIsShow(true);
      setTimeout(() => {
        setIsShow2nd(true);
      }, 500);
    }
  }, [isOpen]);

  return (
    <>
      {isOpen ? (
        <>
          <div className={"modal-open"}>
            <div
              className={`modal-backdrop fade ${isShow2nd ? "in" : ""}`}
            ></div>
            <div
              className={`modal fade ${isShow2nd ? "in" : ""}`}
              role="dialog"
              style={{ display: isShow ? "block" : "none" }}
              onClick={() => (backdrop === "static" ? null : handleOnClose())}
            >
              <div
                className={`modal-dialog ${size == "" ? "" : "modal-" + size}`}
                role="document"
              >
                <div className="modal-content">
                  <div className="modal-header">
                    <button
                      type="button"
                      className="close"
                      aria-label="Close"
                      onClick={() => handleOnClose()}
                    >
                      <span aria-hidden="true">&times;</span>
                    </button>

                    {!!title ? <h4 className="modal-title">{title}</h4> : null}
                  </div>

                  <div className="modal-body">{children}</div>
                  {!!footer ? (
                    <div className="modal-footer">
                      {footer}
                      <button type="button" className="btn btn-default">
                        Close
                      </button>
                      <button type="button" className="btn btn-primary">
                        Save changes
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
};

export default Modal;
