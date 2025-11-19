import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  NativeBaseProvider,
  Flex,
  Box,
  Row,
  StatusBar,
  Button,
  Input,
  ScrollView,
} from "native-base";

import Card from "./card.js";
import cardData from "./cardData";

export default function Sites() {
  let [showSites, setShowSites] = useState(true);

  return (
    <Box  h="100%" w="100%" backgroundColor="white">
            <StatusBar translucent={true} backgroundColor={"transparent"} />

      <Row background="primary.800" p="5"  w="100%" h="150">
        <Button my="5">Cog</Button>
        <Input flexGrow="3">Cog</Input>
        <Button onPress={() => setShowSites(!showSites)}>
          {showSites == true ? "Sites" : "Notes"}
        </Button>
      </Row>
      {/* <Text>Sites</Text>
      <Button onPress={() => console.log()}></Button> */}
      <ScrollView display="flex" h="100%" w="100%">
        {!!showSites &&
          cardData.map((el, i) => {
            console.log(el);
            return (
              // <Box  backgroundColor="white" onPress={() => console.log()}></Box>
              <Card key={i} image={el} />
            );
          })
          
          
          }
        <Box h="2500"></Box>
      </ScrollView>
    </Box>
  );
}
