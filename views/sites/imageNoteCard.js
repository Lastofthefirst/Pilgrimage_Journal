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
  Image,
  Pressable,
  Select,
} from "native-base";
import Editor from "../editor/editor";
import { ViewContext } from "../../viewContext";
import NoteView from "../notes/imageView";
import * as FileSystem from "expo-file-system";
import { Audio } from "expo-av";
import * as Sharing from "expo-sharing";
import ImageView from "../notes/imageView";

export default function ImageNoteCard({
  image,
  note,
  setImageList,
  imageList,
}) {
  const { view, setView } = useContext(ViewContext);

  //This removes the memory leak error  when deleting the note;
  useEffect(() => {
    return () => {};
  }, []);

  async function deleteMedia(note, key) {
    console.log(note.uri);

    let file = await FileSystem.getInfoAsync(note.uri);

    file.exists &&
      (await FileSystem.deleteAsync(file.uri, { idempotent: true }));

    try {
      let removed = imageList.filter((el) => el.id != note.id);

      let jsonValue = JSON.stringify(removed);

      await AsyncStorage.setItem(key, jsonValue);

      let results = await AsyncStorage.getItem(key);

      let parsed = JSON.parse(results);

      await setImageList(parsed);
      
    } catch (err) {
      console.log(err);
    }
  }

  const shareMedia = async (uri) => {
    console.log(uri);
    await Sharing.shareAsync(uri, { UTI: ".jpg", mimeType: "image/jpeg" });
  };

  return (
    <Pressable
      onPress={() =>
        setView([
          <ImageView
            image={image}
            note={note}
            imageList={imageList}
            setImageList={setImageList}
          />,
          ...view,
        ])
      }
    >
      <Row backgroundColor="#DCF1FA" margin="2" padding="2" rounded="md">
        <Image
          key={note.uri}
          alt={`image from ${note.created}`}
          h="60"
          w="60"
          rounded="10"
          source={{ uri: note.uri }}
        />
        <Text fontSize="xl">{note.title}</Text>

        <Button margin="1" flex={1} onPress={() => shareMedia(note.uri)}>
          Share
        </Button>
        <Button
          onPress={() => deleteMedia(note, "@imageList")}
          margin="1"
          flex={1}
        >
          Delete
        </Button>
      </Row>
    </Pressable>
  );
}
