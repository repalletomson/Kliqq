

import React, { useState, useEffect,createContext } from "react";
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Modal,
  useColorScheme,
  StatusBar,
  Dimensions,
} from "react-native";
import { collection, query, where, getDocs, limit, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../../../config/firebaseConfig";
import { MaterialIcons, Ionicons, Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useNavigation, useRouter } from "expo-router";

// Updated color palette with gradients from bright to dull white
const ThemeContext = React.createContext({
  isDarkMode: false,
  toggleTheme: () => {}
});

const lightTheme = {
  background: "#FFFFFF", // Bright white
  surface: "#F8F9FA", // Very light gray
  primary: "#6366F1", // Indigo (as requested)
  secondary: "#E2E4E9", // Light grayish
  text: "#171616", // Nearly black
  textSecondary: "#6C6C6D", // Medium gray
  border: "#E5E7EB", // Light border color
  accent: "#6366F1", // Accent color matching primary
};

const darkTheme = {
  background: "#121212", // Dark background
  surface: "#1E1E1E", // Slightly lighter than background
  primary: "#6366F1", // Indigo (as requested)
  secondary: "#2C2C2C", // Dark grayish
  text: "#FFFFFF", // Bright white
  textSecondary: "#B2B3B2", // Light gray
  border: "#333333", // Dark border
  accent: "#6366F1", // Accent color matching primary
};

// Updated interests and branches
const interests = [
  "Programming",
  "Artificial Intelligence",
  "Web Development",
  "Mobile Development",
  "Data Science",
  "Cybersecurity",
  "Cloud Computing",
  "UI/UX Design",
  "Gaming",
  "Movies & TV Shows",
  "Music",
  "Photography",
  "Reading",
  "Sports",
  "Traveling",
  "Cooking",
  "Fitness",
  "Art & Design"
];

const branches = [
  "Computer Science",
  "Information Technology",
  "Electronics & Communication",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Chemical Engineering",
  "Biotechnology"
];

export default function Connect()  {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? darkTheme : lightTheme;
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalConnections, setTotalConnections] = useState(0);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedInterests, setSelectedInterests] = useState([]);
    const [isDarkMode, setIsDarkMode] = useState(false);
  
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isProfileModalVisible, setProfileModalVisible] = useState(false);
  const navigation = useNavigation();
  const currentUser = auth.currentUser;
  const windowWidth = Dimensions.get('window').width;

  useEffect(() => {
    loadRecommendations();
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    const matchesBranch = !selectedBranch || user.branch === selectedBranch;
    const matchesInterests =
      selectedInterests.length === 0 ||
      selectedInterests.some((interest) => user.interests?.toLowerCase().includes(interest.toLowerCase()));

    return matchesSearch && matchesBranch && matchesInterests;
  });
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };


  const loadRecommendations = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      if (!userDocSnap.exists()) {
        console.log('No user data found');
        return;
      }

      const userData = userDocSnap.data();
      
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        where('userId', '!=', currentUser.uid),
        limit(50)
      );
      
      const querySnapshot = await getDocs(q);
      const recommendedUsers = [];
      querySnapshot.forEach((doc) => {
        const user = doc.data();
        recommendedUsers.push({ id: doc.id, ...user });
      });
      
      console.log('recommendedUsers',recommendedUsers.length,); 

      setUsers(recommendedUsers);
      setTotalConnections(recommendedUsers.length);
      setLoading(false);
    } catch (error) {
      console.error('Error loading recommendations:', error);
      setLoading(false);
    }
  };

  const handleChatNavigation = async (user) => {
    try {
      if (!user?.userId) {
        Alert.alert('Error', 'Invalid recipient');
        return;
      }
      
      const recipientId = user.userId;
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        Alert.alert('Error', 'You must be logged in to start a chat');
        return;
      }
  
      // Check if chat already exists
      const chatsRef = collection(db, 'chats');
      const q = query(
        chatsRef,
        where('participants', 'array-contains', currentUser.uid)
      );
      const snapshot = await getDocs(q);
      
      const existingChat = snapshot.docs.find(doc => 
        doc.data().participants.includes(recipientId)
      );
      
      let chatId;
      
      if (existingChat) {
        chatId = existingChat.id;
      } else {
        // Create a new chat if one doesn't exist
        const newChatRef = await addDoc(chatsRef, {
          participants: [currentUser.uid, recipientId],
          createdAt: serverTimestamp(),
          lastMessageTime: serverTimestamp(),
          lastMessage: null
        });
        
        chatId = newChatRef.id;
      }
  
      // Navigate to chat room with appropriate parameters
      router.push({
        pathname: '/(root)/[chatRoom]',
        params: { 
          chatId: chatId, 
          recipientId: recipientId 
        }
      });
      
      setSearchQuery('');
    } catch (error) {
      console.error('Chat Navigation Error:', error);
      Alert.alert('Navigation Failed', 'Could not start chat. Please try again.');
    }
  };

  // Profile Modal
