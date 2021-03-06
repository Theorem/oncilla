import type { DebugConfig, FullDB } from "../../../core";
import type { ReactType } from "../types";
import { makeMassUpdater, makeUpdater } from "./updater";
import type { Changer, MassUpdater } from "./types";

export type { MassUpdater, Updater } from "./types";

function flat<T>(list: T[][]): T[] {
  return list.reduce((a, b) => a.concat(b));
}

export function makeHooks<Domain>(params: {
  React: ReactType;
  useTryDB: () => FullDB<Domain> | "missing-provider";
}) {
  const { React, useTryDB } = params;

  function useRerender(): () => void {
    const [, rerender] = React.useReducer((x) => x + 1, 0);
    return () => {
      rerender();
    };
  }

  const useDataMap = function <K extends keyof Domain>(
    definition: { [k in K]: string[] }
  ): [
    { [k in K]: { [id: string]: Domain[k] } } | "loading",
    MassUpdater<Domain, K>
  ] {
    const db = useTryDB();
    if (db === "missing-provider")
      throw new Error(
        "The component you render needs a DBProvider grand-parent"
      );

    const items = flat(
      (Object.keys(definition) as K[]).map((kind) =>
        definition[kind].map((id) => ({ kind, id }))
      )
    );
    const definitionHash = JSON.stringify(definition);

    const rerender = useRerender();
    React.useEffect(
      () =>
        db._internals.events.on("change", function (k) {
          if (items.some(({ kind, id }) => kind === k[0] && id === k[1]))
            rerender();
        }),
      [definitionHash]
    );

    React.useEffect(() => {
      const cancels = items.map(({ kind, id }) => db.observe(kind, id));
      return () => cancels.forEach((f) => f());
    }, [definitionHash]);

    const allData = db._internals.withPendingTransactions(
      db._internals.canonData
    );
    const isLoaded = items.every(({ kind, id }) => Boolean(allData[kind][id]));

    const data: { [k in K]: { [id: string]: Domain[k] } } = {} as any;
    if (isLoaded) {
      items.forEach(({ kind, id }) => {
        data[kind] = data[kind] || {};
        const atom = allData[kind][id];
        if (!atom)
          throw new Error(
            `Oncilla internal consistency error, unexpectedly missing ${kind}-${id} in the data`
          );
        const kindCollection: { [k: string]: Domain[typeof kind] } = data[kind];
        kindCollection[id] = atom.value;
      });
    }

    return [
      isLoaded ? data : "loading",
      React.useCallback(makeMassUpdater(db), [db]),
    ];
  };

  return {
    useConnectivity: () => {
      const db = useTryDB();

      const rerender = useRerender();
      React.useEffect(
        () =>
          db === "missing-provider"
            ? undefined
            : db._internals.events.on("connectivity-changed", rerender),
        [db, rerender]
      );

      if (db === "missing-provider") return "online";
      return db.connectivity();
    },

    useCreate: function <K extends keyof Domain>(kind: K) {
      const db = useTryDB();
      if (db === "missing-provider")
        throw new Error(
          "The component you render needs a DBProvider grand-parent"
        );

      return function (id: string, value: Domain[K]) {
        db.create(kind, id, value);
      };
    },

    useData: function <K extends keyof Domain>(
      kind: K,
      id: string
    ): Changer<Domain[K]> {
      const [data, update] = useDataMap<K>({
        [kind]: [id],
      } as { [k in K]: string[] });
      return [
        data === "loading" ? "loading" : data[kind][id],
        makeUpdater(update, kind, id),
      ];
    },

    useMultipleData: function useMultipleData<K extends keyof Domain>(
      kind: K,
      ids: string[]
    ): [
      { [id: string]: Domain[K] } | "loading",
      (id: string, delta: (prev: Domain[K]) => Domain[K]) => void
    ] {
      const definition: { [k in keyof Domain]: string[] } = {
        [kind]: ids,
      } as any;
      const [data, update] = useDataMap<K>(definition);
      return [
        data === "loading" ? "loading" : data[kind],
        (id: string, delta: (prev: Domain[K]) => Domain[K]) =>
          update(kind, id, delta),
      ];
    },

    useOncillaDebug: (): [
      DebugConfig,
      (partial: Partial<DebugConfig>) => void
    ] => {
      const db = useTryDB();
      if (db === "missing-provider")
        throw new Error(
          "The component you render needs a DBProvider grand-parent"
        );

      const { debugConfig, events } = db._internals;

      const rerender = useRerender();
      React.useEffect(() => events.on("debug-config-changed", rerender), []);

      return [
        debugConfig,
        React.useCallback(function (updates: Partial<DebugConfig>) {
          Object.assign(debugConfig, updates);
          events.emit("debug-config-changed", undefined);
        }, []),
      ];
    },

    usePendingChanges: () => {
      const db = useTryDB();

      const rerender = useRerender();
      React.useEffect(
        () =>
          db === "missing-provider"
            ? undefined
            : db._internals.events.on(
                "pending-transaction-count-changed",
                rerender
              ),
        []
      );

      if (db === "missing-provider") return 0;
      return db._internals.pendingTransactionCount();
    },
  };
}
