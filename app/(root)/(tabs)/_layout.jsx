// // import React from 'react';
// // import { Animated, Dimensions } from 'react-native';
// // import { Tabs } from "expo-router";
// // import Icon from "react-native-vector-icons/FontAwesome";

// // const TabIcon = ({ name, focused }) => (
// //   <Animated.View
// //     style={{
// //       flexDirection: "row",
// //       justifyContent: "center",
// //       alignItems: "center",
// //     }}
// //   >
// //     <Animated.View
// //       style={{
// //         borderRadius: 999,
// //         width: 48,
// //         height: 48,
// //         justifyContent: "center",
// //         alignItems: "center",
// //         backgroundColor: focused ? "#A3A3A8" : "white",
// //       }}
// //     >
// //       <Icon
// //         name={name}
// //         size={28}
// //         color="black"
// //         style={{ textAlign: "center" }}
// //       />
// //     </Animated.View>
// //   </Animated.View>
// // );

// // export default function Layout() {
// //   return (
// //     <Tabs
// //       initialRouteName="home"
// //       screenOptions={{
// //         tabBarShowLabel: false,
// //         tabBarStyle: {
// //           paddingBottom: 1,
// //           marginBottom: 5,
// //           height: 70,
// //           display: "flex",
// //           justifyContent: "space-between",
// //           alignItems: "center",
// //           flexDirection: "row",
// //           position: "absolute",
// //           left: 0,
// //           right: 0,
// //           bottom: 0,
// //           backgroundColor: 'white',
// //           borderTopWidth: 1,
// //           borderTopColor: '#f0f0f0',
// //           elevation: 8,
// //           shadowColor: "#000",
// //           shadowOffset: {
// //             width: 0,
// //             height: -2,
// //           },
// //           shadowOpacity: 0.1,
// //           shadowRadius: 3,
// //         },
// //       }}
// //     >
// //       <Tabs.Screen
// //         name="home"
// //         options={{
// //           title: "Home",
// //           headerShown: false,
// //           tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} />,
// //         }}
// //       />
// //       <Tabs.Screen
// //         name="connect"
// //         options={{
// //           title: "Connect",
// //           headerShown: false,
// //           tabBarIcon: ({ focused }) => <TabIcon name="link" focused={focused} />,
// //         }}
// //       />
// //       <Tabs.Screen
// //         name="chat"
// //         options={{
// //           title: "Chat",
// //           headerShown: false,
// //           tabBarIcon: ({ focused }) => <TabIcon name="comments" focused={focused} />,
// //         }}
// //       />
// //       <Tabs.Screen
// //         name="profile"
// //         options={{
// //           title: "Profile",
// //           headerShown: false,
// //           tabBarIcon: ({ focused }) => <TabIcon name="user" focused={focused} />,
// //         }}
// //       />
// //     </Tabs>
// //   );
// // }
import React, { useEffect, useState } from 'react';
import { Animated, Platform, Keyboard, View } from 'react-native';
import { Tabs } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const COLORS = {
  background: '#070606',
  iconInactive: '#6C6C6D',
  iconActive: '#FFFFFF'
};

const TabIcon = ({ name, focused }) => (
  <View style={{ 
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32
  }}>
    <Ionicons
      name={getIconName(name, focused)}
      size={24}
      color={focused ? COLORS.iconActive : COLORS.iconInactive}
      style={{ opacity: focused ? 1 : 0.8 }}
    />
  </View>
);

const getIconName = (routeName, focused) => {
  switch (routeName) {
    case 'home':
      return 'home-outline';
    case 'search':
      return 'search-outline';
    case 'messages':
      return 'mail-outline';
    case 'notifications':
      return 'notifications-outline';
    case 'groups':
      return 'people-circle-outline';
    default:
      return 'circle-outline';
  }
};

export default function Layout() {
  const insets = useSafeAreaInsets();
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [scrollY] = useState(new Animated.Value(0));

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const hideSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const tabBarTranslateY = scrollY.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 100],
    extrapolate: 'clamp'
  });

  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: {
          transform: [{ translateY: tabBarTranslateY }],
          paddingBottom: insets.bottom,
          height: 49 + insets.bottom,
          backgroundColor: COLORS.background,
          borderTopWidth: 0,
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          display: keyboardVisible ? 'none' : 'flex',
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="connect"
        options={{
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon name="search" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon name="messages" focused={focused} />,
        }}
      />
      {/* <Tabs.Screen
        name="notifications"
        options={{
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon name="notifications" focused={focused} />,
        }}
      /> */}
      <Tabs.Screen
        name="groups"
        options={{
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon name="groups" focused={focused} />,
        }}
      />
         {/* <Tabs.Screen
        name="jobs"
        options={{
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon name="groups" focused={focused} />,
        }}
      /> */}
    </Tabs>
  );
}

// import React, { useEffect, useState } from 'react';
// import { Animated, Platform, Keyboard, View, TouchableOpacity, Modal } from 'react-native';
// import { Tabs } from "expo-router";
// import { Ionicons } from '@expo/vector-icons';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import CreatePostScreen from '../../../components/CreatePost';

