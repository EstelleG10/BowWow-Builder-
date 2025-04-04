//created to manage state storage in web and mobile apps
import  { useEffect, useCallback, useReducer } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
//use state hook: structure for the state with boolenas for trackign status
type UseStateHook<T> = [[boolean, T | null], (value: T | null) => void];

//use Async state manages async state: when the stae doesn't have a value and needs to be fetched