const ProfileModal = ({ user, visible, onClose }) => (
  <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
    <View style={{
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.75)",
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    }}>
      <View style={{ 
        backgroundColor: theme.surface, 
        width: "90%", 
        maxWidth: 360, 
        borderRadius: 16, 
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
      }}>
        {/* Header */}
        <View style={{ 
          flexDirection: "row", 
          justifyContent: "space-between", 
          alignItems: "center", 
          paddingHorizontal: 18,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: theme.border
        }}>
          <Text style={{ 
            fontSize: 18, 
            fontWeight: "700", 
            color: theme.text,
            letterSpacing: 0.3,
          }}>Profile Details</Text>
          <TouchableOpacity 
            onPress={onClose}
            style={{
              padding: 6,
              borderRadius: 20,
              backgroundColor: `${theme.primary}10`,
            }}
          >
            <Ionicons name="close" size={22} color={theme.primary} />
          </TouchableOpacity>
        </View>
        
        {/* Profile Content */}
        <ScrollView style={{ maxHeight: 480 }} showsVerticalScrollIndicator={false}>
          <View style={{ padding: 20, gap: 22, alignItems: "center" }}>
            {/* User image and basic info */}  
            <View style={{ alignItems: "center", gap: 16 }}> 
              <Image
                source={{ uri:user?.profileImage|| user?.photoUrl || "https://imgs.search.brave.com/SRTQLz_BmOq7xwzV7ls7bV62QzMZtDrGSacNS5G1d1A/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9pY29u/cy52ZXJ5aWNvbi5j/b20vcG5nLzEyOC9t/aXNjZWxsYW5lb3Vz/LzNweC1saW5lYXIt/ZmlsbGV0LWNvbW1v/bi1pY29uL2RlZmF1/bHQtbWFsZS1hdmF0/YXItMS5wbmc" }}
                style={{ 
                  width: 90, 
                  height: 90, 
                  borderRadius: 45,
                  borderWidth: 3,
                  borderColor: theme.primary,
                }}
              />  

              <View style={{ alignItems: "center", gap: 4 }}>
                <Text style={{ 
                  fontSize: 20, 
                  fontWeight: "bold", 
                  color: theme.text,
                  letterSpacing: 0.4,
                }}>
                  {user?.fullName}
                </Text>
                <Text style={{ 
                  fontSize: 15, 
                  color: theme.primary,
                  fontWeight: "600",
                  letterSpacing: 0.2,
                }}>
                  {user?.branch}
                </Text>
                <Text style={{ 
                  fontSize: 13, 
                  color: theme.textSecondary,
                  marginTop: 2,
                }}>
                  {user?.college?.name}
                </Text>
              </View>
            </View>

            {/* About section */}
            {user?.about && (
              <View style={{ 
                backgroundColor: `${theme.primary}08`,
                borderRadius: 12,
                borderLeftWidth: 3,
                borderLeftColor: theme.primary,
                padding: 16,
                width: "100%",
                marginTop: 6,
              }}>
                <Text style={{ 
                  color: theme.text,
                  fontStyle: "italic",
                  fontSize: 14,
                  lineHeight: 20,
                  textAlign: "left",
                }}>
                  "{user?.about}"
                </Text>
              </View>
            )}

            {/* Interests */}
            <View style={{ width: "100%", alignItems: "flex-start", marginTop: 6 }}>
              <Text style={{ 
                fontSize: 16,
                fontWeight: "700",
                color: theme.text,
                marginBottom: 12,
                letterSpacing: 0.3,
              }}>
                Interests
              </Text>
              <View style={{ 
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 8,
              }}>
                {Array.isArray(user?.interests) 
                  ? user?.interests.map((interest, index) => (
                      <Text 
                        key={index}
                        style={{
                          fontSize: 13,
                          color: theme.primary,
                          backgroundColor: `${theme.primary}15`,
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 16,
                          overflow: 'hidden',
                          marginBottom: 4,
                          fontWeight: "500",
                        }}
                      >
                        {interest}
                      </Text>
                    ))
                  : user?.interests && (
                      <Text 
                        style={{
                          fontSize: 13,
                          color: theme.primary,
                          backgroundColor: `${theme.primary}15`,
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 16,
                          overflow: 'hidden',
                          marginBottom: 4,
                          fontWeight: "500",
                        }}
                      >
                        {user?.interests}
                      </Text>
                    )
                }
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Action Button */}
        <TouchableOpacity
          onPress={() => {
            handleChatNavigation(user);
            onClose();
          }}
          style={{
            backgroundColor: theme.primary,
            paddingVertical: 14,
            marginHorizontal: 20,
            marginBottom: 20,
            marginTop: 10,
            borderRadius: 12,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            shadowColor: theme.primary,
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.3,
            shadowRadius: 5,
            elevation: 3,
          }}
        >
          <MaterialIcons name="message" size={18} color={theme.background} />
          <Text style={{ 
            color: theme.background, 
            fontSize: 16, 
            fontWeight: "600", 
            marginLeft: 8,
            letterSpacing: 0.3,
          }}>
            Message
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

  // Filter Modal
  const FilterModal = ({ visible, onClose }) => (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
        <View style={{ 
          backgroundColor: theme.surface, 
          borderTopLeftRadius: 20, 
          borderTopRightRadius: 20, 
          padding: 20 
        }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <Text style={{ fontSize: 20, fontWeight: "bold", color: theme.text }}>Filters</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color={theme.text} />
            </TouchableOpacity>
          </View>

          {/* Branch Filters */}
          <Text style={{ fontSize: 16, color: theme.text, marginBottom: 10 }}>Branch</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {branches.map((branch) => (
                <TouchableOpacity
                  key={branch}
                  onPress={() => setSelectedBranch(selectedBranch === branch ? "" : branch)}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 6,
                    borderRadius: 16,
                    backgroundColor: selectedBranch === branch ? theme.primary : theme.background,
                  }}
                >
                  <Text style={{ 
                    color: selectedBranch === branch ? theme.background : theme.text,
                    fontSize: 13
                  }}>
                    {branch}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Interest Filters */}
          <Text style={{ fontSize: 16, color: theme.text, marginBottom: 10 }}>Interests</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
            {interests.map((interest) => (
              <TouchableOpacity
                key={interest}
                onPress={() => {
                  setSelectedInterests((prev) =>
                    prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
                  );
                }}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                  borderRadius: 16,
                  backgroundColor: selectedInterests.includes(interest) ? theme.primary : theme.background,
                }}
              >
                <Text style={{ 
                  color: selectedInterests.includes(interest) ? theme.background : theme.text,
                  fontSize: 13
                }}>
                  {interest}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Reset Button */}
          <TouchableOpacity
            onPress={() => {
              setSelectedBranch("");
              setSelectedInterests([]);
            }}
            style={{
              backgroundColor: theme.background,
              borderRadius: 8,
              paddingVertical: 12,
              marginTop: 10,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: theme.text, fontSize: 15 }}>Reset Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  // Render functions for different view modes
  const renderGridItem = (user) => (
    <TouchableOpacity
      key={user.id}
      onPress={() => {
        setSelectedUser(user);
        setProfileModalVisible(true);
      }}
      style={{
        width: (windowWidth / 2) - 20,
        marginBottom: 16,
        backgroundColor: theme.surface,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 0,
        // Enhanced shadow for better depth perception
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 4,
      }}
    >
      {/* Card Header with gradient overlay */}
      <View style={{ 
        height: 40, 
        backgroundColor: `${theme.primary}15`,
        borderBottomWidth: 1,
        borderBottomColor: `${theme.primary}20`,
      }} />
      
      {/* User Profile Image - positioned for overlap effect */}
      <View style={{ 
        alignItems: 'center', 
        marginTop: -30,
        marginBottom: 10,
      }}>
        <Image
          source={{ 
            uri: user.profileImage === 'https://via.placeholder.com/150' 
              ? 'https://assets.grok.com/users/8c354dfe-946c-4a32-b2de-5cb3a8ab9776/generated/av8GdgP4VI6wfj1B/image.jpg'
              : user.profileImage || "https://assets.grok.com/users/8c354dfe-946c-4a32-b2de-5cb3a8ab9776/generated/av8GdgP4VI6wfj1B/image.jpg"
          }}
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            borderWidth: 3,
            borderColor: theme.surface,
            backgroundColor: theme.background,
          }}
          resizeMode="cover"
        />
      </View>
      
      {/* User Info - centered */}
      <View style={{ 
        paddingHorizontal: 16, 
        paddingBottom: 16, 
        alignItems: 'center',
        gap: 6,
      }}>
        <Text style={{ 
          fontSize: 16, 
          fontWeight: "600", 
          color: theme.text,
          textAlign: 'center',
          letterSpacing: 0.3,
        }}>
          {user.fullName}
        </Text>
        
        {user.branch && (
          <View style={{
            backgroundColor: `${theme.primary}10`,
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 12,
            marginBottom: 4,
          }}>
            <Text style={{ 
              fontSize: 12, 
              color: theme.primary, 
              fontWeight: "500",
              textAlign: 'center',
            }}>
              @{user.college.name}
            </Text>
          </View>
        )}
        
        {/* First interest tag if available */}
        {Array.isArray(user.interests) && user.interests.length > 0 && (
          <Text style={{ 
            fontSize: 11, 
            color: theme.textSecondary,
            marginBottom: 8, 
            textAlign: 'center',
          }}>
            {user.interests[0]} {user.interests.length > 1 ? `+${user.interests.length - 1} more` : ''}
          </Text>
        )}
        
        {/* Message Button */}
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            handleChatNavigation(user);
          }}
          style={{
            backgroundColor: theme.primary,
            borderRadius: 12,
            paddingVertical: 10,
            paddingHorizontal: 16,
            alignItems: "center",
            justifyContent: "center",
            width: '100%',
            flexDirection: 'row',
            gap: 8,
            shadowColor: theme.primary,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 4,
            elevation: 2,
            marginTop: 4,
          }}
        >
          <MaterialIcons name="message" size={16} color={theme.background} />
          <Text style={{ 
            color: theme.background, 
            fontSize: 14, 
            fontWeight: "600",
            letterSpacing: 0.2,
          }}>
            Message
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
  const renderListItem = (user) => (
    <TouchableOpacity
      key={user.id}
      onPress={() => {
        setSelectedUser(user);
        setProfileModalVisible(true);
      }}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 0.3,
        borderBottomColor: theme.border,
        backgroundColor: theme.surface,
      }}
    >
      {/* User Profile Image */}
      {user.profileImage==='https://via.placeholder.com/150' ? <Image
        source={{ uri:'https://assets.grok.com/users/8c354dfe-946c-4a32-b2de-5cb3a8ab9776/generated/av8GdgP4VI6wfj1B/image.jpg'}}
        style={{
          width: 50,
          height: 50,
          borderRadius: 25,
          marginRight: 14,
          // borderWidth: 1,
          // borderColor: theme.primary,
        }}
        resizeMode="cover"
      /> :
      <Image
      source={{ uri: user.profileImage || "https://assets.grok.com/users/8c354dfe-946c-4a32-b2de-5cb3a8ab9776/generated/av8GdgP4VI6wfj1B/image.jpg" }}        style={{
          width: 50,
          height: 50,
          borderRadius: 25,
          marginRight: 14,
          // borderWidth: 1.5,
          // borderColor: theme.primary,
        }}
        resizeMode="cover"
      />
      }
      {/* User Info */}
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: "600", color: theme.text }}>
          {user.fullName}
        </Text>
        <Text style={{ fontSize: 12, color: theme.textSecondary, marginTop: 2 }}>
          {user.college.name || ""}
        </Text>
      </View>

      {/* Follow Button */}
      <TouchableOpacity
        onPress={(e) => {
          e.stopPropagation();
          handleChatNavigation(user);
        }}
        style={{
          backgroundColor: theme.primary,
          borderRadius: 6,
          paddingVertical: 6,
          paddingHorizontal: 16,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ color: theme.background, fontSize: 12, fontWeight: "500" }}>Follow</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background, marginBottom: 30}}>
     <StatusBar 
               backgroundColor={isDarkMode ? 'white' : 'black'}
               barStyle={isDarkMode ? 'dark-content' : 'light-content'}
             />

      {/* Header Section */}
      <View
        style={{
          backgroundColor: theme.surface,
          padding: 16,
          borderBottomWidth: 0.3,
          borderBottomColor: theme.border,
        }}
      >  
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <Text style={{ fontSize: 22, fontWeight: "bold", color: theme.text }}>Find Friends</Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity
              onPress={() => setViewMode((prev) => (prev === "grid" ? "list" : "grid"))}
              style={{ backgroundColor: theme.background, padding: 8, borderRadius: 8 }}
            >

              <Feather name={viewMode === "grid" ? "list" : "grid"} size={18} color={theme.text} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setFilterModalVisible(true)}
              style={{ backgroundColor: theme.background, padding: 8, borderRadius: 8 }}
            > 
              <Feather name="filter" size={18} color={theme.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: theme.background,
            borderRadius: 8,
            padding: 8,
            marginBottom: 8,
          }}
        >
          <Ionicons name="search" size={18} color={theme.textSecondary} />
          <TextInput
            style={{ flex: 1, color: theme.text, marginLeft: 8, fontSize: 14 }}
            placeholder="Search by name..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <Text style={{ color: theme.textSecondary, fontSize: 13 }}>
          {filteredUsers.length} of {totalConnections} people
        </Text>
      </View>

      {/* User Cards - Grid or List View */}
      <ScrollView style={{ flex: 1, backgroundColor: colorScheme === "dark" ? theme.background : "#F5F5F5" }}>
        {viewMode === "grid" ? (
          <View style={{ 
            flexDirection: "row", 
            flexWrap: "wrap", 
            justifyContent: "space-between",
            padding: 8
          }}>
            {filteredUsers.map(user => renderGridItem(user))}
          </View>
        ) : (
          <View>
            {filteredUsers.map(user => renderListItem(user))}
          </View>
        )}
      </ScrollView>

      {/* Modals */}
      <FilterModal visible={isFilterModalVisible} onClose={() => setFilterModalVisible(false)} />
      <ProfileModal
        user={selectedUser}
        visible={isProfileModalVisible}
        onClose={() => {
          setProfileModalVisible(false);
          setSelectedUser(null);
        }}
      />
    </SafeAreaView>
    </ThemeContext.Provider>

  );
};


// Follow