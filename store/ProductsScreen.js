import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useWixModules } from "@wix/sdk-react";
import { products } from "@wix/stores";
import { ScrollView, Text } from "react-native";
import { List } from "react-native-paper";

export function ProductsScreen({ navigation }) {
  const { queryProducts } = useWixModules(products);

  const productsResponse = useQuery(["products"], () => queryProducts().find());

  if (productsResponse.isLoading) {
    return <Text>Loading...</Text>;
  }

  if (productsResponse.isError) {
    return <Text>Error: {productsResponse.error.message}</Text>;
  }

  return (
    <ScrollView
      keyboardShouldPersistTaps="always"
      alwaysBounceVertical={false}
      showsVerticalScrollIndicator={false}
    >
      <List.Section>
        {productsResponse.data.items.map((product) => (
          <List.Item
            key={product._id}
            title={product.name}
            onPress={() => {
              navigation.navigate("Product", { product });
            }}
            left={(props) => (
              <List.Image
                style={props.style}
                source={{
                  uri: product.media.mainMedia.image.url,
                }}
              />
            )}
          />
        ))}
      </List.Section>
    </ScrollView>
  );
}
