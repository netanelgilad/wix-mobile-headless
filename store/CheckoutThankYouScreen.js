import * as React from "react";
import { ActivityIndicator, Button, Divider, Text } from "react-native-paper";
import { View } from "react-native";
import { orders } from "@wix/ecom";
import { useWixSessionModules } from "../authentication/session";
import { useQuery } from "@tanstack/react-query";

export function CheckoutThankYouScreen({ route, navigation }) {
  React.useEffect(
    () =>
      navigation.addListener("beforeRemove", (e) => {
        if (e.data.action.type === "GO_BACK") {
          e.preventDefault();
        }
      }),
    [navigation]
  );

  const { getOrder } = useWixSessionModules(orders);
  const orderQuery = useQuery(["order", route.params.orderId], () =>
    getOrder(route.params.orderId)
  );

  if (orderQuery.isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (orderQuery.isError) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Error: {orderQuery.error.message}</Text>
      </View>
    );
  }

  const fullName =
    orderQuery.data.billingInfo.contactDetails.firstName +
    " " +
    orderQuery.data.billingInfo.contactDetails.lastName;

  return (
    <View
      style={{
        alignItems: "center",
        height: "100%",
      }}
    >
      <Text variant="titleLarge" style={{ marginTop: 50 }}>
        Thank you, {fullName}
      </Text>
      <Text style={{ marginTop: 20 }}>
        You'll receive an email confirmation shortly.
      </Text>
      <Text style={{ marginTop: 20 }}>
        Order number: {orderQuery.data.number}
      </Text>

      <Divider />
      <View
        style={{
          flexDirection: "row",
          marginHorizontal: 40,
          marginVertical: 20,
        }}
      >
        <Text style={{ flexGrow: 1 }}>Subtotal</Text>
        <Text>{orderQuery.data.priceSummary.subtotal.formattedAmount}</Text>
      </View>
      <View
        style={{
          flexDirection: "row",
          marginHorizontal: 40,
        }}
      >
        <Text style={{ flexGrow: 1 }}>Sales Tax</Text>
        <Text>{orderQuery.data.priceSummary.tax.formattedAmount}</Text>
      </View>
      <View
        style={{
          flexDirection: "row",
          marginHorizontal: 40,
          marginTop: 20,
        }}
      >
        <Text variant="titleLarge" style={{ flexGrow: 1 }}>
          Total
        </Text>
        <Text>{orderQuery.data.priceSummary.total.formattedAmount}</Text>
      </View>
      <View style={{ flexGrow: 1 }} />
      <View style={{ padding: 20, width: "100%" }}>
        <Button
          style={{ width: "100%" }}
          mode="elevated"
          onPress={() => {
            navigation.navigate("Products");
          }}
        >
          Continue Shopping
        </Button>
      </View>
    </View>
  );
}
