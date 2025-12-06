import { getSocket } from "@/services/connectSocket";
import Toast from "react-native-toast-message";
import { addNotificationAPI } from "../api/notificationsApi";
import { useNotificationStore } from "../store/notificationStore";

export const initNotificationListener = (user) => {
    const socket = getSocket();

    if (!socket || !user) return;

    // ensure we remove previous listener if re-initialized
    socket.off("notification:new");

    socket.on("notification:new", async (payload) => {
    // payload will be the saved notification (server should send saved doc)
    // fallback if server emits raw object without _id
    const { _id, title, message, orderId, type, receiverId, receiverModel, createdAt } = payload;

    // show swiggy style toast
    Toast.show({
      type: "nagrow",
      text1: title,
      text2: message,
      position: "top",
      visibilityTime: 2500,
    });

    // if server didn't persist, persist from client
    let saved;
    if (_id) {
      saved = payload;
    } else {
      saved = await addNotificationAPI({
        receiverId: user._id,
        receiverModel: user.userType,
        title,
        message,
        orderId,
        type,
      });
    }

    // add to Zustand store with DB id
    useNotificationStore.getState().addNotification({
      _id: saved._id || `${Date.now()}`, // fallback local id
      title,
      message,
      orderId,
      type,
      role: receiverModel || user.userType,
      createdAt: saved.createdAt || new Date().toISOString(),
      read: saved.read || false,
    });
  });
};