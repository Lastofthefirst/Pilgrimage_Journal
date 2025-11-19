import React, { useState, useEffect } from "react";
import { View, Dimensions, BackHandler, Keyboard, LogBox } from "react-native";
import { NativeBaseProvider, StatusBar } from "native-base";

import { ViewContext } from "./viewContext";
import { MenuContext } from "./menuContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

import NoteList from "./views/notes/notesList";

import * as FileSystem from "expo-file-system";
import { useFonts, loadAsync } from "expo-font";

// Comment out to turn  on in-app error logs. (the big yellow screen)

export default function App() {
  let [view, setView] = useState([<NoteList />]);
  let [menu, setMenu] = useState(true);

  useEffect(() => {
    (async () => {
      console.log("running");
      try {
        await loadAsync({
          Caveat: require("./assets/Caveat-VariableFont_wght.ttf"),
          "comicneue-bold": require("./assets/ComicNeue-Bold.ttf"),
        });
      } catch (error) {}
    })();
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setMenu(false); // or some other action
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setMenu(true); // or some other action
      }
    );
    (async () => {
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
    })();

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  // if there is a view history go to the previous, if there is no history left close app.
  const backAction = (state) => {
    if (state.length > 1) {
      let shifted = [...state];
      shifted.shift();
      setView(shifted);
      return true;
    } else {
      BackHandler.exitApp();
      return true;
    }
    return true;
  };
  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () =>
      backAction(view)
    );
    return () => backHandler.remove();
  }, [view]);

  const inset = {
    frame: { x: 0, y: 0, width: 0, height: 0 },
    insets: { top: 0, left: 0, right: 0, bottom: 0 },
  };
  useEffect(() => {
    getData("@noteList");
    getData("@audioList");
    getData("@imageList");
    LogBox.ignoreAllLogs();

    //  let clearAll = async () => {
    //   try {
    //     await AsyncStorage.clear()
    //   } catch(e) {
    //     // clear error
    //   }
    //   let dir = await FileSystem.getInfoAsync(
    //     FileSystem.documentDirectory + "notes"
    //   );
    //   dir.exists &&
    //     (await FileSystem.deleteAsync(
    //       FileSystem.documentDirectory + "notes",
    //       { intermediates: true }
    //     )) &&
    //   console.log('Done.')
    // }

    // clearAll();
  }, []);

  const getData = async (key) => {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value !== null) {
        // value previously stored
        console.log(value);
      } else {
        storeData(key, []);
        console.log(value);
      }
    } catch (e) {
      // error reading value
    }
  };

  const storeData = async (key, value) => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (e) {
      // saving error
    }
  };

  const height = Dimensions.get("window").height;

  return (
    <NativeBaseProvider initialWindowMetrics={inset}>
      <ViewContext.Provider value={{ view, setView }}>
        <MenuContext.Provider value={{ menu, setMenu }}>
          <View
            style={{
              height: height,
              backgroundColor: "#fff",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              flex: 1,
            }}
          >
            <StatusBar
              style="auto"
              backgroundColor="#DCF1FA"
              barStyle="dark-content"
            />
            {view[0]}
          </View>
        </MenuContext.Provider>
      </ViewContext.Provider>
    </NativeBaseProvider>
  );
}
