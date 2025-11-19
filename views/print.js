import React, { useEffect, useContext, useState } from "react";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import * as Print from "expo-print";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from "expo-linking";
import data from "./sites/cardData";
import * as StoreReview from "expo-store-review";

import {
  HStack,
  Spinner,
  Heading,
  StatusBar,
  Row,
  Column,
  Text,
  ScrollView,
  Image,
  Pressable,
  Box,
} from "native-base";
import { Asset } from "expo-asset";
import { manipulateAsync } from "expo-image-manipulator";
import { ViewContext } from "../viewContext";

// import { convertRemToAbsolute } from "native-base/lib/typescript/theme/tools";
// import { shareAsync } from 'expo-sharing';
import Back from "../svgs/back";
import Reverse from "../svgs/reverse";
import Info from "../svgs/info";
import AboutTeam from "../svgs/aboutTeam";
import Writings from "../svgs/writings";
import Star from "../svgs/star";
import Save from "../svgs/save";
import Printer from "../svgs/print";

export default function PrintView() {
  let [notes, setNotes] = useState([]);
  let [images, setImages] = useState([]);
  // let [binaries, setBinaries] = useState([]);  ADD USER TAKEN IMAGES, OVERLOADS MEMORY
  let [loadingPrint, setLoadingPrint] = useState(false);
  let [loadingSave, setLoadingSave] = useState(false);
  let [imagesReady, setImagesReady] = useState(false);
  const { view, setView } = useContext(ViewContext);
  // cardData = cardData.sort((one, two)=>one.index>two.index);
  let cardData = data.sort((one, two)=>one.index>two.index);

  useEffect(() => {
    getData("@noteList", setNotes);
    getData("@imageList", setImages);

    // let cancel = false;
    // (async function () {
    //   for await (const el of cardData) {
    //     if (cancel) return;
    //     try {
    //       let asset = Asset.fromModule(el.image).uri;
    //       const base64 = await manipulateAsync(asset, [], {
    //         base64: true,
    //       });
    //       el.bin = `src="data:image/jpeg;base64,${base64.base64}"`;
    //     } catch (error) {
    //       console.log(error);
    //     }
    //   }
    //   setImagesReady(true);
    // })();

    // return () => (cancel = true);
  }, []);

  // useEffect(() => {  ADD USER TAKEN IMAGES, OVERLOADS MEMORY
  //   let binHolder = [];
  //   let cancel = false;
  //   (async function () {
  //     for await (const el of images) {
  //       if (cancel) return;
  //       try {
  //         const base64 = await manipulateAsync(el.uri, [], {
  //           base64: true,
  //         });
  //         binHolder.push({
  //           site: el.site,
  //           title: el.title,
  //           bin: `
  //   <h1 class="pagebreak">${el.title}<h1>
  //    <img
  // src="data:image/jpeg;base64,${base64.base64}"
  // style="width: 90vw;" />
  //  `,
  //         });
  //       } catch (error) {
  //         console.log(error);
  //       }
  //     }

  //     console.log(binHolder.length, "is the length of binholder.");

  //     setBinaries(binHolder);
  //   })();

  //   return () => (cancel = true);
  // }, [images]);

  let goBack = () => {
    let shifted = [...view];
    shifted.shift();
    setView(shifted);
  };

  // async function generateHTML(asset) {
  //   const image = await manipulateAsync(
  //     asset.localUri ?? asset.uri,
  //     [],
  //     { base64: true }
  //   );
  //   return `
  //     <html>
  //       <img
  //         src="data:image/jpeg;base64,${image.base64}"
  //         style="width: 90vw;" />
  //     </html>
  //   `;
  // }

  const getData = async (key, setFn) => {
    console.log("made it in");
    try {
      console.log("trying");
      const value = await AsyncStorage.getItem(key);
      if (value !== null) {
        // value previously stored
        let parsed = JSON.parse(value);
        setFn(parsed);
        console.log("made it here");
      } else {
        console.log("endded up here");
      }
    } catch (e) {
      // error reading value
      console.log(e);
    }
  };

  const html = `
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
    <style>
    @media print {
      .pagebreak { page-break-before: always; }

  }

  .pagebreak { page-break-before: always;margin-top:45px }
  p{
    width:60vw;margin:auto; text-align:left;
  }
  .top{
    height:45px;
  }
  .top-sm{
  height:25px;    
  }

    </style>
  </head>
  <body style="text-align: center;">
  <div style="position:relative; height: 100%;">

  <h1 style="font-size: 50px; padding-top:150px; font-family: Helvetica Neue; font-weight: normal;">
  Pilgrimage Journal
</h1>
<h2 style="font-size: 40px; font-family: Helvetica Neue; font-weight: normal;">
  By <br>Hussein Ahdieh<br> &<br> Tatiana Jordan
</h2>
<img style="width: 25vw; position:absolute; bottom: 10px; right: 10px; height:auto;" src="https://github.com/Lastofthefirst/pilgrim-images/raw/main/corner.png" />
<img style="width: 25vw; position:absolute; top: 10px; transform: rotate(270deg); right: 10px; height:auto;" src="https://github.com/Lastofthefirst/pilgrim-images/raw/main/corner.png" />
<img style="width: 25vw; position:absolute; top: 10px; transform: rotate(180deg); left: 10px; height:auto;" src="https://github.com/Lastofthefirst/pilgrim-images/raw/main/corner.png" />
<img style="width: 25vw; position:absolute; bottom: 10px; transform: rotate(90deg); left: 10px; height:auto;" src="https://github.com/Lastofthefirst/pilgrim-images/raw/main/corner.png" />
</div>

<div class="pagebreak"><br>
<br>
<br>
<br>
<br>Copyright © 2021 by Hussein Ahdieh.
All rights reserved.</div>
<div class="pagebreak top"></div>
    <h2 class="">Table of Contents</h2>
    ${cardData
      .map((el) => {
        return `<h3>${el.name}</h3>`;
      })
      .join("")}
      <div class="pagebreak top"></div>

<p class="" style="width:60vw;margin:auto; text-align: center;"><br>
<br>
<br>
<br>
“This Hallowed Spot that God
hath made the Centre round which
circle the Concourse on High, and
which He hath decreed to be the
Point of Adoration for the denizens
of the Cities of Eternity, and the
Source of Command unto all that
are in heaven and on earth”</p>
<p>Bahá’u’lláh</p>
<p>Kitáb-i-Aqdas,paragraph 137</p>
<img style="width: 40vw; margin-top:65px; height:auto;" src="https://github.com/Lastofthefirst/pilgrim-images/raw/main/whirl.png" />

<div class="pagebreak top"></div>

<p class="" style="width:60vw;margin:auto; text-align: center;"><br>
<br>
<br>
<br>
“Holy places are undoubtedly
centres of the outpouring of
Divine grace, because on entering
the illumined sites associated with
martyrs and holy souls, and by
observing reverence, both physical
and spiritual, one’s heart is moved
with great tenderness.”</p>
<p>‘Abdu’l-Bahá</p>
<p>Synopsis and Codification of the Laws and
Ordinances of the Kitáb-i-Aqdas,p.64</p>
<img style="width: 40vw; margin-top:65px; height:auto;" src="https://github.com/Lastofthefirst/pilgrim-images/raw/main/whirl.png" />

<div class="pagebreak top"></div>
<h1 class="" style="margin-top:45px">Introduction</h1>
<p  ><br>
<br>
<br>
<br>
Pilgrimage is a journey of the soul to the centre of
the universe, to that Spot where you and countless
souls turn in prayer each day. Now you are here and
walking on the Sacred Dust trodden on by the
Manifestation of God for this Day.</p>
<p> This journal was created as a token of love for your
journey. We hope that you will record reflections
and insights and plans as you visit the sacred Shrines
of the Báb and Bahá'u'lláh, as well as special sites
associated with the Lives of the Central Figures of
the Faith.</p>
<p> God-willing, when you return home, these
reflections will help to keep your soul connected to
this Sacred Spot and continue to render service
towards the betterment of humanity.</p>
<p style="text-align:right;">Linda Ahdieh Grant</p>


    ${cardData
      .map((el) => {
        let locationString = `<div class="pagebreak top-sm"></div>
        <h1 class="">${el.name}</h1>`;

        locationString += `<img src="${el.webUrl}" style="width: 90vw; border-radius:15px; height:auto; max-height:60vh" />`;
if(el.from_world_center ==="TRUE"){
  locationString+= `<div>Copyright © Bahá’í International Community</div>`
}
        locationString+= `<img style="width: 55vw; margin-top:25px; margin-bottom:10px;height:auto;" src="https://github.com/Lastofthefirst/pilgrim-images/raw/main/divider.png"/>`
        locationString+= `<p>${el.quote.text}</p>`
        locationString+= `<p style="font-weight:bold;">${el.quote.ref}</p>`
        

        let notesListHtmlString = [...notes]
          .filter((l) => l.site.includes(el.name))
          .map((n) => {
            return `<div class="pagebreak top-sm"></div>
            <h1 class="" style="color:grey">Notes</h1>
            <br><h3 style="font-size: 40; text-align:left; font-family: Helvetica Neue; font-weight: normal;">${n.title}</h3>
<section style="width:60vw;margin:auto; text-align: center;">${n.body}</section>`;
          })
          .join("");

        // let imagesListHtmlString = [...binaries]  ADD USER TAKEN IMAGES, OVERLOADS MEMORY
        //   .filter((l) => l.site.includes(el.name))
        //   .map((n) => {
        //     return n.bin;
        //   })
        //   .join("");

        // .join("");

        return locationString + notesListHtmlString;
        // return locationString + notesListHtmlString + imagesListHtmlString; ADD USER TAKEN IMAGES, OVERLOADS MEMORY
      })
      .join("")}
      <div class="pagebreak top"></div>
      <h2 class="">Acknowledgements</h2>

  </body>
</html>
`;

  const [selectedPrinter, setSelectedPrinter] = React.useState();

  const print = async () => {
    // if (binaries.length != images.length) return;  ADD USER TAKEN IMAGES, OVERLOADS MEMORY
    // if (!imagesReady) return;

    setLoadingPrint(true);
    try {
      await Print.printAsync({
        html,
        printerUrl: selectedPrinter?.url, // iOS only
      });
      setLoadingPrint(false);
    } catch (error) {
      setLoadingPrint(false);
    }
  };

  const printToFile = async () => {
    // if (binaries.length != images.length) return;  ADD USER TAKEN IMAGES, OVERLOADS MEMORY
    // if (!imagesReady) return;
    setLoadingSave(true);
    let uriToDel = "";

    const promiseToShare = new Promise(async (resolve, reject) => {
      try {
        const { uri } = await Print.printToFileAsync({
          html,
        });
        let rename = uri.split("/");
        rename.splice(rename.length - 1, 1, "MyBahaiPilgrimageJournal.pdf");
        rename = rename.join("/");
        await FileSystem.moveAsync({ from: uri, to: rename });
        await Sharing.shareAsync(rename);
        uriToDel = rename;
        setLoadingSave(false);
        resolve(rename);
      } catch (error) {
        setLoadingSave(false);
        reject(error);
      }
    });
    promiseToShare.then(async (response, error) => {
      if (!error) {
        StoreReview.requestReview();
        await FileSystem.deleteAsync(uriToDel);
      }
    });
  };

  const selectPrinter = async () => {
    const printer = await Print.selectPrinterAsync(); // iOS only
    setSelectedPrinter(printer);
  };

  const Building = ({ text }) => {
    return (
      <HStack space={2} paddingX={4} justifyContent="center">
        <Spinner accessibilityLabel="LoadingPrint posts" />
        <Heading color="primary.500" fontSize="md">
          {text}
        </Heading>
      </HStack>
    );
  };

  return (
    <Column alignItems={"center"} bg="#024359" h="100%" w="100%">
      <StatusBar translucent={true} backgroundColor={"transparent"} />

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
            Back{" "}
          </Text>
        </Row>
      </Pressable>
      <Image
        mt="-105"
        h="450"
        w="100%"
        alt=""
        rounded="3xl"
        source={require("../assets/images/row.jpg")}
      />

      <ScrollView
        position="absolute"
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        top="0%"
        height="100%"
        overflow="visible"
      >
        <Box
          rounded="md"
          py="10"
          px="2"
          padding="5"
          mt="100"
          bg="white"
          width="80%"
          minW="81%"
          minH="32"
          justifyContent={"center"}
          alignItems="center"
        >
          {loadingSave ? (
            <Building text="Building your jounal!" />
          ) : (
            <Pressable onPress={printToFile}>
              <Row>
                <Save color="#024359" />
                <Text bold textAlign={"center"} fontSize={"md"} color="#024359">
                  {" "}
                  Download or share a .pdf journal!
                </Text>
              </Row>
            </Pressable>
          )}
        </Box>
        <Box
          rounded="md"
          py="5"
          padding="1"
          mt="10"
          bg="#DCF1FA"
          width="80%"
          justifyContent={"center"}
          alignItems="center"
        >
          {loadingPrint ? (
            <Building text="Building" />
          ) : (
            <Pressable onPress={print}>
              <Row>
                <Printer color="#024359" />
                <Text bold fontSize={"md"} color="#024359">
                  {" "}
                  Print a .pdf journal.
                </Text>
              </Row>
            </Pressable>
          )}
        </Box>
        {/* <Pressable
          rounded="md"
          py="5"
          padding="1"
          mt="10"
          bg="#DCF1FA"
          width="80%"
          justifyContent={"center"}
          alignItems="center"
        >
          <Row>
            <Info color="#024359" />
            <Text bold fontSize={"md"} color="#024359">
              {" "}
              About the App
            </Text>
          </Row>
        </Pressable> */}
        <Pressable
          rounded="md"
          py="5"
          padding="1"
          mt="10"
          bg="#DCF1FA"
          width="80%"
          justifyContent={"center"}
          alignItems="center"
          onPress={() =>
            Linking.openURL("https://pilgrimnotes.ridvan.org/#features")
          }
        >
          <Row>
            <Reverse color="#024359" />
            <Text bold fontSize={"md"} color="#024359">
              {" "}
              How to use the App
            </Text>
          </Row>
        </Pressable>
        <Pressable
          rounded="md"
          py="5"
          padding="1"
          mt="10"
          bg="#DCF1FA"
          width="80%"
          justifyContent={"center"}
          alignItems="center"
          onPress={() => StoreReview.requestReview()}
        >
          <Row>
            <Star color="#024359" />
            <Text bold fontSize={"md"} color="#024359">
              {" "}
              Rate and Review the App
            </Text>
          </Row>
        </Pressable>
        <Pressable
          rounded="md"
          py="5"
          padding="1"
          mt="10"
          bg="#DCF1FA"
          width="80%"
          justifyContent={"center"}
          alignItems="center"
          onPress={() => Linking.openURL("https://bahai.org/library")}
        >
          <Row>
            <Writings color="#024359" />
            <Text bold fontSize={"md"} color="#024359">
              {" "}
              Baha'i Writings
            </Text>
          </Row>
        </Pressable>
        <Pressable
          rounded="md"
          py="5"
          padding="1"
          mt="10"
          mb="40"
          bg="#DCF1FA"
          width="80%"
          justifyContent={"center"}
          alignItems="center"
          onPress={() =>
            Linking.openURL("https://pilgrimnotes.ridvan.org/#the-team")
          }
        >
          <Row>
            <AboutTeam color="#024359" />
            <Text bold fontSize={"md"} color="#024359">
              {" "}
              About the team.
            </Text>
          </Row>
        </Pressable>
        {/* <Row>
        <Spacer />

        <Button onPress={print}>Print</Button>
        <Spacer />
        <Button onPress={printToFile}>Print to PDF file</Button>
        {Platform.OS === "ios" && (
          <>
          <View />
          <Button title="" onPress={selectPrinter}>
          Select printer
          </Button>
          <View />
          {selectedPrinter ? (
            <Text>{`Selected printer: ${selectedPrinter.name}`}</Text>
            ) : undefined}
            </>
            )}
            <Spacer />
          </Row> */}
      </ScrollView>
    </Column>
  );
}
