import React, { createContext, useState } from 'react';
import auth from '@react-native-firebase/auth';
import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';
/**
 * This provider is created
 * to access user in whole app
 * inspired by: https://github.com/amandeepmittal/react-native-examples/tree/master/reactnav5-stack-navigator
 */

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState("null");

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        userType,
        login: async (email, password) => {
          try {
            await auth().signInWithEmailAndPassword(email, password)
            .then((user => {
              try {
                const type = firestore().collection('doctors')
                             .doc(user.user.uid).get().type;
                setUserType(type);
              } catch (e) {
                const type = firestore().collection('patients')
                             .doc(user.user.uid).get().type;
                setUserType(type);
              }
            }));
          } catch (e) {
            console.log(e);
            console.log('Sign in Failed');
          }
        },
        registerProvider: async (org, name, email, password) => {
          try {
            await auth().createUserWithEmailAndPassword(email, password)
            .then((user) => {
              setUserType("provider");
              const db = firestore();
              const user_id = user.user.uid; // comes from auth
              console.log(user_id);
              const userRef = db.collection('doctors').doc(user_id);
              userRef.set({
                email,
                user_id,
                name,
                org
              });
            });
            /*.then((user) => {
              const db = firestore();
              const user_id = user.user.uid;
              db.collection('users').doc(user_id).collection('closet').doc(user_id)
              .set({});
            });*/
          } catch (e) {
            console.log(e);
            if (e.code === 'auth/email-already-in-use') {
              console.log('That email address is already in use!');
            }

            if (e.code === 'auth/invalid-email') {
              console.log('That email address is invalid!');
            }
          }
        },
        registerPatient: async (id, name, bday, email, password) => {
          try {
            await auth().createUserWithEmailAndPassword(email, password)
            .then((user) => {
              setUserType("patient");
              const db = firestore();
              const doc_id = user.user.uid;
              console.log(doc_id);
              const userRef = db.collection('patients').doc(doc_id);
              userRef.set({
                email,
                id,
                doc_id,
                name,
                bday
              });
            });
            /*.then((user) => {
              const db = firestore();
              const user_id = user.user.uid;
              db.collection('users').doc(user_id).collection('closet').doc(user_id)
              .set({});
            });*/
          } catch (e) {
            console.log(e);
            if (e.code === 'auth/email-already-in-use') {
              console.log('That email address is already in use!');
            }

            if (e.code === 'auth/invalid-email') {
              console.log('That email address is invalid!');
            }
          }
        },
        logout: async () => {
          try {
            await auth().signOut();
          } catch (e) {
            console.error(e);
            console.log('Sign out Failed');
          }
        }
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};