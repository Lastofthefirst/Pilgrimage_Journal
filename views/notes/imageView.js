import React, { useState, useContext } from "react";
import {
  Column,
  Pressable,
  Row,
  StatusBar,
  Text,
  Spacer,
  Input,
  Image,
} from "native-base";
import { useWindowDimensions } from "react-native";
import Back from "../../svgs/back";
import { ViewContext } from "../../viewContext";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NoteList from "./notesList";
import Trash from "../../svgs/trashcan";
import Share from "../../svgs/share";

export default function ImageView({ image, note, setImageList, imageList }) {
  const { view, setView } = useContext(ViewContext);
  let [text, onChangeText] = useState(note.title);

  let goBack = async () => {
    await setNoteTitle(text, note, "@imageList", setImageList);
    let shifted = [...view];
    shifted.shift();
    setView(shifted);
  };
  const shareMedia = async (uri) => {
    console.log(uri);
    await Sharing.shareAsync(uri, { UTI: ".jpg", mimeType: "image/jpeg" });
  };

  async function deleteMedia(note, key) {
    console.log(note.uri);

    let file = await FileSystem.getInfoAsync(note.uri);

    file.exists &&
      (await FileSystem.deleteAsync(file.uri, { idempotent: true }));

    try {
      let removed = imageList.filter((el) => el.id != note.id);

      let jsonValue = JSON.stringify(removed);

      await AsyncStorage.setItem(key, jsonValue);

      // let results = await AsyncStorage.getItem(key);

      // let parsed = JSON.parse(results);

      await setView([<NoteList />, ...view]);
    } catch (err) {
      console.log(err);
    }
  }
  let setNoteTitle = async (newTitle, thisNote, key, setFn) => {
    let removed = imageList.filter((el) => el.id != thisNote.id);
    thisNote.title = newTitle;

    console.log(thisNote.title);
    removed.push(thisNote);

    console.log(removed);

    let jsonValue = JSON.stringify(removed);

    await AsyncStorage.setItem(key, jsonValue);

    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      // value previously stored
      console.log(value);
      await setFn(value);
    } else {
    }
  };

  return (
    <Column backgroundColor="#DCF1FA" height="100%" width="100%">
      <StatusBar translucent={true} backgroundColor={"transparent"} />

      <Pressable
        onPress={() => goBack()}
        backgroundColor={"#DCF1FA"}
        padding="1.5"
        mb="5"
        rounded="md"
        zIndex={40}
        position="absolute"
        top={38}
        left={5}
      >
        <Row>
          <Back color="#015D7C" hw="22" />
          <Text color="#015D7C" bold="400">
            {" "}
            All Notes{" "}
          </Text>
        </Row>
      </Pressable>
      <Image h="150" w="100%" alt="image" source={image}></Image>
      <Row zIndex={20} overflow={"visible"} h="120">
        <Column style={{ width: "100%" }} p="2">
          <Row>
            <Text ml="3" fontSize={"sm"} bold="lg" color="#015D7C">
              {note.site}
            </Text>
            <Spacer />
            <Text mr="3" color="rgba(2, 67, 89, 0.49)">
              Taken on: {note.easyCreatedTime}
            </Text>
          </Row>
          <Input
            margin="1"
            backgroundColor="#DCF1FA"
            borderColor="#DCF1FA"
            bold="100"
            placeholderTextColor={"rgba(2, 67, 89, 0.49)"}
            onChangeText={onChangeText}
            value={text}
            onBlur={() => setNoteTitle(text, note, "@imageList", setImageList)}
            placeholder="Edit title..."
            fontSize="3xl"
          ></Input>
          <Row justifyContent={"flex-end"}>
            <Pressable
              mr="3"
              shadow="5"
              height={12}
              width={12}
              justifyContent="center"
              alignItems={"center"}
              rounded="3xl"
              bg="#DCF1FA"
              onPress={() => deleteMedia(note, "@imageList")}
            >
              <Trash color="#015D7C" />
            </Pressable>
            <Pressable
              shadow="5"
              height={12}
              width={12}
              justifyContent="center"
              alignItems={"center"}
              rounded="3xl"
              bg="#DCF1FA"
              mr="3"
              onPress={() => shareMedia(note.uri)}
            >
              <Share color="#015D7C" />
            </Pressable>
          </Row>
        </Column>
      </Row>
      <Column backgroundColor="white" h="100%">
        <Image alt="The image" source={{ uri: note.uri }} h="100%" w="100%" />
      </Column>
    </Column>
  );
}
