interface IProps {
  color?: "danger" | "info" | "success" | "warning";
  dismissible?: boolean;
  children: React.ReactNode;
  onClose?: () => void;
}

const Alert: React.FC<IProps> = ({
  color = "info",
  dismissible = false,
  children,
  onClose = () => null,
}) => {
  return (
    <div
      className={`alert alert-${color} ${
        dismissible ? "alert-dismissible" : ""
      }`}
      role="alert"
    >
      {dismissible ? (
        <button type="button" className="close" onClick={onClose}>
          <span aria-hidden="true">&times;</span>
        </button>
      ) : null}
      {children}
    </div>
  );
};

export default Alert;
