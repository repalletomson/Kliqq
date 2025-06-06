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
import { LinearGradient } from 'expo-linear-gradient';

// Updated color palette with gradients from bright to dull white
const ThemeContext = React.createContext({
  isDarkMode: false,
  toggleTheme: () => {}
});

const lightTheme = {
  background: "#000000", // Black background
  surface: "#111111", // Dark surface
  primary: "#8B5CF6", // Purple accent color
  secondary: "#27272A", // Dark grayish
  text: "#FFFFFF", // White text
  textSecondary: "#A1A1AA", // Light gray
  border: "#27272A", // Dark border color
  accent: "#8B5CF6", // Accent color matching primary
  cardShadow: "rgba(0, 0, 0, 0.3)", // Dark shadow
};

const darkTheme = {
  background: "#000000", // Black background
  surface: "#111111", // Dark card background
  primary: "#8B5CF6", // Purple accent color
  secondary: "#27272A", // Dark grayish
  text: "#FFFFFF", // White text
  textSecondary: "#A1A1AA", // Light gray
  border: "#27272A", // Dark border
  accent: "#8B5CF6", // Accent color matching primary
  cardShadow: "rgba(0, 0, 0, 0.3)", // Dark shadow for dark mode
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

// Sample bio messages for users who don't have one
const sampleBios = [
  "Loves tech & travel ✈️",
  "Coffee enthusiast ☕",
  "Always learning something new 📚",
  "Passionate about coding 💻",
  "Music lover 🎵",
  "Fitness enthusiast 💪",
  "Creative mind 🎨",
  "Problem solver 🧠",
  "Adventure seeker 🏔️",
  "Bookworm 📖"
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

  // Helper function to get user bio or generate one
  const getUserBio = (user) => {
    if (user.about) return user.about;
    if (user.interests && Array.isArray(user.interests) && user.interests.length > 0) {
      return `Interested in ${user.interests[0]}`;
    }
    if (user.branch) return `Studying ${user.branch}`;
    return sampleBios[Math.floor(Math.random() * sampleBios.length)];
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

  // Modern Grid Card Design
  const renderGridItem = (user) => (
    <TouchableOpacity
      key={user.id}
      onPress={() => {
        setSelectedUser(user);
        setProfileModalVisible(true);
      }}
      style={{
        width: (windowWidth / 2) - 24,
        height: 220, // Fixed height for equal card sizes
        marginBottom: 20,
        backgroundColor: theme.surface,
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: theme.cardShadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 12,
        elevation: 6,
        borderWidth: 1,
        borderColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
      }}
    >
      {/* Profile Section */}
      <View style={{ 
        alignItems: 'center', 
        paddingTop: 20,
        paddingHorizontal: 12,
        paddingBottom: 16,
        flex: 1,
        justifyContent: 'space-between',
      }}>
        {/* Profile Image with Gradient Border */}
        <View style={{ marginBottom: 12 }}>
          <LinearGradient
            colors={['#8B5CF6', '#EC4899', '#F59E0B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              padding: 3,
              borderRadius: 35,
            }}
          >
            <Image
              source={{ 
                uri: user.profileImage === 'https://via.placeholder.com/150' 
                  ? 'https://assets.grok.com/users/8c354dfe-946c-4a32-b2de-5cb3a8ab9776/generated/av8GdgP4VI6wfj1B/image.jpg'
                  : user.profileImage || "https://assets.grok.com/users/8c354dfe-946c-4a32-b2de-5cb3a8ab9776/generated/av8GdgP4VI6wfj1B/image.jpg"
              }}
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                borderWidth: 3,
                borderColor: theme.surface,
                backgroundColor: theme.background,
              }}
              resizeMode="cover"
            />
          </LinearGradient>
        </View>
        
        {/* User Info Container */}
        <View style={{ alignItems: 'center', flex: 1, justifyContent: 'center', width: '100%' }}>
          {/* User Name - Single line */}
          <Text 
            style={{ 
              fontSize: 16, 
              fontWeight: "700", 
              color: theme.text,
              textAlign: 'center',
              letterSpacing: 0.3,
              marginBottom: 6,
              width: '100%',
            }}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {user.fullName}
          </Text>
          
          {/* Bio/Status - Single line */}
          <Text 
            style={{ 
              fontSize: 12, 
              color: theme.textSecondary,
              textAlign: 'center',
              lineHeight: 16,
              marginBottom: 16,
              paddingHorizontal: 4,
              width: '100%',
            }}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {getUserBio(user)}
          </Text>
        </View>
        
        {/* Message Button */}
        <LinearGradient
          colors={['#8B5CF6', '#7C3AED']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            borderRadius: 20,
            shadowColor: theme.primary,
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.3,
            shadowRadius: 6,
            elevation: 4,
            width: '85%',
          }}
        >
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              handleChatNavigation(user);
            }}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 20,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: 'row',
              gap: 6,
            }}
          >
            <MaterialIcons name="message" size={14} color="white" />
            <Text style={{ 
              color: "white", 
              fontSize: 14, 
              fontWeight: "600",
              letterSpacing: 0.3,
            }}>
              Message
            </Text>
          </TouchableOpacity>
        </LinearGradient>
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
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
        backgroundColor: theme.surface,
        marginHorizontal: 12,
        marginBottom: 8,
        borderRadius: 16,
        shadowColor: theme.cardShadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      {/* User Profile Image */}
      <LinearGradient
        colors={['#8B5CF6', '#EC4899']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          padding: 2,
          borderRadius: 30,
          marginRight: 16,
        }}
      >
        <Image
          source={{ 
            uri: user.profileImage === 'https://via.placeholder.com/150' 
              ? 'https://assets.grok.com/users/8c354dfe-946c-4a32-b2de-5cb3a8ab9776/generated/av8GdgP4VI6wfj1B/image.jpg'
              : user.profileImage || "https://assets.grok.com/users/8c354dfe-946c-4a32-b2de-5cb3a8ab9776/generated/av8GdgP4VI6wfj1B/image.jpg"
          }}
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            borderWidth: 2,
            borderColor: theme.surface,
          }}
          resizeMode="cover"
        />
      </LinearGradient>
      
      {/* User Info */}
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 16, fontWeight: "600", color: theme.text, marginBottom: 4 }}>
          {user.fullName}
        </Text>
        <Text style={{ fontSize: 13, color: theme.textSecondary, marginBottom: 2 }}>
          {user.college?.name || ""}
        </Text>
        <Text style={{ fontSize: 12, color: theme.textSecondary, fontStyle: 'italic' }}>
          {getUserBio(user)}
        </Text>
      </View>

      {/* Message Button */}
      <LinearGradient
        colors={['#8B5CF6', '#7C3AED']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          borderRadius: 20,
          shadowColor: theme.primary,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            handleChatNavigation(user);
          }}
          style={{
            paddingVertical: 10,
            paddingHorizontal: 20,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "white", fontSize: 14, fontWeight: "600" }}>Message</Text>
        </TouchableOpacity>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background, marginBottom: 30}}>
     <StatusBar 
               backgroundColor="#000000"
               barStyle="light-content"
             />

      {/* Header Section */}
      <View
        style={{
          backgroundColor: theme.surface,
          paddingHorizontal: 20,
          paddingVertical: 20,
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
          shadowColor: theme.cardShadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 1,
          shadowRadius: 4,
          elevation: 2,
        }}
      >  
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <Text style={{ fontSize: 26, fontWeight: "800", color: theme.text, letterSpacing: 0.5 }}>
            Connect with People
          </Text>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity
              onPress={() => setViewMode((prev) => (prev === "grid" ? "list" : "grid"))}
              style={{ 
                backgroundColor: theme.background, 
                padding: 10, 
                borderRadius: 12,
                shadowColor: theme.cardShadow,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 1,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <Feather name={viewMode === "grid" ? "list" : "grid"} size={20} color={theme.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setFilterModalVisible(true)}
              style={{ 
                backgroundColor: theme.background, 
                padding: 10, 
                borderRadius: 12,
                shadowColor: theme.cardShadow,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 1,
                shadowRadius: 4,
                elevation: 2,
              }}
            > 
              <Feather name="filter" size={20} color={theme.primary} />
            </TouchableOpacity>
            {/* Skip/Close Button */}
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ 
                backgroundColor: theme.background, 
                padding: 10, 
                borderRadius: 12,
                shadowColor: theme.cardShadow,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 1,
                shadowRadius: 4,
                elevation: 2,
              }}
            > 
              <Ionicons name="close" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: theme.background,
            borderRadius: 14,
            paddingHorizontal: 16,
            paddingVertical: 12,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: theme.border,
            shadowColor: theme.cardShadow,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 1,
            shadowRadius: 2,
            elevation: 1,
          }}
        >
          <Ionicons name="search" size={20} color={theme.textSecondary} />
          <TextInput
            style={{ flex: 1, color: theme.text, marginLeft: 12, fontSize: 16 }}
            placeholder="Search by name..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <Text style={{ color: theme.textSecondary, fontSize: 14, fontWeight: "500" }}>
          {filteredUsers.length} of {totalConnections} people available
        </Text>
      </View>

      {/* User Cards - Grid or List View */}
      <ScrollView 
        style={{ flex: 1, backgroundColor: theme.background }}
        contentContainerStyle={{ padding: 12 }}
        showsVerticalScrollIndicator={false}
      >
        {viewMode === "grid" ? (
          <View style={{ 
            flexDirection: "row", 
            flexWrap: "wrap", 
            justifyContent: "space-between",
          }}>
            {filteredUsers.map(user => renderGridItem(user))}
          </View>
        ) : (
          <View>
            {filteredUsers.map(user => renderListItem(user))}
          </View>
        )}
        
        {/* Bottom Spacing */}
        <View style={{ height: 20 }} />
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