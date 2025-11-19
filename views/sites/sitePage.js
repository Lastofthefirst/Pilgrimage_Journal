import React, { useState, useContext, useEffect } from "react";
import { StyleSheet } from "react-native";
import {
  View,
  NativeBaseProvider,
  Flex,
  Box,
  Row,
  Spacer,
  ScrollView,
  StatusBar,
  Text,
  Image,
  Center,
  Column,
  useToast,
  Pressable,
} from "native-base";
import { Audio } from "expo-av";
import * as MediaLibrary from "expo-media-library";

import Mic from "../../svgs/mic";
import Stop from "../../svgs/stop";
import Camera from "../../svgs/camera";
import AddNote from "../../svgs/addNote";
import Back from "../../svgs/back";
import Photo from "../../svgs/photo";
import Map from "../../svgs/map";
import * as FileSystem from "expo-file-system";
import { ViewContext } from "../../viewContext";
import * as Clipboard from "expo-clipboard";
import Editor from "../editor/editor";
import NotesListCard from "../notes/notesListCard";
import uuidV4 from "../../utility/uuid";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AudioNoteCard from "../notes/audioListNoteCard";
import * as ImagePicker from "expo-image-picker";
import ImageNoteCard from "../notes/imageNoteListCard";
import UpArrow from "../../svgs/upArrow";

