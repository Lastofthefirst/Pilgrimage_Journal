
import { StatusBar } from "expo-status-bar";
import React, { useState, useContext } from "react";
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
import Editor from "../editor/editor";
import { ViewContext } from "../../viewContext";
import * as Sharing from "expo-sharing";
import NoteView from "./imageView";
import ShareSVG from "../../svgs/share";
import AddNote from "../../svgs/addNote";
import TrashCan from "../../svgs/trashcan";
import RenderHtml from "react-native-render-html";
import { useWindowDimensions } from "react-native";
import * as FileSystem from "expo-file-system";

import data from "../sites/cardData";
import ImageView from "./imageView";

export default function SiteNotesCard({ note, setImageList, imageList }) {
  const { view, setView } = useContext(ViewContext);
  const { width } = useWindowDimensions();

  let { image } = data.find((em) => em.name == note.site);

  console.log("Here is image",note.uri);

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

      console.log(parsed);
      await setImageList(parsed);
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
        setView([<ImageView image={image} imageList={imageList} setImageList={setImageList} note={note} />, ...view]);
      }}
      w="85%"
      h="190"
      marginY={5}
      marginX="auto"
      overflow="hidden"
      shadow="5"
      rounded="2xl"
    >
      <Column  zIndex={40} width="88%" h="100%" rounded="2xl" overflow="hidden">
        <Column px="5" backgroundColor="#DCF1FA" p="2">
          <Row>
            <Text color={!!note.title ? "black" : "gray.400"}  fontSize="md">{note.title || "Untitled Image"}</Text>
            
            <Spacer />
            <Text mt={1} >{note.easyCreatedTime}</Text>
          </Row>
          <Row>
            <Text color="#015D7C" fontWeight="bold">
              {note.site}
            </Text>
            <Spacer />

            {/* <Text color="gray.600">425 Words</Text> */}
          </Row>
        </Column>
        <Box p="2"  backgroundColor="white" h="100%" w="100%">
        <Image
          key={note.uri}
          alt={`image from ${note.created}`}
      height="100%"
      width="100%"
          rounded="10"
          source={{ uri: note.uri }}
        />
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
        <Button backgroundColor="#DCF1FA" shadow="1" rounded="full" w="9" h="9" marginBottom={2}  onPress={() => shareMedia(note.uri)}>
          <ShareSVG color="#015D7C" hw="20" />
        </Button>
      
        <Button backgroundColor="#DCF1FA" shadow="1" rounded="full" w="9" h="9" onPress={() => deleteMedia(note,  "@imageList")}>
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
        source={image}
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

