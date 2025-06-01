import { Stack } from "expo-router";

const Layout = () => {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
     
      <Stack.Screen
        name="[chatRoom]"
        options={{
          headerShown: false,
        }} />  
         <Stack.Screen
        name="groupRoom"
        options={{
          headerShown: false,
        }} />  
      <Stack.Screen
        name="editprofile" 
        options={{
          headerShown: false,
        }}
      />
        <Stack.Screen
        name="postDetailView" 
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="profile" 
        options={{
          headerShown: false,
        }}
      />
         <Stack.Screen
        name="[jobDetailView]" 
        options={{
          headerShown: false,
        }}
      />
          {/* <Stack.Screen
        name="drawer" 
        options={{
          headerShown: false,
        }}
      /> */}
    </Stack>
  );
};

export default Layout; 