export default function Site({ site }) {
  const { view, setView } = useContext(ViewContext);
  const toast = useToast();
  let [list, setList] = useState([]);
  let [audioList, setAudioList] = useState([]);
  let [imageList, setImageList] = useState([]);
  const [image, setImage] = useState(null);

  const [recording, setRecording] = React.useState();

  let addData = async (key, newData, setFn) => {
    try {
      // Doesnt properly handle editing notes
      let currentTime = new Date();

      newData.created = currentTime;

      let easyCreatedTime = `${
        currentTime.getMonth() + 1
      }/${currentTime.getDate()}/${currentTime.getFullYear()}`;

      newData.easyCreatedTime = easyCreatedTime;
      //save first user
      // await AsyncStorage.setItem(key, JSON.stringify(newData));
      let results = await AsyncStorage.getItem(key);

      let parsed = JSON.parse(results);

      let noCopies = parsed.filter((el) => el.id != newData.id);

      console.log(
        "If different we are editing an existing note:",
        parsed.length,
        noCopies.length
      );
      noCopies.push(newData);
      console.log(noCopies);
      await AsyncStorage.setItem(key, JSON.stringify(noCopies));
      getData(key, setFn, site);
    } catch (err) {
      console.log(err);
    }
  };

  async function startRecording() {
    try {
      console.log("Requesting permissions..");
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      console.log("Starting recording..");
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );
      await recording.startAsync();
      setRecording(recording);
      console.log("Recording started");
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  }

  async function stopRecording() {
    let file = await FileSystem.getInfoAsync(
      FileSystem.documentDirectory + "notes/"
    );
    //matching
    !file.exists &&
      (await FileSystem.makeDirectoryAsync(
        FileSystem.documentDirectory + "notes",
        { intermediates: true }
      )) &&
      console.log("made images Directory");

    console.log("Stopping recording..");
    setRecording(undefined);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    const savedUri =
      FileSystem.documentDirectory + "notes/" + uuidV4() + ".m4a";
    await FileSystem.copyAsync({
      from: uri,
      to: savedUri,
    });
    addData(
      "@audioList",
      {
        id: uuidV4(),
        title: "",
        created: new Date(),
        uri: savedUri,
        site: site.name,
        type: "audio",
      },
      setAudioList
    );
    await FileSystem.deleteAsync(uri, { idempotent: true });
    console.log("Recording stopped and stored at", uri);
    toast.show({
      bg: "#015D7C",
      color: "#DCF1FA",
      title: "Complete!",
      description: "Your recording has been saved.",
    });
  }

  const takeImage = async () => {
    // No permissions request is necessary for launching the image library
    await FileSystem.makeDirectoryAsync(
      FileSystem.documentDirectory + "notes/",
      { intermediates: true }
    );

    let result = await ImagePicker.launchCameraAsync({
      // allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.cancelled) {
      await MediaLibrary.saveToLibraryAsync(result.uri);
      await saveImage(result);
    }
  };

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      // allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.cancelled) {
      saveImage(result);
    }
  };

  let saveImage = async (result) => {
    console.log("result", result);
    let uri = result.uri;
    console.log("initial uri: ", uri);
    await FileSystem.makeDirectoryAsync(
      FileSystem.documentDirectory + "notes/",
      { intermediates: true }
    );
    const savedUri =
      FileSystem.documentDirectory + "notes/" + uuidV4() + ".jpg";
    try {
      await FileSystem.copyAsync({
        from: uri,
        to: savedUri,
      });
    } catch (error) {
      console.log(error);
    }

    let imageData = {
      id: uuidV4(),
      title: "",
      created: new Date(),
      uri: savedUri,
      site: site.name,
      type: "image",
    };

    await addData("@imageList", imageData, setImageList);
  };

  useEffect(() => {
    getData("@noteList", setList, site);
    getData("@audioList", setAudioList, site);
    getData("@imageList", setImageList, site);
    console.log(imageList, "imageList");
    console.log(audioList, "audiolist");
    console.log(site.image);
  }, []);

  const getData = async (key, stFn, place) => {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value !== null) {
        // value previously stored
        console.log("site", place);
        let parsed = JSON.parse(value).filter((el) => el.site === place.name);
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

  const copyToClipboard = async (value) => {
    await Clipboard.setStringAsync(value);
    toast.show({
      bg: "#015D7C",
      color: "#DCF1FA",
      title: "Copied Location to Clipboard!",
      description: value,
    });
  };

  useEffect(() => {
    console.log("listchanged", list);
  }, [list]);

  let goBack = () => {
    let shifted = [...view];
    shifted.shift();
    setView(shifted);
  };

  return (
    <Box h="100%" w="100%" backgroundColor="white">
      <StatusBar translucent={true} backgroundColor={"transparent"} />

      <ScrollView>
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
        <Image h="300" w="100%" alt="image" source={site.image}></Image>
        {site.from_world_center=== "TRUE" &&<Text style={{marginTop:-22, color:"white"}}>Copyright © Bahá’í International Community</Text>}
        <Column bg="#DCF1FA" padding="4" pb="10">
          <Text bold fontSize="4xl" color="#024359">
            {site.name}
          </Text>
          <Text color="#024359" fontFamily="serif" italic>
            {site.quote.text}
          </Text>
          {!!site.quote.ref && (
            <Text color="#024359" fontSize="xs" paddingLeft="20px" bold>
              - {site.quote.ref}
            </Text>
          )}
          <Center
            position="absolute"
            flexDir="row"
            justifyContent="space-evenly"
            bottom="-20"
          >
            {!!site.address.length && (
              <Pressable
                shadow="5"
                height={12}
                width={12}
                justifyContent="center"
                alignItems={"center"}
                rounded="3xl"
                bg="#DCF1FA"
                ml="5"
                onPress={() => copyToClipboard(site.address)}
              >
                <Map color="#015D7C" />
              </Pressable>
            )}
            <Spacer />
            <Pressable
              shadow="5"
              height={12}
              width={12}
              justifyContent="center"
              alignItems={"center"}
              rounded="3xl"
              bg="#DCF1FA"
              mr="3"
              onPress={() => pickImage()}
            >
              <Photo color="#015D7C" />
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
              onPress={recording ? stopRecording : startRecording}
            >
              {recording ? <Stop color="#015D7C" /> : <Mic color="#015D7C" />}
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
              onPress={() => takeImage()}
            >
              <Camera color="#015D7C" />
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
              onPress={() => {
                setView([
                  <Editor
                    note={{
                      id: uuidV4(),
                      title: "",
                      site: site.name,
                      body: "",
                    }}
                  />,
                  ...view,
                ]);
              }}
            >
              <AddNote color="#015D7C" />
            </Pressable>
          </Center>
        </Column>

        <Column mt="5" h="auto" w="100%" display="flex">
          {[...list, ...audioList, ...imageList].length > 0 &&
            [...list, ...audioList, ...imageList]
              .sort(function (a, b) {
                // Turn your strings into dates, and then subtract them
                // to get a value that is either negative, positive, or zero.
                return new Date(b.created) - new Date(a.created);
              })
              .map((el) => {
                if (el.type == "text")
                  return (
                    <NotesListCard
                      noteId={el.id}
                      key={el.id}
                      image={site.image}
                      list={list}
                      setList={setList}
                      note={el}
                    />
                  );
                else if (el.type == "audio")
                  return (
                    <AudioNoteCard
                      key={el.id}
                      note={el}
                      image={site.image}
                      audioList={audioList}
                      setAudioList={setAudioList}
                    />
                  );
                else if (el.type == "image") {
                  return (
                    <ImageNoteCard
                      key={el.id}
                      note={el}
                      image={site.image}
                      imageList={imageList}
                      setImageList={setImageList}
                    />
                  );
                }
              })}
        </Column>
        <Box h="100"></Box>
      </ScrollView>
    </Box>
  );
}
