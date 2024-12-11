import axios, { AxiosError, AxiosResponse } from "axios";
import { useCallback, useState } from "react";
import { expandJSON } from "./helper";

export const useLazyFetch = ({
  url,
  method,
  type = "formdata",
}: {
  url: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  type?: "formdata" | "json";
}) => {
  const [loading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  return [
    useCallback(
      (
        config: { params?: string; query?: any; data?: any } | null,
        token: string | null,
        cb: (error: AxiosError | null, response: AxiosResponse | null) => void
      ) => {
        const source = axios.CancelToken.source();
        setIsLoading(true);

        const form = new FormData();
        if (type === "formdata") {
          expandJSON(config?.data).forEach((el) => {
            form.append(el.label, el.value);
          });
        }
        axios({
          url: `${url}${!!config?.params ? "/" + config?.params : ""}${
            !!config?.query
              ? "?" +
                expandJSON(config?.query)
                  .map((item) => `${item.label}=${item.value}`)
                  .join("&")
              : ""
          }`,
          method,
          ...(method === "GET"
            ? {}
            : { data: type === "formdata" ? form : config?.data }),
          headers: {
            "X-API-KEY": import.meta.env.VITE_WEBIVERT_API_KEY,
            ...(!!token ? { Authorization: token } : {}),
          },
          cancelToken: source.token,
        })
          .then((response) => {
            setIsLoading(false);
            setResult(response.data);
            cb(null, response);
          })
          .catch((err) => {
            setIsLoading(false);
            cb(err, null);
          });
        return () => {
          source.cancel("Cancelling in cleanup");
        };
      },
      [method, type, url]
    ),
    { loading, data: result },
  ] as const;
};

interface IConfig {
  url: string;
  path?: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  data?: any;
  type?: "formdata" | "json";
}

export const onFetchArrayAsync =
  (token?: string) =>
  (
    config: IConfig[] = [],
    {
      beforeSend = () => null,
      success,
      error,
    }: {
      beforeSend?: () => void;
      success: (response: axios.AxiosResponse<any, any>[]) => void;
      error: (err: any) => void;
    }
  ) => {
    beforeSend();
    Promise.all(
      config.map((item) => {
        const form = new FormData();
        if (item.data) {
          const dt = expandJSON(item.data);
          for (const i in dt) {
            form.append(dt[i].label, dt[i].value);
          }
        }
        return axios({
          method: !!item.method ? item.method : "GET",
          url: item.url + (!!item.path ? item.path : ""),
          headers: {
            ...(!!token ? { Authorization: token } : {}),
            "Content-Type":
              item.type === "json" ? "application/json" : "multipart/form-data",
            "X-API-KEY": import.meta.env.VITE_WEBIVERT_API_KEY,
          },
          ...((!!item.method ? item.method : "GET") === "GET"
            ? {
                params: item.data,
              }
            : {
                data: item.type === "json" ? item.data : form,
              }),
        });
      })
    )
      .then((response) => {
        success(response);
      })
      .catch((err) => {
        error(err);
      });
  };
