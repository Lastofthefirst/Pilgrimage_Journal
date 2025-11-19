import React, { useState, useContext, useCallback, useEffect } from "react";
import {
  NativeBaseProvider,
  Flex,
  Box,
  Row,
  Text,
  Spacer,
  ScrollView,
  StatusBar,
  Button,
  Input,
  Image,
  CheckIcon,
  Select,
  useToast,
  KeyboardAvoidingView,
} from "native-base";
import { ViewContext } from "../../viewContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDebouncedCallback } from "use-debounce";
import EditorScreen from "./richTextEditor";
import cardData from "../sites/cardData";
import { Keyboard } from "react-native";
import Back from "../../svgs/back";



function SelectImage({associatedSite}){
  

  return (
    <Image
    h="50"
    w="60"
    rounded="2xl"
    key={associatedSite}
    alt={associatedSite}
    source={cardData.find((em) => em.name == associatedSite).image}
    mx="2"
  />
  )
}

export default function Editor({ note }) {
  let [body, setBody] = useState(note.body);
  let [title, setTitle] = useState(note.title);
  let [hasTyped, setHasTyped] = useState(false);
  let [associatedSite, setAssociatedSite] = useState(note.site);


  const { view, setView } = useContext(ViewContext);

  const Toast = useToast();
  

  // useEffeect(() => {
    
  // }, associatedSite);
  useEffect(() => {
    setTimeout(() => setHasTyped(true), 10000);
  }),
    [];

  // let [tick, setTick] = useState(0);

  // // useEffect(() => {
  // //   window.addEventListener("keydown", handleUserKeyPress);
  // //   return () => {
  // //     window.removeEventListener("keydown", handleUserKeyPress);
  // //   };
  // // }, [handleUserKeyPress]);
  // useEffect(() => {
  //   setInterval(function(tick){
  //     console.log(tick);
  //     if (tick == 0) {
  //       return;
  //     }
  //     if (tick > 1) {
  //       setTick(tick-1);

  //     }
  //     if (tick == 1) {
  //       setTick(tick-1);
  //     }
  //   }, 2000);
  //   return () => {
  //     clearInterval();
  //   };
  // }, []);

  function saveInput() {
    let titleCheck = title.length > 0;
    let bodyCheck = body.length > 0;
    if (titleCheck || bodyCheck) {
      if (hasTyped) {
        addNote("@noteList", {
          id: note.id,
          title: title,
          site: associatedSite,
          body: body,
          type: "text",
        });
        if (!Toast.isActive("save")) {
          Toast.show({
            id: "save",
            title: "Note Autosaved",
            placement: "top",
          });
        }
      }
    }
  }
  const debounced = useDebouncedCallback(
    // function
    () => saveInput(),
    // delay in ms
    500
  );

  useEffect(() => {
    debounced();
  }, [associatedSite, body, title]);



  let addNote = async (key, newData) => {
    try {
      // Doesnt properly handle editing notes
      let currentTime = new Date();

      newData.created = currentTime;

      let easyCreatedTime = `${
        currentTime.getMonth() + 1
      }/${currentTime.getDate()}/${currentTime.getFullYear()}`;

      newData.easyCreatedTime = easyCreatedTime;
      //save first user
      // await AsyncStorage.setItem(key, JSON.stringify(newData));
      let results = await AsyncStorage.getItem(key);

      let parsed = JSON.parse(results);

      let noCopies = parsed.filter((el) => el.id != newData.id);

      console.log(
        "If different we are editing an existing note:",
        parsed.length,
        noCopies.length
      );

      noCopies.push(newData);
      await AsyncStorage.setItem(key, JSON.stringify(noCopies));

      // read merged item
      let res2 = await AsyncStorage.getItem(key);
      console.log(1);

      // let shifted = [...view];
      // shifted.shift();
      // setView(shifted);
    } catch (err) {
      console.log(err);
    }
  };

  let goBack = async () => {
    if (!Toast.isActive("save")) {
      Toast.show({
        id: "save",
        title: "Saving note.",
        placement: "top",
        duration: 500,
      });
    }
    await addNote("@noteList", {
      id: note.id,
      title: title,
      site: associatedSite,
      body: body,
      type: "text",
    });

    let shifted = [...view];
    shifted.shift();
    console.log(shifted[0], "shifted")
    setView(shifted);
  };
  // let siteImage = cardData.find((em) => em.name == associatedSite);

  return (
    <Box
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      backgroundColor="white"
      h="100%"
      w="100%"
      paddingBottom="0"
    >
      <StatusBar
        style="auto"
        backgroundColor="transparent"
        barStyle="dark-content"
        translucent={true}
      />
      <Box pt="20" px="10">
        <Row pb={2}>
          <Button
            onPress={() => goBack()}
            backgroundColor={"#DCF1FA"}
            padding="1.5"
            mb="5"
            rounded="md"
          >
            <Row>
              <Back color="#015D7C" />
              <Text color="#015D7C"> Done </Text>
            </Row>
          </Button>
          <Box flex="1"></Box>
        </Row>

        <Box>
          <Input
            value={title}
            onChangeText={setTitle}
            size="2xl"
            placeholder="Title..."
            backgroundColor="rgba(1, 191, 255, 0.14)"
            borderColor="white"
            padding={3}
            mb="2"
          ></Input>
{/* <Button onPress={Keyboard.dismiss()}>Dismiss</Button> */}
          <Row h="50">
            {/* Image not updating on state change */}
           <SelectImage associatedSite={associatedSite}  /> 
            <Select
              backgroundColor="rgba(219, 246, 255, 0.6)"
              color="#015D7C"
              onPress={console.log("Select is selected")}
              selectedValue={associatedSite}
              minWidth="240"
              borderColor="rgba(219, 246, 255, 0.6)"
              accessibilityLabel="Choose associated Holy Site"
              placeholder="Choose associated Holy Site"
              defaultValue={associatedSite}
              onOpen={Keyboard.dismiss}
              _selectedItem={{
                bg: "primary.200",
                endIcon: <CheckIcon size="5" />,
              }}
              mt={1}
              onValueChange={(itemValue) => setAssociatedSite(itemValue)}
            >
              {cardData.map((el) => {
                return (
                  <Select.Item key={el.name} label={el.name} value={el.name} />
                );
              })}
              {/* <Select.Item label="None" value="None" /> */}
            </Select>
            {/* <Button
            marginY={1}
            onPress={() =>
              // console.log(body)
              {
                addNote("@noteList", {
                  id: note.id,
                  title: title,
                  site: associatedSite,
                  body: body,
                  type: "text",
                });
                Toast.show({
                  title: "Note Saved",
                });
              }
            }
          >
          Save
          </Button> */}
          </Row>
        </Box>
      </Box>
      <EditorScreen setBody={setBody} body={body} />
    </Box>
  );
}
