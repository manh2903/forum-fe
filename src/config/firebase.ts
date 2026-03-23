import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import api from "../services/api";
import toast from "react-hot-toast";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

export const requestForToken = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, { 
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY 
      });
      if (token) {
        // console.log("FCM Token obtained:", token);
        // Lưu token vào backend
        await api.put('/users/me/fcm-token', { token });
        toast.success("Đã bật thông báo đẩy thành công!", { duration: 3000 });
        return token;
      } else {
        console.warn("No registration token available. Check VAPID key.");
      }
    } else {
      console.warn("Notification permission NOT granted.");
    }
  } catch (err: any) {
    if (err.code === 'messaging/bad-vapid-key') {
      toast.error("VAPID KEY không đúng. Vui lòng kiểm tra lại cấu hình Firebase!");
    }
    console.error("An error occurred while retrieving token: ", err.message);
  }
  return null;
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
