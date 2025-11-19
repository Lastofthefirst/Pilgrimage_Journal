import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState, useContext } from "react";
import { StyleSheet, View } from "react-native";
import {
  NativeBaseProvider,
  Flex,
  Box,
  Pressable,
  Spacer,
  Column,
  Row,
  useToast,
  Text,
  Image,
} from "native-base";
import { Audio } from "expo-av";

import Site from "./sitePage";
import Editor from "../editor/editor";
import uuidV4 from "../../utility/uuid";
import NoteText from "../../svgs/noteText";
import Mic from "../../svgs/mic";
import Stop from "../../svgs/stop";
import Photo from "../../svgs/photo";
import AddNote from "../../svgs/addNote";
import Camera from "../../svgs/camera";
import Sound from "../../svgs/audio";
import { ViewContext } from "../../viewContext";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";

// const img = require(image);
export default function Card({ i, image, numImages, numNotes, numAudio, setAudioList, setImageList }) {
  const { view, setView } = useContext(ViewContext);
  const [recording, setRecording] = React.useState();
  const toast = useToast();
  const [statusCam, requestCamPermission] = ImagePicker.useCameraPermissions();
  const [statusMedia, requestMediaPermission] =
    ImagePicker.useMediaLibraryPermissions();

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
        site: image.name,
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

  let addData = async (key, newData, setTheList) => {
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
      setTheList(noCopies);
    } catch (err) {
      console.log(err);
    }
  };

  let saveImage = async (result) => {
    let uri = result.uri;
    await FileSystem.makeDirectoryAsync(
      FileSystem.documentDirectory + "notes/",
      { intermediates: true }
    );
    const savedUri =
      FileSystem.documentDirectory + "notes/" + uuidV4() + ".jpg";
    await FileSystem.copyAsync({
      from: uri,
      to: savedUri,
    });

    let imageData = {
      id: uuidV4(),
      title: "",
      created: new Date(),
      uri: savedUri,
      site: image.name,
      type: "image",
    };

    await addData("@imageList", imageData, setImageList);
  };

  const takeImage = async () => {
    // No permissions request is necessary for launching the image library
    requestCamPermission();
    await FileSystem.makeDirectoryAsync(
      FileSystem.documentDirectory + "notes/",
      { intermediates: true }
    );

    await ImagePicker.getMediaLibraryPermissionsAsync();
    await ImagePicker.getCameraPermissionsAsync();
    console.log("here i am.");

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

  return (
    <Pressable
      margin="10"
      // shadow="2"
      // rounded="lg"
      bg="blue"
      borderRadius={5}
      // shadow="2"
      onPress={() => {
        setView([<Site site={image} />, ...view]);
      }}
    >
      <Image
        h="250"
        w="auto"
        alt="image"
        rounded="3xl"
        source={image.image}
      ></Image>

      <Box
        background={"white"}
        position="absolute"
        bottom="-40"
        width={"95%"}
        right="-10"
        shadow="3"
        borderColor={"#DCF1FA"}
        borderWidth={"0.5px"}
        rounded="lg"
        overflow={"hidden"}
      >
        <Column>
          <Column padding={"10px"}>
            <Text fontSize="xl" bold>
              {image.name}
            </Text>
            <Text
              fontSize={"2xs"}
              color={"#113747"}
              fontFamily={"serif"}
              italic
              numberOfLines={2}
            >
              {image.quote.text}
            </Text>
          </Column>
          <Row background={"#DCF1FA"} p="2" pl="5">
            <NoteText color="#015D7C" />
            <Text color="#015D7C" mr="3" bold="600">
              {" "}
              {numNotes}
            </Text>
            <Sound color="#015D7C" />
            <Text color="#015D7C" mr="3" bold="600">
              {" "}
              {numAudio}
            </Text>
            <Photo color="#015D7C" />
            <Text color="#015D7C" bold="600">
              {numImages}
            </Text>
          </Row>
        </Column>
      </Box>
      <Row position="absolute" top="2" right="-10" overflow={"hidden"}>
        <Pressable
          background={"#DCF1FA"}
          shadow="3"
          rounded="3xl"
          mr="2"
          justifyContent={"center"}
          alignItems={"center"}
          style={{ height: 40, width: 40 }}
          onPress={recording ? stopRecording : startRecording}
        >
          {recording ? <Stop color="#015D7C" /> : <Mic color="#015D7C" />}
        </Pressable>
        <Pressable
          background={"#DCF1FA"}
          shadow="3"
          rounded="3xl"
          mr="2"
          justifyContent={"center"}
          alignItems={"center"}
          style={{ height: 40, width: 40 }}
          onPress={() => takeImage()}
        >
          <Camera hw="22" color="#015D7C" />
        </Pressable>
        <Pressable
          background={"#DCF1FA"}
          shadow="3"
          rounded="3xl"
          p="3"
          mr="0.5"
          onPress={() => {
            setView([
              <Editor
                note={{
                  id: uuidV4(),
                  title: "",
                  site: image.name,
                  body: "",
                }}
              />,
              ...view,
            ]);
          }}
        >
          <AddNote color="#015D7C" />
        </Pressable>
      </Row>
      <Box position={"absolute"} bg="blue" top="0" left="10"></Box>
    </Pressable>
  );
}
