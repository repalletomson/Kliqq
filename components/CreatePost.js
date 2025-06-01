// // // import React, { useState } from 'react';
// // // import {
// // //   Modal,
// // //   View,
// // //   Text,
// // //   TextInput,
// // //   TouchableOpacity,
// // //   ActivityIndicator,
// // //   Animated,
// // //   Image,
// // //   KeyboardAvoidingView,
// // //   Platform,
// // //   Alert
// // // } from 'react-native';
// // // import * as ImagePicker from 'expo-image-picker';
// // // import { MaterialIcons } from '@expo/vector-icons';
// // // import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
// // // import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// // // import { db ,storage} from '../config/firebaseConfig';
// // // import {LinearGradient} from 'expo-linear-gradient';
// // // import { auth } from '../config/firebaseConfig';
// // // import { useAuth } from '../context/authContext';
// // // import {uploadFile} from '../config/appwrite';
// // // import { notificationService} from '../app/(apis)/notifications';
// // // // import { notificationService } from '../services/NotificationService';

// // // const colors = {
// // //   primary: '#4A90E2',    
// // //   secondary: '#6C63FF',  
// // //   accent: '#FF6B6B',     
// // //   background: '#FFFFFF', 
// // //   text: '#333333',      
// // //   lightGrey: '#F5F5F5', 
// // //   mediumGrey: '#9E9E9E'
// // // };

// // // const CreatePostModal = ({ visible, onClose, onSuccess, user }) => {
// // //   if (!user) {
// // //     return null;
// // //   }
// // //   // console.log("user from ",user)

// // //   const [content, setContent] = useState('');
// // //   const [category, setCategory] = useState('general');
// // //   const [image, setImage] = useState(null);
// // //   const [loading, setLoading] = useState(false);
// // //   const [animation] = useState(new Animated.Value(0));
// // //   const [media, setMedia] = useState(null);
// // //   const {username, uid, profileUrl,college} = user;
// // //   const [imageUri, setImageUri] = useState(null);
// // //   const [uploadedUrl, setUploadedUrl] = useState(null);

// // //   console.log("Create post page")
// // //   React.useEffect(() => {
// // //     Animated.timing(animation, {
// // //       toValue: visible ? 1 : 0,
// // //       duration: 300,
// // //       useNativeDriver: true,
// // //     }).start();
// // //   }, [visible]);

// // //   const pickImage = async () => {
// // //     try {
// // //       const result = await ImagePicker.launchImageLibraryAsync({
// // //         mediaTypes: ['images', 'videos'],
// // //         allowsEditing: true,
// // //         aspect: [4, 3],
// // //         quality: 1,
// // //       });
// // //      console.log("result",result)
// // //       if (!result.canceled) {
// // //         setImageUri(result.assets[0].uri);
// // //         console.log("image",image);
// // //       }
// // //     } catch (error) {
// // //       Alert.alert('Error', error.message);
// // //     }
// // //   };

// // //   const uploadImage = async (uri) => {
// // //     try {
// // //       const response = await fetch(uri);
// // //       const blob = await response.blob();
  
// // //       console.log("Blob:", blob);
  
// // //       // const storage = getStorage();
// // //   const imageRef = ref(storage, `posts/${Date.now()}`);
  
// // //       const metadata = {
// // //         contentType: 'image/jpeg',
// // //       };
      
// // //       await uploadBytes(imageRef, blob);
  
// // //       const downloadURL = await getDownloadURL(imageRef);
  
// // //       console.log("Image uploaded successfully. Download URL:", downloadURL);
  
// // //       return downloadURL;
// // //     } catch (error) {
// // //       console.error("Error uploading image:", error.message, error.stack);
// // //       throw error;
// // //     }
// // //   };

// // //   const handleSubmit = async () => {
// // //     if (!content.trim()) {
// // //       Alert.alert('Error', 'Please enter some content');
// // //       return;
// // //     }

// // //     setLoading(true);
// // //     try {
// // //       console.log("uploading startred")
// // //       let mediaUrl = null;
// // //       if (imageUri) {
// // //         console.log("image",imageUri)
// // //         mediaUrl = await uploadImage(imageUri);
// // //         console.log("mediaUrl",mediaUrl)
// // //       }


// // //     // const fileType = imageUri.endsWith(".mp4") ? "video" : "image"; // Detect file type
     
