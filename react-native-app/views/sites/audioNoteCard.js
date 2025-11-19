import { StatusBar } from "expo-status-bar";
import React, { Share, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  NativeBaseProvider,
  Column,
  Flex,
  Box,
  Row,
  Text,
  Spacer,
  Button,
  Input,
  Pressable,
  Select,
  useToast,
} from "native-base";
import Editor from "../editor/editor";
import { ViewContext } from "../../viewContext";
import NoteView from "../notes/imageView";
import * as FileSystem from "expo-file-system";
import { Audio } from "expo-av";
import * as Sharing from "expo-sharing";
import AudioView from "../notes/audioView";

export default function AudioNoteCard({
  image,
  note,
  setAudioList,
  audioList,
}) {
  console.log("zoomba", audioList)
  const { view, setView } = useContext(ViewContext);

  //This removes the memory leak error  when deleting the note;
  useEffect(() => {
    return () => {};
  }, []);

  async function play(uri) {
    const { sound: playbackObject } = await Audio.Sound.createAsync(
      { uri: uri },
      { shouldPlay: true }
    );
    await playbackObject.playAsync();
  }

  async function deleteAudio(note, key) {
    console.log(note.uri);

    let file = await FileSystem.getInfoAsync(note.uri);

    file.exists &&
      (await FileSystem.deleteAsync(file.uri, { idempotent: true }));

    try {
      let removed = audioList.filter((el) => el.id != note.id);

      let jsonValue = JSON.stringify(removed);

      await AsyncStorage.setItem(key, jsonValue);

      let results = await AsyncStorage.getItem(key);

      let parsed = JSON.parse(results);

      console.log(parsed);
      setAudioList(parsed);
    } catch (err) {
      console.log(err);
    }
  }

  const shareAudio = async (uri) => {
    console.log(uri);
    await Sharing.shareAsync(uri, { UTI: ".m4a", mimeType: "audio/m4a" });
  };

  return (
    <Pressable
    onPress={()=>{
      setView([<AudioView image={image} note={note} audioList={audioList} setAudioList={setAudioList} />, ...view]);

    }}>
      <Row backgroundColor="#DCF1FA" margin="2" padding="2" rounded="md">
      <Column>
      <Text fontSize="xl">{note.title}</Text>
        <Text>{note.easyCreatedTime} Audio Note</Text>
      </Column>

        <Button margin="1" flex={1} onPress={() => play(note.uri)}>
          Play
        </Button>
        <Button margin="1" flex={1} onPress={() => shareAudio(note.uri)}>
          Share
        </Button>
        <Button
          onPress={() => deleteAudio(note, "@audioList")}
          margin="1"
          flex={1}
        >
          Delete
        </Button>
      </Row>
    </Pressable>
  );
}
