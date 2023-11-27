import {ReactNode} from 'react';

const Toast = ({content, color}: {content: ReactNode; color: string}) => {
  return (
    <div className='p-2 shadow color-white rounded' style={{background: color}}>
      {content}
    </div>
  );
};

export default Toast;
