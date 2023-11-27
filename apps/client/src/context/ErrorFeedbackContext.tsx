import Toast from '@/src/components/common/toast';
import {createContext, useMemo, useState, FC, PropsWithChildren, useRef} from 'react';
import {motion} from 'framer-motion';

type TToastOptions = {message: string; duration?: number};
type TToastOptionsWithShow = TToastOptions & {show: boolean};

export interface ErrorFeedbackProps {
  setToastOptions: (toastOptions: TToastOptions) => void;
}
type ErrorFeedbackProviderProps = {children: React.ReactNode};

const initialToastOptions = {message: '', duration: 0, show: false};

export const ErrorFeedbackContext = createContext<ErrorFeedbackProps | null>(null);

const ErrorFeedbackProvider: FC<PropsWithChildren<ErrorFeedbackProviderProps>> = ({children}) => {
  const [toastOptions, setToastOptions] = useState<TToastOptionsWithShow>(initialToastOptions);
  const messageTimeoutIdRef = useRef<NodeJS.Timeout>();

  const setToastOptionsHandler = (to: TToastOptions) => {
    clearTimeout(messageTimeoutIdRef.current);
    setToastOptions({...to, show: true});
    messageTimeoutIdRef.current = setTimeout(
      () => setToastOptions(ps => ({...ps, show: false})),
      to?.duration || 5000,
    );
  };

  const contextValue = useMemo(() => ({setToastOptions: setToastOptionsHandler}), []);
  return (
    <ErrorFeedbackContext.Provider value={contextValue}>
      <motion.div
        className='fixed top-0 right-0 m-4 opacity-0'
        animate={toastOptions.show ? 'open' : 'closed'}
        variants={{
          open: {x: 0, opacity: 1},
          closed: {x: '100%', opacity: 0},
        }}
      >
        <Toast content={toastOptions.message} color='#e62117' />
      </motion.div>
      {children}
    </ErrorFeedbackContext.Provider>
  );
};

export default ErrorFeedbackProvider;
