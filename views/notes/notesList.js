import React, { useState, useEffect, useContext } from "react";
import { StyleSheet,  Share, View } from "react-native";
import {
  NativeBaseProvider,
  Text,
  Box,
  Row,
  Pressable,
  StatusBar,
  Input,
  Button,
  ScrollView,
  AddIcon,
} from "native-base";
import { ViewContext } from "../../viewContext";
import Editor from "../editor/editor";
import NoteView from "./imageView";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NotesListCard from "./notesListCard";
import ImageNoteListCard from "./imageNoteListCard";
import AudioListNoteCard from "./audioListNoteCard";
import Card from "../sites/card";
import AddNote from "../../svgs/addNote";
import cardData from "../sites/cardData";
import Menu from "../../svgs/menu";
import Map from "../../svgs/map";
import Print from "../print";
import NoteText from "../../svgs/noteText";
import uuidV4 from "../../utility/uuid";
import { elementsThatOverlapOffsets } from "react-native/Libraries/Lists/VirtualizeUtils";


export default function NoteList({ setMenu }) {
  const { view, setView } = useContext(ViewContext);

  let [list, setList] = useState([]);
  let [audioList, setAudioList] = useState([]);
  let [imageList, setImageList] = useState([]);
  let [search, setSearch] = useState("");
  let [showSites, setShowSites] = useState(true);

  useEffect(() => {
    getData("@noteList", setList);
    getData("@audioList", setAudioList);
    getData("@imageList", setImageList);
    console.log("refreshing", audioList.length)
  }, []);

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
        console.log(value);
      }
    } catch (e) {
      console.log(e);
      // error reading value
    }
  };

  return (
    <Box h="100%" w="100%" backgroundColor="white">
      <Row
        background="#DCF1FA"
        paddingX="1"
        pt={Platform.OS === "ios" ? "10" : "0"}
        // style={{
        //   marginTop: 50,
        // }}
        w="100%"
        style={Platform.OS === "ios" ? {height: 100} : { height: 50 }}
      >
        <Pressable
          bg="#DCF1FA"
          padding={2}
          onPress={() => {
            let newState = [<Print />, ...view];
            setView(newState);
          }}
        >
          <Menu hw="30" color="#015D7C" />
        </Pressable>
        <Input
          flex={4}
          borderColor="white"
          color="#015D7C"
          rounded="md"
          backgroundColor="white"
          margin="2"
          placeholder="Search..."
          fontSize="lg"
          value={search}
          onChangeText={setSearch}
        ></Input>
        <Pressable
          bg="#DCF1FA"
          padding={2}
          onPress={() => setShowSites(!showSites)}
        >
          {showSites == true ? (
            <Map hw="30" color="#015D7C" />
          ) : (
            <NoteText hw="30" color="#015D7C" />
          )}
        </Pressable>
      </Row>
      <ScrollView display="flex" h="100%" w="100%">
        {!showSites && [...list, ...audioList, ...imageList].length > 0 &&
          [...list, ...audioList, ...imageList]
            .filter((el) =>
              `${el.site} ${el.title} ${el.type}`
                .toLowerCase()
                .includes(search.toLowerCase())
            )
            .sort(function (a, b) {
              // Turn your strings into dates, and then subtract them
              // to get a value that is either negative, positive, or zero.
              return new Date(b.created) - new Date(a.created);
            })
            .map((el) => {
              if (el.type == "text")
                return (
                  <NotesListCard
                    key={el.id}
                    noteId={el.id}
                    note={el}
                    list={list}
                    setList={setList}
                    setImageList={setImageList}
                    setAudioList={setAudioList}
                  />
                );
              else if (el.type == "image")
                return (
                  <ImageNoteListCard
                    key={el.id}
                    note={el}
                    imageList={imageList}
                    setImageList={setImageList}
                  />
                );
              else if (el.type == "audio")
                return (
                  <AudioListNoteCard
                    key={el.id}
                    note={el}
                    audioList={audioList}
                    setAudioList={setAudioList}
                  />
                );
            })}
            {!showSites && [...list, ...audioList, ...imageList].length === 0 && 
            <Box m="6" mt="12" p="4" rounded={"lg"} bg="#DCF1FA">
              <Text fontSize="24" color="#015D7C">Alláh-u-Abhá! Welcome!</Text>
              <Text fontSize="18" color="#015D7C">Once you write a note, take a picture or record an audio note you can find them all here!</Text>
              <Pressable p="2" m="4" rounded="md" background={"#015D7C"} onPress={()=>{
                let newState = [<Editor  
                  note={{
                    id: uuidV4(),
                    title: "",
                    site: "Shrine of the Báb",
                    body: "",
                  }}
                />, ...view];
                setView(newState);
              }}>
                <Text fontSize="18" textAlign={"center"} color="#DCF1FA">Start a new note!</Text>
              </Pressable>
              </Box>}

        {!!showSites &&
          cardData.sort((one,two)=>one.index>two.index).filter(el=>`${el.name} ${el.city}`
          .toLowerCase()
          .includes(search.toLowerCase())).map((el, i) => {
            
            return (
              // <Box  backgroundColor="white" onPress={() => console.log()}></Box>
              <Card key={el.name} numImages={imageList.filter(im=>im.site.includes( el.name) ).length} numNotes={list.filter(im=>im.site.includes( el.name) ).length} numAudio={audioList.filter(im=>im.site.includes( el.name) ).length} image={el} setImageList={setImageList} setAudioList={setAudioList} />
            );
          })}
          <Box height="200" />
      </ScrollView>
      {/* <Button
        onPress={() => {
          console.log(list);
        }}
      >
        List
      </Button> */}

      
      {/* 
      
      ***** This is a button to add a new site from the note list page. ****
      ** In order to add, uncomment, theen you have to edit the 
      ** associated site select to handle not having a preselected associated site.
      
      {!showSites && ( 
        <Pressable
          rounded="3xl"
          bg="#DCF1FA"
          position="absolute"
          bottom="3"
          right="3"
          p="2"
          onPress={() => setView([<Editor note={
            {
              id: uuidV4(),
              title: "",
              site: "",
              body: "",
            }

          } />, ...view])}
        >
          <AddIcon color="#015D7C" />
        </Pressable>
      )} */}
    </Box>
  );
}
