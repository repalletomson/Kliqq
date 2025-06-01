// import { onAuthStateChanged } from 'firebase/auth';
import React, { useState, useEffect, createContext, useContext } from 'react';
import { onAuthStateChanged ,createUserWithEmailAndPassword,signInWithEmailAndPassword,signOut,sendEmailVerification,setMessage} from 'firebase/auth';
import {doc,setDoc,getDoc,updateDoc, getDocs, collection, query, where} from 'firebase/firestore'
import { Alert } from 'react-native';
import {db} from '../config/firebaseConfig'
import { initializeFirebase ,auth} from '../config/firebaseConfig';
import { useRouter } from 'expo-router';
import { monitorNewMessages } from '../config/firebaseConfig';

export const AuthContext = createContext();

export default function AuthContextProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(undefined);
  const [user, setUser] = useState(null);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [isCollegeSelected, setIsCollegeSelected] = useState(false);
  // const { auth } = initializeFirebase();
  //  console.log("auth",auth)
const router=useRouter()
  useEffect(() => {

    if (!auth) {
      console.error("Auth service is not available");
      return;
    }

    const unsub = onAuthStateChanged(auth, async (user) => {
      // console.log("email verified",user.emailVerified)
      if (user ) {
        // console.log("Auth state changed:", user);
        await updateUserData(user.uid);
        
        setIsAuthenticated(true);
        
        const profileComplete = await checkUserProfileCompletion(user.uid);
        setIsProfileComplete(profileComplete);
        const CollegeSelected = await checkUserCollegeSelection(user.uid);
        setIsCollegeSelected(CollegeSelected);
        monitorNewMessages(user.uid);
        // console.log("Auth", isAuthenticated);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setIsProfileComplete(false); // Reset on logout

      }
    });
    return () => unsub();
  }, []);

  const updateUserData = async (userId) => {
    try {
      const docRef = doc(db, "users", userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUser({
          uid: userId,
          username: data.username,
          ...data
        });
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  async function login(email, password) {
    try {
      // Perform login logic, e.g., API call
      
//       if (password === null) {
//         // User is already authenticated via Google, we just need to retrieve their data
//       const usersRef = collection(db, "users");

// // Example: Check if user with specific email exists
// const q = query(usersRef, where("email", "==",email));

// // const querySnapshot = await getDocs(q);
//       // Check if user exists in Firestore using email as document ID
//       const userDoc = await getDocs(q);
//       console.log(userDoc.docs[0].data())      
//       if (userDoc.docs[0].data()) {
//         return { user: { email } };
//       } else {
//         throw new Error('User not found');
//       }
//       }
      
      const response=await signInWithEmailAndPassword(auth,email,password);
      // console.log('response',response )
      
      
      // router.replace('/(root)/(tabs)/home');
      return true
      // Adjust delay as needed
      // Alert.alert('Success',' successful');
    } catch (e) {
      // console.error('Login failed:', e);
      let errorMessage = e.message;
      if (errorMessage.includes('auth/invalid-credential')) {
        errorMessage = 'Invalid credential';   
      // console.error('Signup failed:', e);
      }
      Alert.alert('Check the email and password', errorMessage)
    }
  }

  async function loginOut() {
    try {
        console.log("Logging out...");
        await signOut(auth); // Perform logout
        console.log("Logout successful");
        setIsAuthenticated(false); // Update authentication state
    } catch (e) {
        console.error("Logout failed:", e); // Handle errors
    }
}

// In authContext.js
const registerWithGoogleCredentials = async (credentials) => {
  // Create user in Firebase with Google credentials
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    credentials.email,
    credentials.password
  );

  // Update profile with Google info
  await updateUserProfile(userCredential.user, {
    username: credentials.displayName,
    photoURL: credentials.photoURL
  });

  return userCredential.user;
};

const signInWithGoogle = async (credentials) => {
  // Sign in with email/password using Google credentials
  const userCredential = await signInWithEmailAndPassword(
    auth,
    credentials.email,
    credentials.password
  );
  
  return userCredential.user;
};
  async function register(email, password, photoUrl) {
    try {
      // Perform signup logic
      // console.log('register')

            const response= await createUserWithEmailAndPassword(auth,email, password);
                  console.log('response.User',response.user)
            const users = response.user;
//             try {
//               await sendEmailVerification(user);
//               console.log('Verification email sent.');
//             } catch (error) {
//               console.error('Error sending verification email:', error);
// }
//               //  setMessage('Verification email sent. Please check your inbox.');
//                Alert.alert('Success', 'Verification email sent. Please check your inbox.');
              setIsAuthenticated(true); // Update authentication state

                await setDoc(doc(db, "users", response?.user?.uid),{
                  email:email,
                  
                  profileImage:photoUrl || 'https://imgs.search.brave.com/SRTQLz_BmOq7xwzV7ls7bV62QzMZtDrGSacNS5G1d1A/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9pY29u/cy52ZXJ5aWNvbi5j/b20vcG5nLzEyOC9t/aXNjZWxsYW5lb3Vz/LzNweC1saW5lYXIt/ZmlsbGV0LWNvbW1v/bi1pY29uL2RlZmF1/bHQtbWFsZS1hdmF0/YXItMS5wbmc',
                  userId:response?.user?.uid
                  
                })
        // router.replace('/(auth)/userprofile');
     
          console.log('userprofile')
  // router.replace('/userprofile')

            return response?.user?.uid
    } catch (e) { 
      let errorMessage = e.message;
      if (errorMessage.includes('email-already-in-use')) {
        errorMessage = 'Email already in use';   
      }
      if (errorMessage.includes('auth/invalid-email')) {
        errorMessage = 'Invalid email';   
      } 
      if (errorMessage.includes('auth/weak-password')) {
        errorMessage = 'Weak password';   
      }
      // console.error('Signup failed:', e);
      Alert.alert('Error', errorMessage)
    }
  }

  const updateUserProfile = async (profileData) => {
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, profileData);
      setUser(prev => ({...prev, ...profileData}));
      return true;
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  };
  const checkUserCollegeSelection = async (userId) => {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
  
    if (userDoc.exists()) {
      const userData = userDoc.data();
      // Check if the college field is filled
      return userData.college && userData.college.name; // Adjust based on your profile fields
    }
    return false 
  
}

  const updateUserCollege = async (college) => {
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { college });
      setUser(prev => ({...prev, college}));
      return user;
    } catch (error) {
      console.error("Error updating college:", error);
      throw error;
    }
  };

  // const sendVerificationEmail = async () => {
  //   const user = auth.currentUser;

  //   if (!user) {
  //     console.error("User is not authenticated");
  //     return;
  //   }

  //   try {
  //     const idToken = await user.getIdToken();
  //     await user.sendEmailVerification();
  //     console.log("Verification email sent successfully");
  //   } catch (error) {
  //     console.error("Error sending verification email:", error);
  //   }
  // };

  const checkUserProfileCompletion = async (userId) => {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      // Check if the necessary fields are filled
      return userData.fullName && userData.college.name; // Adjust based on your profile fields
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, loginOut, register, updateUserProfile, updateUserCollege, isProfileComplete, isCollegeSelected,registerWithGoogleCredentials, signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => {
  const value = useContext(AuthContext);
  if (value === undefined) {
    throw new Error('useAuth must be used within an AuthContextProvider');
  }
  return value;
};
