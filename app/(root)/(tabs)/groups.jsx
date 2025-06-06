import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  Modal,
  SafeAreaView,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { useNavigation, router } from 'expo-router';
import { getCurrentUser, joinGroup } from '../../../lib/firebase';

// Consistent Color Palette - Black Theme
const COLORS = {
  background: '#000000',
  cardBg: '#000000',
  text: '#FFFFFF',
  textSecondary: '#E5E5E5',
  textMuted: '#A1A1AA',
  inputBg: '#1A1A1A',
  accent: '#8B5CF6',
  success: '#10B981',
  shadow: 'rgba(139, 92, 246, 0.15)',
};

const DEFAULT_GROUPS = [
  { id: 'projects', name: 'Projects', image: require('../../../assets/images/projects2.jpg') },
  { id: 'movies', name: 'Movies', image: require('../../../assets/images/moviess.jpg') },
  { id: 'coding', name: 'Coding', image: require('../../../assets/images/coding.jpg') },
  { id: 'funny', name: 'Funny', image: require('../../../assets/images/funny.jpg') },
  { id: 'gaming', name: 'Gaming', image: require('../../../assets/images/movies.jpg') },
  { id: 'placements', name: 'Placements', image: require('../../../assets/images/placements.jpg') },
];

const { width } = Dimensions.get('window');
const SPACING = 10;

export default function GroupList() {
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [userGroups, setUserGroups] = useState([]);
  const [joinModalVisible, setJoinModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        setLoading(true);
        const user = await getCurrentUser();
        setCurrentUser(user);
        
        // Convert user's groups array to a format matching the DEFAULT_GROUPS
        if (user && user.groups && user.groups.length > 0) {
          // Store the user's group IDs for easy checking
          setUserGroups(user.groups);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCurrentUser();
  }, []);

  const isUserInGroup = (groupId) => {
    return userGroups.includes(groupId);
  };

  const handleGroupPress = (group) => {
    const isMember = isUserInGroup(group.id);
    
    if (isMember) {
      navigation.navigate('groupRoom', { group });
    } else {
      setSelectedGroup(group);
      setJoinModalVisible(true);
    }
  };

  const handleJoinGroup = async () => {
    if (currentUser && selectedGroup) {
      try {
        setLoading(true);
        await joinGroup(currentUser.uid, selectedGroup.id);
        
        // Update local state to include the new group
        setUserGroups([...userGroups, selectedGroup.id]);
        
        setJoinModalVisible(false);
        navigation.navigate('groupRoom', { group: selectedGroup });
      } catch (error) {
        console.error("Error joining group:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const GroupGridItem = ({ item, style }) => (
    <TouchableOpacity 
      onPress={() => handleGroupPress(item)}
      style={{
        width: style.width,
        height: style.height,
        marginBottom: SPACING,
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 15,
        elevation: 5,
      }}
    >
      <Image 
        source={item.image} 
        style={{ flex: 1, width: '100%', height: '100%', position: 'absolute' }}
        resizeMode="cover"
      />
      <View 
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.3))',
          backgroundColor: 'rgba(0,0,0,0.6)',
          padding: 16
        }}
      >
        <Text style={{ 
          color: COLORS.text, 
          fontSize: 20, 
          fontWeight: '800',
          marginBottom: 4,
        }}>
          {item.name}
        </Text>
        {isUserInGroup(item.id) && (
          <View style={{
            backgroundColor: COLORS.accent,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
            alignSelf: 'flex-start',
          }}>
            <Text style={{ 
              color: '#FFFFFF', 
              fontSize: 12,
              fontWeight: '600'
            }}>
              Member
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const CustomGrid = () => {
    const itemWidth = (width - 3 * SPACING) / 2;
    const largeItemWidth = width - 2 * SPACING;

    return (
      <View style={{ flexDirection: 'column', padding: SPACING }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <GroupGridItem item={DEFAULT_GROUPS[0]} style={{ width: itemWidth, height: 180 }} />
          <GroupGridItem item={DEFAULT_GROUPS[1]} style={{ width: itemWidth, height: 180 }} />
        </View>

        <GroupGridItem item={DEFAULT_GROUPS[2]} style={{ width: largeItemWidth, height: 200 }} />

        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <GroupGridItem item={DEFAULT_GROUPS[3]} style={{ width: itemWidth, height: 180 }} />
          <GroupGridItem item={DEFAULT_GROUPS[4]} style={{ width: itemWidth, height: 180 }} />
        </View>

        <GroupGridItem item={DEFAULT_GROUPS[5]} style={{ width: largeItemWidth, height: 200 }} />
      </View>
    );
  };

  const JoinGroupModal = () => (
    <Modal 
      animationType="fade" 
      transparent={true} 
      visible={joinModalVisible} 
      onRequestClose={() => setJoinModalVisible(false)}
    >
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: 'rgba(0,0,0,0.8)' 
      }}>
        <View style={{ 
          width: '90%', 
          backgroundColor: COLORS.cardBg,
          borderRadius: 20,
          padding: 24,
          shadowColor: COLORS.shadow,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 1,
          shadowRadius: 20,
          elevation: 10,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.1)',
        }}>
          <Text style={{ 
            fontSize: 22, 
            fontWeight: '800', 
            color: COLORS.text, 
            textAlign: 'center',
            marginBottom: 8,
          }}>
            Join {selectedGroup?.name} Group
          </Text>
          <Text style={{ 
            color: COLORS.textSecondary, 
            textAlign: 'center', 
            marginBottom: 24,
            fontSize: 15,
            lineHeight: 22,
          }}>
            Disclaimer: This group is for {selectedGroup?.name.toLowerCase()} discussions only. Keep conversations relevant and respectful.
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <TouchableOpacity 
              onPress={() => setJoinModalVisible(false)} 
              style={{ 
                flex: 1, 
                marginRight: 8, 
                padding: 16, 
                borderRadius: 16, 
                backgroundColor: COLORS.inputBg,
                alignItems: 'center',
              }}
            >
              <Text style={{ 
                color: COLORS.text, 
                fontWeight: '600',
                fontSize: 16,
              }}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleJoinGroup} 
              style={{ 
                flex: 1, 
                marginLeft: 8, 
                padding: 16, 
                borderRadius: 16, 
                backgroundColor: COLORS.accent,
                alignItems: 'center',
              }}
            >
              <Text style={{ 
                color: '#FFFFFF', 
                fontWeight: '700',
                fontSize: 16,
              }}>
                Join Group
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <SafeAreaView style={{ 
        flex: 1, 
        backgroundColor: COLORS.background, 
        justifyContent: 'center', 
        alignItems: 'center' 
      }}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={{ 
          color: COLORS.textSecondary, 
          marginTop: 16,
          fontSize: 16,
          fontWeight: '500'
        }}>
          Loading groups...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Header */}
      <View style={{ 
        paddingHorizontal: 20,
        paddingVertical: 20,
        alignItems: 'center',
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 5,
      }}>
        <Text style={{ 
          fontSize: 24, 
          fontWeight: '800', 
          color: COLORS.text 
        }}>
          Groups
        </Text>
      </View>

      {/* Scrollable Content */}
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 100 }} 
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
      >
        <CustomGrid />
      </ScrollView>

      <JoinGroupModal />
    </SafeAreaView>
  );
};

