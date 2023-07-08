import { parse, useURL } from "expo-linking";

export function OrderSummaryScreen() {
  const url = useURL();

  if (!url) {
    return null;
  }

  const { queryParams } = parse(url);

  return <Text>Order ID: {queryParams.orderId} </Text>;
}
