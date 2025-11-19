import React, { useRef, useContext, useState, useEffect } from "react";
import {
  Text,
  Platform,
  KeyboardAvoidingView,
  SafeAreaView,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import {
  actions,
  RichEditor,
  RichToolbar,
} from "react-native-pell-rich-editor";

import { MenuContext } from "../../menuContext";

const TempScreen = ({ body, setBody }) => {
  let { menu, setMenu } = useContext(MenuContext);
  let [contHeight, setContHeight] = useState(300);

  const [showToolBar, setShowToolBar] = useState("hidden");

  const ref = useRef();


  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setShowToolBar("visible"); // or some other action
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setShowToolBar("none"); // or some other action
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  const richText = React.useRef();
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, height: "100%" }}

    >
      <ScrollView
        onLayout={(event) => {
          var { x, y, width, height } = event.nativeEvent.layout;
          setContHeight(height - 4);
        }}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        style={{
          display: "flex",
          flex: 1,
          backgroundColor: "white",
          borderRadius: 15,
          borderWidth: 1,
          padding: 4,
          margin: 5,
          borderColor: "white",
        }}
      >
        {/* <TouchableWithoutFeedback
        //   Use to blur when clicking outside
          onPress={() => richText.current?.blurContentEditor()}
          >
          <Text>Description:</Text>
          </TouchableWithoutFeedback> */}
        <RichEditor
          ref={richText}
          initialContentHTML={body}
          onChange={(descriptionText) => {
            setBody(descriptionText);
          }}
          onFocus={() => setMenu(false)}
          onBlur={() => {setMenu(true)}}
          useContainer={false}
          style={{
            minHeight: contHeight,
            flex: 1,
            borderColor: "#e3e3e3",
          }}
        />
      </ScrollView>

      <RichToolbar
        editor={richText}
        actions={[
          actions.heading1,
          actions.setBold,
          actions.setParagraph,
          actions.setItalic,
          actions.setUnderline,
          actions.blockquote,
          actions.insertBulletsList,
          actions.insertOrderedList,
          actions.removeFormat,
        ]}
        iconTint="#015D7C"
        selectedIconTint="black"
        // backgroundColor="#DCF1FA"
        iconMap={{
          [actions.heading1]: ({ tintColor }) => (
            <Text style={[{ color: tintColor }]}>H1</Text>
          ),
          [actions.setParagraph]: ({ tintColor }) => (
            <Text style={[{ color: tintColor }]}>P</Text>
          ),
        }}
        style={{
          visibility: setShowToolBar,
          backgroundColor:"#DCF1FA",
          color:"#015D7C",
        }}
      />
    </KeyboardAvoidingView>
  );
};

export default TempScreen;
