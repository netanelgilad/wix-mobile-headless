import { createDrawerNavigator } from "@react-navigation/drawer";
import { NavigationContainer } from "@react-navigation/native";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { OAuthStrategy } from "@wix/sdk-react";
import { members } from "@wix/members";
import { WixProvider } from "@wix/sdk-react";
import * as React from "react";
import { Button, Text, View } from "react-native";
import "react-native-gesture-handler";
import {
  ActivityIndicator,
  PaperProvider,
  IconButton,
} from "react-native-paper";
import "react-native-url-polyfill/auto";
import { MemberHeaderMenu } from "./authentication/MemberHeaderMenu";
import {
  useWixSessionModules,
  useWixSession,
  WixSessionProvider,
} from "./authentication/session";
import { StoreScreen } from "./store/StoreScreen";
import * as Linking from "expo-linking";

const Drawer = createDrawerNavigator();

function MemberNickname() {
  const { getMyMember } = useWixSessionModules(members);

  const memberDetails = useQuery(["memberDetails"], getMyMember);

  if (memberDetails.isLoading) {
    return <ActivityIndicator />;
  }

  if (memberDetails.isError) {
    return <Text>Error: {memberDetails.error.message}</Text>;
  }

  return <Text>{memberDetails.data.member.profile.nickname}</Text>;
}

function HomeScreen({ navigation }) {
  const { session } = useWixSession();

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>
        Home Screen:{" "}
        {session.refreshToken.role === "member" ? (
          <MemberNickname />
        ) : (
          "Anonymous"
        )}
      </Text>
      <Button
        title="Go to Details"
        onPress={() => navigation.navigate("Details")}
      />
    </View>
  );
}

function DetailsScreen({ navigation }) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>Details Screen</Text>
      <Button
        title="Go to Details... again"
        onPress={() => navigation.push("Details")}
      />
      <Button title="Go to Home" onPress={() => navigation.navigate("Home")} />
      <Button title="Go back" onPress={() => navigation.goBack()} />
      <Button
        title="Go back to first screen in stack"
        onPress={() => navigation.popToTop()}
      />
    </View>
  );
}

const queryClient = new QueryClient();

function App() {
  return (
    <PaperProvider>
      <QueryClientProvider client={queryClient}>
        <WixProvider
          auth={OAuthStrategy({
            clientId: "2fb39349-3744-4242-920d-9ccd74af3229",
          })}
        >
          <WixSessionProvider>
            <NavigationContainer
              linking={{
                prefixes: [Linking.createURL("/")],
                config: {
                  screens: {
                    Store: {
                      path: "store",
                      screens: {
                        CheckoutThankYou: "checkout/thank-you",
                        Cart: "cart",
                        Products: "products",
                      },
                    },
                  },
                },
              }}
            >
              <Drawer.Navigator
                screenOptions={({ navigation, route }) => ({
                  headerRight: () => (
                    <View
                      style={{
                        marginRight: 10,
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      {route.name === "Store" && (
                        <IconButton
                          icon="cart"
                          onPress={() => navigation.navigate("Cart")}
                        />
                      )}
                      <MemberHeaderMenu navigation={navigation} />
                    </View>
                  ),
                })}
              >
                <Drawer.Screen
                  name="Home"
                  component={HomeScreen}
                  options={{
                    headerTitle: () => <Text>Home</Text>,
                  }}
                />
                <Drawer.Screen
                  name="Store"
                  component={StoreScreen}
                  options={{
                    headerTitle: () => <Text>Store</Text>,
                  }}
                />
                <Drawer.Screen name="Details" component={DetailsScreen} />
              </Drawer.Navigator>
            </NavigationContainer>
          </WixSessionProvider>
        </WixProvider>
      </QueryClientProvider>
    </PaperProvider>
  );
}

export default App;
