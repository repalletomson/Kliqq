import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack>
    
        <Stack.Screen
        name="[postId]" 
        options={{
          headerShown: false,
        }}
      />
        
    </Stack>
  );
};

// export default Layout; 