// const COLORS = {
//   background: '#070606',
//   iconInactive: '#6C6C6D',
//   iconActive: '#FFFFFF',
//   createButtonBackground: '#3B82F6'
// };

// const TabIcon = ({ name, focused }) => (
//   <View style={{ 
//     alignItems: 'center',
//     justifyContent: 'center',
//     width: 32,
//     height: 32
//   }}>
//     <Ionicons
//       name={getIconName(name, focused)}
//       size={24}
//       color={focused ? COLORS.iconActive : COLORS.iconInactive}
//       style={{ opacity: focused ? 1 : 0.8 }}
//     />
//   </View>
// );

// const getIconName = (routeName, focused) => {
//   switch (routeName) {
//     case 'home':
//       return focused ? 'home' : 'home-outline';
//     case 'search':
//       return focused ? 'search' : 'search-outline';
//     case 'messages':
//       return focused ? 'mail' : 'mail-outline';
//     case 'groups':
//       return focused ? 'people-circle' : 'people-circle-outline';
//     default:
//       return 'circle-outline';
//   }
// };

// export default function Layout() {
//   const insets = useSafeAreaInsets();
//   const [keyboardVisible, setKeyboardVisible] = useState(false);
//   const [scrollY] = useState(new Animated.Value(0));
//   const [isCreatePostVisible, setIsCreatePostVisible] = useState(false);

//   useEffect(() => {
//     const showSubscription = Keyboard.addListener(
//       Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
//       () => setKeyboardVisible(true)
//     );
//     const hideSubscription = Keyboard.addListener(
//       Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
//       () => setKeyboardVisible(false)
//     );

//     return () => {
//       showSubscription.remove();
//       hideSubscription.remove();
//     };
//   }, []);

//   const tabBarTranslateY = scrollY.interpolate({
//     inputRange: [0, 1],
//     outputRange: [0, 100],
//     extrapolate: 'clamp'
//   });

//   const handlePostCreated = (newPost) => {
//     // Handle the newly created post
//     console.log('New post created:', newPost);
//     // You might want to refresh the feed or navigate to the new post
//   };

//   const CreatePostButton = () => {
//     return (
//       <TouchableOpacity
//         onPress={() => setIsCreatePostVisible(true)}
//         style={{
//           backgroundColor: COLORS.createButtonBackground,
//           width: 56,
//           height: 56,
//           borderRadius: 28,
//           justifyContent: 'center',
//           alignItems: 'center',
//           marginBottom: 16, // Lift the button up from the tab bar
//           shadowColor: '#000',
//           shadowOffset: { width: 0, height: 2 },
//           shadowOpacity: 0.25,
//           shadowRadius: 3.84,
//           elevation: 5,
//         }}
//       >
//         <Ionicons name="add" size={32} color="white" />
//       </TouchableOpacity>
//     );
//   };

//   return (
//     <>
//       <Tabs
//         screenOptions={{
//           tabBarShowLabel: false,
//           tabBarStyle: {
//             transform: [{ translateY: tabBarTranslateY }],
//             paddingBottom: insets.bottom,
//             height: 49 + insets.bottom,
//             backgroundColor: COLORS.background,
//             borderTopWidth: 0,
//             position: 'absolute',
//             left: 0,
//             right: 0,
//             bottom: 0,
//             display: keyboardVisible ? 'none' : 'flex',
//           },
//         }}
//       >
//         <Tabs.Screen
//           name="home"
//           options={{
//             headerShown: false,
//             tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} />,
//           }}
//         />
//         <Tabs.Screen
//           name="connect"
//           options={{
//             headerShown: false,
//             tabBarIcon: ({ focused }) => <TabIcon name="search" focused={focused} />,
//           }}
//         />
//         {/* <Tabs.Screen
//           name="createpost"
//           options={{
//             headerShown: false,
//             tabBarIcon: ({ focused }) => <TabIcon name="search" focused={focused} />,
//             // tabBarButton: (props) => <CreatePostButton {...props} />,
//           }}
//           // listeners={{
//           //   tabPress: (e) => {
//           //     // Prevent default behavior
//           //     e.preventDefault();
//           //     setIsCreatePostVisible(true);
//           //   },
//           // }}
//         /> */}
//         {/* <Tabs.Screen
//           name="createpost"
//           options={{
//             headerShown: false,
//             tabBarIcon: ({ focused }) => <TabIcon name="messages" focused={focused} />,
//           }}
//         /> */}
//         <Tabs.Screen
//           name="chat"
//           options={{
//             headerShown: false,
//             tabBarIcon: ({ focused }) => <TabIcon name="messages" focused={focused} />,
//           }}
//         />
//         <Tabs.Screen
//           name="groups"
//           options={{
//             headerShown: false,
//             tabBarIcon: ({ focused }) => <TabIcon name="groups" focused={focused} />,
//           }}
//         />
//       </Tabs>

//       {/* <CreatePostScreen 
//         visible={isCreatePostVisible}
//         onClose={() => setIsCreatePostVisible(false)}
//         onPostCreated={handlePostCreated}
//       /> */}
//     </>
//   );
// }
