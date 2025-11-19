import { StatusBar } from "expo-status-bar";
import React, { useEffect, useContext } from "react";
import { Share } from "react-native";
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
  CheckIcon,
  Image,
  useToast,
  Pressable,
} from "native-base";
import * as Sharing from "expo-sharing";
import { ViewContext } from "../../viewContext";
import AudioView from "./audioView";
import ShareSVG from "../../svgs/share";
import Play from "../../svgs/play";
import TrashCan from "../../svgs/trashcan";
import { useWindowDimensions } from "react-native";
import { Audio } from 'expo-av';
import * as FileSystem from "expo-file-system";

import data from "../sites/cardData";

export default function AudioListNoteCard({
  image,
  note,
  setAudioList,
  audioList,
}) {
  const { view, setView } = useContext(ViewContext);

  let siteImage = data.find((em) => em.name == note.site).image;

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

  const { width } = useWindowDimensions();

  console.log("Here is image", note.uri);

  async function deleteMedia(note, key) {

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
      await setAudioList(parsed);
    } catch (err) {
      console.log(err);
    }
  }

  const shareMedia = async (uri) => {
    console.log(uri);
    await Sharing.shareAsync(uri, { UTI: ".jpg", mimeType: "image/jpeg" });
  };

  const onShare = async (note) => {
    // let  regex1 =  /(</.*?>)/;
    // let replaceGex = /r"\1\n"/
    let body = note.body;
    let newlines = body.replace("<br>", "\n").replace(/<\/[^>]+?>/g, "$&\n");
    let regex2 = /(<([^>]+)>)/gi;
    let parsed = newlines.replace(regex2, "");
    let complete = `${note.title}

${parsed}`;
    try {
      const result = await Share.share({
        message: complete,
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      alert(error.message);
    }
  };
  console.log(note);
  return (
    <Pressable
      onPress={() => {
        setView([<AudioView image={siteImage} audioList={audioList} setAudioList={setAudioList} note={note} />, ...view]);
      }}
      w="85%"
      h="190"
      marginY={5}
      marginX="auto"
      overflow="hidden"
      shadow="5"
      rounded="2xl"
    >
      <Column zIndex={40} width="88%" h="100%" rounded="2xl" overflow="hidden">
        <Column px="5" backgroundColor="#DCF1FA" p="2">
          <Row>
            <Text color={!!note.title ? "black" : "gray.400"} fontSize="md">
              {note.title || "Untitled Audio-Note"}
            </Text>
            <Spacer />
            <Text mt={1}>{note.easyCreatedTime}</Text>
          </Row>
          <Row>
            <Text color="primary.900" fontWeight="bold">
              {note.site}
            </Text>
            <Spacer />

            {/* <Text color="gray.600">425 Words</Text> */}
          </Row>
        </Column>
        <Box
          p="2"
          justifyContent={"center"}
          alignItems="center"
          backgroundColor="white"
          h="100%"
          w="100%"
        >
          <Pressable
            bg="#DCF1FA"
            justifyContent={"center"}
            alignItems="center"
            style={{ marginTop: -60 }}
            h="100"
            w="100"
            rounded="lg"
            onPress={() => play(note.uri)}
          >
            <Play hw="75" color="#015D7C" />
          </Pressable>
          {/* <RenderHtml contentWidth={width} source={{ html: note.body }} /> */}
        </Box>
      </Column>
      <Column
        position="absolute"
        justifyContent="space-evenly"
        right="4"
        paddingY="8"
        zIndex={50}
      >
        <Button
          backgroundColor="#DCF1FA"
          shadow="1"
          rounded="full"
          w="9"
          h="9"
          marginBottom={2}
          onPress={() => shareAudio(note.uri)}
        >
          <ShareSVG color="#015D7C" hw="20" />
        </Button>

        <Button
          backgroundColor="#DCF1FA"
          shadow="1"
          rounded="full"
          w="9"
          h="9"
          onPress={() => deleteMedia(note, "@audioList")}
        >
          <TrashCan hw="20" color="#015D7C" />
        </Button>
      </Column>
      <Image
        position="absolute"
        right="0"
        h="100%"
        w="20%"
        alt="image"
        rounded="md"
        source={siteImage}
      ></Image>

      {/* <Row
        backgroundColor="white"
        justifyContent="space-evenly"
        margin="2"
        padding="1"
        shadow="1"
        rounded="md"
        key={note.id}
      >
        <Image h="100%" w="50" alt="image" rounded="md" source={image}></Image>
        <Text key={note.id}>{note.title}</Text>
        <Row>
          <Button
            margin="1"
            onPress={() => {
              setView([<Editor note={note} />, ...view]);
            }}
          >
            Edit
          </Button>
          <Button
            margin="1"
            onPress={() => {
              deleteNote("@noteList", note.id);
            }}
          >
            <TrashCan />
          </Button>
          <Button margin="1" onPress={() => onShare(note)}>
            <ShareSVG />
          </Button>
        </Row>
      </Row> */}
    </Pressable>
  );
}
