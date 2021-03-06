import type { ReactNode } from "react";
import { create, CreateParams, Data } from "../../core";
import { createContext } from "./context";
import { makeHooks } from "./hooks";
import type { ReactType } from "./types";

type Configuration<Domain> = {
  data: Data<Domain>;
  React: ReactType;
};

export function configure<Domain>(configuration: Configuration<Domain>) {
  const { data, React } = configuration;
  const { Provider, useTryDB } = createContext<Domain>({ React });
  const hooks = makeHooks({ useTryDB, React });

  return {
    ...hooks,
    create: (params: CreateParams<Domain>) => {
      const db = create<Domain>({ ...params, initialData: data });
      const withDB = (children: ReactNode) =>
        React.createElement(Provider as any, { value: db, children: children });
      return { db, withDB };
    },
    useTryDB,
  };
}
