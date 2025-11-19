import { StatusBar } from "expo-status-bar";
import React, { useState, useContext , useEffect} from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  Select,
  useToast,
} from "native-base";
import Editor from "../editor/editor";
import { ViewContext } from "../../viewContext";
import NoteView from "../notes/noteView";
import { Pressable } from "react-native";

export default function SiteNotesCard({ image, note, list, setList }) {
  const { view, setView } = useContext(ViewContext);
  

  //This removes the memory leak error  when deleting the note;
  useEffect(() => {
    return () => {
       };
   }, [])
  
  let deleteNote = async (key, id) => {

    try {
      const value = await AsyncStorage.getItem(key);
      if (value !== null) {
        // value previously stored
        list = JSON.parse(value);
      } else {
        // storeData("@noteList", [])
        console.log(value);
      }
    } catch (e) {
      // error reading value
    }

    try {
      let removed = list.filter((el) => el.id != id);

      let jsonValue = JSON.stringify(removed);

      await AsyncStorage.setItem(key, jsonValue);

      let results = await AsyncStorage.getItem(key);

      let parsed = JSON.parse(results);

      await setList(parsed);

      console.log(parsed);
    } catch (err) {
      console.log(err);
    }
  };



  return (
    <Pressable
      key={note.id}
      onPress={() => {
        console.log("note, image");
        setView([<NoteView image={image} list={list} setList={setList} note={note} />, ...view]);
      }}
    >
      <Row backgroundColor="#DCF1FA" margin="2" rounded="md">
        <Column flex={5} padding="2">
          <Text fontSize="lg" bold>
            {note.title}
          </Text>
          <Text fontSize="xs">{note.easyCreatedTime}</Text>
          <Text isTruncated maxW="250">
            {/* {note.body} */}
          </Text>
        </Column>
        <Button
          margin="3"
          flex={1}
          onPress={() => setView([<Editor note={note} />, ...view])}
        >
          Edit
        </Button>
        <Button
          margin="3"
          flex={1}
          onPress={() => {
            deleteNote("@noteList", note.id);
          }}
        >
          Delete
        </Button>
      </Row>
    </Pressable>
  );
}