// // //     // try {
// // //     //   // console.log("initialized")
// // //     //   // const uploadedUrl = await uploadFile(imageUri, fileType);
// // //     //   // console.log("uploadedUrl",uploadedUrl)
// // //     //   // setUploadedUrl(uploade);
// // //     //   Alert.alert("Success", "File uploaded successfully!");
// // //     // } catch (error) {
// // //     //   return
// // //     //   console.error("Upload Error:", error);
// // //     //   Alert.alert("Error", "Failed to upload file.");
// // //     // }
// // //       const postData = {
// // //         content: content.trim(),
// // //         category,
// // //         mediaUrl: mediaUrl || null,
// // //         createdAt: serverTimestamp(),
// // //         likes: 0,
// // //         comments: [],
// // //         userId: user?.uid,
// // //         userName:user.fullName || "Student",
// // //         userAvatar:profileUrl || 'https://www.kindpng.com/picc/m/78-785827_user-profile-avatar-login-account-male-user-icon.png',
// // //         college:user.college.name || null
// // //       };
// // // console.log("user",user.college.name)
// // //       const postRef=await addDoc(collection(db, 'posts'), postData);
// // //     //  const notification = await notificationService.sendNewPostNotification(user, {
// // //     //     id: postRef.id,
// // //     //     ...postData
// // //     //   });
// // //     //   console.log("notification",notification)
// // //     //   if (notification){
// // //     //     console.log("notification sent")
// // //     //   }
// // //       onSuccess();
// // //       resetForm();
// // //     } catch (error) {
// // //       console.log("error",error.message,error.code)
// // //       Alert.alert('Error', error.message,error.code );
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   const resetForm = () => {
// // //     setContent('');
// // //     setCategory('general');
// // //     setImage(null);
// // //     onClose();
// // //   };
// // // // CreatePostModal.js - Updated version
// // // // const handleSubmit = async () => {
// // // //   if (!content.trim()) {
// // // //     Alert.alert('Error', 'Please enter some content');
// // // //     return;
// // // //   }

// // // //   setLoading(true);
// // // //   try {
// // // //     if (imageUri) {
      
      
// // // //       const fileType = imageUri.endsWith(".mp4") ? "video" : "image";
// // // //       const uploadedUrl = await uploadFile(imageUri, fileType);
// // // //       setUploadedUrl(uploadedUrl);
// // // //     }

// // // //       const postData = {
// // // //         content: content.trim(),
// // // //       category,
// // // //       mediaUrl: uploadedUrl || null,
// // // //       createdAt: serverTimestamp(),
// // // //       likes: 0,
// // // //       comments: [],
// // // //       userId: user?.uid,
// // // //       userName: username,
// // // //       userAvatar: profileUrl,
// // // //       college: user.college.name // Add college information
// // // //     };

// // // //     // Add post to Firestore
// // // //     const postRef = await addDoc(collection(db, 'posts'), postData);
    
// // // //     // Send notifications to users in the same college
// // //     // await sendNotification(user.college, 'new_post', {
// // //     //   ...postData,
// // //     //   id: postRef.id
// // //     // });

// // // //     onSuccess();
// // // //     resetForm();
// // // //     Alert.alert('Success', 'Post created and notifications sent!');
// // // //   } catch (error) {
// // // //     console.log("error", error.message, error.code);
// // // //     Alert.alert('Error', error.message);
// // // //   } finally {
// // // //     setLoading(false);
// // // //   }
// // // // };
// // //   return (
// // //     <Modal
// // //       visible={visible}
// // //       animationType="slide"
// // //       transparent={true}
// // //       onRequestClose={onClose}
// // //     >
// // //       <View style={styles.modalContainer}>
// // //         <View style={styles.modalContent}>
// // //           <Text style={styles.modalTitle}>Create Post</Text>
// // //           <View className='flex-row justify-between max-w-full'>


// // //           <LinearGradient 
// // //             colors={['#8A4FFF', '#633333']} 
// // //             className='p-2 rounded-full w-full flex items-center justify-center'
// // //           >
// // //             <Text className='text-white font-semibold text-sm px-3 py-1 rounded-full'>
// // //                 Caution: Only post your college related post... if not you will be banned !!
// // //             </Text>
// // //           </LinearGradient>
// // //           </View>
// // //           <TextInput
// // //             style={styles.input}
// // //             placeholder="What's on your mind?"
// // //             multiline
// // //             value={content}
// // //             onChangeText={setContent}
// // //             maxLength={500}
// // //           />

// // //           {imageUri && (
// // //             <View style={styles.imageContainer}>
// // //               <Image source={{ uri: imageUri }} style={styles.previewImage} />
// // //               <TouchableOpacity
// // //                 style={styles.removeImage}
// // //                 onPress={() => setImage(null)}
// // //               >
// // //                 <MaterialIcons name="close" size={20} color="white" />
// // //               </TouchableOpacity>
// // //             </View>
// // //           )}

// // //           <View style={styles.footer}>
// // //             <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
// // //               <MaterialIcons name="image" size={24} color={colors.primary} />
// // //             </TouchableOpacity>

// // //             <TouchableOpacity
// // //               style={[styles.submitButton, !content.trim() && styles.submitButtonDisabled]}
// // //               onPress={handleSubmit}
// // //               disabled={loading || !content.trim()}
// // //             >
// // //               {loading ? (
// // //                 <ActivityIndicator color="white" />
// // //               ) : (
// // //                 <Text style={styles.submitButtonText}>Post</Text>
// // //               )}
// // //             </TouchableOpacity>
// // //           </View>
// // //         </View>
// // //       </View>
// // //     </Modal>
// // //   );
// // // };
// // // import React, { useState, useCallback } from 'react';
// // // import {
// // //   Modal,
// // //   View,
// // //   Text,
// // //   TextInput,
// // //   TouchableOpacity,
// // //   ActivityIndicator,
// // //   Animated,
// // //   Image,
// // //   Alert
// // // } from 'react-native';
// // // import * as ImagePicker from 'expo-image-picker';
// // // import { MaterialIcons } from '@expo/vector-icons';
// // // import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
// // // import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// // // import { db, storage } from '../config/firebaseConfig';
// // // import { LinearGradient } from 'expo-linear-gradient';

// // // // Constants for better maintainability
// // // const STORAGE_PATH = 'posts';
// // // const IMAGE_PICKER_OPTIONS = {
// // //   mediaTypes: ['images', 'videos'],
// // //   allowsEditing: true,
// // //   aspect: [4, 3],
// // //   quality: 1,
// // // };
// // // const colors = {
// // //   primary: '#4A90E2',    
// // //   secondary: '#6C63FF',  
// // //   accent: '#FF6B6B',     
// // //   background: '#FFFFFF', 
// // //   text: '#333333',      
// // //   lightGrey: '#F5F5F5', 
// // //   mediumGrey: '#9E9E9E'
// // // };


// // // const CreatePostModal = ({ visible, onClose, onSuccess, user }) => {
// // //   // Early return if no user
// // //   if (!user) return null;

// // //   const [postState, setPostState] = useState({
// // //     content: '',
// // //     category: 'general',
// // //     imageUri: null,
// // //     loading: false
// // //   });
// // //   const [animation] = useState(new Animated.Value(0));

// // //   // Handle modal animation
// // //   React.useEffect(() => {
// // //     Animated.timing(animation, {
// // //       toValue: visible ? 1 : 0,
// // //       duration: 300,
// // //       useNativeDriver: true,
// // //     }).start();
// // //   }, [visible]);

// // //   // Image picker function with proper error handling
// // //   const pickImage = useCallback(async () => {
// // //     try {
// // //       const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
// // //       if (!permission.granted) {
// // //         Alert.alert('Permission Required', 'Please allow access to your media library');
// // //         return;
// // //       }

// // //       const result = await ImagePicker.launchImageLibraryAsync(IMAGE_PICKER_OPTIONS);
      
// // //       if (!result.canceled && result.assets?.[0]?.uri) {
// // //         setPostState(prev => ({ ...prev, imageUri: result.assets[0].uri }));
// // //       }
// // //     } catch (error) {
// // //       Alert.alert('Error', 'Failed to pick image. Please try again.');
// // //       console.error('Image picker error:', error);
// // //     }
// // //   }, []);

// // //   // Optimized image upload function with better error handling and progress tracking
// // //   const uploadImage = useCallback(async (uri) => {
// // //     try {
// // //       const response = await fetch(uri);
// // //       const blob = await response.blob();
      
// // //       const filename = `${STORAGE_PATH}/${Date.now()}-${Math.random().toString(36).substring(7)}`;
// // //       const imageRef = ref(storage, filename);
      
// // //       const metadata = {
// // //         contentType: blob.type || 'image/jpeg',
// // //         customMetadata: {
// // //           uploadedBy: user.uid,
// // //           uploadedAt: new Date().toISOString()
// // //         }
// // //       };

// // //       await uploadBytes(imageRef, blob, metadata);
// // //       const downloadURL = await getDownloadURL(imageRef);
      
// // //       return downloadURL;
// // //     } catch (error) {
// // //       console.error('Image upload error:', error);
// // //       throw new Error('Failed to upload image. Please try again.');
// // //     }
// // //   }, [user.uid]);

// // //   // Handle post submission with proper validation and error handling
// // //   const handleSubmit = useCallback(async () => {
// // //     const { content, imageUri } = postState;
    
// // //     if (!content.trim()) {
// // //       Alert.alert('Error', 'Please enter some content');
// // //       return;
// // //     }

// // //     setPostState(prev => ({ ...prev, loading: true }));

// // //     try {
// // //       let mediaUrl = null;
// // //       if (imageUri) {
// // //         mediaUrl = await uploadImage(imageUri);
// // //       }

// // //       const postData = {
// // //         content: content.trim(),
// // //         category: postState.category,
// // //         mediaUrl,
// // //         createdAt: serverTimestamp(),
// // //         likes: 0,
// // //         comments: [],
// // //         userId: user.uid,
// // //         userName: user.fullName || 'Student',
// // //         userAvatar: user.profileUrl || 'https://www.kindpng.com/picc/m/78-785827_user-profile-avatar-login-account-male-user-icon.png',
// // //         college: user.college?.name || null,
// // //         // Add notification-related fields
// // //         notificationSent: false,
// // //         notificationError: null
// // //       };

// // //       const postRef = await addDoc(collection(db, 'posts'), postData);
      
// // //       // The notification will be handled by the Cloud Function
// // //       // We don't need to handle it here anymore
      
// // //       onSuccess();
// // //       resetForm();
// // //       Alert.alert('Success', 'Post created successfully!');
// // //     } catch (error) {
// // //       console.error('Post creation error:', error);
// // //       Alert.alert('Error', 'Failed to create post. Please try again.');
// // //     } finally {
// // //       setPostState(prev => ({ ...prev, loading: false }));
// // //     }
// // //   }, [postState, user, uploadImage, onSuccess]);

// // //   const resetForm = useCallback(() => {
// // //     setPostState({
// // //       content: '',
// // //       category: 'general',
// // //       imageUri: null,
// // //       loading: false
// // //     });
// // //     onClose();
// // //   }, [onClose]);

// // //   // Render methods
// // //   const renderImagePreview = () => {
// // //     if (!postState.imageUri) return null;

// // //     return (
// // //       <View style={styles.imageContainer}>
// // //         <Image source={{ uri: postState.imageUri }} style={styles.previewImage} />
// // //         <TouchableOpacity
// // //           style={styles.removeImage}
// // //           onPress={() => setPostState(prev => ({ ...prev, imageUri: null }))}
// // //         >
// // //           <MaterialIcons name="close" size={20} color="white" />
// // //         </TouchableOpacity>
// // //       </View>
// // //     );
// // //   };

// // //   return (
// // //     <Modal
// // //       visible={visible}
// // //       animationType="slide"
// // //       transparent={true}
// // //       onRequestClose={onClose}
// // //     >
// // //       <View style={styles.modalContainer}>
// // //         <View style={styles.modalContent}>
// // //           <Text style={styles.modalTitle}>Create Post</Text>
          
// // //           <LinearGradient 
// // //             colors={['#8A4FFF', '#633333']} 
// // //             className='p-2 rounded-full w-full flex items-center justify-center'
// // //           >
// // //             <Text className='text-white font-semibold text-sm px-3 py-1 rounded-full'>
// // //               Caution: Only post your college related content to avoid account restrictions
// // //             </Text>
// // //           </LinearGradient>

// // //           <TextInput
// // //             style={styles.input}
// // //             placeholder="What's on your mind?"
// // //             multiline
// // //             value={postState.content}
// // //             onChangeText={(content) => setPostState(prev => ({ ...prev, content }))}
// // //             maxLength={500}
// // //           />

// // //           {renderImagePreview()}

// // //           <View style={styles.footer}>
// // //             <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
// // //               <MaterialIcons name="image" size={24} color={colors.primary} />
// // //             </TouchableOpacity>

// // //             <TouchableOpacity
// // //               style={[styles.submitButton, !postState.content.trim() && styles.submitButtonDisabled]}
// // //               onPress={handleSubmit}
// // //               disabled={postState.loading || !postState.content.trim()}
// // //             >
// // //               {postState.loading ? (
// // //                 <ActivityIndicator color="white" />
// // //               ) : (
// // //                 <Text style={styles.submitButtonText}>Post</Text>
// // //               )}
// // //             </TouchableOpacity>
// // //           </View>
// // //         </View>
// // //       </View>
// // //     </Modal>
// // //   );
// // // };

// // // // export default CreatePostModal;

// // // const styles = {
// // //   modalContainer: {
// // //     flex: 1,
// // //     backgroundColor: 'rgba(0,0,0,0.5)',
// // //     justifyContent: 'flex-end',
// // //   },
// // //   modalContent: {
// // //     backgroundColor: colors.background,
// // //     borderTopLeftRadius: 20,
// // //     borderTopRightRadius: 20,
// // //     padding: 20,
// // //     maxHeight: '80%',
// // //   },
// // //   modalTitle: {
// // //     fontSize: 20,
// // //     fontWeight: 'bold',
// // //     color: colors.text,
// // //     marginBottom: 20,
// // //   },
// // //   userInfo: {
// // //     color: colors.mediumGrey,
// // //     // marginBottom: 20,
// // //   },
// // //   categories: {
// // //     flexDirection: 'row',
// // //     marginBottom: 20,
// // //   },
// // //   categoryButton: {
// // //     paddingHorizontal: 16,
// // //     paddingVertical: 8,
// // //     borderRadius: 20,
// // //     marginRight: 10,
// // //     backgroundColor: colors.lightGrey,
// // //   },
// // //   categoryButtonActive: {
// // //     backgroundColor: colors.primary,
// // //   },
// // //   categoryText: {
// // //     color: colors.mediumGrey,
// // //   },
// // //   categoryTextActive: {
// // //     color: colors.background,
// // //   },
// // //   input: {
// // //     minHeight: 100,
// // //     maxHeight: 200,
// // //     fontSize: 16,
// // //     color: colors.text,
// // //     marginBottom: 20,
// // //   },
// // //   imageContainer: {
// // //     marginBottom: 20,
// // //   },
// // //   previewImage: {
// // //     width: '100%',
// // //     height: 200,
// // //     borderRadius: 10,
// // //   },
// // //   removeImage: {
// // //     position: 'absolute',
// // //     top: 10,
// // //     right: 10,
// // //     backgroundColor: 'rgba(0,0,0,0.5)',
// // //     borderRadius: 15,
// // //     padding: 5,
// // //   },
// // //   footer: {
// // //     flexDirection: 'row',
// // //     justifyContent: 'space-between',
// // //     alignItems: 'center',
// // //   },
// // //   imageButton: {
// // //     padding: 10,
// // //   },
// // //   submitButton: {
// // //     backgroundColor: colors.primary,
// // //     paddingHorizontal: 30,
// // //     paddingVertical: 12,
// // //     borderRadius: 25,
// // //   },
// // //   submitButtonDisabled: {
// // //     backgroundColor: colors.mediumGrey,
// // //   },
// // //   submitButtonText: {
// // //     color: colors.background,
// // //     fontWeight: 'bold',
// // //   },
// // // };

// // // export default CreatePostModal;

// // import React, { useState, useCallback } from 'react';
// // import {
// //   Modal,
// //   View,
// //   Text,
// //   TextInput,
// //   TouchableOpacity,
// //   ActivityIndicator,
// //   Animated,
// //   Image,
// //   Alert
// // } from 'react-native';
// // import * as ImagePicker from 'expo-image-picker';
// // import { MaterialIcons } from '@expo/vector-icons';
// // import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
// // import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// // import { db, storage } from '../config/firebaseConfig';
// // import { LinearGradient } from 'expo-linear-gradient';

// // // Constants for better maintainability
// // const STORAGE_PATH = 'posts';
// // const IMAGE_PICKER_OPTIONS = {
// //   mediaTypes: ['images', 'videos'],
// //   allowsEditing: true,
// //   aspect: [4, 3],
// //   quality: 1,
// // };
// // const colors = {
// //   primary: '#4A90E2',    
// //   secondary: '#6C63FF',  
// //   accent: '#FF6B6B',     
// //   background: '#FFFFFF', 
// //   text: '#333333',      
// //   lightGrey: '#F5F5F5', 
// //   mediumGrey: '#9E9E9E'
// // };


// // const CreatePostModal = ({ visible, onClose, onSuccess, user }) => {
// //   // Early return if no user
// //   if (!user) return null;

// //   const [postState, setPostState] = useState({
// //     content: '',
// //     category: 'general',
// //     imageUri: null,
// //     loading: false
// //   });
// //   const [animation] = useState(new Animated.Value(0));

// //   // Handle modal animation
// //   React.useEffect(() => {
// //     Animated.timing(animation, {
// //       toValue: visible ? 1 : 0,
// //       duration: 300,
// //       useNativeDriver: true,
// //     }).start();
// //   }, [visible]);

// //   // Image picker function with proper error handling
// //   const pickImage = useCallback(async () => {
// //     try {
// //       const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
// //       if (!permission.granted) {
// //         Alert.alert('Permission Required', 'Please allow access to your media library');
// //         return;
// //       }

// //       const result = await ImagePicker.launchImageLibraryAsync(IMAGE_PICKER_OPTIONS);
      
// //       if (!result.canceled && result.assets?.[0]?.uri) {
// //         setPostState(prev => ({ ...prev, imageUri: result.assets[0].uri }));
// //       }
// //     } catch (error) {
// //       Alert.alert('Error', 'Failed to pick image. Please try again.');
// //       console.error('Image picker error:', error);
// //     }
// //   }, []);

// //   // Optimized image upload function with better error handling and progress tracking
// //   const uploadImage = useCallback(async (uri) => {
// //     try {
// //       const response = await fetch(uri);
// //       const blob = await response.blob();
      
// //       const filename = `${STORAGE_PATH}/${Date.now()}-${Math.random().toString(36).substring(7)}`;
// //       const imageRef = ref(storage, filename);
      
// //       const metadata = {
// //         contentType: blob.type || 'image/jpeg',
// //         customMetadata: {
// //           uploadedBy: user.uid,
// //           uploadedAt: new Date().toISOString()
// //         }
// //       };

// //       await uploadBytes(imageRef, blob, metadata);
// //       const downloadURL = await getDownloadURL(imageRef);
      
// //       return downloadURL;
// //     } catch (error) {
// //       console.error('Image upload error:', error);
// //       throw new Error('Failed to upload image. Please try again.');
// //     }
// //   }, [user.uid]);

// //   // Handle post submission with proper validation and error handling
// //   const handleSubmit = useCallback(async () => {
// //     const { content, imageUri } = postState;
    
// //     if (!content.trim()) {
// //       Alert.alert('Error', 'Please enter some content');
// //       return;
// //     }

// //     setPostState(prev => ({ ...prev, loading: true }));

// //     try {
// //       let mediaUrl = null;
// //       if (imageUri) {
// //         mediaUrl = await uploadImage(imageUri);
// //       }

// //       const postData = {
// //         content: content.trim(),
// //         category: postState.category,
// //         mediaUrl,
// //         createdAt: serverTimestamp(),
// //         likes: 0,
// //         comments: [],
// //         userId: user.uid,
// //         userName: user.fullName || 'Student',
// //         userAvatar: user.profileUrl || 'https://www.kindpng.com/picc/m/78-785827_user-profile-avatar-login-account-male-user-icon.png',
// //         college: user.college?.name || null,
// //         // Add notification-related fields
// //         notificationSent: false,
// //         notificationError: null
// //       };

// //       const postRef = await addDoc(collection(db, 'posts'), postData);
      
// //       // The notification will be handled by the Cloud Function
// //       // We don't need to handle it here anymore
      
// //       onSuccess();
// //       resetForm();
// //       Alert.alert('Success', 'Post created successfully!');
// //     } catch (error) {
// //       console.error('Post creation error:', error);
// //       Alert.alert('Error', 'Failed to create post. Please try again.');
// //     } finally {
// //       setPostState(prev => ({ ...prev, loading: false }));
// //     }
// //   }, [postState, user, uploadImage, onSuccess]);

// //   const resetForm = useCallback(() => {
// //     setPostState({
// //       content: '',
// //       category: 'general',
// //       imageUri: null,
// //       loading: false
// //     });
// //     onClose();
// //   }, [onClose]);

// //   // Render methods
// //   const renderImagePreview = () => {
// //     if (!postState.imageUri) return null;

// //     return (
// //       <View style={styles.imageContainer}>
// //         <Image source={{ uri: postState.imageUri }} style={styles.previewImage} />
// //         <TouchableOpacity
// //           style={styles.removeImage}
// //           onPress={() => setPostState(prev => ({ ...prev, imageUri: null }))}
// //         >
// //           <MaterialIcons name="close" size={20} color="white" />
// //         </TouchableOpacity>
// //       </View>
// //     );
// //   };

// //   return (
// //     <Modal
// //       visible={visible}
// //       animationType="slide"
// //       transparent={true}
// //       onRequestClose={onClose}
// //     >
// //       <View style={styles.modalContainer}>
// //         <View style={styles.modalContent}>
// //           <Text style={styles.modalTitle}>Create Post</Text>
          
// //           <LinearGradient 
// //             colors={['#8A4FFF', '#633333']} 
// //             className='p-2 rounded-full w-full flex items-center justify-center'
// //           >
// //             <Text className='text-white font-semibold text-sm px-3 py-1 rounded-full'>
// //               Caution: Only post your college related content to avoid account restrictions
// //             </Text>
// //           </LinearGradient>

// //           <TextInput
// //             style={styles.input}
// //             placeholder="What's on your mind?"
// //             multiline
// //             value={postState.content}
// //             onChangeText={(content) => setPostState(prev => ({ ...prev, content }))}
// //             maxLength={500}
// //           />

// //           {renderImagePreview()}

// //           <View style={styles.footer}>
// //             <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
// //               <MaterialIcons name="image" size={24} color={colors.primary} />
// //             </TouchableOpacity>

// //             <TouchableOpacity
// //               style={[styles.submitButton, !postState.content.trim() && styles.submitButtonDisabled]}
// //               onPress={handleSubmit}
// //               disabled={postState.loading || !postState.content.trim()}
// //             >
// //               {postState.loading ? (
// //                 <ActivityIndicator color="white" />
// //               ) : (
// //                 <Text style={styles.submitButtonText}>Post</Text>
// //               )}
// //             </TouchableOpacity>
// //           </View>
// //         </View>
// //       </View>
// //     </Modal>
// //   );
// // };

// // // export default CreatePostModal;

// // const styles = {
// //   modalContainer: {
// //     flex: 1,
// //     backgroundColor: 'rgba(0,0,0,0.5)',
// //     justifyContent: 'flex-end',
// //   },
// //   modalContent: {
// //     backgroundColor: colors.background,
// //     borderTopLeftRadius: 20,
// //     borderTopRightRadius: 20,
// //     padding: 20,
// //     maxHeight: '80%',
// //   },
// //   modalTitle: {
// //     fontSize: 20,
// //     fontWeight: 'bold',
// //     color: colors.text,
// //     marginBottom: 20,
// //   },
// //   userInfo: {
// //     color: colors.mediumGrey,
// //     // marginBottom: 20,
// //   },
// //   categories: {
// //     flexDirection: 'row',
// //     marginBottom: 20,
// //   },
// //   categoryButton: {
// //     paddingHorizontal: 16,
// //     paddingVertical: 8,
// //     borderRadius: 20,
// //     marginRight: 10,
// //     backgroundColor: colors.lightGrey,
// //   },
// //   categoryButtonActive: {
// //     backgroundColor: colors.primary,
// //   },
// //   categoryText: {
// //     color: colors.mediumGrey,
// //   },
// //   categoryTextActive: {
// //     color: colors.background,
// //   },
// //   input: {
// //     minHeight: 100,
// //     maxHeight: 200,
// //     fontSize: 16,
// //     color: colors.text,
// //     marginBottom: 20,
// //   },
// //   imageContainer: {
// //     marginBottom: 20,
// //   },
// //   previewImage: {
// //     width: '100%',
// //     height: 200,
// //     borderRadius: 10,
// //   },
// //   removeImage: {
// //     position: 'absolute',
// //     top: 10,
// //     right: 10,
// //     backgroundColor: 'rgba(0,0,0,0.5)',
// //     borderRadius: 15,
// //     padding: 5,
// //   },
// //   footer: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     alignItems: 'center',
// //   },
// //   imageButton: {
// //     padding: 10,
// //   },
// //   submitButton: {
// //     backgroundColor: colors.primary,
// //     paddingHorizontal: 30,
// //     paddingVertical: 12,
// //     borderRadius: 25,
// //   },
// //   submitButtonDisabled: {
// //     backgroundColor: colors.mediumGrey,
// //   },
// //   submitButtonText: {
// //     color: colors.background,
// //     fontWeight: 'bold',
// //   },
// // };

// // export default CreatePostModal;

// // import React, { useState, useCallback } from 'react';
// // import {
// //   Modal,
// //   View,
// //   Text,
// //   TextInput,
// //   TouchableOpacity,
// //   ActivityIndicator,
// //   Image,
// //   Alert,
// //   ScrollView,
// // } from 'react-native';
// // import * as ImagePicker from 'expo-image-picker';
// // import { MaterialIcons } from '@expo/vector-icons';
// // import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
// // import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// // import { db, storage } from '../config/firebaseConfig';

// // const CreatePostModal = ({ visible, onClose, onSuccess, user }) => {
// //   const [content, setContent] = useState('');
// //   const [selectedImages, setSelectedImages] = useState([]);
// //   const [loading, setLoading] = useState(false);

// //   // Image picker with permissions
// //   const pickImages = useCallback(async () => {
// //     try {
// //       const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
// //       if (status !== 'granted') {
// //         Alert.alert(
// //           'Permission Required',
// //           'Please allow access to your photo library to select images.'
// //         );
// //         return;
// //       }

// //       const result = await ImagePicker.launchImageLibraryAsync({
// //         mediaTypes: ImagePicker.MediaTypeOptions.Images,
// //         allowsEditing: true,
// //         aspect: [4, 3],
// //         quality: 1,
// //         allowsMultipleSelection: true,
// //         maxSelected: 4,
// //       });

// //       if (!result.canceled && result.assets) {
// //         setSelectedImages(result.assets.map(asset => asset.uri));
// //       }
// //     } catch (error) {
// //       Alert.alert('Error', 'Failed to pick images. Please try again.');
// //     }
// //   }, []);

// //   // Upload multiple images
// //   const uploadImages = async (uris) => {
// //     const uploadPromises = uris.map(async (uri) => {
// //       const response = await fetch(uri);
// //       const blob = await response.blob();
// //       const filename = `posts/${Date.now()}-${Math.random().toString(36).substr(2)}`;
// //       const imageRef = ref(storage, filename);
      
// //       await uploadBytes(imageRef, blob);
// //       return getDownloadURL(imageRef);
// //     });

// //     return Promise.all(uploadPromises);
// //   };

// //   // Handle post creation
// //   const handleSubmit = async () => {
// //     if (!content.trim()) {
// //       Alert.alert('Error', 'Please enter some content');
// //       return;
// //     }

// //     setLoading(true);

// //     try {
// //       let mediaUrls = [];
// //       if (selectedImages.length > 0) {
// //         mediaUrls = await uploadImages(selectedImages);
// //       }

// //       await addDoc(collection(db, 'posts'), {
// //         content: content.trim(),
// //         mediaUrls,
// //         createdAt: serverTimestamp(),
// //         userId: user.uid,
// //         userName: user.fullName,
// //         userAvatar: user.profileUrl,
// //         college: user.college?.name,
// //       });

// //       onSuccess();
// //       setContent('');
// //       setSelectedImages([]);
// //     } catch (error) {
// //       Alert.alert('Error', 'Failed to create post. Please try again.');
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   return (
// //     <Modal
// //       visible={visible}
// //       animationType="slide"
// //       transparent
// //       onRequestClose={onClose}
// //     >
// //       <View className="flex-1 bg-black/50">
// //         <View className="mt-auto bg-white dark:bg-gray-900 rounded-t-3xl p-6">
// //           <View className="flex-row justify-between items-center mb-6">
// //             <Text className="text-xl font-bold text-gray-900 dark:text-white">
// //               Create Post
// //             </Text>
// //             <TouchableOpacity onPress={onClose}>
// //               <MaterialIcons name="close" size={24} className="text-gray-600" />
// //             </TouchableOpacity>
// //           </View>

// //           <ScrollView>
// //             <TextInput
// //               className="min-h-[100] text-base text-gray-900 dark:text-white mb-4"
// //               placeholder="What's on your mind?"
// //               placeholderTextColor="#666"
// //               multiline
// //               value={content}
// //               onChangeText={setContent}
// //             />

// //             {selectedImages.length > 0 && (
// //               <View className="flex-row flex-wrap gap-2 mb-4">
// //                 {selectedImages.map((uri, index) => (
// //                   <View key={index} className="relative">
// //                     <Image
// //                       source={{ uri }}
// //                       className="w-24 h-24 rounded-lg"
// //                     />
// //                     <TouchableOpacity
// //                       className="absolute top-1 right-1 bg-black/50 rounded-full p-1"
// //                       onPress={() => {
// //                         setSelectedImages(prev => 
// //                           prev.filter((_, i) => i !== index)
// //                         );
// //                       }}
// //                     >
// //                       <MaterialIcons name="close" size={16} color="#fff" />
// //                     </TouchableOpacity>
// //                   </View>
// //                 ))}
// //               </View>
// //             )}
// //           </ScrollView>

// //           <View className="flex-row justify-between items-center mt-4">
// //             <TouchableOpacity
// //               className="p-3 rounded-full bg-gray-100 dark:bg-gray-800"
// //               onPress={pickImages}
// //             >
// //               <MaterialIcons name="image" size={24} className="text-primary" />
// //             </TouchableOpacity>

// //             <TouchableOpacity
// //               className={`px-8 py-3 rounded-full ${
// //                 !content.trim() ? 'bg-gray-400' : 'bg-primary'
// //               }`}
// //               onPress={handleSubmit}
// //               disabled={loading || !content.trim()}
// //             >
// //               {loading ? (
// //                 <ActivityIndicator color="#fff" />
// //               ) : (
// //                 <Text className="text-white font-semibold">Post</Text>
// //               )}
// //             </TouchableOpacity>
// //           </View>
// //         </View>
// //       </View>
// //     </Modal>
// //   );
// // };

// // export default CreatePostModal;

// // import React, { useState, useCallback } from 'react';
// // import {
// //   Modal,
// //   View,
// //   Text,
// //   TextInput,
// //   TouchableOpacity,
// //   ActivityIndicator,
// //   Image,
// //   Alert,
// //   ScrollView,
// //   Switch,
// // } from 'react-native';
// // import * as ImagePicker from 'expo-image-picker';
// // import { MaterialIcons, Ionicons } from '@expo/vector-icons';
// // import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
// // import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// // import { db, storage } from '../config/firebaseConfig';
// // import { uploadVideoToCloudinary, generateUniqueUsername } from '../config/cloudinaryConfig';
// // // import { styles } from '../styles/createPostStyles';

// // // CreatePostStyles.js
// // const styles = {
// //   // Modal container with overlay
// //   modalContainer: `fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4`,
  
// //   // Modal content
// //   modalContent: `bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col`,
  
// //   // Header section
// //   header: `flex items-center justify-between p-4 border-b border-gray-200`,
// //   headerTitle: `text-xl font-semibold text-gray-800`,
// //   closeButton: `p-2 hover:bg-gray-100 rounded-full transition-colors`,

// //   // Scrollable content area
// //   scrollContent: `flex-1 overflow-y-auto p-4`,

// //   // Input fields
// //   titleInput: `w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent`,
// //   contentInput: `w-full p-3 min-h-[120px] mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent`,

// //   // Category section
// //   sectionTitle: `text-lg font-medium text-gray-700 mb-3`,
// //   categoryGrid: `grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4`,
// //   categoryButton: `p-3 text-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors`,
// //   selectedCategory: `border-purple-500 bg-purple-50`,
// //   categoryText: `text-gray-700`,
// //   selectedCategoryText: `text-purple-700`,

// //   // Media preview section
// //   mediaPreviewContainer: `flex flex-wrap gap-2 mb-4`,
// //   mediaPreview: `relative w-24 h-24`,
// //   imagePreview: `w-full h-full object-cover rounded-lg`,
// //   videoPreview: `w-full h-full bg-purple-100 rounded-lg flex flex-col items-center justify-center`,
// //   videoLabel: `text-sm text-purple-700 mt-1`,
// //   removeMediaButton: `absolute -top-2 -right-2 bg-red-500 rounded-full p-1 shadow-lg`,

// //   // Anonymous posting toggle
// //   anonymousContainer: `flex items-center justify-between p-4 border-t border-gray-200`,
// //   anonymousText: `text-gray-700`,

// //   // Footer section
// //   footer: `flex items-center justify-between p-4 border-t border-gray-200`,
// //   mediaButtons: `flex space-x-2`,
// //   mediaButton: `p-2 hover:bg-purple-100 rounded-full transition-colors`,
// //   submitButton: `px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors`,
// //   disabledButton: `opacity-50 cursor-not-allowed`,
// //   submitButtonText: `text-white font-medium`
// // };


// // const CreatePostModal = ({ visible, onClose, onSuccess, user }) => {
// //   const [title, setTitle] = useState('');
// //   const [content, setContent] = useState('');
// //   const [selectedMedia, setSelectedMedia] = useState([]);
// //   const [loading, setLoading] = useState(false);
// //   const [isAnonymous, setIsAnonymous] = useState(false);
// //   const [selectedCategory, setSelectedCategory] = useState(null);

// //   const categories = ['IT', 'BE\'2026', 'CBIT', 'HYD'];

// //   const pickMedia = useCallback(async (type) => {
// //     try {
// //       const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
// //       if (status !== 'granted') {
//   //         Alert.alert('Permission Required', 'Please allow access to your media library.');
// //         return;
// //       }

// //       const result = await ImagePicker.launchImageLibraryAsync({
// //         mediaTypes:['images', 'videos'],
// //         allowsEditing: true,
// //         aspect: [4, 3],
// //         quality: 1,
// //         allowsMultipleSelection: type === 'image',
// //         maxSelected: 4,
// //       });

// //       if (!result.canceled && result.assets) {
// //         const newMedia = result.assets.map(asset => ({
// //           uri: asset.uri,
// //           type: asset.type || (asset.uri.endsWith('.mp4') ? 'video' : 'image'),
// //         }));
        
// //         setSelectedMedia(prev => [...prev, ...newMedia].slice(0, 4));
// //       }
// //     } catch (error) {
// //       Alert.alert('Error', 'Failed to pick media. Please try again.');
// //     }
// //   }, []);

// //   const handleSubmit = async () => {
// //     if (!content.trim() && !title.trim()) {
//   //       Alert.alert('Error', 'Please enter a title or description');
// //       return;
// //     }

// //     if (!selectedCategory) {
//   //       Alert.alert('Error', 'Please select where you want to post');
// //       return;
// //     }

// //     setLoading(true);

// //     try {
//   //       const mediaUrls = await Promise.all(
//     //         selectedMedia.map(async (media) => {
// //           if (media.type === 'video') {
// //             return await uploadVideoToCloudinary(media.uri);
// //           } else {
// //             const response = await fetch(media.uri);
// //             const blob = await response.blob();
// //             const filename = `posts/${Date.now()}`;
// //             const imageRef = ref(storage, filename);
// //             await uploadBytes(imageRef, blob);
// //             return await getDownloadURL(imageRef);
// //           }
// //         })
// //       );

// //       const postData = {
// //         title: title.trim(),
// //         content: content.trim(),
// //         mediaUrls,
// //         mediaTypes: selectedMedia.map(m => m.type),
// //         createdAt: serverTimestamp(),
// //         userId: user.uid,
// //         userName: isAnonymous ? generateUniqueUsername(user.fullName) : user.fullName,
// //         category: selectedCategory,
// //         isAnonymous,
// //         college: user.college?.name,
// //       };

// //       await addDoc(collection(db, 'posts'), postData);
// //       onSuccess();
// //       setTitle('');
// //       setContent('');
// //       setSelectedMedia([]);
// //       setIsAnonymous(false);
// //       setSelectedCategory(null);
// //     } catch (error) {
// //       Alert.alert('Error', 'Failed to create post. Please try again.');
// //       console.error(error);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   return (
//   //     <Modal
//   //       visible={visible}
//   //       animationType="slide"
// //       transparent
// //       onRequestClose={onClose}
// //     >
// //       <View style={styles.modalContainer}>
// //         <View style={styles.modalContent}>
// //           <View style={styles.header}>
// //             <Text style={styles.headerTitle}>Create Post</Text>
// //             <TouchableOpacity onPress={onClose} style={styles.closeButton}>
// //               <MaterialIcons name="close" size={24} color="#666" />
// //             </TouchableOpacity>
// //           </View>

// //           <ScrollView style={styles.scrollContent}>
// //             <TextInput
// //               style={styles.titleInput}
// //               placeholder="Title (optional)"
// //               placeholderTextColor="#666"
// //               value={title}
// //               onChangeText={setTitle}
// //             />

// //             <TextInput
// //               style={styles.contentInput}
// //               placeholder="What's on your mind?"
// //               placeholderTextColor="#666"
// //               multiline
// //               value={content}
// //               onChangeText={setContent}
// //             />

// //             <Text style={styles.sectionTitle}>Where do you want to post?</Text>
// //             <View style={styles.categoryGrid}>
// //               {categories.map((category) => (
// //                 <TouchableOpacity
// //                   key={category}
// //                   style={[
// //                     styles.categoryButton,
// //                     selectedCategory === category && styles.selectedCategory
// //                   ]}
// //                   onPress={() => setSelectedCategory(category)}
// //                 >
// //                   <Text style={[
//   //                     styles.categoryText,
// //                     selectedCategory === category && styles.selectedCategoryText
// //                   ]}>
// //                     {category}
// //                   </Text>
// //                 </TouchableOpacity>
// //               ))}
// //             </View>

// //             {selectedMedia.length > 0 && (
// //               <View style={styles.mediaPreviewContainer}>
// //                 {selectedMedia.map((media, index) => (
//   //                   <View key={index} style={styles.mediaPreview}>
//   //                     {media.type === 'video' ? (
// //                       <View style={styles.videoPreview}>
// //                         <Ionicons name="videocam" size={24} color="#9F7AEA" />
// //                         <Text style={styles.videoLabel}>Video</Text>
// //                       </View>
// //                     ) : (
// //                       <Image
// //                         source={{ uri: media.uri }}
// //                         style={styles.imagePreview}
// //                       />
// //                     )}
// //                     <TouchableOpacity
// //                       style={styles.removeMediaButton}
// //                       onPress={() => {
// //                         setSelectedMedia(prev => 
//   //                           prev.filter((_, i) => i !== index)
// //                         );
// //                       }}
// //                     >
// //                       <MaterialIcons name="close" size={16} color="#fff" />
// //                     </TouchableOpacity>
// //                   </View>
// //                 ))}
// //               </View>
// //             )}

// //             <View style={styles.anonymousContainer}>
// //               <Text style={styles.anonymousText}>Post Anonymously</Text>
// //               <Switch
// //                 value={isAnonymous}
// //                 onValueChange={setIsAnonymous}
// //                 trackColor={{ false: "#767577", true: "#9F7AEA" }}
// //                 thumbColor={isAnonymous ? "#fff" : "#f4f3f4"}
// //               />
// //             </View>
// //           </ScrollView>

// //           <View style={styles.footer}>
// //             <View style={styles.mediaButtons}>
// //               <TouchableOpacity
// //                 style={styles.mediaButton}
// //                 onPress={() => pickMedia('image')}
// //                 disabled={selectedMedia.length >= 4}
// //               >
// //                 <MaterialIcons name="image" size={24} color="#9F7AEA" />
// //               </TouchableOpacity>
// //               <TouchableOpacity
// //                 style={styles.mediaButton}
// //                 onPress={() => pickMedia('video')}
// //                 disabled={selectedMedia.length >= 4}
// //               >
// //                 <MaterialIcons name="videocam" size={24} color="#9F7AEA" />
// //               </TouchableOpacity>
// //             </View>

// //             <TouchableOpacity
// //               style={[
// //                 styles.submitButton,
// //                 (!content.trim() && !title.trim()) && styles.disabledButton
// //               ]}
// //               onPress={handleSubmit}
// //               disabled={loading || (!content.trim() && !title.trim())}
// //             >
// //               {loading ? (
// //                 <ActivityIndicator color="#fff" />
// //               ) : (
// //                 <Text style={styles.submitButtonText}>Post</Text>
// //               )}
// //             </TouchableOpacity>
// //           </View>
// //         </View>
// //       </View>
// //     </Modal>
// //   );
// // };

// // export default CreatePostModal;

// // import React, { useState, useCallback } from 'react';
// // import {
// //   Modal,
// //   View,
// //   Text,
// //   TextInput,
// //   TouchableOpacity,
// //   ActivityIndicator,
// //   Image,
// //   Alert,
// //   ScrollView,
// // } from 'react-native';
// // import * as ImagePicker from 'expo-image-picker';
// // import { MaterialIcons } from '@expo/vector-icons';
// // import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
// // import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// // import { db, storage } from '../config/firebaseConfig';
// // import { useAuth } from '../context/authContext';
// // const CreatePostModal = ({ visible, onClose, onSuccess, user }) => {
// //   const [content, setContent] = useState('');
// //   const [selectedImages, setSelectedImages] = useState([]);
// //   const [loading, setLoading] = useState(false);
// //   const DEFAULT_AVATAR = 'https://via.placeholder.com/100?text=User';
// // // const { user } = useAuth();
// // // console.log("User:", user);c
// //   // Image picker with permissions
// //   const pickImages = useCallback(async () => {
// //     try {
// //       const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
// //       if (status !== 'granted') {
// //         Alert.alert(
// //           'Permission Required',
// //           'Please allow access to your photo library to select images.'
// //         );
// //         return;
// //       }

// //       const result = await ImagePicker.launchImageLibraryAsync({
// //         mediaTypes: ['images'],
// //         // allowsEditing: true,
// //         aspect: [4, 3],
// //         quality: 1,
// //         allowsMultipleSelection: true,
// //         maxSelected: 4,
// //       });

// //       if (!result.canceled && result.assets) {
// //         setSelectedImages(result.assets.map(asset => asset.uri));
// //       }
// //     } catch (error) {
// //       Alert.alert('Error', 'Failed to pick images. Please try again.');
// //     }
// //   }, []);

// //   // Upload multiple images
// //   const uploadImages = async (uris) => {
// //     const uploadPromises = uris.map(async (uri) => {
// //       const response = await fetch(uri);
// //       const blob = await response.blob();
// //       const filename = `posts/${Date.now()}`;
// //       const imageRef = ref(storage, filename);
      
// //       await uploadBytes(imageRef, blob);
// //       return getDownloadURL(imageRef);
// //     });

// //     return Promise.all(uploadPromises);
// //   };

// //   // Handle post creation
// //   const handleSubmit = async () => {
// //     if (!content.trim()) {
// //       Alert.alert('Error', 'Please enter some content');
// //       return;
// //     }

// //     setLoading(true);

// //     try {
// //       let mediaUrls = [];
// //       if (selectedImages.length > 0) {
// //         mediaUrls = await uploadImages(selectedImages);
// //         // console.log("Media URLs:", mediaUrls);
// //       }
// //       console.log("Starting....");
// //       await addDoc(collection(db, 'posts'), {
// //         content: content.trim(),
// //         mediaUrls,
// //         createdAt: serverTimestamp(),
// //         userId: user.uid,
// //         userName: user.fullName || 'Student',
        
// //         college: user.college?.name,
// //       });
// //  console.log("Done....");
// //       onSuccess();
// //       setContent('');
// //       setSelectedImages([]);
// //     } catch (error) {
// //       Alert.alert('Error', 'Failed to create post. Please try again.')
// //       console.error(error);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   return (
// //     <Modal
// //       visible={visible}
// //       animationType="slide"
// //       transparent
// //       onRequestClose={onClose}
// //     >
// //       <View className="flex-1 bg-black/50">
// //         <View className="mt-auto bg-white dark:bg-gray-900 rounded-t-3xl p-6">
// //           <View className="flex-row justify-between items-center mb-6">
// //             <Text className="text-xl font-bold text-gray-900 dark:text-white">
// //               Create Post
// //             </Text>
// //             <TouchableOpacity onPress={onClose}>
// //               <MaterialIcons name="close" size={24} className="text-gray-600" />
// //             </TouchableOpacity>
// //           </View>

// //           <ScrollView>
// //             <TextInput
// //               className="min-h-[100] text-base text-gray-900 dark:text-white mb-4"
// //               placeholder="What's on your mind?"
// //               placeholderTextColor="#666"
// //               multiline
// //               value={content}
// //               onChangeText={setContent}
// //             />

// //             {selectedImages.length > 0 && (
// //               <View className="flex-row flex-wrap gap-2 mb-4">
// //                 {selectedImages.map((uri, index) => (
// //                   <View key={index} className="relative">
// //                     <Image
// //                       source={{ uri }}
// //                       className="w-24 h-24 rounded-lg"
// //                     />
// //                     <TouchableOpacity
// //                       className="absolute top-1 right-1 bg-black/50 rounded-full p-1"
// //                       onPress={() => {
// //                         setSelectedImages(prev => 
// //                           prev.filter((_, i) => i !== index)
// //                         );
// //                       }}
// //                     >
// //                       <MaterialIcons name="close" size={16} color="#fff" />
// //                     </TouchableOpacity>
// //                   </View>
// //                 ))}
// //               </View>
// //             )}
// //           </ScrollView>

// //           <View className="flex-row justify-between items-center mt-4">
// //             <TouchableOpacity
// //               className="p-3 rounded-full bg-gray-100 dark:bg-gray-800"
// //               onPress={pickImages}
// //             >
// //               <MaterialIcons name="image" size={24} className="text-primary" />
// //             </TouchableOpacity>

// //             <TouchableOpacity
// //               className={`px-8 py-3 rounded-full ${
// //                 !content.trim() ? 'bg-gray-400' : 'bg-primary'
// //               }`}
// //               onPress={handleSubmit}
// //               disabled={loading || !content.trim()}
// //             >
// //               {loading ? (
// //                 <ActivityIndicator color="#fff" />
// //               ) : (
// //                 <Text className="text-white font-semibold">Post</Text>
// //               )}
// //             </TouchableOpacity>
// //           </View>
// //         </View>
// //       </View>
// //     </Modal>
// //   );
// // };

// // export default CreatePostModal;
// import React, { useState, useEffect, useRef } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   Image,
//   ScrollView,
//   Modal,
//   ActivityIndicator,
//   SafeAreaView,
//   KeyboardAvoidingView,
//   Platform,
//   Alert,
//   StatusBar,
//   FlatList
// } from 'react-native';
// import { Ionicons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
// import { LinearGradient } from 'expo-linear-gradient';
// import * as ImagePicker from 'expo-image-picker';
// import { useAuth } from '../context/authContext';
// import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
// import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// import { db, storage } from '../config/firebaseConfig';
// import { router } from 'expo-router';
// import {incrementUserStreak, getUserStreak } from '../app/(apis)/streaks';
// const CreatePostScreen = ({ visible, onClose }) => {
//   const { user } = useAuth();
//   const [content, setContent] = useState('');
//   const [selectedImages, setSelectedImages] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [streak, setStreak] = useState(0);
//   const [showStreakAnimation, setShowStreakAnimation] = useState(false);
//   const [isEmojiPickerVisible, setIsEmojiPickerVisible] = useState(false);
//   const textInputRef = useRef(null);
  
//   useEffect(() => {
//     loadStreak();
//     if (visible) {
//       setTimeout(() => textInputRef.current?.focus(), 300);
//     }
//   }, [visible]);
  
//   const loadStreak = async () => {
//     try {
//       const streakData = await getUserStreak(user.uid);
//       setStreak(streakData.currentStreak || 0);
//     } catch (error) {
//       console.error('Error loading user streak:', error);
//     }
//   };
  
//   const pickImage = async () => {
//     try {
//       const result = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.Images,
//         allowsEditing: true,
//         aspect: [4, 3],
//         quality: 1,
//         allowsMultipleSelection: true,
//         selectionLimit: 8 - selectedImages.length,
//       });
      
//       if (!result.canceled && result.assets) {
//         const newImages = result.assets.map(asset => asset.uri);
//         setSelectedImages([...selectedImages, ...newImages]);
//       }
//     } catch (error) {
//       console.error('Error picking image:', error);
//       Alert.alert('Error', 'Failed to pick image');
//     }
//   };
  
//   const openCamera = async () => {
//     try {
//       const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
//       if (status !== 'granted') {
//         Alert.alert('Permission Denied', 'Camera access is required to take photos');
//         return;
//       }
      
//       const result = await ImagePicker.launchCameraAsync({
//         allowsEditing: true,
//         aspect: [4, 3],
//         quality: 1,
//       });
      
//       if (!result.canceled && result.assets) {
//         setSelectedImages([...selectedImages, result.assets[0].uri]);
//       }
//     } catch (error) {
//       console.error('Error taking photo:', error);
//       Alert.alert('Error', 'Failed to take photo');
//     }
//   };
  
//   const removeImage = (index) => {
//     const newImages = [...selectedImages];
//     newImages.splice(index, 1);
//     setSelectedImages(newImages);
//   };
  
//   // Upload multiple images to Firebase Storage
//   const uploadImages = async (uris) => {
//     const uploadPromises = uris.map(async (uri) => {
//       const response = await fetch(uri);
//       const blob = await response.blob();
//       const filename = `posts/${user.uid}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
//       const imageRef = ref(storage, filename);
      
//       await uploadBytes(imageRef, blob);
//       return getDownloadURL(imageRef);
//     });

//     return Promise.all(uploadPromises);
//   };
  
//   const renderImagePreviews = () => {
//     if (selectedImages.length === 0) return null;
    
//     return (
//       <View className="mb-4">
//         <FlatList
//           horizontal
//           data={selectedImages}
//           renderItem={({item, index}) => (
//             <View className="mr-2 relative">
//               <Image 
//                 source={{ uri: item }} 
//                 className="w-24 h-24 rounded-lg"
//               />
//               <TouchableOpacity 
//                 onPress={() => removeImage(index)}
//                 className="absolute top-1 right-1 bg-black/70 rounded-full p-1"
//               >
//                 <Ionicons name="close" size={16} color="white" />
//               </TouchableOpacity>
//             </View>
//           )}
//           keyExtractor={(_, index) => index.toString()}
//           showsHorizontalScrollIndicator={false}
//         />
//         <View className="flex-row justify-center mt-2">
//           {selectedImages.map((_, index) => (
//             <View 
//               key={index} 
//               className={`h-1.5 w-1.5 rounded-full mx-1 ${index === 0 ? 'bg-blue-500' : 'bg-gray-300'}`} 
//             />
//           ))}
//         </View>
//       </View>
//     );
//   };
  
//   const handleSubmit = async () => {
//     if (!content.trim() && selectedImages.length === 0) {
//       Alert.alert('Error', 'Please add some content or images to your post');
//       return;
//     }
    
//     setIsLoading(true);
    
//     try {
//       // Upload images to Firebase Storage
//       let mediaUrls = [];
//       if (selectedImages.length > 0) {
//         mediaUrls = await uploadImages(selectedImages);
//       }
      
//       // Create post in Firestore
//       await addDoc(collection(db, 'posts'), {
//         content: content.trim(),
//         mediaUrls,
//         createdAt: serverTimestamp(),
//         userId: user.uid,
//         userName: user.displayName || 'Anonymous',
//         userAvatar: user.photoURL || null,
//         college: user.college?.name,
//       });
      
//       // Increment user streak
//       const updatedStreak = await incrementUserStreak(user.uid);
//       setStreak(updatedStreak.currentStreak);
      
//       // Show streak animation if streak increased
//       if (updatedStreak.streakIncreased) {
//         setShowStreakAnimation(true);
//         setTimeout(() => setShowStreakAnimation(false), 3000);
//       }
      
//       // Reset form and close modal
//       setContent('');
//       setSelectedImages([]);
//       onClose();
//     } catch (error) {
//       console.error('Error creating post:', error);
//       Alert.alert('Error', 'Failed to create post. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };
  
//   // Streak animation component
//   const StreakAnimation = () => (
//     <Modal
//       transparent={true}
//       visible={showStreakAnimation}
//       animationType="fade"
//     >
//       <View className="flex-1 justify-center items-center bg-black/70">
//         <LinearGradient
//           colors={['#4c669f', '#3b5998', '#192f6a']}
//           className="p-6 rounded-2xl items-center"
//         >
//           <Ionicons name="flame" size={60} color="#FFD700" />
//           <Text className="text-white text-xl font-bold mt-4">
//             Streak Updated!
//           </Text>
//           <Text className="text-white text-3xl font-bold mt-2">
//             🔥 Day {streak} 🔥
//           </Text>
//           <Text className="text-white text-sm mt-4 text-center">
//             Keep posting daily to maintain your streak!
//           </Text>
//         </LinearGradient>
//       </View>
//     </Modal>
//   );

//   if (!visible) return null;
  
//   return (
//     <Modal
//       animationType="slide"
//       transparent={false}
//       visible={visible}
//       onRequestClose={onClose}
//     >
//       <SafeAreaView className="flex-1 bg-black">
//         <StatusBar barStyle="light-content" />
//         <KeyboardAvoidingView
//           behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//           className="flex-1"
//         >
//           {/* Header */}
//           <View className="flex-row justify-between items-center p-4 border-b border-gray-800">
//             <TouchableOpacity onPress={onClose}>
//               <Ionicons name="close" size={28} color="white" />
//             </TouchableOpacity>
//             <Text className="text-white text-lg font-bold">Create Post</Text>
//             <TouchableOpacity 
//               onPress={handleSubmit}
//               disabled={isLoading || (!content.trim() && selectedImages.length === 0)}
//               className={`px-4 py-2 rounded-full ${(!content.trim() && selectedImages.length === 0) ? 'bg-gray-700' : 'bg-blue-500'}`}
//             >
//               {isLoading ? (
//                 <ActivityIndicator size="small" color="white" />
//               ) : (
//                 <Text className="text-white font-bold">Post</Text>
//               )}
//             </TouchableOpacity>
//           </View>
          
//           {/* Streak Badge */}
//           <LinearGradient
//             colors={['#FF6B6B', '#FF8E53']}
//             className="px-4 py-2 m-4 rounded-lg flex-row items-center"
//           >
//             <Ionicons name="flame" size={24} color="white" />
//             <View className="ml-2">
//               <Text className="text-white font-bold">Current Streak: {streak} days</Text>
//               <Text className="text-white text-xs">Post today to keep your streak alive!</Text>
//             </View>
//           </LinearGradient>
          
//           {/* Content */}
//           <ScrollView className="flex-1 p-4">
//             <View className="flex-row items-start mb-4">
//               <Image 
//                 source={{ uri: user?.photoURL || 'https://via.placeholder.com/150' }} 
//                 className="w-10 h-10 rounded-full mr-3"
//               />
//               <View className="flex-1">
//                 <Text className="text-white font-bold mb-1">{user?.displayName || 'Anonymous'}</Text>
//                 <TextInput
//                   ref={textInputRef}
//                   className="text-white text-base min-h-32"
//                   placeholder="What's on your mind?"
//                   placeholderTextColor="#6B7280"
//                   multiline
//                   value={content}
//                   onChangeText={setContent}
//                   autoFocus={false}
//                 />
//               </View>
//             </View>
            
//             {renderImagePreviews()}
//           </ScrollView>
          
//           {/* Bottom Toolbar */}
//           <View className="p-4 border-t border-gray-800 flex-row justify-between">
//             <View className="flex-row space-x-6">
//               <TouchableOpacity onPress={pickImage}>
//                 <Ionicons name="images" size={28} color="#3B82F6" />
//               </TouchableOpacity>
//               <TouchableOpacity onPress={openCamera}>
//                 <Ionicons name="camera" size={28} color="#10B981" />
//               </TouchableOpacity>
//               <TouchableOpacity onPress={() => setIsEmojiPickerVisible(true)}>
//                 <Ionicons name="happy" size={28} color="#F59E0B" />
//               </TouchableOpacity>
//             </View>
//             <TouchableOpacity>
//               <FontAwesome5 name="hashtag" size={24} color="#8B5CF6" />
//             </TouchableOpacity>
//           </View>
//         </KeyboardAvoidingView>
        
//         <StreakAnimation />
//       </SafeAreaView>
//     </Modal>
//   );
// };

// export default CreatePostScreen;
// import React, { useState, useEffect, useRef } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   Image,
//   ScrollView,
//   Modal,
//   ActivityIndicator,
//   SafeAreaView,
//   KeyboardAvoidingView,
//   Platform,
//   Alert,
//   StatusBar,
//   FlatList
// } from 'react-native';
// import { Ionicons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
// import { LinearGradient } from 'expo-linear-gradient';
// import * as ImagePicker from 'expo-image-picker';
// import { useAuth } from '../context/authContext';
// import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc, setDoc, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
// import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// import { db, storage } from '../config/firebaseConfig';
// import { router } from 'expo-router';
// import { incrementUserStreak, getUserStreak } from '../app/(apis)/streaks';

// const CreatePostScreen = ({ visible, onClose, onPostCreated }) => {
//   const { user } = useAuth();
//   const [content, setContent] = useState('');
//   const [selectedImages, setSelectedImages] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [streak, setStreak] = useState(0);
//   const [streakTimer, setStreakTimer] = useState('');
//   const [showStreakAnimation, setShowStreakAnimation] = useState(false);
//   const [streakIncreased, setStreakIncreased] = useState(false);
//   const [isEmojiPickerVisible, setIsEmojiPickerVisible] = useState(false);
//   const [streakActive, setStreakActive] = useState(false);
//   const [hotPosts, setHotPosts] = useState([]);
//   const textInputRef = useRef(null);
  
//   useEffect(() => {
//     if (visible) {
//       loadStreak();
//       fetchHotPosts();
//       setTimeout(() => textInputRef.current?.focus(), 300);
//     }
//   }, [visible]);
  
//   const loadStreak = async () => {
//     try {
//       const streakData = await getUserStreak(user.uid);
//       setStreak(streakData.currentStreak || 0);
//       setStreakActive(streakData.streakActive || false);
      
//       if (!streakData.streakActive) {
//         updateStreakTimer();
//       }
//     } catch (error) {
//       console.error('Error loading user streak:', error);
//     }
//   };
  
//   const fetchHotPosts = async () => {
//     try {
//       // Get yesterday's date
//       const yesterday = new Date();
//       yesterday.setDate(yesterday.getDate() - 1);
//       yesterday.setHours(0, 0, 0, 0);
      
//       const yesterdayEnd = new Date(yesterday);
//       yesterdayEnd.setHours(23, 59, 59, 999);
      
//       // Query posts from yesterday with the most likes/comments
//       const postsRef = collection(db, 'posts');
//       const q = query(
//         postsRef, 
//         where('createdAt', '>=', yesterday),
//         where('createdAt', '<=', yesterdayEnd),
//         orderBy('createdAt', 'desc'),
//         limit(3)
//       );
      
//       const snapshot = await getDocs(q);
//       const hotPostsData = snapshot.docs.map(doc => ({
//         id: doc.id,
//         ...doc.data()
//       }));
      
//       setHotPosts(hotPostsData.filter(post => post.mediaUrls && post.mediaUrls.length > 0));
//     } catch (error) {
//       console.error('Error fetching hot posts:', error);
//     }
//   };
  
//   const updateStreakTimer = () => {
//     const now = new Date();
//     const endOfDay = new Date();
//     endOfDay.setHours(23, 59, 59, 999);
    
//     const timeRemaining = endOfDay - now;
//     const hours = Math.floor((timeRemaining / (1000 * 60 * 60)) % 24);
//     const minutes = Math.floor((timeRemaining / (1000 * 60)) % 60);
    
//     setStreakTimer(`${hours}h ${minutes}m left`);
//   };
  
//   useEffect(() => {
//     if (!visible || streakActive) return;
//     updateStreakTimer();
//     const interval = setInterval(updateStreakTimer, 60000);
//     return () => clearInterval(interval);
//   }, [visible, streakActive]);
  
//   const pickImage = async () => {
//     try {
//       const result = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes:['images'],
//         allowsEditing: true,
//         aspect: [4, 3],
//         quality: 1,
//         allowsMultipleSelection: true,
//         selectionLimit: 8 - selectedImages.length,
//       });
      
//       if (!result.canceled && result.assets) {
//         const newImages = result.assets.map(asset => asset.uri);
//         setSelectedImages([...selectedImages, ...newImages]);
//       }
//     } catch (error) {
//       console.error('Error picking image:', error);
//       Alert.alert('Error', 'Failed to pick image');
//     }
//   };
  
//   const openCamera = async () => {
//     try {
//       const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
//       if (status !== 'granted') {
//         Alert.alert('Permission Denied', 'Camera access is required to take photos');
//         return;
//       }
      
//       const result = await ImagePicker.launchCameraAsync({
//         allowsEditing: true,
//         aspect: [4, 3],
//         quality: 1,
//       });
      
//       if (!result.canceled && result.assets) {
//         setSelectedImages([...selectedImages, result.assets[0].uri]);
//       }
//     } catch (error) {
//       console.error('Error taking photo:', error);
//       Alert.alert('Error', 'Failed to take photo');
//     }
//   };
  
//   const removeImage = (index) => {
//     const newImages = [...selectedImages];
//     newImages.splice(index, 1);
//     setSelectedImages(newImages);
//   };
  
//   // Upload multiple images to Firebase Storage
//   const uploadImages = async (uris) => {
//     const uploadPromises = uris.map(async (uri) => {
//       const response = await fetch(uri);
//       const blob = await response.blob();
//       const filename = `posts/${user.uid}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
//       const imageRef = ref(storage, filename);
      
//       await uploadBytes(imageRef, blob);
//       return getDownloadURL(imageRef);
//     });

//     return Promise.all(uploadPromises);
//   };
  
//   const renderImagePreviews = () => {
//     if (selectedImages.length === 0) return null;
    
//     return (
//       <View className="mb-4">
//         <FlatList
//           horizontal
//           data={selectedImages}
//           renderItem={({item, index}) => (
//             <View className="mr-2 relative">
//               <Image 
//                 source={{ uri: item }} 
//                 className="w-24 h-24 rounded-lg"
//               />
//               <TouchableOpacity 
//                 onPress={() => removeImage(index)}
//                 className="absolute top-1 right-1 bg-black/70 rounded-full p-1"
//               >
//                 <Ionicons name="close" size={16} color="white" />
//               </TouchableOpacity>
//             </View>
//           )}
//           keyExtractor={(_, index) => index.toString()}
//           showsHorizontalScrollIndicator={false}
//         />
//         <View className="flex-row justify-center mt-2">
//           {selectedImages.map((_, index) => (
//             <View 
//               key={index} 
//               className={`h-1.5 w-1.5 rounded-full mx-1 ${index === 0 ? 'bg-blue-500' : 'bg-gray-300'}`} 
//             />
//           ))}
//         </View>
//       </View>
//     );
//   };
  
//   const renderHotPosts = () => {
//     if (hotPosts.length === 0) return null;
    
//     return (
//       <View className="mb-6">
//         <Text className="text-white font-bold text-lg mb-2">Hot Posts From Yesterday</Text>
//         <FlatList
//           horizontal
//           data={hotPosts}
//           renderItem={({item, index}) => (
//             <TouchableOpacity 
//               className="mr-3 relative rounded-lg overflow-hidden"
//               onPress={() => router.push(`/post/${item.id}`)}
//             >
//               <Image 
//                 source={{ uri: item.mediaUrls[0] }} 
//                 className="w-32 h-32 rounded-lg"
//               />
//               <LinearGradient
//                 colors={['transparent', 'rgba(0,0,0,0.8)']}
//                 className="absolute bottom-0 left-0 right-0 p-2"
//               >
//                 <Text className="text-white text-xs" numberOfLines={1}>
//                   {item.userName}
//                 </Text>
//                 <View className="flex-row items-center mt-1">
//                   <Ionicons name="heart" size={12} color="#FF6B6B" />
//                   <Text className="text-white text-xs ml-1">{item.likes?.length || 0}</Text>
//                   <Ionicons name="chatbubble" size={12} color="#3B82F6" className="ml-2" />
//                   <Text className="text-white text-xs ml-1">{item.comments?.length || 0}</Text>
//                 </View>
//               </LinearGradient>
//             </TouchableOpacity>
//           )}
//           keyExtractor={(item) => item.id}
//           showsHorizontalScrollIndicator={false}
//         />
//       </View>
//     );
//   };
  
//   const handleSubmit = async () => {
//     if (!content.trim() && selectedImages.length === 0) {
//       Alert.alert('Error', 'Please add some content or images to your post');
//       return;
//     }
    
//     setIsLoading(true);
    
//     try {
//       // Upload images to Firebase Storage
//       let mediaUrls = [];
//       if (selectedImages.length > 0) {
//         mediaUrls = await uploadImages(selectedImages);
//       }
      
//       // Create post in Firestore
//       const postRef = await addDoc(collection(db, 'posts'), {
//         content: content.trim(),
//         mediaUrls,
//         createdAt: serverTimestamp(),
//         userId: user.uid,
//         userName: user.displayName || 'Anonymous',
//         userAvatar: user.photoURL || null,
//         college: user.college?.name,
//         likes: [],
//         comments: []
//       });
      
//       // Increment user streak
//       const updatedStreak = await incrementUserStreak(user.uid);
//       setStreak(updatedStreak.currentStreak);
//       setStreakActive(true);
      
//       // Show streak animation if streak increased
//       if (updatedStreak.streakIncreased) {
//         setStreakIncreased(true);
//         setShowStreakAnimation(true);
//         setTimeout(() => setShowStreakAnimation(false), 3000);
//       }
      
//       // Notify parent component about post creation
//       if (onPostCreated) {
//         onPostCreated({
//           id: postRef.id,
//           content: content.trim(),
//           mediaUrls,
//           createdAt: new Date(),
//           userId: user.uid,
//           userName: user.displayName || 'Anonymous',
//           userAvatar: user.photoURL || null
//         });
//       }
      
//       // Reset form and close modal
//       setContent('');
//       setSelectedImages([]);
//       onClose();
//     } catch (error) {
//       console.error('Error creating post:', error);
//       Alert.alert('Error', 'Failed to create post. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };
  
//   // Streak animation component
//   const StreakAnimation = () => (
//     <Modal
//       transparent={true}
//       visible={showStreakAnimation}
//       animationType="fade"
//     >
//       <View className="flex-1 justify-center items-center bg-black/70">
//         <LinearGradient
//           colors={['#4c669f', '#3b5998', '#192f6a']}
//           className="p-6 rounded-2xl items-center"
//         >
//           <Ionicons name="flame" size={60} color="#FFD700" />
//           <Text className="text-white text-xl font-bold mt-4">
//             {streakIncreased ? 'Streak Increased!' : 'Streak Maintained!'}
//           </Text>
//           <Text className="text-white text-3xl font-bold mt-2">
//             🔥 Day {streak} 🔥
//           </Text>
//           <Text className="text-white text-sm mt-4 text-center">
//             Keep posting daily to maintain your streak!
//           </Text>
//           <TouchableOpacity 
//             onPress={() => setShowStreakAnimation(false)}
//             className="mt-4 bg-white/20 px-6 py-2 rounded-full"
//           >
//             <Text className="text-white font-bold">Got it!</Text>
//           </TouchableOpacity>
//         </LinearGradient>
//       </View>
//     </Modal>
//   );

//   if (!visible) return null;
  
//   return (
//     <Modal
//       animationType="slide"
//       transparent={false}
//       visible={visible}
//       onRequestClose={onClose}
//     >
//       <SafeAreaView className="flex-1 bg-black">
//         <StatusBar barStyle="light-content" />
//         <KeyboardAvoidingView
//           behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//           className="flex-1"
//         >
//           {/* Header */}
//           <View className="flex-row justify-between items-center p-4 border-b border-gray-800">
//             <TouchableOpacity onPress={onClose}>
//               <Ionicons name="close" size={28} color="white" />
//             </TouchableOpacity>
//             <Text className="text-white text-lg font-bold">Create Post</Text>
//             <TouchableOpacity 
//               onPress={handleSubmit}
//               disabled={isLoading || (!content.trim() && selectedImages.length === 0)}
//               className={`px-4 py-2 rounded-full ${(!content.trim() && selectedImages.length === 0) ? 'bg-gray-700' : 'bg-blue-500'}`}
//             >
//               {isLoading ? (
//                 <ActivityIndicator size="small" color="white" />
//               ) : (
//                 <Text className="text-white font-bold">Post</Text>
//               )}
//             </TouchableOpacity>
//           </View>
          
//           {/* Streak Badge */}
//           <LinearGradient
//             colors={streakActive ? ['#4CAF50', '#2E7D32'] : ['#FF6B6B', '#FF8E53']}
//             className="px-4 py-2 m-4 rounded-lg flex-row items-center justify-between"
//           >
//             <View className="flex-row items-center">
//               <Ionicons name="flame" size={24} color="white" />
//               <View className="ml-2">
//                 <Text className="text-white font-bold">Current Streak: {streak} days</Text>
//                 <Text className="text-white text-xs">
//                   {streakActive 
//                     ? 'Today\'s streak completed! Next streak starts tomorrow.' 
//                     : 'Post today to keep your streak alive!'}
//                 </Text>
//               </View>
//             </View>
//             {!streakActive && (
//               <View className="bg-white/20 px-3 py-1 rounded-full">
//                 <Text className="text-white font-bold">{streakTimer}</Text>
//               </View>
//             )}
//           </LinearGradient>
          
//           {/* Content */}
//           <ScrollView className="flex-1 p-4">
//             {renderHotPosts()}
            
//             <View className="flex-row items-start mb-4">
//               <Image 
//                 source={{ uri: user?.photoURL || 'https://via.placeholder.com/150' }} 
//                 className="w-10 h-10 rounded-full mr-3"
//               />
//               <View className="flex-1">
//                 <Text className="text-white font-bold mb-1">{user?.displayName || 'Anonymous'}</Text>
//                 <TextInput
//                   ref={textInputRef}
//                   className="text-white text-base min-h-32"
//                   placeholder="What's on your mind?"
//                   placeholderTextColor="#6B7280"
//                   multiline
//                   value={content}
//                   onChangeText={setContent}
//                   autoFocus={false}
//                 />
//               </View>
//             </View>
            
//             {renderImagePreviews()}
//           </ScrollView>
          
//           {/* Bottom Toolbar */}
//           <View className="p-4 border-t border-gray-800 flex-row justify-between">
//             <View className="flex-row space-x-6">
//               <TouchableOpacity onPress={pickImage}>
//                 <Ionicons name="images" size={28} color="#3B82F6" />
//               </TouchableOpacity>
//               <TouchableOpacity onPress={openCamera}>
//                 <Ionicons name="camera" size={28} color="#10B981" />
//               </TouchableOpacity>
//               <TouchableOpacity onPress={() => setIsEmojiPickerVisible(true)}>
//                 <Ionicons name="happy" size={28} color="#F59E0B" />
//               </TouchableOpacity>
//             </View>
//             <TouchableOpacity>
//               <FontAwesome5 name="hashtag" size={24} color="#8B5CF6" />
//             </TouchableOpacity>
//           </View>
//         </KeyboardAvoidingView>
        
//         <StreakAnimation />
//       </SafeAreaView>
//     </Modal>
//   );
// };

// export default CreatePostScreen;

// import React, { useState, useEffect, useRef } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   Image,
//   ScrollView,
//   Modal,
//   ActivityIndicator,
//   SafeAreaView,
//   KeyboardAvoidingView,
//   Platform,
//   Alert,
//   StatusBar,
//   FlatList
// } from 'react-native';
// import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
// import { LinearGradient } from 'expo-linear-gradient';
// import * as ImagePicker from 'expo-image-picker';
// import { useAuth } from '../context/authContext';
// import { collection, addDoc, serverTimestamp, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
// import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// import { db, storage } from '../config/firebaseConfig';
// import { router } from 'expo-router';
// import { incrementUserStreak, getUserStreak } from '../app/(apis)/streaks';

// const CreatePostScreen = ({ visible, onClose, onPostCreated }) => {
//   const { user } = useAuth();
//   const [content, setContent] = useState('');
//   const [selectedImages, setSelectedImages] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [streak, setStreak] = useState(0);
//   const [streakTimer, setStreakTimer] = useState('');
//   const [showStreakAnimation, setShowStreakAnimation] = useState(false);
//   const [streakIncreased, setStreakIncreased] = useState(false);
//   const [isEmojiPickerVisible, setIsEmojiPickerVisible] = useState(false);
//   const [streakActive, setStreakActive] = useState(false);
//   const [hotPosts, setHotPosts] = useState([]);
//   const textInputRef = useRef(null);
//    console.log('CreatePostScreen rendered',visible,onClose, onPostCreated);

//   useEffect(() => {
//     if (visible) {
//       loadStreak();
//       fetchHotPosts();
//       setTimeout(() => textInputRef.current?.focus(), 300);
//     }
//   }, [visible]);
  
//   const loadStreak = async () => {
//     try {
//       const streakData = await getUserStreak(user.uid);
//       setStreak(streakData.currentStreak || 0);
//       setStreakActive(streakData.streakActive || false);
      
//       if (!streakData.streakActive) {
//         updateStreakTimer();
//       }
//     } catch (error) {
//       console.error('Error loading user streak:', error);
//     }
//   };
  
//   const fetchHotPosts = async () => {
//     try {
//       // Get yesterday's date
//       const yesterday = new Date();
//       yesterday.setDate(yesterday.getDate() - 1);
//       yesterday.setHours(0, 0, 0, 0);
      
//       const yesterdayEnd = new Date(yesterday);
//       yesterdayEnd.setHours(23, 59, 59, 999);
      
//       // Query posts from yesterday with the most likes/comments
//       const postsRef = collection(db, 'posts');
//       const q = query(
//         postsRef, 
//         where('createdAt', '>=', yesterday),
//         where('createdAt', '<=', yesterdayEnd),
//         orderBy('createdAt', 'desc'),
//         limit(3)
//       );
      
//       const snapshot = await getDocs(q);
//       const hotPostsData = snapshot.docs.map(doc => ({
//         id: doc.id,
//         ...doc.data()
//       }));
      
//       setHotPosts(hotPostsData.filter(post => post.mediaUrls && post.mediaUrls.length > 0));
//     } catch (error) {
//       console.error('Error fetching hot posts:', error);
//     }
//   };
  
//   const updateStreakTimer = () => {
//     const now = new Date();
//     const endOfDay = new Date();
//     endOfDay.setHours(23, 59, 59, 999);
    
//     const timeRemaining = endOfDay - now;
//     const hours = Math.floor((timeRemaining / (1000 * 60 * 60)) % 24);
//     const minutes = Math.floor((timeRemaining / (1000 * 60)) % 60);
    
//     setStreakTimer(`${hours}h ${minutes}m left`);
//   };
  
//   useEffect(() => {
//     if (!visible || streakActive) return;
//     updateStreakTimer();
//     const interval = setInterval(updateStreakTimer, 60000);
//     return () => clearInterval(interval);
//   }, [visible, streakActive]);
  
//   const pickImage = async () => {
//     try {
//       const result = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.Images,
//         allowsEditing: true,
//         aspect: [4, 3],
//         quality: 1,
//         allowsMultipleSelection: true,
//         selectionLimit: 8 - selectedImages.length,
//       });
      
//       if (!result.canceled && result.assets) {
//         const newImages = result.assets.map(asset => asset.uri);
//         setSelectedImages([...selectedImages, ...newImages]);
//       }
//     } catch (error) {
//       console.error('Error picking image:', error);
//       Alert.alert('Error', 'Failed to pick image');
//     }
//   };
  
//   const openCamera = async () => {
//     try {
//       const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
//       if (status !== 'granted') {
//         Alert.alert('Permission Denied', 'Camera access is required to take photos');
//         return;
//       }
      
//       const result = await ImagePicker.launchCameraAsync({
//         allowsEditing: true,
//         aspect: [4, 3],
//         quality: 1,
//       });
      
//       if (!result.canceled && result.assets) {
//         setSelectedImages([...selectedImages, result.assets[0].uri]);
//       }
//     } catch (error) {
//       console.error('Error taking photo:', error);
//       Alert.alert('Error', 'Failed to take photo');
//     }
//   };
  
//   const removeImage = (index) => {
//     const newImages = [...selectedImages];
//     newImages.splice(index, 1);
//     setSelectedImages(newImages);
//   };
  
//   // Upload multiple images to Firebase Storage
//   const uploadImages = async (uris) => {
//     const uploadPromises = uris.map(async (uri) => {
//       const response = await fetch(uri);
//       const blob = await response.blob();
//       const filename = `posts/${user.uid}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
//       const imageRef = ref(storage, filename);
      
//       await uploadBytes(imageRef, blob);
//       return getDownloadURL(imageRef);
//     });

//     return Promise.all(uploadPromises);
//   };
  
//   const renderImagePreviews = () => {
//     if (selectedImages.length === 0) return null;
    
//     return (
//       <View className="mb-4">
//         <FlatList
//           horizontal
//           data={selectedImages}
//           renderItem={({item, index}) => (
//             <View className="mr-2 relative">
//               <Image 
//                 source={{ uri: item }} 
//                 className="w-24 h-24 rounded-lg"
//               />
//               <TouchableOpacity 
//                 onPress={() => removeImage(index)}
//                 className="absolute top-1 right-1 bg-black/70 rounded-full p-1"
//               >
//                 <Ionicons name="close" size={16} color="white" />
//               </TouchableOpacity>
//             </View>
//           )}
//           keyExtractor={(_, index) => index.toString()}
//           showsHorizontalScrollIndicator={false}
//         />
//         <View className="flex-row justify-center mt-2">
//           {selectedImages.map((_, index) => (
//             <View 
//               key={index} 
//               className={`h-1.5 w-1.5 rounded-full mx-1 ${index === 0 ? 'bg-blue-500' : 'bg-gray-300'}`} 
//             />
//           ))}
//         </View>
//       </View>
//     );
//   };
  
//   const renderHotPosts = () => {
//     if (hotPosts.length === 0) return null;
    
//     return (
//       <View className="mb-6">
//         <Text className="text-white font-bold text-lg mb-2">Hot Posts From Yesterday</Text>
//         <FlatList
//           horizontal
//           data={hotPosts}
//           renderItem={({item, index}) => (
//             <TouchableOpacity 
//               className="mr-3 relative rounded-lg overflow-hidden"
//               onPress={() => router.push(`/post/${item.id}`)}
//             >
//               <Image 
//                 source={{ uri: item.mediaUrls[0] }} 
//                 className="w-32 h-32 rounded-lg"
//               />
//               <LinearGradient
//                 colors={['transparent', 'rgba(0,0,0,0.8)']}
//                 className="absolute bottom-0 left-0 right-0 p-2"
//               >
//                 <Text className="text-white text-xs" numberOfLines={1}>
//                   {item.userName}
//                 </Text>
//                 <View className="flex-row items-center mt-1">
//                   <Ionicons name="heart" size={12} color="#FF6B6B" />
//                   <Text className="text-white text-xs ml-1">{item.likes?.length || 0}</Text>
//                   <Ionicons name="chatbubble" size={12} color="#3B82F6" className="ml-2" />
//                   <Text className="text-white text-xs ml-1">{item.comments?.length || 0}</Text>
//                 </View>
//               </LinearGradient>
//             </TouchableOpacity>
//           )}
//           keyExtractor={(item) => item.id}
//           showsHorizontalScrollIndicator={false}
//         />
//       </View>
//     );
//   };
  
//   const handleSubmit = async () => {
//     if (!content.trim() && selectedImages.length === 0) {
//       Alert.alert('Error', 'Please add some content or images to your post');
//       return;
//     }
    
//     setIsLoading(true);
    
//     try {
//       // Upload images to Firebase Storage
//       let mediaUrls = [];
//       if (selectedImages.length > 0) {
//         mediaUrls = await uploadImages(selectedImages);
//       }
      
//       // Create post in Firestore
//       const postRef = await addDoc(collection(db, 'posts'), {
//         content: content.trim(),
//         mediaUrls,
//         createdAt: serverTimestamp(),
//         userId: user.uid,
//         userName: user.displayName || 'Anonymous',
//         userAvatar: user.photoURL || null,
//         college: user.college?.name,
//         likes: [],
//         comments: []
//       });
      
//       // Increment user streak
//       const updatedStreak = await incrementUserStreak(user.uid);
//       setStreak(updatedStreak.currentStreak);
//       setStreakActive(true);
      
//       // Show streak animation if streak increased
//       if (updatedStreak.streakIncreased) {
//         setStreakIncreased(true);
//         setShowStreakAnimation(true);
//         setTimeout(() => setShowStreakAnimation(false), 3000);
//       }
      
//       // Notify parent component about post creation
//       if (onPostCreated) {
//         onPostCreated({
//           id: postRef.id,
//           content: content.trim(),
//           mediaUrls,
//           createdAt: new Date(),
//           userId: user.uid,
//           userName: user.displayName || 'Anonymous',
//           userAvatar: user.photoURL || null
//         });
//       }
      
//       // Reset form and close modal
//       setContent('');
//       setSelectedImages([]);
//       onClose();
//     } catch (error) {
//       console.error('Error creating post:', error);
//       Alert.alert('Error', 'Failed to create post. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };
  
//   // Streak animation component
//   const StreakAnimation = () => (
//     <Modal
//       transparent={true}
//       visible={showStreakAnimation}
//       animationType="fade"
//     >
//       <View className="flex-1 justify-center items-center bg-black/70">
//         <LinearGradient
//           colors={['#4c669f', '#3b5998', '#192f6a']}
//           className="p-6 rounded-2xl items-center"
//         >
//           <Ionicons name="flame" size={60} color="#FFD700" />
//           <Text className="text-white text-xl font-bold mt-4">
//             {streakIncreased ? 'Streak Increased!' : 'Streak Maintained!'}
//           </Text>
//           <Text className="text-white text-3xl font-bold mt-2">
//             🔥 Day {streak} 🔥
//           </Text>
//           <Text className="text-white text-sm mt-4 text-center">
//             Keep posting daily to maintain your streak!
//           </Text>
//           <TouchableOpacity 
//             onPress={() => setShowStreakAnimation(false)}
//             className="mt-4 bg-white/20 px-6 py-2 rounded-full"
//           >
//             <Text className="text-white font-bold">Got it!</Text>
//           </TouchableOpacity>
//         </LinearGradient>
//       </View>
//     </Modal>
//   );

//   // This is critically important!
//   // Without this condition, the component renders even when not visible
//   if (!visible) return null;
  
//   return (
//     <Modal
//       animationType="slide"
//       transparent={false}
//       visible={visible}
//       onRequestClose={onClose}
//       className='z-50'
//       // Adding this presentationStyle can help with visibility issues on iOS
//       presentationStyle="fullScreen"
//     >
//       <SafeAreaView className="flex-1 bg-black z-10">
//         <StatusBar barStyle="light-content" />
//         <KeyboardAvoidingView
//           behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//           className="flex-1"
//         >
//           {/* Header */}
//           <View className="flex-row justify-between items-center p-4 border-b border-gray-800">
//             <TouchableOpacity onPress={onClose}>
//               <Ionicons name="close" size={28} color="white" />
//             </TouchableOpacity>
//             <Text className="text-white text-lg font-bold">Create Post</Text>
//             <TouchableOpacity 
//               onPress={handleSubmit}
//               disabled={isLoading || (!content.trim() && selectedImages.length === 0)}
//               className={`px-4 py-2 rounded-full ${(!content.trim() && selectedImages.length === 0) ? 'bg-gray-700' : 'bg-blue-500'}`}
//             >
//               {isLoading ? (
//                 <ActivityIndicator size="small" color="white" />
//               ) : (
//                 <Text className="text-white font-bold">Post</Text>
//               )}
//             </TouchableOpacity>
//           </View>
          
//           {/* Streak Badge */}
//           <LinearGradient
//             colors={streakActive ? ['#4CAF50', '#2E7D32'] : ['#FF6B6B', '#FF8E53']}
//             className="px-4 py-2 m-4 rounded-lg flex-row items-center justify-between"
//           >
//             <View className="flex-row items-center">
//               <Ionicons name="flame" size={24} color="white" />
//               <View className="ml-2">
//                 <Text className="text-white font-bold">Current Streak: {streak} days</Text>
//                 <Text className="text-white text-xs">
//                   {streakActive 
//                     ? 'Today\'s streak completed! Next streak starts tomorrow.' 
//                     : 'Post today to keep your streak alive!'}
//                 </Text>
//               </View>
//             </View>
//             {!streakActive && (
//               <View className="bg-white/20 px-3 py-1 rounded-full">
//                 <Text className="text-white font-bold">{streakTimer}</Text>
//               </View>
//             )}
//           </LinearGradient>
          
//           {/* Content */}
//           <ScrollView className="flex-1 p-4">
//             {renderHotPosts()}
            
//             <View className="flex-row items-start mb-4">
//               <Image 
//                 source={{ uri: user?.photoURL || 'https://via.placeholder.com/150' }} 
//                 className="w-10 h-10 rounded-full mr-3"
//               />
//               <View className="flex-1">
//                 <Text className="text-white font-bold mb-1">{user?.displayName || 'Anonymous'}</Text>
//                 <TextInput
//                   ref={textInputRef}
//                   className="text-white text-base min-h-32"
//                   placeholder="What's on your mind?"
//                   placeholderTextColor="#6B7280"
//                   multiline
//                   value={content}
//                   onChangeText={setContent}
//                 />
//               </View>
//             </View>
            
//             {renderImagePreviews()}
//           </ScrollView>
          
//           {/* Bottom Toolbar */}
//           <View className="p-4 border-t border-gray-800 flex-row justify-between">
//             <View className="flex-row space-x-6">
//               <TouchableOpacity onPress={pickImage}>
//                 <Ionicons name="images" size={28} color="#3B82F6" />
//               </TouchableOpacity>
//               <TouchableOpacity onPress={openCamera}>
//                 <Ionicons name="camera" size={28} color="#10B981" />
//               </TouchableOpacity>
//               <TouchableOpacity onPress={() => setIsEmojiPickerVisible(true)}>
//                 <Ionicons name="happy" size={28} color="#F59E0B" />
//               </TouchableOpacity>
//             </View>
//             <TouchableOpacity>
//               <FontAwesome5 name="hashtag" size={24} color="#8B5CF6" />
//             </TouchableOpacity>
//           </View>
//         </KeyboardAvoidingView>
        
//         <StreakAnimation />
//       </SafeAreaView>
//     </Modal>
//   );
// };

// export default CreatePostScreen;

// import React, { useState, useEffect, useRef } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   Image,
//   ScrollView,
//   Modal,
//   ActivityIndicator,
//   SafeAreaView,
//   KeyboardAvoidingView,
//   Platform,
//   Alert,
//   StatusBar,
//   FlatList,
//   StyleSheet // Import StyleSheet for native styles
// } from 'react-native';
// import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
// import { LinearGradient } from 'expo-linear-gradient';
// import * as ImagePicker from 'expo-image-picker';
// import { useAuth } from '../context/authContext';
// import { collection, addDoc, serverTimestamp, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
// import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// import { db, storage } from '../config/firebaseConfig';
// import { router } from 'expo-router';
// import { incrementUserStreak, getUserStreak } from '../app/(apis)/streaks';

// const CreatePostScreen = ({ visible, onClose, onPostCreated }) => {
//   const { user } = useAuth();
//   const [content, setContent] = useState('');
//   const [selectedImages, setSelectedImages] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [streak, setStreak] = useState(0);
//   const [streakTimer, setStreakTimer] = useState('');
//   const [showStreakAnimation, setShowStreakAnimation] = useState(false);
//   const [streakIncreased, setStreakIncreased] = useState(false);
//   const [isEmojiPickerVisible, setIsEmojiPickerVisible] = useState(false);
//   const [streakActive, setStreakActive] = useState(false);
//   const [hotPosts, setHotPosts] = useState([]);
//   const textInputRef = useRef(null);
//   console.log('CreatePostScreen rendered', visible, onClose, onPostCreated);

//   useEffect(() => {
//     if (visible) {
//       loadStreak();
//       fetchHotPosts();
//       setTimeout(() => textInputRef.current?.focus(), 300);
//     }
//   }, [visible]);
  
//   const loadStreak = async () => {
//     try {
//       const streakData = await getUserStreak(user.uid);
//       setStreak(streakData.currentStreak || 0);
//       setStreakActive(streakData.streakActive || false);
      
//       if (!streakData.streakActive) {
//         updateStreakTimer();
//       }
//     } catch (error) {
//       console.error('Error loading user streak:', error);
//     }
//   };
  
//   const fetchHotPosts = async () => {
//     try {
//       // Get yesterday's date
//       const yesterday = new Date();
//       yesterday.setDate(yesterday.getDate() - 1);
//       yesterday.setHours(0, 0, 0, 0);
      
//       const yesterdayEnd = new Date(yesterday);
//       yesterdayEnd.setHours(23, 59, 59, 999);
      
//       // Query posts from yesterday with the most likes/comments
//       const postsRef = collection(db, 'posts');
//       const q = query(
//         postsRef, 
//         where('createdAt', '>=', yesterday),
//         where('createdAt', '<=', yesterdayEnd),
//         orderBy('createdAt', 'desc'),
//         limit(3)
//       );
      
//       const snapshot = await getDocs(q);
//       const hotPostsData = snapshot.docs.map(doc => ({
//         id: doc.id,
//         ...doc.data()
//       }));
      
//       setHotPosts(hotPostsData.filter(post => post.mediaUrls && post.mediaUrls.length > 0));
//     } catch (error) {
//       console.error('Error fetching hot posts:', error);
//     }
//   };
  
//   const updateStreakTimer = () => {
//     const now = new Date();
//     const endOfDay = new Date();
//     endOfDay.setHours(23, 59, 59, 999);
    
//     const timeRemaining = endOfDay - now;
//     const hours = Math.floor((timeRemaining / (1000 * 60 * 60)) % 24);
//     const minutes = Math.floor((timeRemaining / (1000 * 60)) % 60);
    
//     setStreakTimer(`${hours}h ${minutes}m left`);
//   };
  
//   useEffect(() => {
//     if (!visible || streakActive) return;
//     updateStreakTimer();
//     const interval = setInterval(updateStreakTimer, 60000);
//     return () => clearInterval(interval);
//   }, [visible, streakActive]);
  
//   const pickImage = async () => {
//     try {
//       const result = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: ['images'],
//         allowsEditing: true,
//         // aspect: [4, 3],
//         quality: 1,
//         allowsMultipleSelection: true,
//         selectionLimit: 8 - selectedImages.length,
//       });
      
//       if (!result.canceled && result.assets) {
//         const newImages = result.assets.map(asset => asset.uri);
//         setSelectedImages([...selectedImages, ...newImages]);
//       }
//     } catch (error) {
//       console.error('Error picking image:', error);
//       Alert.alert('Error', 'Failed to pick image');
//     }
//   };
  
//   const openCamera = async () => {
//     try {
//       const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
//       if (status !== 'granted') {
//         Alert.alert('Permission Denied', 'Camera access is required to take photos');
//         return;
//       }
      
//       const result = await ImagePicker.launchCameraAsync({
//         allowsEditing: true,
//         // aspect: [4, 3],
//         quality: 1,
//       });
      
//       if (!result.canceled && result.assets) {
//         setSelectedImages([...selectedImages, result.assets[0].uri]);
//       }
//     } catch (error) {
//       console.error('Error taking photo:', error);
//       Alert.alert('Error', 'Failed to take photo');
//     }
//   };
  
//   const removeImage = (index) => {
//     const newImages = [...selectedImages];
//     newImages.splice(index, 1);
//     setSelectedImages(newImages);
//   };
  
//   // Upload multiple images to Firebase Storage
//   const uploadImages = async (uris) => {
//     const uploadPromises = uris.map(async (uri) => {
//       const response = await fetch(uri);
//       const blob = await response.blob();
//       const filename = `posts/${user.uid}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
//       const imageRef = ref(storage, filename);
      
//       await uploadBytes(imageRef, blob);
//       return getDownloadURL(imageRef);
//     });

//     return Promise.all(uploadPromises);
//   };
  
//   const renderImagePreviews = () => {
//     if (selectedImages.length === 0) return null;
    
//     return (
//       <View className="mb-4">
//         <FlatList
//           horizontal
//           data={selectedImages}
//           renderItem={({item, index}) => (
//             <View className="mr-2 relative">
//               <Image 
//                 source={{ uri: item }} 
//                 className="w-24 h-24 rounded-lg"
//               />
//               <TouchableOpacity 
//                 onPress={() => removeImage(index)}
//                 className="absolute top-1 right-1 bg-black/70 rounded-full p-1"
//               >
//                 <Ionicons name="close" size={16} color="white" />
//               </TouchableOpacity>
//             </View>
//           )}
//           keyExtractor={(_, index) => index.toString()}
//           showsHorizontalScrollIndicator={false}
//         />
//         <View className="flex-row justify-center mt-2">
//           {selectedImages.map((_, index) => (
//             <View 
//               key={index} 
//               className={`h-1.5 w-1.5 rounded-full mx-1 ${index === 0 ? 'bg-blue-500' : 'bg-gray-300'}`} 
//             />
//           ))}
//         </View>
//       </View>
//     );
//   };
  
//   const renderHotPosts = () => {
//     if (hotPosts.length === 0) return null;
    
//     return (
//       <View className="mb-6">
//         <Text className="text-white font-bold text-lg mb-2">Hot Posts From Yesterday</Text>
//         <FlatList
//           horizontal
//           data={hotPosts}
//           renderItem={({item, index}) => (
//             <TouchableOpacity 
//               className="mr-3 relative rounded-lg overflow-hidden"
//               onPress={() => router.push(`/post/${item.id}`)}
//             >
//               <Image 
//                 source={{ uri: item.mediaUrls[0] }} 
//                 className="w-32 h-32 rounded-lg"
//               />
//               <LinearGradient
//                 colors={['transparent', 'rgba(0,0,0,0.8)']}
//                 className="absolute bottom-0 left-0 right-0 p-2"
//               >
//                 <Text className="text-white text-xs" numberOfLines={1}>
//                   {item.userName}
//                 </Text>
//                 <View className="flex-row items-center mt-1">
//                   <Ionicons name="heart" size={12} color="#FF6B6B" />
//                   <Text className="text-white text-xs ml-1">{item.likes?.length || 0}</Text>
//                   <Ionicons name="chatbubble" size={12} color="#3B82F6" className="ml-2" />
//                   <Text className="text-white text-xs ml-1">{item.comments?.length || 0}</Text>
//                 </View>
//               </LinearGradient>
//             </TouchableOpacity>
//           )}
//           keyExtractor={(item) => item.id}
//           showsHorizontalScrollIndicator={false}
//         />
//       </View>
//     );
//   };
  
//   const handleSubmit = async () => {
//     if (!content.trim() && selectedImages.length === 0) {
//       Alert.alert('Error', 'Please add some content or images to your post');
//       return;
//     }
    
//     setIsLoading(true);
    
//     try {
//       // Upload images to Firebase Storage
//       let mediaUrls = [];
//       if (selectedImages.length > 0) {
//         mediaUrls = await uploadImages(selectedImages);
//       }
      
//       // Create post in Firestore
//       const postRef = await addDoc(collection(db, 'posts'), {
//         content: content.trim(),
//         mediaUrls,
//         createdAt: serverTimestamp(),
//         userId: user.uid,
//         userName: user.displayName || 'Anonymous',
//         userAvatar: user.photoURL || null,
//         college: user.college?.name,
//         likes: [],
//         comments: []
//       });
      
//       // Increment user streak
//       const updatedStreak = await incrementUserStreak(user.uid);
//       setStreak(updatedStreak.currentStreak);
//       setStreakActive(true);
      
//       // Show streak animation if streak increased
//       if (updatedStreak.streakIncreased) {
//         setStreakIncreased(true);
//         setShowStreakAnimation(true);
//         setTimeout(() => setShowStreakAnimation(false), 3000);
//       }
      
//       // Notify parent component about post creation
//       if (onPostCreated) {
//         onPostCreated({
//           id: postRef.id,
//           content: content.trim(),
//           mediaUrls,
//           createdAt: new Date(),
//           userId: user.uid,
//           userName: user.displayName || 'Anonymous',
//           userAvatar: user.photoURL || null
//         });
//       }
      
//       // Reset form and close modal
//       setContent('');
//       setSelectedImages([]);
//       onClose();
//     } catch (error) {
//       console.error('Error creating post:', error);
//       Alert.alert('Error', 'Failed to create post. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };
  
//   // Streak animation component
//   const StreakAnimation = () => (
//     <Modal
//       transparent={true}
//       visible={showStreakAnimation}
//       animationType="fade"
//     >
//       <View className="flex-1 justify-center items-center bg-black/70">
//         <LinearGradient
//           colors={['#4c669f', '#3b5998', '#192f6a']}
//           className="p-6 rounded-2xl items-center"
//         >
//           <Ionicons name="flame" size={60} color="#FFD700" />
//           <Text className="text-white text-xl font-bold mt-4">
//             {streakIncreased ? 'Streak Increased!' : 'Streak Maintained!'}
//           </Text>
//           <Text className="text-white text-3xl font-bold mt-2">
//             🔥 Day {streak} 🔥
//           </Text>
//           <Text className="text-white text-sm mt-4 text-center">
//             Keep posting daily to maintain your streak!
//           </Text>
//           <TouchableOpacity 
//             onPress={() => setShowStreakAnimation(false)}
//             className="mt-4 bg-white/20 px-6 py-2 rounded-full"
//           >
//             <Text className="text-white font-bold">Got it!</Text>
//           </TouchableOpacity>
//         </LinearGradient>
//       </View>
//     </Modal>
//   );

//   // This is critically important!
//   // Without this condition, the component renders even when not visible
//   if (!visible) return null;
  
//   return (
//     <Modal
//       animationType="slide"
//       transparent={true}
//       visible={visible}
//       onRequestClose={onClose}
//       presentationStyle="overFullScreen"
//     >
//       <View style={styles.modalContainer}>
//         <SafeAreaView style={styles.safeArea}>
//           <StatusBar barStyle="light-content" />
//           <KeyboardAvoidingView
//             behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//             style={styles.keyboardView}
//           >
//             {/* Header */}
//             <View className="flex-row justify-between items-center p-4 border-b border-gray-800">
//               <TouchableOpacity onPress={onClose}>
//                 <Ionicons name="close" size={28} color="white" />
//               </TouchableOpacity>
//               <Text className="text-white text-lg font-bold">Create Post</Text>
//               <TouchableOpacity 
//                 onPress={handleSubmit}
//                 disabled={isLoading || (!content.trim() && selectedImages.length === 0)}
//                 className={`px-4 py-2 rounded-full ${(!content.trim() && selectedImages.length === 0) ? 'bg-gray-700' : 'bg-blue-500'}`}
//               >
//                 {isLoading ? (
//                   <ActivityIndicator size="small" color="white" />
//                 ) : (
//                   <Text className="text-white font-bold">Post</Text>
//                 )}
//               </TouchableOpacity>
//             </View>
            
//             {/* Streak Badge */}
//             <LinearGradient
//               colors={streakActive ? ['#4CAF50', '#2E7D32'] : ['#FF6B6B', '#FF8E53']}
//               className="px-4 py-2 m-4 rounded-lg flex-row items-center justify-between"
//             >
//               <View className="flex-row items-center">
//                 <Ionicons name="flame" size={24} color="white" />
//                 <View className="ml-2">
//                   <Text className="text-white font-bold">Current Streak: {streak} days</Text>
//                   <Text className="text-white text-xs">
//                     {streakActive 
//                       ? 'Today\'s streak completed! Next streak starts tomorrow.' 
//                       : 'Post today to keep your streak alive!'}
//                   </Text>
//                 </View>
//               </View>
//               {!streakActive && (
//                 <View className="bg-white/20 px-3 py-1 rounded-full">
//                   <Text className="text-white font-bold">{streakTimer}</Text>
//                 </View>
//               )}
//             </LinearGradient>
            
//             {/* Content */}
//             <ScrollView className="flex-1 p-4">
//               {renderHotPosts()}
              
//               <View className="flex-row items-start mb-4">
//                 <Image 
//                   source={{ uri: user?.photoURL || 'https://via.placeholder.com/150' }} 
//                   className="w-10 h-10 rounded-full mr-3"
//                 />
//                 <View className="flex-1">
//                   <Text className="text-white font-bold mb-1">{user?.displayName || 'Anonymous'}</Text>
//                   <TextInput
//                     ref={textInputRef}
//                     className="text-white text-base min-h-32"
//                     placeholder="What's on your mind?"
//                     placeholderTextColor="#6B7280"
//                     multiline
//                     value={content}
//                     onChangeText={setContent}
//                   />
//                 </View>
//               </View>
              
//               {renderImagePreviews()}
//             </ScrollView>
            
//             {/* Bottom Toolbar */}
//             <View className="p-4 border-t border-gray-800 flex-row justify-between">
//               <View className="flex-row space-x-6">
//                 <TouchableOpacity onPress={pickImage}>
//                   <Ionicons name="images" size={28} color="#3B82F6" />
//                 </TouchableOpacity>
//                 <TouchableOpacity onPress={openCamera}>
//                   <Ionicons name="camera" size={28} color="#10B981" />
//                 </TouchableOpacity>
//                 <TouchableOpacity onPress={() => setIsEmojiPickerVisible(true)}>
//                   <Ionicons name="happy" size={28} color="#F59E0B" />
//                 </TouchableOpacity>
//               </View>
//               <TouchableOpacity>
//                 <FontAwesome5 name="hashtag" size={24} color="#8B5CF6" />
//               </TouchableOpacity>
//             </View>
//           </KeyboardAvoidingView>
          
//           <StreakAnimation />
//         </SafeAreaView>
//       </View>
//     </Modal>
//   );
// };

// // Add explicit styles with proper z-index values
// const styles = StyleSheet.create({
//   modalContainer: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.9)',
//     zIndex: 1000,
//     elevation: 10, // For Android
//   },
//   safeArea: {
//     flex: 1,
//     backgroundColor: 'black',
//   },
//   keyboardView: {
//     flex: 1,
//   },
// });

// export default CreatePostScreen;

// import React, { useState, useEffect, useRef } from 'react';


// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   Image,
//   ScrollView,
//   Modal,
//   ActivityIndicator,
//   SafeAreaView,
//   KeyboardAvoidingView,
//   Platform,
//   Alert,
//   StatusBar,
//   FlatList,
//   Switch,
//   Animated,
// } from 'react-native';
// import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
// import { LinearGradient } from 'expo-linear-gradient';
// import * as ImagePicker from 'expo-image-picker';
// import { useAuth } from '../context/authContext';
// import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
// import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// import { db, storage } from '../config/firebaseConfig';
// import { incrementUserStreak, getUserStreak } from '../app/(apis)/streaks';

// const PURPLE_COLOR = '#8B5CF6';
// const GRADIENT_COLORS = ['#8B5CF6', '#6D28D9'];

// const CreatePostScreen = ({ visible, onClose, onPostCreated }) => {
//   const { user } = useAuth();
//   const [title, setTitle] = useState('');
//   const [content, setContent] = useState('');
//   const [selectedImages, setSelectedImages] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isAnonymous, setIsAnonymous] = useState(false);
//   const [isPoll, setIsPoll] = useState(false);
//   const [pollOptions, setPollOptions] = useState(['', '']);
//   const [pollDuration, setPollDuration] = useState('1 day');
//   const [streak, setStreak] = useState(0);
//   const [streakTimer, setStreakTimer] = useState('');
//   const [showStreakAnimation, setShowStreakAnimation] = useState(false);
//   const [streakIncreased, setStreakIncreased] = useState(false);
//   const [streakActive, setStreakActive] = useState(false);
//   const fadeAnim = useRef(new Animated.Value(0)).current;

//   const titleInputRef = useRef(null);

//   useEffect(() => {
//     if (visible) {
//       loadStreak();
//       Animated.timing(fadeAnim, {
//         toValue: 1,
//         duration: 300,
//         useNativeDriver: true,
//       }).start();
//       setTimeout(() => titleInputRef.current?.focus(), 300);
//     }
//   }, [visible]);

//   const loadStreak = async () => {
//     try {
//       const streakData = await getUserStreak(user.uid);
//       setStreak(streakData.currentStreak || 0);
//       setStreakActive(streakData.streakActive || false);
//       if (!streakData.streakActive) updateStreakTimer();
//     } catch (error) {
//       console.error('Error loading streak:', error);
//     }
//   };

//   const updateStreakTimer = () => {
//     const now = new Date();
//     const endOfDay = new Date().setHours(23, 59, 59, 999);
//     const timeLeft = endOfDay - now;
//     const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
//     const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
//     setStreakTimer(`${hours}h ${minutes}m`);
//   };

//   useEffect(() => {
//     if (!visible || streakActive) return;
//     const interval = setInterval(updateStreakTimer, 60000);
//     return () => clearInterval(interval);
//   }, [visible, streakActive]);

//   const pickImage = async () => {
//     if (isPoll) {
//       Alert.alert('Notice', 'Images cannot be added to polls');
//       return;
//     }

//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes:['images'],
//       allowsEditing: true,
//       quality: 0.8,
//       allowsMultipleSelection: true,
//       selectionLimit: 8 - selectedImages.length,
//     });

//     if (!result.canceled && result.assets) {
//       setSelectedImages([...selectedImages, ...result.assets.map(asset => asset.uri)]);
//     }

//   };

//   const openCamera = async () => {
//     if (isPoll) {
//       Alert.alert('Notice', 'Images cannot be added to polls');
//       return;
//     }
//     const { status } = await ImagePicker.requestCameraPermissionsAsync();
//     if (status !== 'granted') {
//       Alert.alert('Permission Required', 'Camera access is needed');
//       return;
//     }
//     const result = await ImagePicker.launchCameraAsync({
//       allowsEditing: true,
//       quality: 0.8,
//     });
//     if (!result.canceled && result.assets) {
//       setSelectedImages([...selectedImages, result.assets[0].uri]);
//     }

//   };

//   const removeImage = (index) => {
   
//     setSelectedImages(selectedImages.filter((_, i) => i !== index));
  
//   };

//   const uploadImages = async (uris) => {
//     const uploadPromises = uris.map(async (uri) => {
//       const response = await fetch(uri);
//       const blob = await response.blob();
//       const filename = `posts/${user.uid}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
//       const imageRef = ref(storage, filename);
//       await uploadBytes(imageRef, blob);
//       return getDownloadURL(imageRef);
//     });
//     return Promise.all(uploadPromises);
//   };

//   const handleSubmit = async () => {
//     if (!title.trim()) {
//       Alert.alert('Error', 'Title is required');
//       return;
//     }
//     if (isPoll && pollOptions.filter(opt => opt.trim()).length < 2) {
//       Alert.alert('Error', 'Polls need at least 2 options');
//       return;
//     }
//     if (!isPoll && !content.trim() && !selectedImages.length) {
//       Alert.alert('Error', 'Add content or images');
//       return;
//     }

//     setIsLoading(true);
//     try {
//       let mediaUrls = [];
//       if (!isPoll && selectedImages.length) {
//         mediaUrls = await uploadImages(selectedImages);
//       }

//       const postData = {
//         title: title.trim(),
//         content: content.trim(),
//         mediaUrls,
//         createdAt: serverTimestamp(),
//         userId: isAnonymous ? 'anonymous' : user.uid,
//         userName: isAnonymous ? 'Anonymous' : (user.displayName || 'User'),
//         userAvatar: isAnonymous ? null : (user.photoURL || null),
//         college: isAnonymous ? null : user.college?.name,
//         likes: [],
//         comments: [],
//         isAnonymous,
//         isPoll,
//       };

//       if (isPoll) {
//         postData.pollOptions = pollOptions
//           .filter(opt => opt.trim())
//           .map(opt => ({ text: opt, votes: [] }));
//         postData.pollDuration = pollDuration;
//         postData.pollEndsAt = new Date(
//           Date.now() + 
//           (pollDuration === '1 day' ? 86400000 : 
//            pollDuration === '3 days' ? 259200000 :
//            pollDuration === '7 days' ? 604800000 : 2592000000)
//         );
//       }

//       const postRef = await addDoc(collection(db, 'posts'), postData);
//       const updatedStreak = await incrementUserStreak(user.uid);
//       setStreak(updatedStreak.currentStreak);
//       setStreakActive(true);

//       if (updatedStreak.streakIncreased) {
//         setStreakIncreased(true);
//         setShowStreakAnimation(true);
//         setTimeout(() => setShowStreakAnimation(false), 3000);
//       }

//       onPostCreated?.({
//         id: postRef.id,
//         ...postData,
//         createdAt: new Date(),
//       });

//       setTitle('');
//       setContent('');
//       setSelectedImages([]);
//       setPollOptions(['', '']);
//       setIsPoll(false);
//       setIsAnonymous(false);
//       onClose();
//     } catch (error) {
//       console.error('Post creation error:', error);
//       Alert.alert('Error', 'Failed to create post');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const renderImagePreviews = () => {
//     if (!selectedImages.length || isPoll) return null;
//     return (
//       <FlatList
//         horizontal
//         data={selectedImages}
//         className="mt-6"
//         renderItem={({ item, index }) => (
//           <View className="mr-4">
//             <Image source={{ uri: item }} className="w-32 h-32 rounded-xl" />
//             <TouchableOpacity
//               onPress={() => removeImage(index)}
//               className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
//             >
//               <Ionicons name="close" size={20} color="white" />
//             </TouchableOpacity>
//           </View>
//         )}
//         keyExtractor={(_, index) => index.toString()}
//         showsHorizontalScrollIndicator={false}
//       />
//     );
//   };

//   const renderPollOptions = () => {
//     if (!isPoll) return null;
//     return (
//       <View className="mt-6">
//         {pollOptions.map((option, index) => (
//           <View key={index} className="flex-row items-center mb-4">
//             <TextInput
//               className="flex-1 bg-gray-800 text-white text-lg p-4 rounded-xl"
//               placeholder={`Option ${index + 1}`}
//               placeholderTextColor="#888"
//               value={option}
//               onChangeText={(text) => {
//                 const newOptions = [...pollOptions];
//                 newOptions[index] = text;
//                 setPollOptions(newOptions);
//               }}
//             />
//             {pollOptions.length > 2 && (
//               <TouchableOpacity
//                 className="ml-3"
//                 onPress={() => setPollOptions(pollOptions.filter((_, i) => i !== index))}
//               >
//                 <Ionicons name="trash" size={24} color="#FF4444" />
//               </TouchableOpacity>
//             )}
//           </View>
//         ))}
//         {pollOptions.length < 4 && (
//           <TouchableOpacity
//             className="bg-gray-800 p-3 rounded-xl items-center"
//             onPress={() => setPollOptions([...pollOptions, ''])}
//           >
//             <Text className="text-purple-400 text-lg">+ Add Option</Text>
//           </TouchableOpacity>
//         )}
//         <View className="flex-row items-center justify-between mt-6">
//           <Text className="text-white text-lg">Duration:</Text>
//           <TouchableOpacity
//             className="bg-gray-800 px-4 py-2 rounded-xl flex-row items-center"
//             onPress={() => {
//               const durations = ['1 day', '3 days', '7 days', '30 days'];
//               setPollDuration(durations[(durations.indexOf(pollDuration) + 1) % durations.length]);
//             }}
//           >
//             <Text className="text-white text-lg mr-2">{pollDuration}</Text>
//             <Ionicons name="chevron-down" size={24} color="white" />
//           </TouchableOpacity>
//         </View>
//       </View>
//     );
//   };

//   if (!visible) return null;

//   return (
//     <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
//       <Animated.View style={{ opacity: fadeAnim }} className="flex-1 bg-gray-900">
//         <SafeAreaView className="flex-1">
//           <StatusBar barStyle="light-content" />
//           <KeyboardAvoidingView
//             behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//             className="flex-1"
//           >
//             {/* Header */}
//             <LinearGradient colors={GRADIENT_COLORS} className="p-4 flex-row justify-between items-center">
//               <TouchableOpacity onPress={onClose}>
//                 <Ionicons name="close" size={32} color="white" />
//               </TouchableOpacity>
//               <Text className="text-white text-xl font-bold">New Post</Text>
//               <TouchableOpacity
//                 onPress={handleSubmit}
//                 disabled={isLoading}
//                 className={`px-6 py-2 rounded-full ${isLoading ? 'bg-gray-600' : 'bg-white'}`}
//               >
//                 {isLoading ? (
//                   <ActivityIndicator size="small" color="white" />
//                 ) : (
//                   <Text className={`text-lg font-semibold ${isLoading ? 'text-white' : 'text-purple-600'}`}>
//                     Post
//                   </Text>
//                 )}
//               </TouchableOpacity>
//             </LinearGradient>

//             {/* Post Type Tabs */}
//             <View className="flex-row mx-4 mt-4 bg-gray-800 rounded-xl p-1">
//               <TouchableOpacity
//                 className={`flex-1 p-3 rounded-lg ${!isPoll ? 'bg-purple-600' : ''}`}
//                 onPress={() => setIsPoll(false)}
//               >
//                 <Text className={`text-center text-lg ${!isPoll ? 'text-white' : 'text-gray-400'}`}>
//                   Post
//                 </Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 className={`flex-1 p-3 rounded-lg ${isPoll ? 'bg-purple-600' : ''}`}
//                 onPress={() => {
//                   setIsPoll(true);
//                   setSelectedImages([]);
//                 }}
//               >
//                 <Text className={`text-center text-lg ${isPoll ? 'text-white' : 'text-gray-400'}`}>
//                   Poll
//                 </Text>
//               </TouchableOpacity>
//             </View>

//             {/* Streak Banner */}
//             <LinearGradient
//               colors={streakActive ? ['#4CAF50', '#2E7D32'] : ['#FF6B6B', '#FF8E53']}
//               className="mx-4 mt-4 p-3 rounded-xl flex-row items-center"
//             >
//               <Ionicons name="flame" size={24} color="white" />
//               <Text className="text-white text-lg font-semibold ml-2">Streak: {streak} days</Text>
//               {!streakActive && (
//                 <Text className="text-white text-sm ml-auto">{streakTimer}</Text>
//               )}
//             </LinearGradient>

//             {/* Content Area */}
//             <ScrollView className="flex-1 px-4 mt-4">
//               <TextInput
//                 ref={titleInputRef}
//                 className="bg-gray-800 text-white text-xl p-4 rounded-xl mb-4"
//                 placeholder="Title..."
//                 placeholderTextColor="#888"
//                 value={title}
//                 onChangeText={setTitle}
//               />
//               {!isPoll && (
//                 <TextInput
//                   className="bg-gray-800 text-white text-lg p-4 rounded-xl min-h-40 mb-4"
//                   placeholder="What's on your mind?"
//                   placeholderTextColor="#888"
//                   multiline
//                   value={content}
//                   onChangeText={setContent}
//                 />
//               )}
//               {renderPollOptions()}
//               {renderImagePreviews()}
//             </ScrollView>

//             {/* Footer */}
//             <View className="p-4 bg-gray-900 border-t border-gray-800 flex-row justify-between items-center">
//               {!isPoll && (
//                 <View className="flex-row">
//                   <TouchableOpacity onPress={pickImage} className="mr-6">
//                     <Ionicons name="images" size={32} color={PURPLE_COLOR} />
//                   </TouchableOpacity>
//                   <TouchableOpacity onPress={openCamera}>
//                     <Ionicons name="camera" size={32} color={PURPLE_COLOR} />
//                   </TouchableOpacity>
//                 </View>
//               )}
//               <View className="flex-row items-center">
//                 <Text className="text-white text-lg mr-2">Anonymous</Text>
//                 <Switch
//                   value={isAnonymous}
//                   onValueChange={setIsAnonymous}
//                   trackColor={{ false: '#666', true: PURPLE_COLOR }}
//                   thumbColor="#fff"
//                 />
//               </View>
//             </View>

//             {/* Streak Animation */}
//             {showStreakAnimation && (
//               <Modal transparent={true} animationType="fade">
//                 <View className="flex-1 justify-center items-center bg-black/80">
//                   <LinearGradient
//                     colors={GRADIENT_COLORS}
//                     className="w-11/12 p-6 rounded-2xl items-center"
//                   >
//                     <Ionicons name="flame" size={80} color="#FFD700" />
//                     <Text className="text-white text-3xl font-bold mt-4">
//                       {streakIncreased ? 'Streak Up!' : 'Streak On!'}
//                     </Text>
//                     <Text className="text-white text-5xl font-bold mt-2">🔥 {streak}</Text>
//                     <TouchableOpacity
//                       onPress={() => setShowStreakAnimation(false)}
//                       className="bg-white rounded-full px-8 py-3 mt-6"
//                     >
//                       <Text className="text-purple-600 text-lg font-bold">Awesome!</Text>
//                     </TouchableOpacity>
//                   </LinearGradient>
//                 </View>
//               </Modal>
//             )}
//           </KeyboardAvoidingView>
//         </SafeAreaView>
//       </Animated.View>
//     </Modal>
//   );
// };
// export default CreatePostScreen;


// import React, { useState, useEffect, useRef } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   Image,
//   ScrollView,
//   Modal,
//   ActivityIndicator,
//   SafeAreaView,
//   KeyboardAvoidingView,
//   Platform,
//   Alert,
//   StatusBar,
//   FlatList,
//   StyleSheet,
//   Switch
// } from 'react-native';
// import { Ionicons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
// import { LinearGradient } from 'expo-linear-gradient';
// import * as ImagePicker from 'expo-image-picker';
// import { useAuth } from '../context/authContext';
// import { collection, addDoc, serverTimestamp, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
// import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// import { db, storage } from '../config/firebaseConfig';
// import { router } from 'expo-router';
// import { incrementUserStreak, getUserStreak } from '../app/(apis)/streaks';

// const CreatePostScreen = ({ visible, onClose, onPostCreated }) => {
//   const { user } = useAuth();
//   const [title, setTitle] = useState('');
//   const [content, setContent] = useState('');
//   const [selectedImages, setSelectedImages] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [streak, setStreak] = useState(0);
//   const [streakTimer, setStreakTimer] = useState('');
//   const [showStreakAnimation, setShowStreakAnimation] = useState(false);
//   const [streakIncreased, setStreakIncreased] = useState(false);
//   const [isEmojiPickerVisible, setIsEmojiPickerVisible] = useState(false);
//   const [streakActive, setStreakActive] = useState(false);
//   const [hotPosts, setHotPosts] = useState([]);
//   const [selectedCommunity, setSelectedCommunity] = useState(null);
//   const [isAnonymous, setIsAnonymous] = useState(false);
//   const titleInputRef = useRef(null);
//   const contentInputRef = useRef(null);
  
//   useEffect(() => {
//     if (visible) {
//       loadStreak();
//       fetchHotPosts();
//       setTimeout(() => titleInputRef.current?.focus(), 300);
//     }
//   }, [visible]);
  
//   const loadStreak = async () => {
//     try {
//       const streakData = await getUserStreak(user.uid);
//       setStreak(streakData.currentStreak || 0);
//       setStreakActive(streakData.streakActive || false);
      
//       if (!streakData.streakActive) {
//         updateStreakTimer();
//       }
//     } catch (error) {
//       console.error('Error loading user streak:', error);
//     }
//   };
  
//   const fetchHotPosts = async () => {
//     try {
//       const yesterday = new Date();
//       yesterday.setDate(yesterday.getDate() - 1);
//       yesterday.setHours(0, 0, 0, 0);
      
//       const yesterdayEnd = new Date(yesterday);
//       yesterdayEnd.setHours(23, 59, 59, 999);
      
//       const postsRef = collection(db, 'posts');
//       const q = query(
//         postsRef, 
//         where('createdAt', '>=', yesterday),
//         where('createdAt', '<=', yesterdayEnd),
//         orderBy('createdAt', 'desc'),
//         limit(3)
//       );
      
//       const snapshot = await getDocs(q);
//       const hotPostsData = snapshot.docs.map(doc => ({
//         id: doc.id,
//         ...doc.data()
//       }));
      
//       setHotPosts(hotPostsData.filter(post => post.mediaUrls && post.mediaUrls.length > 0));
//     } catch (error) {
//       console.error('Error fetching hot posts:', error);
//     }
//   };
  
//   const updateStreakTimer = () => {
//     const now = new Date();
//     const endOfDay = new Date();
//     endOfDay.setHours(23, 59, 59, 999);
    
//     const timeRemaining = endOfDay - now;
//     const hours = Math.floor((timeRemaining / (1000 * 60 * 60)) % 24);
//     const minutes = Math.floor((timeRemaining / (1000 * 60)) % 60);
    
//     setStreakTimer(`${hours}h ${minutes}m left`);
//   };
  
//   useEffect(() => {
//     if (!visible || streakActive) return;
//     updateStreakTimer();
//     const interval = setInterval(updateStreakTimer, 60000);
//     return () => clearInterval(interval);
//   }, [visible, streakActive]);
  
//   const pickImage = async () => {
//     try {
//       const result = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.Images,
//         allowsEditing: true,
//         quality: 1,
//         allowsMultipleSelection: true,
//         selectionLimit: 8 - selectedImages.length,
//       });
      
//       if (!result.canceled && result.assets) {
//         const newImages = result.assets.map(asset => asset.uri);
//         setSelectedImages([...selectedImages, ...newImages]);
//       }
//     } catch (error) {
//       console.error('Error picking image:', error);
//       Alert.alert('Error', 'Failed to pick image');
//     }
//   };
  
//   const openCamera = async () => {
//     try {
//       const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
//       if (status !== 'granted') {
//         Alert.alert('Permission Denied', 'Camera access is required to take photos');
//         return;
//       }
      
//       const result = await ImagePicker.launchCameraAsync({
//         allowsEditing: true,
//         quality: 1,
//       });
      
//       if (!result.canceled && result.assets) {
//         setSelectedImages([...selectedImages, result.assets[0].uri]);
//       }
//     } catch (error) {
//       console.error('Error taking photo:', error);
//       Alert.alert('Error', 'Failed to take photo');
//     }
//   };
  
//   const removeImage = (index) => {
//     const newImages = [...selectedImages];
//     newImages.splice(index, 1);
//     setSelectedImages(newImages);
//   };
  
//   const uploadImages = async (uris) => {
//     const uploadPromises = uris.map(async (uri) => {
//       const response = await fetch(uri);
//       const blob = await response.blob();
//       const filename = `posts/${user.uid}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
//       const imageRef = ref(storage, filename);
      
//       await uploadBytes(imageRef, blob);
//       return getDownloadURL(imageRef);
//     });

//     return Promise.all(uploadPromises);
//   };
  
//   const renderImagePreviews = () => {
//     if (selectedImages.length === 0) return null;
    
//     return (
//       <View className="mb-4">
//         <FlatList
//           horizontal
//           data={selectedImages}
//           renderItem={({item, index}) => (
//             <View className="mr-2 relative">
//               <Image 
//                 source={{ uri: item }} 
//                 className="w-24 h-24 rounded-lg"
//               />
//               <TouchableOpacity 
//                 onPress={() => removeImage(index)}
//                 className="absolute top-1 right-1 bg-black/70 rounded-full p-1"
//               >
//                 <Ionicons name="close" size={16} color="white" />
//               </TouchableOpacity>
//             </View>
//           )}
//           keyExtractor={(_, index) => index.toString()}
//           showsHorizontalScrollIndicator={false}
//         />
//         <View className="flex-row justify-center mt-2">
//           {selectedImages.map((_, index) => (
//             <View 
//               key={index} 
//               className={`h-1.5 w-1.5 rounded-full mx-1 ${index === 0 ? 'bg-purple-500' : 'bg-gray-300'}`} 
//             />
//           ))}
//         </View>
//       </View>
//     );
//   };
  
//   const renderHotPosts = () => {
//     if (hotPosts.length === 0) return null;
    
//     return (
//       <View className="mb-6">
//         <Text className="text-white font-bold text-lg mb-2">Hot Posts From Yesterday</Text>
//         <FlatList
//           horizontal
//           data={hotPosts}
//           renderItem={({item, index}) => (
//             <TouchableOpacity 
//               className="mr-3 relative rounded-lg overflow-hidden"
//               onPress={() => router.push(`/post/${item.id}`)}
//             >
//               <Image 
//                 source={{ uri: item.mediaUrls[0] }} 
//                 className="w-32 h-32 rounded-lg"
//               />
//               <LinearGradient
//                 colors={['transparent', 'rgba(0,0,0,0.8)']}
//                 className="absolute bottom-0 left-0 right-0 p-2"
//               >
//                 <Text className="text-white text-xs" numberOfLines={1}>
//                   {item.userName}
//                 </Text>
//                 <View className="flex-row items-center mt-1">
//                   <Ionicons name="heart" size={12} color="#FF6B6B" />
//                   <Text className="text-white text-xs ml-1">{item.likes?.length || 0}</Text>
//                   <Ionicons name="chatbubble" size={12} color="#3B82F6" className="ml-2" />
//                   <Text className="text-white text-xs ml-1">{item.comments?.length || 0}</Text>
//                 </View>
//               </LinearGradient>
//             </TouchableOpacity>
//           )}
//           keyExtractor={(item) => item.id}
//           showsHorizontalScrollIndicator={false}
//         />
//       </View>
//     );
//   };
  
//   const getDefaultUserAvatar = () => {
//     // Default anonymous avatar URL
//     return 'https://assets.grok.com/users/8c354dfe-946c-4a32-b2de-5cb3a8ab9776/generated/av8GdgP4VI6wfj1B/image.jpg';
//   };
  
//   const handleSubmit = async () => {
//     if (!title.trim()) {
//       Alert.alert('Error', 'Please add a title to your post');
//       return;
//     }
    
//     if (!content.trim() && selectedImages.length === 0) {
//       Alert.alert('Error', 'Please add some content or images to your post');
//       return;
//     }
    
//     setIsLoading(true);
    
//     try {
//       let mediaUrls = [];
//       if (selectedImages.length > 0) {
//         mediaUrls = await uploadImages(selectedImages);
//       }
      
//       const postRef = await addDoc(collection(db, 'posts'), {
//         title: title.trim(),
//         content: content.trim(),
//         mediaUrls,
//         createdAt: serverTimestamp(),
//         userId: user.uid,
//         userName: isAnonymous ? 'Anonymous' : (user.fullName || 'Anonymous'),
//         userAvatar: isAnonymous ? getDefaultUserAvatar() : (user.profileImage || null),
//         college: user.college?.name,
//         community: selectedCommunity,
//         isAnonymous: isAnonymous,
//         likes: [],
//         comments: []
//       });
      
//       const updatedStreak = await incrementUserStreak(user.uid);
//       setStreak(updatedStreak.currentStreak);
//       setStreakActive(true);
      
//       if (updatedStreak.streakIncreased) {
//         setStreakIncreased(true);
//         setShowStreakAnimation(true);
//         setTimeout(() => setShowStreakAnimation(false), 3000);
//       }
      
//       if (onPostCreated) {
//         onPostCreated({
//           id: postRef.id,
//           title: title.trim(),
//           content: content.trim(),
//           mediaUrls,
//           createdAt: new Date(),
//           userId: user.uid,
//           userName: isAnonymous ? 'Anonymous' : (user.fullName || 'Anonymous'),
//           userAvatar: isAnonymous ? getDefaultUserAvatar() : (user.profileImageL || null),
//           community: selectedCommunity,
//           isAnonymous: isAnonymous
//         });
//       }
      
//       setTitle('');
//       setContent('');
//       setSelectedImages([]);
//       setSelectedCommunity(null);
//       setIsAnonymous(false);
//       onClose();
//     } catch (error) {
//       console.error('Error creating post:', error);
//       Alert.alert('Error', 'Failed to create post. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };
  
//   // Streak animation component
//   const StreakAnimation = () => (
//     <Modal
//       transparent={true}
//       visible={showStreakAnimation}
//       animationType="fade"
//     >
//       <View className="flex-1 justify-center items-center bg-black/70">
//         <LinearGradient
//           colors={['#6d28d9', '#8b5cf6', '#a78bfa']}
//           className="p-6 rounded-2xl items-center"
//         >
//           <Ionicons name="flame" size={60} color="#FFD700" />
//           <Text className="text-white text-xl font-bold mt-4">
//             {streakIncreased ? 'Streak Increased!' : 'Streak Maintained!'}
//           </Text>
//           <Text className="text-white text-3xl font-bold mt-2">
//             🔥 Day {streak} 🔥
//           </Text>
//           <Text className="text-white text-sm mt-4 text-center">
//             Keep posting daily to maintain your streak!
//           </Text>
//           <TouchableOpacity 
//             onPress={() => setShowStreakAnimation(false)}
//             className="mt-4 bg-white/20 px-6 py-2 rounded-full"
//           >
//             <Text className="text-white font-bold">Got it!</Text>
//           </TouchableOpacity>
//         </LinearGradient>
//       </View>
//     </Modal>
//   );

//   if (!visible) return null;
  
//   return (
//     <Modal
//       animationType="slide"
//       transparent={true}
//       visible={visible}
//       onRequestClose={onClose}
//       presentationStyle="overFullScreen"
//     >
//       <View style={styles.modalContainer}>
//         <SafeAreaView style={styles.safeArea}>
//           <StatusBar barStyle="light-content" />
//           <KeyboardAvoidingView
//             behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//             style={styles.keyboardView}
//           >
//             {/* Header */}
            // <View className="flex-row justify-between items-center p-4">
            //   <TouchableOpacity onPress={onClose}>
            //     <Ionicons name="close" size={28} color="white" />
            //   </TouchableOpacity>
            //   <TouchableOpacity 
            //     onPress={handleSubmit}
            //     disabled={isLoading || !title.trim() || (!content.trim() && selectedImages.length === 0)}
            //     className={`px-6 py-2 rounded-full ${(!title.trim() || (!content.trim() && selectedImages.length === 0)) ? 'bg-gray-700' : 'bg-purple-600'}`}
            //   >
            //     {isLoading ? (
            //       <ActivityIndicator size="small" color="white" />
            //     ) : (
            //       <Text className="text-white font-bold">Post</Text>
            //     )}
            //   </TouchableOpacity>
            // </View>
//               <LinearGradient
//                 colors={streakActive ? ['#8b5cf6', '#6d28d9'] : ['#FF6B6B', '#FF8E53']}
//                 className="px-4 py-2 my-4 rounded-lg flex-row items-center justify-between"
//               >
//                 <View className="flex-row items-center">
//                   <Ionicons name="flame" size={24} color="white" />
//                   <View className="ml-2">
//                     <Text className="text-white font-bold">Current Streak: {streak} days</Text>
//                     <Text className="text-white text-xs">
//                       {streakActive 
//                         ? 'Today\'s streak completed! Next streak starts tomorrow.' 
//                         : 'Post today to keep your streak alive!'}
//                     </Text>
//                   </View>
//                 </View>
//                 {!streakActive && (
//                   <View className="bg-white/20 px-3 py-1 rounded-full">
//                     <Text className="text-white font-bold">{streakTimer}</Text>
//                   </View>
//                 )}
//               </LinearGradient>
            
//             {/* Content */}
//             <ScrollView className="flex-1 px-4">
//               {/* Title Input */}
//               <TextInput
//                 ref={titleInputRef}
//                 className="text-white text-3xl font-bold mb-4 mt-14"
//                 placeholder="Title"
//                 placeholderTextColor="#6B7280"
//                 value={title}
//                 onChangeText={setTitle}
//                 maxLength={300}
//               />
              
//               {/* Content Input */}
//               <TextInput
//                 ref={contentInputRef}
//                 className="text-white text-base min-h-32"
//                 placeholder="body text (optional)"
//                 placeholderTextColor="#6B7280"
//                 multiline
//                 value={content}
//                 onChangeText={setContent}
//               />
              
//               {renderImagePreviews()}
              
//                 {renderHotPosts()}
//               {/* Anonymous Toggle */}
//               {/* <View className="flex-row items-end justify-between my-4 p-3 bg-gray-800/60 rounded-lg">
//                 <View className="flex-row items-center">
//                   <Ionicons name="person-circle-outline" size={24} color={isAnonymous ? "#a78bfa" : "white"} />
//                   <View className="ml-2">
//                     <Text className="text-white font-bold">Post anonymously</Text>
//                     <Text className="text-gray-400 text-xs">Your name and profile photo won't be shown</Text>
//                   </View>
//                 </View>
//                 <Switch
//                   value={isAnonymous}
//                   onValueChange={setIsAnonymous}
//                   trackColor={{ false: "#3f3f46", true: "#a78bfa" }}
//                   thumbColor={isAnonymous ? "#8b5cf6" : "#f4f3f4"}
//                 /> 
//               </View>
//                */}
//               {/* Streak Badge */}
              
//             </ScrollView>
//             {/* Bottom Toolbar */}
//             <View className="p-4 border-t border-gray-800 flex-row justify-evenly">
//               <TouchableOpacity onPress={pickImage}>
//                 <Ionicons name="images" size={28} color="#9CA3AF" />
//               </TouchableOpacity>
//               <TouchableOpacity onPress={openCamera}>
//                 <Ionicons name="camera" size={28} color="#9CA3AF" />
//               </TouchableOpacity>  
//               <View className="flex-row items-end justify-between w-fit h-fit  my-4 p-3 bg-gray-800/60 rounded-lg">
//                 <View className="flex-row items-center">
//                   <Ionicons name="person-circle-outline" size={24} color={isAnonymous ? "#a78bfa" : "white"} />
//                   <View className="ml-2">
//                     <Text className="text-white font-bold"> Anonymously</Text>
//                     {/* <Text className="text-gray-400 text-xs">Your name and profile photo won't be shown</Text> */}
//                   </View>
//                 </View>
//                 <Switch
//                   value={isAnonymous}
//                   onValueChange={setIsAnonymous}
//                   trackColor={{ false: "#3f3f46", true: "#a78bfa" }}
//                   thumbColor={isAnonymous ? "#8b5cf6" : "#f4f3f4"}
//                 /> 
//               </View>
//             </View>

//           </KeyboardAvoidingView>
//           <StreakAnimation />
//         </SafeAreaView>
//       </View>
//     </Modal>
//   );
// };

// // Add explicit styles with proper z-index values
// const styles = StyleSheet.create({
//   modalContainer: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.97)',
//     zIndex: 1000,
//     elevation: 10, // For Android
//   },
//   safeArea: {
//     flex: 1,
//     backgroundColor: '#0F0F0F',
//   },
//   keyboardView: {
//     flex: 1,
//   },
// });

// export default CreatePostScreen;


import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
  FlatList,
  StyleSheet,
  Switch,
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/authContext';
import { collection, addDoc, serverTimestamp, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebaseConfig';
import { incrementUserStreak, getUserStreak } from '../(apis)/streaks';

const CreatePostScreen = ({ visible, onClose, onPostCreated }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streak, setStreak] = useState(0);
  const [streakTimer, setStreakTimer] = useState('');
  const [showStreakAnimation, setShowStreakAnimation] = useState(false);
  const [streakIncreased, setStreakIncreased] = useState(false);
  const [streakActive, setStreakActive] = useState(false);
  const [hotPosts, setHotPosts] = useState([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const titleInputRef = useRef(null);

  useEffect(() => {
    if (visible) {
      loadStreak();
      fetchHotPosts();
      setTimeout(() => titleInputRef.current?.focus(), 300);
    }
  }, [visible]);

  const loadStreak = async () => {
    try {
      const streakData = await getUserStreak(user.uid);
      setStreak(streakData.currentStreak || 0);
      setStreakActive(streakData.streakActive || false);

      if (!streakData.streakActive) {
        updateStreakTimer();
      }
    } catch (error) {
      console.error('Error loading user streak:', error);
    }
  };

  const fetchHotPosts = async () => {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const yesterdayEnd = new Date(yesterday);
      yesterdayEnd.setHours(23, 59, 59, 999);

      const postsRef = collection(db, 'posts');
      const q = query(
        postsRef,
        where('createdAt', '>=', yesterday),
        where('createdAt', '<=', yesterdayEnd),
        orderBy('createdAt', 'desc'),
        limit(3)
      );

      const snapshot = await getDocs(q);
      const hotPostsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setHotPosts(hotPostsData.filter((post) => post.mediaUrls && post.mediaUrls.length > 0));
    } catch (error) {
      console.error('Error fetching hot posts:', error);
    }
  };

  const updateStreakTimer = () => {
    const now = new Date();
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const timeRemaining = endOfDay - now;
    const hours = Math.floor((timeRemaining / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((timeRemaining / (1000 * 60)) % 60);

    setStreakTimer(`${hours}h ${minutes}m left`);
  };

  useEffect(() => {
    if (!visible || streakActive) return;
    updateStreakTimer();
    const interval = setInterval(updateStreakTimer, 60000);
    return () => clearInterval(interval);
  }, [visible, streakActive]);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
        allowsMultipleSelection: true,
        selectionLimit: 8 - selectedImages.length,
      });

      if (!result.canceled && result.assets) {
        const newImages = result.assets.map((asset) => asset.uri);
        setSelectedImages([...selectedImages, ...newImages]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const openCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera access is required to take photos');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets) {
        setSelectedImages([...selectedImages, result.assets[0].uri]);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const removeImage = (index) => {
    const newImages = [...selectedImages];
    newImages.splice(index, 1);
    setSelectedImages(newImages);
  };

  const uploadImages = async (uris) => {
    const uploadPromises = uris.map(async (uri) => {
      const response = await fetch(uri);
      const blob = await response.blob();
      const filename = `posts/${user.uid}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const imageRef = ref(storage, filename);

      await uploadBytes(imageRef, blob);
      return getDownloadURL(imageRef);
    });

    return Promise.all(uploadPromises);
  };

  const renderImagePreviews = () => {
    if (selectedImages.length === 0) return null;

    return (
      <View style={styles.imagePreviewContainer} className='mt-4'>
        <FlatList
          horizontal
          data={selectedImages}
          renderItem={({ item, index }) => (
            <View style={styles.imagePreviewWrapper}>
              <Image source={{ uri: item }} style={styles.imagePreview} />
              <TouchableOpacity onPress={() => removeImage(index)} style={styles.removeImageButton}>
                <Ionicons name="close" size={16} color="white" />
              </TouchableOpacity>
            </View>
          )}
          keyExtractor={(_, index) => index.toString()}
          showsHorizontalScrollIndicator={false}
        />
      </View>
    );
  };

  const renderHotPosts = () => {
    if (hotPosts.length === 0) return null;

    return (
      <View style={styles.hotPostsContainer}>
        <Text style={styles.hotPostsTitle}>Hot Posts From Yesterday</Text>
        <FlatList
          horizontal
          data={hotPosts}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.hotPostItem}>
              <Image source={{ uri: item.mediaUrls[0] }} style={styles.hotPostImage} />
              <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.hotPostOverlay}>
                <Text style={styles.hotPostUserName}>{item.userName}</Text>
                <View style={styles.hotPostStats}>
                  <Ionicons name="heart" size={12} color="#FF6B6B" />
                  <Text style={styles.hotPostStatText}>{item.likes?.length || 0}</Text>
                  <Ionicons name="chatbubble" size={12} color="#3B82F6" style={styles.hotPostStatIcon} />
                  <Text style={styles.hotPostStatText}>{item.comments?.length || 0}</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
        />
      </View>
    );
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please add a title to your post');
      return;
    }

    if (!content.trim() && selectedImages.length === 0) {
      Alert.alert('Error', 'Please add some content or images to your post');
      return;
    }

    setIsLoading(true);

    try {
      let mediaUrls = [];
      if (selectedImages.length > 0) {
        mediaUrls = await uploadImages(selectedImages);
      }

      const postRef = await addDoc(collection(db, 'posts'), {
        title: title.trim(),
        content: content.trim(),
        mediaUrls,
        createdAt: serverTimestamp(),
        userId: user.uid,
        userName: isAnonymous ? 'Anonymous' : user.fullName || 'Anonymous',
        userAvatar: isAnonymous ? null : user.profileImage || null,
        college: user.college?.name,
        isAnonymous,
        likes: [],
        comments: [],
      });

      const updatedStreak = await incrementUserStreak(user.uid);
      setStreak(updatedStreak.currentStreak);
      setStreakActive(true);

      if (updatedStreak.streakIncreased) {
        setStreakIncreased(true);
        setShowStreakAnimation(true);
        setTimeout(() => setShowStreakAnimation(false), 3000);
      }

      if (onPostCreated) {
        onPostCreated({
          id: postRef.id,
          title: title.trim(),
          content: content.trim(),
          mediaUrls,
          createdAt: new Date(),
          userId: user.uid,
          userName: isAnonymous ? 'Anonymous' : user.fullName || 'Anonymous',
          userAvatar: isAnonymous ? null : user.profileImage || null,
        });
      }

      setTitle('');
      setContent('');
      setSelectedImages([]);
      setIsAnonymous(false);
      onClose();
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
          {/* Streak Banner */}
          <View className="flex-row justify-between items-center p-4">
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={28} color="white" />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleSubmit}
                disabled={isLoading || !title.trim() || (!content.trim() && selectedImages.length === 0)}
                className={`px-6 py-2 rounded-full ${(!title.trim() || (!content.trim() && selectedImages.length === 0)) ? 'bg-gray-700' : 'bg-purple-600'}`}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-white font-bold">Post</Text>
                )}
              </TouchableOpacity>
            </View>
          <LinearGradient
            colors={streakActive ? ['#4CAF50', '#2E7D32'] : ['#FF6B6B', '#FF8E53']}
            style={styles.streakBanner}
          >
            <View style={styles.streakInfo}>
              <Ionicons name="flame" size={24} color="white" />
              <View style={styles.streakTextContainer}>
                <Text style={styles.streakText}>Current Streak: {streak} days</Text>
                <Text style={styles.streakSubText}>
                  {streakActive ? "Today's streak completed!" : 'Post today to keep your streak alive!'}
                </Text>
              </View>
            </View>
            {!streakActive && <Text style={styles.streakTimer}>{streakTimer}</Text>}
          </LinearGradient>

          {/* Content */}
          <ScrollView style={styles.contentContainer} className=''>
            <TextInput
              style={styles.titleInput}
              className='text-white text-3xl font-bold mb-4 mt-10 pl-2'
              ref={titleInputRef}
              placeholder="Title"
              placeholderTextColor="#6B7280"
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={styles.contentInput}
              className='mt-4 pl-2 '
              placeholder="What's on your mind?"
              placeholderTextColor="#6B7280"
              multiline
              value={content}
              onChangeText={setContent}
            />
            {renderImagePreviews()}
          </ScrollView>

            {renderHotPosts()}
          {/* Footer */}
              </KeyboardAvoidingView>
          <View style={styles.footer}>
            <TouchableOpacity onPress={pickImage}>
              <Ionicons name="images" size={28} color="#9CA3AF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={openCamera}>
              <Ionicons name="camera" size={28} color="#9CA3AF" />
            </TouchableOpacity>
            <View style={styles.anonymousToggle}>
              <Text style={styles.anonymousText}>Post Anonymously</Text>
              <Switch
                value={isAnonymous}
                onValueChange={setIsAnonymous}
                trackColor={{ false: '#3f3f46', true: '#8b5cf6' }}
                thumbColor={isAnonymous ? '#8b5cf6' : '#f4f3f4'}
              />
            </View>
          </View>

          {/* Hot Posts */}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  keyboardView: {
    flex: 1,
  },
  streakBanner: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  streakInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakTextContainer: {
    marginLeft: 8,
  },
  streakText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  streakSubText: {
    color: 'white',
    fontSize: 12,
  },
  streakTimer: {
    color: 'white',
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  titleInput: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  contentInput: {
    color: 'white',
    fontSize: 16,
    marginBottom: 16,
  },
  imagePreviewContainer: {
    marginBottom: 16,
  },
  imagePreviewWrapper: {
    marginRight: 8,
    position: 'relative',
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    padding: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#3f3f46',
  },
  anonymousToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  anonymousText: {
    color: 'white',
    marginRight: 8,
  },
  hotPostsContainer: {
    padding: 16,
  },
  hotPostsTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
  },
  hotPostItem: {
    marginRight: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  hotPostImage: {
    width: 100,
    height: 100,
  },
  hotPostOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
  },
  hotPostUserName: {
    color: 'white',
    fontSize: 12,
  },
  hotPostStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  hotPostStatText: {
    color: 'white',
    fontSize: 10,
    marginLeft: 4,
  },
  hotPostStatIcon: {
    marginLeft: 8,
  },
});

export default CreatePostScreen;