import Toast from '@src/common/toast';
import {
  createContext,
  useMemo,
  useState,
  FC,
  PropsWithChildren,
  Dispatch,
  SetStateAction,
} from 'react';

export interface ErrorFeedbackProps {
  setMessage: Dispatch<SetStateAction<boolean>>;
  message: boolean;
}
type ErrorFeedbackProviderProps = {children: React.ReactNode};

export const ErrorFeedbackContext = createContext<ErrorFeedbackProps | null>(null);

const ErrorFeedbackProvider: FC<PropsWithChildren<ErrorFeedbackProviderProps>> = ({children}) => {
  const [message, setMessage] = useState(false);
  const contextValue = useMemo(() => ({setMessage, message}), [message]);
  return (
    <ErrorFeedbackContext.Provider value={contextValue}>
      <>
        {message && <Toast content={message} />}
        {children}
      </>
    </ErrorFeedbackContext.Provider>
  );
};

export default ErrorFeedbackProvider;
