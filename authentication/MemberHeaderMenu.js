import * as React from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { members } from "@wix/members";
import { useWixModules } from "@wix/sdk-react";
import { TouchableHighlight } from "react-native";
import {
  ActivityIndicator,
  Avatar,
  Divider,
  Menu,
  Button,
} from "react-native-paper";
import { useWixSession } from "./session";
import { useWixAuth } from "@wix/sdk-react";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";

export function MemberHeaderMenu({ navigation }) {
  const { session } = useWixSession();

  if (session.refreshToken.role !== "member") {
    return <SignInButton />;
  } else {
    return <MemberMenu navigation={navigation} />;
  }
}

function SignInButton() {
  const { setSession } = useWixSession();
  const auth = useWixAuth();

  const authSessionMutation = useMutation(
    async () => {
      const data = auth.generateOAuthData(
        Linking.createURL("oauth/wix/callback"),
        "stam"
      );

      const { authUrl } = await auth.getAuthUrl(data);
      return { authUrl, data };
    },
    {
      onSuccess: async ({ authUrl, data }) => {
        const subscription = Linking.addEventListener("url", async (event) => {
          // need to use parseFromUrl but it should get the url from the event
          // then we can polyfill the URLSearchParams and the URL class
          const theURL = new URL(event.url);
          const params = new URLSearchParams(theURL.hash.substring(1));
          const tokens = await auth.getMemberTokens(
            params.get("code"),
            params.get("state"),
            data
          );
          setSession(tokens);

          subscription.remove();
        });

        WebBrowser.openBrowserAsync(authUrl, {});
      },
    }
  );

  return (
    <Button
      mode="elevated"
      icon={"login"}
      loading={authSessionMutation.isLoading}
      disabled={authSessionMutation.isLoading}
      onPress={async () => authSessionMutation.mutate()}
    >
      Login
    </Button>
  );
}

function MemberMenu({ navigation }) {
  const { newVisitorSession } = useWixSession();
  const { getMyMember } = useWixModules(members);
  const memberQuery = useQuery(["myMember"], () => getMyMember());
  const [visible, setVisible] = React.useState(false);

  if (memberQuery.isLoading) {
    return <ActivityIndicator animating={true} />;
  }

  if (memberQuery.isError) {
    return null;
  }

  return (
    <Menu
      visible={visible}
      onDismiss={() => setVisible(false)}
      anchorPosition="bottom"
      anchor={
        <TouchableHighlight
          onPress={() => setVisible(true)}
          underlayColor="white"
        >
          <Avatar.Image
            size={36}
            source={{ uri: memberQuery.data.member.profile.photo.url }}
          />
        </TouchableHighlight>
      }
    >
      <Menu.Item onPress={() => {}} title="Item 1" />
      <Menu.Item onPress={() => {}} title="Item 2" />
      <Divider />
      <Menu.Item
        onPress={async () => {
          await newVisitorSession();
          navigation.navigate("Home");
        }}
        title="Sign out"
      />
    </Menu>
  );
}
