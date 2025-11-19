import React, { useState, useContext, useEffect } from "react";

// import { StyleSheet, , View } from "react-native";
import {
  Column,
  Pressable,
  Row,
  Text,
  Spacer,
  Button,
  Input,
  Image,
  Popover,
  StatusBar,
  ScrollView,
} from "native-base";
import { useWindowDimensions, Share } from "react-native";
import Back from "../../svgs/back";
import Editor from "../editor/editor";
import { ViewContext } from "../../viewContext";
import * as Sharing from "expo-sharing";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NoteList from "./notesList";
import Trash from "../../svgs/trashcan";
import AddNote from "../../svgs/addNote";
import ShareIcon from "../../svgs/share";
import RenderHTML, { defaultSystemFonts } from "react-native-render-html";

export default function NoteView({ noteId, note, image, setList, list }) {
  const { view, setView } = useContext(ViewContext);
  const { width } = useWindowDimensions();
  let [activeNote, setActiveNote] = useState({
    body: note.body,
    created: note.created,
    easyCreatedTime: note.easyCreatedTime,
    id: note.id,
    site: note.site,
    title: note.title,
    type: "text",
  });
  let [text, onChangeText] = useState(activeNote.title);

  useEffect(() => {
    (async () => {
      const jsonOfNotes = await AsyncStorage.getItem("@noteList");
      let listOfNotes = JSON.parse(jsonOfNotes);
      console.log(listOfNotes.length, noteId);
      let foundIt = listOfNotes.find((el) => el.id.includes(noteId));
      console.log(foundIt);
      setActiveNote(foundIt);
    })();
  }, []);

  useEffect(() => {
    onChangeText(activeNote.title)
  }, [activeNote]);

  const getData = async (key, stFn) => {
    console.log("getting data: " + key);
    try {
      const value = await AsyncStorage.getItem(key);
      if (value !== null) {
        // value previously stored
        let parsed = JSON.parse(value);
        console.log("These values:", parsed);
        stFn(parsed);
      } else {
        console.log("null");

        // storeData("@noteList", [])
        console.log(value, "nullvalue");
      }
    } catch (e) {
      console.log(e);
      // error reading value
    }
  };

  const systemFonts = [...defaultSystemFonts, "Caveat", "comicneue-bold"];

  let goBack = () => {
    let shifted = [...view];
    shifted.shift();
    setView(shifted);
  };
  const shareMedia = async (uri) => {
    console.log(uri);
    await Sharing.shareAsync(uri, { UTI: ".jpg", mimeType: "image/jpeg" });
  };

  let cont = activeNote.body;
  cont = cont.replace(/<[^>]*>/g, " ");
  cont = cont.replace(/\s+/g, " ");
  cont = cont.trim();
  cont = cont.split(" ").length;
  let numberOfWords = cont == 1 ? `${cont} word` : `${cont} words`;

  async function deleteMedia(key) {
    try {
      let removed = list.filter((el) => el.id != noteId);

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
    let removed = list.filter((el) => el.id != thisNote.id);
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
  console.log("here is the html:", activeNote.body);
  return (
    <ScrollView>
      <StatusBar translucent={true} backgroundColor={"transparent"} />
      <Column backgroundColor="#DCF1FA" height="100%" width="100%">
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
              All Notes
            </Text>
          </Row>
        </Pressable>
        <Image h="150" w="100%" alt="image" source={image}></Image>
        <Row zIndex={20} overflow={"visible"} h="140">
          <Column style={{ width: "100%" }} p="2">
            <Row>
              <Text
                ml="3"
                fontSize={"sm"}
                bold="lg"
                color="#015D7C"
              >
                {activeNote.site}
              </Text>
              <Spacer />
              <Text mr="3" color="rgba(2, 67, 89, 0.49)">
                Created: {activeNote.easyCreatedTime}
              </Text>
            </Row>
            <Input
              margin="1"
              backgroundColor="#DCF1FA"
              borderColor="#DCF1FA"
              bold="900"
              style={{ fontWeight: "bold" }}
              color="#024359"
              placeholderTextColor={"rgba(2, 67, 89, 0.49)"}
              onChangeText={onChangeText}
              value={text}
              onBlur={() =>
                setNoteTitle(text, activeNote, "@noteList", setList)
              }
              placeholder="Edit title..."
              fontSize="3xl"
            ></Input>
            <Text ml="3" color="rgba(2, 67, 89, 0.49)">
              {numberOfWords}
            </Text>
            <Row justifyContent={"flex-end"}>
              <Popover
                trigger={(triggerProps) => {
                  return (
                    <Pressable
                      mr="3"
                      shadow="5"
                      height={12}
                      width={12}
                      justifyContent="center"
                      alignItems={"center"}
                      rounded="3xl"
                      bg="#DCF1FA"
                      {...triggerProps}
                    >
                      <Trash color="#015D7C" />
                    </Pressable>
                  );
                }}
              >
                <Popover.Content accessibilityLabel="Delete Customer" w="56">
                  <Popover.Arrow />
                  <Popover.CloseButton />
                  <Popover.Header>Delete Note?</Popover.Header>
                  <Popover.Body>
                    This will remove the entire activeNote. This action cannot
                    be reversed. Deleted data can not be recovered.
                  </Popover.Body>
                  <Popover.Footer justifyContent="flex-end">
                    <Button.Group space={2}>
                      <Button
                        colorScheme="danger"
                        onPress={() => deleteMedia("@noteList")}
                      >
                        Delete
                      </Button>
                    </Button.Group>
                  </Popover.Footer>
                </Popover.Content>
              </Popover>
              <Pressable
                shadow="5"
                height={12}
                width={12}
                justifyContent="center"
                alignItems={"center"}
                rounded="3xl"
                bg="#DCF1FA"
                mr="3"
                onPress={() => {
                  setView([<Editor note={activeNote} />, ...view]);
                }}
              >
                <AddNote color="#015D7C" />
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
                onPress={() => onShare(activeNote)}
              >
                <ShareIcon color="#015D7C" />
              </Pressable>
            </Row>
          </Column>
        </Row>
        <Column backgroundColor="white" h="100%" p="4" pt="10">
          <RenderHTML
            contentWidth={width}
            source={{ html: activeNote.body }}
            systemFonts={systemFonts}
            tagsStyles={{
              b: {
                fontFamily: "Caveat",
                fontWeight: "900",
                // color: 'blue',
              },
              i: {
                fontFamily: "Caveat",
              },
            }}
            baseStyle={{ fontFamily: "Caveat", fontSize: 18 }}
          ></RenderHTML>
        </Column>
      </Column>
    </ScrollView>
  );
}
