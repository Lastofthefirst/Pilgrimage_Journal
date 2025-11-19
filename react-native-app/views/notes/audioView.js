import React, { useState, useContext } from "react";
// import { StyleSheet, , View } from "react-native";
import {
  StatusBar,
  Column,
  Pressable,
  Row,
  Text,
  Spacer,
  Input,
  Image,
  Center,
  
} from "native-base";
import { useWindowDimensions } from "react-native";
import Back from "../../svgs/back";
import { ViewContext } from "../../viewContext";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NoteList from "./notesList";
import Play from "../../svgs/play";
import Trash from "../../svgs/trashcan";
import Share from "../../svgs/share";
import { Audio } from 'expo-av';

export default function ImageView({ image, note, setAudioList, audioList }) {
  const { view, setView } = useContext(ViewContext);
  let [text, onChangeText] = useState(note.title);

  let goBack = async () => {
    await setNoteTitle(text, note, "@audioList", setAudioList);
    let shifted = [...view];
    shifted.shift();
    setView(shifted);
  };

  
  async function play(uri) {
    const { sound: playbackObject } = await Audio.Sound.createAsync(
      { uri: uri },
      { shouldPlay: true }
    );
    await playbackObject.playAsync();
  }

  async function deleteAudio(note, key) {
    console.log(audioList);

    let file = await FileSystem.getInfoAsync(note.uri);

    file.exists &&
      (await FileSystem.deleteAsync(file.uri, { idempotent: true }));

    try {
      let removed = audioList.filter((el) => el.id != note.id);

      let jsonValue = JSON.stringify(removed);

      await AsyncStorage.setItem(key, jsonValue);

      await setView([<NoteList />, ...view]);
    } catch (err) {
      console.log(err);
    }
  }

  const shareAudio = async (uri) => {
    console.log(uri);
    await Sharing.shareAsync(uri, { UTI: ".m4a", mimeType: "audio/m4a" });
  };

  let setNoteTitle = async (newTitle, thisNote, key, setFn) => {
    console.log(audioList)
    let removed = audioList.filter((el) => el.id != thisNote.id);
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
            onBlur={() => setNoteTitle(text, note, "@audioList", setAudioList)}            placeholder="Edit title..."
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
              onPress={() => deleteAudio(note, "@audioList")}
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
              onPress={() => shareAudio(note.uri)}
            >
              <Share color="#015D7C" />
            </Pressable>
          </Row>
        </Column>
      </Row>
      <Column backgroundColor="white" h="100%">
      <Center flex="0.6">
          <Pressable
            onPress={() => {
              play(note.uri);
            }}
          >
            <Play color="steelblue" hw="100" />
          </Pressable>
        </Center>
      </Column>
    </Column>
  );
}
