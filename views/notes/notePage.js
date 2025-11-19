import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect, useContext } from "react";
import { StyleSheet, View } from "react-native";
import {
  NativeBaseProvider,
  Flex,
  Box,
  Row,
  Spacer,
  Button,
  Text,
  Image,
  Center,
} from "native-base";
import { ViewContext } from "../../viewContext";
import * as Clipboard from "expo-clipboard";
import Editor from "../editor/editor";
import uuidV4 from "../../utility/uuid";

export default function NotePage({ site }) {
  let [list, setList] = useState([]);

  const { view, setView } = useContext(ViewContext);
  console.log(site);

  useEffect(() => {
    getData("@noteList", site.site);
  }, []);

  const getData = async (key, site) => {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value !== null) {
        // value previously stored
        setList(JSON.parse(value.filter(el=>el.site===site.name)));
      } else {
        // storeData("@noteList", [])
        console.log(value);
      }
    } catch (e) {
      // error reading value
    }
  };

  const copyToClipboard = (value) => {
    Clipboard.setString(value);
  };

  return (
    <Box h="100%" w="100%" backgroundColor="#DCF1FA" paddingTop="20">
      <Image h="60%" w="100%" alt="image" source={site.image}></Image>

      <Text fontSize="4xl">{site.name}</Text>
      <Center flexDir="row" justifyContent="space-evenly">
          <Text>Hello</Text>
        <Button
          title="Click here to copy to Clipboard"
          onPress={copyToClipboard(site.name)}
        >
          clipboard
        </Button>
        <Button
          onPress={() =>
            setView(
              [<Editor
                note={{
                  id: uuidV4(),
                  title: "",
                  site: site.name,
                  body: "",
                }}
              />, ...view]
            )
          }
        >
          +
        </Button>
      <Text>Hello</Text>
      <Text>Hello</Text>
      </Center>
      {
          list.map(el=>{
            console.log(el)
              return (<Column><Text>el.title</Text><Text>{el.body}</Text></Column>)
            })
        }
    </Box>
  );
}
