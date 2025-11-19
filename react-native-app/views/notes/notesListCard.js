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
  Popover,
  useToast,
  Pressable,
} from "native-base";
import Editor from "../editor/editor";
import { ViewContext } from "../../viewContext";
import NoteView from "./noteView";
import ShareSVG from "../../svgs/share";
import AddNote from "../../svgs/addNote";
import TrashCan from "../../svgs/trashcan";
import RenderHtml from "react-native-render-html";
import { useWindowDimensions } from "react-native";

import data from "../sites/cardData";

export default function SiteNotesListCard({ note, list, setList, noteId }) {
  const { view, setView } = useContext(ViewContext);
  const { width } = useWindowDimensions();
  let toast = useToast();
  // If the program errors here it may be that the device has data from a previous and now unused data schema.
  let { image } = data.find((em) => em.name.includes(note.site));
  console.log("hi dad");
  let deleteNote = async (key, note) => {
    await toast.show({
      bg: "#015D7C",
      color: "#DCF1FA",
      title: "Deleted!",
      description: "Your note has been removed.",
    });
    try {
      let removed = list.filter((el) => el.id != note.id);

      let jsonValue = JSON.stringify(removed);

      await AsyncStorage.setItem(key, jsonValue);

      let results = await AsyncStorage.getItem(key);

      let parsed = JSON.parse(results);

      console.log(parsed);
      setList(parsed);
    } catch (err) {
      console.log(err);
    }
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

  let cont = note.body;
  cont = cont.replace(/<[^>]*>/g, " ");
  cont = cont.replace(/\s+/g, " ");
  cont = cont.trim();
  cont = cont.split(" ").length;
  let numberOfWords = cont == 1 ? `${cont} word` : `${cont} words`;
  return (
    <Pressable
      onPress={() => {
        setView([
          <NoteView noteId={noteId} image={image} list={list} setList={setList} note={note} />,
          ...view,
        ]);
      }}
      w="85%"
      h="190"
      marginY={5}
      marginX="auto"
      overflow="hidden"
      bg="white"
      shadow={5}
      rounded="2xl"
    >
      <Column zIndex={40} width="88%" h="100%" rounded="2xl" overflow="hidden">
        <Column px="5" backgroundColor="#DCF1FA" p="2">
          <Row>
            <Text color={!!note.title ? "black" : "gray.400"} fontSize="md">
              {note.title || "Untitled Note"}
            </Text>
            <Spacer />
            <Text mt={1}>{note.easyCreatedTime}</Text>
          </Row>
          <Row>
            <Text color="primary.900" fontWeight="bold">
              {note.site}
            </Text>
            <Spacer />

            <Text color="gray.600">{numberOfWords}</Text>
          </Row>
        </Column>
        <Box p="3" px="5" backgroundColor="white" h="100%" w="100%">
          <RenderHtml contentWidth={width} source={{ html: note.body }} />
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
          onPress={() => onShare(note)}
        >
          <ShareSVG color="#015D7C" hw="20" />
        </Button>
        <Button
          backgroundColor="#DCF1FA"
          shadow="1"
          rounded="full"
          w="9"
          h="9"
          marginBottom={2}
          onPress={() => setView([<Editor note={note} />,...view])}
        >
          <AddNote hw="20" color="#015D7C" />
        </Button>

        <Popover
          trigger={(triggerProps) => {
            return (
              <Button
                backgroundColor="#DCF1FA"
                shadow="1"
                rounded="full"
                w="9"
                h="9"
                {...triggerProps}
              >
                <TrashCan hw="20" color="#015D7C" />
              </Button>
            );
          }}
        >
          <Popover.Content accessibilityLabel="Delete Customer" w="56">
            <Popover.Arrow />
            <Popover.CloseButton />
            <Popover.Header>Delete Note?</Popover.Header>
            <Popover.Body>
              This will remove the entire note. This action cannot be reversed.
              Deleted data can not be recovered.
            </Popover.Body>
            <Popover.Footer justifyContent="flex-end">
              <Button.Group space={2}>
                <Button
                  colorScheme="danger"
                  onPress={() => deleteNote("@noteList", note)}
                >
                  Delete
                </Button>
              </Button.Group>
            </Popover.Footer>
          </Popover.Content>
        </Popover>
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
