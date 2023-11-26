import Toast from '@/src/common/toast';
import {createContext, useMemo, useState, FC, PropsWithChildren, useRef} from 'react';
import {motion} from 'framer-motion';

type TToastOptions = {message: string; duration: number};

export interface ErrorFeedbackProps {
  setToastOptions: (toastOptions: TToastOptions) => void;
}
type ErrorFeedbackProviderProps = {children: React.ReactNode};

export const ErrorFeedbackContext = createContext<ErrorFeedbackProps | null>(null);

const ErrorFeedbackProvider: FC<PropsWithChildren<ErrorFeedbackProviderProps>> = ({children}) => {
  const [message, setMessage] = useState<string>('');
  const messageTimeoutIdRef = useRef<NodeJS.Timeout>();

  const setToastOptionsHandler = (to: TToastOptions) => {
    clearTimeout(messageTimeoutIdRef.current);
    setMessage(to.message);
    messageTimeoutIdRef.current = setTimeout(() => {
      setMessage('');
    }, to.duration);
  };

  const contextValue = useMemo(() => ({setToastOptions: setToastOptionsHandler}), []);
  return (
    <ErrorFeedbackContext.Provider value={contextValue}>
      <>
        <motion.div
          animate={message ? 'open' : 'closed'}
          variants={{
            open: {x: 0, opacity: 1},
            close: {x: '100%', opacity: 0},
          }}
        >
          <Toast content={message} />
        </motion.div>
        {children}
      </>
    </ErrorFeedbackContext.Provider>
  );
};

export default ErrorFeedbackProvider;
