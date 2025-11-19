# Pilgrim Notes

## Objective

Pilgrims in the Holy Land can make notes of their pilgrimage. These notes can be associated with each of the Holy Places. The user can generate a pdf book containing preselected quotes and images about the Holy placese, as well as their own notes. They can also share these notes with others. They can also record audio recordings and pictures, these can be associated with the holy place.

## Workflow

- Baha'is go on pilgrimage to the Shrines of Baha'u'llah, the Báb, and 'AbdulBaha from all around the world.
  - This pilgrimage is a special moment in their life.
  - The energy and enthusiasim from their pilgrimage is invigorating both to the inddividual but also to their family friends and community.
- The pilgrimage is relatively short usually a trip of 3 or 9 days.
  - The pilgrim may not be very organized or planned out how they will take notes.
  - They will have many times they might want to take notes on a short notice.
  - These notes are valuable and don't want to be missed.
  - They will want to be able to keep record of their notes and share them with others.
- How will the pilgrim hear about the app?
  - Maybe a friend
  - Maybe social media
  - Maybe an advertisement
  - maybe someone will send them a link to the launch page
  - maybe they will find the launch page on a search engine.
- The pilgrim will download the app from the android or apple store.
  - The app will be free of charge.
- The pilgrim will go into the app when they want to make a note about something during their pilgrimage.
  - Written notes
  - Audio notes
  - pictures
  - They should be able to put notes in quickly
  - They shouldn't be worried the notes will be deleted
- The pilgrim can browse the notes they have created and make edits.
- They can view notes in a list form
- They can view a page for each of the holy places
  - That page contains the address and long/lat of the Holy Site(?)
    - Can be pressed to copy for pasting into maps
  - contains an image of the holy site
  - contains the preselected quotes of the holy site
  - contains the notes the pilgrim has made thus far asssociated with that holy site.
- The pilgrim can generate a pdf book from their notes for printing or saving.
  - pdf contains the notes they recorded about each place
  - contains misc notes at the end.
- The pilgrim can share a particular note
  - using the built in share menu
- The user can share their pdf
  - using the share menu

## Actors

- Owner: Hussein
- Assistant: Tatiana
- Developers: Velimir, Quddus
  - Build the app
  - Fix bugs andd issues
  -
- Users: pilgrims
  - add new notes
  - edit notes
  - download pdf
  - find address of Holy Places
  - add images
  - add audio notes
  - share pdf
  - ask questions about how the app works
- Pilgrims' community: friends family community of the user
  - Recieve shared notes.
- App Stores: Google and Apple
  - Review app

## Useful Links

- https://scribe.rip/how-to-record-audio-using-react-native-expo-74723d2358e3
- https://nativebase.io/
- https://www.figma.com/file/BkceN2GqwazlUQU7hkRhbi/Pilgrim-Notes?node-id=0%3A1
- https://docs.expo.dev/guides/testing-with-jest/
- https://stackoverflow.com/questions/4658382/test-driven-development-tdd-for-user-interface-ui-with-functional-tests
  - https://vid.puffyan.us/watch?v=ydddSkVz_a8
- expo print cannot read local images, must turn to base64 https://github.com/expo/expo/issues/7940#issuecomment-657111033

  ### Editor Research

  - https://github.com/DaniAkash/react-native-draftjs
  - https://github.com/facebook/draft-js/issues/1343
  - https://github.com/quilljs/awesome-quill
  - https://github.com/typeskill/typer
  - https://github.com/kunall17/react-native-markdown-editor#screenshots
  - https://github.com/jondot/awesome-react-native#readme

## Forums Q&A

- https://forums.expo.dev/t/text-editors-and-notes/59573

## First sprint

**Tests**

Behavior driven tests

- given that I am on the sites page
  - when I tap a sites card
    - I should be taken to that sites individual page
- given that i am on a site location page
  - when i tap the new note button
    - i should be taken to the text editor
    - the note i am editing should be new
    - the new note should be tagged to the selected site
- given that i am on the notes page
  - all notes should be listed

Test driven dev tests

- adding a new note should create an empty db entry
- pushing export buttonshould generate a new pdf
  - thepdf should contain the body textof each note

https://docs.expo.dev/versions/latest/sdk/status-bar/
https://stackoverflow.com/questions/51289587/react-native-how-to-use-safeareaview-for-android-notch-devices

## Note

Expo projects often break if developers use both yarn and npm by mistake. This is not just a fault on the side of developers, but expoo as a project sometimes defaults to one andd other times to the other. **For this project we are only using yarn.**

## Meeting 3

add

- add note button to note list button
- Add title
- Some figures and image in the background
- tutorial popups
- Theres alot of meaningful information you can give people to for the sites.
  - How would we get the information.
- We want this to be as inspirational as possible. The idea is ffor you to reflect ont he quality of pilgrimage. The office will take care of the mechanics of pilgrimage.
- as part of  the introductiono link to the website.
- At  some point its not bad to have chanting or prayer to be recited at the beginning. 


resize all images in a dir:

`magick mogrify -resize 1100  -path ../new-images *.jpg`

https://www.freecodecamp.org/news/javascript-debounce-example/ for autosave
https://github.com/xnimorz/use-debounce