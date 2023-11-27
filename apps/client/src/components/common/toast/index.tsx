import {ReactNode} from 'react';

const Toast = ({content, color}: {content: ReactNode; color: string}) => {
  return (
    <div className='m-2 p-2 shadow' style={{color}}>
      {content}
    </div>
  );
};

export default Toast;
