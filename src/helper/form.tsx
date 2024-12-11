import { FormEvent, useState } from "react";
import yup from "yup";

// const reducer = (state, action) => {
//   switch (action.type) {
//     case "SET_FORM":
//       return { ...state, [action.payload.field]: action.payload.value };
//     case "RESET_FORM":
//       return { ...state, ...action.payload };
//     default:
//       return { ...state };
//   }
// };

interface IProps {
  initialValues: any;
  validation?: yup.ObjectSchema<any> | null;
  mode?: "onTouched" | "onChanged" | "onSubmit";
}

export type ICallbackSubmit = (
  values: any,
  config: { setSubmitting: (bool: boolean) => void }
) => void;

export const useForm = ({
  initialValues,
  validation = null,
  mode = "onTouched",
}: IProps) => {
  // const [form, dispatch] = useReducer(reducer, initialValues);
  const [form, setForm] = useState(initialValues);

  const [isFormTouched, setIsFormTouched] = useState<string[]>([]);
  // const [isSubmitTouched, setIsSubmitTouched] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [errForm, setErrForm] = useState<{
    [field: keyof typeof initialValues]: any;
  }>({});

  const [isValid, setIsValid] = useState(validation === null ? true : false);

  const handleValidation = (
    currentForm: any,
    touched = isFormTouched,
    cb: (res: { [field: string]: string } | null) => void = () => null
  ) => {
    if (validation !== null) {
      validation
        .validate(currentForm, { abortEarly: false })
        .then(() => {
          setErrForm({});
          cb(null);
        })
        .catch((err) => {
          let errin = {};
          (!!err.inner ? err.inner : []).forEach(
            (item: { path: string; message: string }) => {
              errin = { ...errin, [item.path]: item.message };
            }
          );

          if (mode === "onTouched") {
            setErrForm(() => {
              let touchError = {};
              touched.forEach((item) => {
                touchError = {
                  ...touchError,
                  [item]: errin[item as keyof typeof errin],
                };
              });

              return { ...touchError };
            });
          }
          if (mode === "onChanged") {
            setErrForm({ ...errin });
          }

          cb(errin);
        });
    } else {
      cb(null);
    }
  };

  const handleFieldValue = (field: string, value: any) => {
    // dispatch({
    //   type: "SET_FORM",
    //   payload: {
    //     field,
    //     value,
    //   },
    // });
    setIsFormTouched((prev) => {
      const touched =
        prev.findIndex((item) => item === field) < 0
          ? [...prev, field]
          : [...prev];

      setForm((prev: any) => {
        const currentForm = { ...prev, [field]: value };
        handleValidation(currentForm, touched, (err) => {
          if (!!!err) {
            setIsValid(true);
          } else {
            setIsValid(false);
          }
        });
        return currentForm;
      });

      return touched;
    });
  };

  const handleSubmit = (cb: ICallbackSubmit) => (e: FormEvent) => {
    e.preventDefault();
    handleValidation(form, [], (err) => {
      if (!!!err) {
        setSubmitting(true);
        cb(form, { setSubmitting });
      } else {
        if (
          mode === "onSubmit" ||
          mode === "onTouched" ||
          mode === "onChanged"
        ) {
          setErrForm({ ...err });
        }
      }
    });
  };

  const handleReset = () => {
    setForm(initialValues);
  };

  const handleChange = (e: React.ChangeEvent<any>) => {
    handleFieldValue(e.currentTarget.name, e.currentTarget.value);
  };

  return {
    handleSubmit,
    errors: errForm,
    setFieldValue: handleFieldValue,
    values: form,
    handleReset,
    isSubmitting,
    isValid,
    handleChange,
  } as const;
};
