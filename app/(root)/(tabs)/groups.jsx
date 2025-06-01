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

// Color Palette
const COLORS = {
  background: '#070606',
  surface: '#171616',
  textPrimary: '#FFFFFF',
  textSecondary: '#B2B3B2',
  accent: '#6C6C6D',
  separator: '#1E1E1E',
  buttonBackground: '#1A1A1A'
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

export default function GroupList  () {
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
        borderRadius: 12,
        overflow: 'hidden'
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
          backgroundColor: 'rgba(0,0,0,0.5)',
          padding: 10
        }}
      >
        <Text style={{ color: COLORS.textPrimary, fontSize: 18, fontWeight: 'bold' }}>
          {item.name}
        </Text>
        {isUserInGroup(item.id) && (
          <Text style={{ color: COLORS.accent, fontSize: 14 }}>
            Member
          </Text>
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
    <Modal animationType="slide" transparent={true} visible={joinModalVisible} onRequestClose={() => setJoinModalVisible(false)}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <View style={{ width: '90%', padding: 20, borderRadius: 10, backgroundColor: COLORS.surface }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: COLORS.textPrimary, textAlign: 'center' }}>
            Join {selectedGroup?.name} Group
          </Text>
          <Text style={{ color: COLORS.textSecondary, textAlign: 'center', marginVertical: 10 }}>
            Disclaimer: This group is for {selectedGroup?.name.toLowerCase()} discussions only. Keep conversations relevant and respectful.
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <TouchableOpacity onPress={() => setJoinModalVisible(false)} style={{ flex: 1, marginRight: 5, padding: 12, borderRadius: 8, backgroundColor: COLORS.buttonBackground }}>
              <Text style={{ color: COLORS.textPrimary, textAlign: 'center' }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleJoinGroup} style={{ flex: 1, marginLeft: 5, padding: 12, borderRadius: 8, backgroundColor: COLORS.accent }}>
              <Text style={{ color: COLORS.textPrimary, textAlign: 'center' }}>Join</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={{ color: COLORS.textSecondary, marginTop: 10 }}>Loading groups...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
      {/* Sticky Header */}
      <View style={{ padding: 15, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: COLORS.separator }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: COLORS.textPrimary }}>Groups</Text>
      </View>

      {/* Scrollable Content */}
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <CustomGrid />
      </ScrollView>

      <JoinGroupModal />
    </SafeAreaView>
  );
};

