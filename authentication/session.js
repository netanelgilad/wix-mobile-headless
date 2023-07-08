import { useWixAuth, useWixModules } from "@wix/sdk-react";
import * as SecureStore from "expo-secure-store";
import * as React from "react";
import "react-native-gesture-handler";
import "react-native-url-polyfill/auto";

/**
 * @type {React.Context<{
 *  session: import("@wix/api-client").Tokens,
 * setSession: (session: import("@wix/api-client").Tokens) => Promise<void>,
 * newVisitorSession: () => Promise<void> }>}
 */
const WixSessionContext = React.createContext(null);

export function WixSessionProvider(props) {
  const [session, setSessionState] = React.useState(null);
  const auth = useWixAuth();

  const setSession = React.useCallback(
    async (tokens) => {
      auth.setTokens(tokens);
      await SecureStore.setItemAsync("wixSession", JSON.stringify(tokens));
      setSessionState(tokens);
    },
    [auth, setSessionState]
  );

  const newVisitorSession = React.useCallback(async () => {
    const tokens = await auth.generateVisitorTokens();
    setSession(tokens);
  }, [auth, setSessionState]);

  React.useEffect(() => {
    SecureStore.getItemAsync("wixSession").then((wixSession) => {
      if (!wixSession) {
        newVisitorSession();
      } else {
        setSession(JSON.parse(wixSession));
      }
    });
  }, []);

  if (!session) {
    return null;
  }

  return (
    <WixSessionContext.Provider
      value={{
        session,
        setSession,
        newVisitorSession,
      }}
    >
      {props.children}
    </WixSessionContext.Provider>
  );
}

export function useWixSession() {
  const context = React.useContext(WixSessionContext);
  if (context === undefined) {
    throw new Error("useWixSession must be used within a WixSessionProvider");
  }
  return context;
}

/**
 *
 * @type {import("@wix/sdk-react").useWixModules}
 */
export function useWixSessionModules(modules) {
  useWixSession();
  return useWixModules(modules);
}
