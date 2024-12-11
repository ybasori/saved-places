export const parseJwt = (token: string) => {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );

  return JSON.parse(jsonPayload);
};

const onArrayForm = (
  name: string,
  data: { [name: string]: any },
  obj: { label: string; value: any }[]
) => {
  let newObj = [...obj];
  for (const key in data) {
    if (
      (Array.isArray(data[key]) || typeof data[key] === "object") &&
      !(data[key] instanceof File)
    ) {
      newObj = onArrayForm(`${name}[${key}]`, data[key], newObj);
    } else {
      newObj = [...newObj, { label: `${name}[${key}]`, value: data[key] }];
    }
  }
  return newObj;
};

export const expandJSON = (data: { [name: string]: any }) => {
  let obj: { label: string; value: any }[] = [];
  for (const key in data) {
    if (
      Array.isArray(data[key]) ||
      (typeof data[key] === "object" && !(data[key] instanceof File))
    ) {
      obj = onArrayForm(`${key}`, data[key], obj);
    } else {
      obj = [
        ...obj,
        {
          label: key,
          value: data[key],
        },
      ];
    }
  }
  return obj;
};
