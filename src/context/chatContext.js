import { createContext, useContext, useReducer } from "react";
import { userContext } from "../App";

const ChatContext = createContext();

const initialState = {
  msgId: null,
  chatUser: null,
  userBlocked: false,
  receiverBlocked: false,
};

const chatReducer = (state, action) => {
  switch (action.type) {
    case "CHANGE_CHAT": {
      const { id, User, mainUser } = action.payload;

      //   CHECK IF MAIN USER IS BLOCKED
      if (User.blocked.includes(mainUser.id)) {
        return {
          ...state,
          chatUser: null,
          userBlocked: true,
        };
      }

      // CHECK IF RECEIVER IS BLOCKED
      else if (User.blocked.includes(mainUser.id)) {
        return {
          ...state,
          chatUser: User,
          receiverBlocked: true,
        };
      } else {
        return {
          ...state,
          msgId: id,
          chatUser: User,
        };
      }
    }
    case "CHANGE_BLOCK": {
      return { ...state, receiverBlocked: !state.receiverBlocked };
    }
    // case "RESET_CHAT": {
    //   return {
    //     chatId: null,
    //     user: null,
    //     isCurrentUserBlocked: false,
    //     isReceiverBlocked: false,
    //   };
    // }
    default:
      return state;
  }
};

export const ChatProvider = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const { user: mainUser } = useContext(userContext);
  const enhancedDispatch = (action) => {
    dispatch({ ...action, payload: { ...action.payload, mainUser } });
  };

  const value = { ...state, dispatch: enhancedDispatch };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  return useContext(ChatContext);
};
