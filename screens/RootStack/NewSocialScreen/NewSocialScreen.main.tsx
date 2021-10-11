import React, { useState, useEffect } from "react";
import { Platform, View, Text} from "react-native";
import { Appbar, TextInput, Snackbar, Button, ActivityIndicator } from "react-native-paper";
import { getFileObjectAsync, uuid } from "../../../Utils";

// See https://github.com/mmazzarolo/react-native-modal-datetime-picker
// Most of the date picker code is directly sourced from the example.
import DateTimePickerModal from "react-native-modal-datetime-picker";

// See https://docs.expo.io/versions/latest/sdk/imagepicker/
// Most of the image picker code is directly sourced from the example.
import * as ImagePicker from "expo-image-picker";
import { styles } from "./NewSocialScreen.styles";

import firebase from "firebase/app";
import "firebase/firestore";
import { SocialModel } from "../../../models/social";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../RootStackScreen";

interface Props {
  navigation: StackNavigationProp<RootStackParamList, "NewSocialScreen">;
}

export default function NewSocialScreen({ navigation }: Props) {
  /* TODO: Declare state variables for all of the attributes 
           that you need to keep track of on this screen.
    
     HINTS:

      1. There are five core attributes that are related to the social object.
      2. There are two attributes from the Date Picker.
      3. There is one attribute from the Snackbar.
      4. There is one attribute for the loading indicator in the submit button.
  
  */

  // TODO: Follow the Expo Docs to implement the ImagePicker component.
  // https://docs.expo.io/versions/latest/sdk/imagepicker/

  // TODO: Follow the GitHub Docs to implement the react-native-modal-datetime-picker component.
  // https://github.com/mmazzarolo/react-native-modal-datetime-picker

  // TODO: Follow the SnackBar Docs to implement the Snackbar component.
  // https://callstack.github.io/react-native-paper/snackbar.html
  const [eventName, setEventName] = useState<String[]>()
  const [eventLocation, setEventLocation] = useState()
  const [eventDescription, setEventDescription] = useState()
  const [eventDate, setEventDate] = useState()
  const [eventImage, setEventImage] = useState();
  const [hasChosenImage, setHasChosenImage] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isSnackBarVisible, setSnackBarVisible] = useState(false);
  const [isLoadingVisible, setLoadingVisible] = useState(false);

  const saveEvent = async () => {
    // TODO: Validate all fields (hint: field values should be stored in state variables).
    // If there's a field that is missing data, then return and show an error
    // using the Snackbar.

    // Otherwise, proceed onwards with uploading the image, and then the object.

    if (eventName && eventLocation && eventDescription && eventDate && eventImage) {
      try {
        setLoadingVisible(true);
        const asyncAwaitNetworkRequests = async () => {
          const object = await getFileObjectAsync(eventImage);
          const result = await firebase
            .storage()
            .ref()
            .child(uuid() + ".jpg")
            .put(object as Blob);
          const downloadURL = await result.ref.getDownloadURL();
          const doc: SocialModel = {
            eventName: eventName,
            eventDate: eventDate.getTime(),
            eventLocation: eventLocation,
            eventDescription: eventDescription,
            eventImage: downloadURL,
          };
          await firebase.firestore().collection("socials").doc().set(doc);
          console.log("Finished social creation.");
        };
  
        asyncAwaitNetworkRequests()
          .then(() => {
            console.log("our async function finished running.");
            setLoadingVisible(false);
            navigation.navigate("Main")
            
          })
          .catch((e) => {
            console.log("our async function threw an error:", e);
          });
  
  
        // NOTE: THE BULK OF THIS FUNCTION IS ALREADY IMPLEMENTED FOR YOU IN HINTS.TSX.
        // READ THIS TO GET A HIGH-LEVEL OVERVIEW OF WHAT YOU NEED TO DO, THEN GO READ THAT FILE!
  
        // (0) Firebase Cloud Storage wants a Blob, so we first convert the file path
        // saved in our eventImage state variable to a Blob.
  
        // (1) Write the image to Firebase Cloud Storage. Make sure to do this
        // using an "await" keyword, since we're in an async function. Name it using
        // the uuid provided below.
  
        // (2) Get the download URL of the file we just wrote. We're going to put that
        // download URL into Firestore (where our data itself is stored). Make sure to
        // do this using an async keyword.
  
        // (3) Construct & write the social model to the "socials" collection in Firestore.
        // The eventImage should be the downloadURL that we got from (3).
        // Make sure to do this using an async keyword.
        
        // (4) If nothing threw an error, then go back to the previous screen.
        //     Otherwise, show an error.
  
      } catch (e) {
        console.log("Error while writing social:", e);
      }
    }
    else {
      console.log("Validation failed")
      setSnackBarVisible(true);
    }

    
  };


  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          alert('Sorry, we need camera roll permissions to make this work!');
        }
      }
    })();
  }, []);

  // Image picker function
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.cancelled) {
      setEventImage(result.uri);
      setHasChosenImage(true);
    }
  };

  // Date Picker usage functions
  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date) => {
    console.warn("A date has been picked: ", date);
    setEventDate(date)
    hideDatePicker();
  };

  const Bar = () => {
    return (
      <Appbar.Header dark={false} style={{backgroundColor: "white"}}>
        <Appbar.Action onPress={navigation.goBack} icon="close" />
        <Appbar.Content title="Socials" />
      </Appbar.Header>
    );
  };

  return (
    <>
      <Bar />
      <View style={{ ...styles.container, padding: 20 }}>

        <TextInput 
          label="Event Name"
          value={eventName}
          style={styles.text_input}
          onChangeText={(textName) => {setEventName(textName)}}
        />
        <TextInput 
          label="Event Location"
          value={eventLocation}
          style={styles.text_input}
          onChangeText={(text) => {setEventLocation(text)}}
        />
        <TextInput 
          label="Event Description"
          value={eventDescription}
          style={styles.text_input}
          onChangeText={(text) => {setEventDescription(text)}}
        />
        <View style={styles.top_padding}>
          <Button
            onPress={showDatePicker}
            mode="outlined"
          >
            {eventDate ? eventDate.toLocaleString() : "Pick a Date"}
          </Button>
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            onConfirm={handleConfirm}
            onCancel={hideDatePicker}
          />
        </View>
        <View style={styles.top_padding}>
          <Button mode="outlined" onPress={pickImage}>{hasChosenImage ? "Change event image" : "Select event image"}</Button>
        </View>
        <View style={styles.top_padding}>
          <Button mode="contained" onPress={saveEvent} >
            {isLoadingVisible ? <ActivityIndicator color={"white"} style={{marginRight: 10}} size={16} animating={isLoadingVisible} /> : ""}
            <Text>Save event</Text>
          </Button>
        </View>
      
      </View>
      <Snackbar
          visible={isSnackBarVisible}
          onDismiss={() => setSnackBarVisible(true)}
        >
          All fields are required!
      </Snackbar>
    </>
  );
}
