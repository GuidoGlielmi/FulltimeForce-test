import {ICommit} from 'monorepo-globals';

type CommitProps = {commit: ICommit};
const commitClassName = 'grid grid-cols-5 gap-2';
const columnClassName = 'center h-full rounded-md shadow-bottomStrong';
const columnStyle = {borderTop: '1px solid #444', borderBottom: '1px solid #2f2f2f'};
const spanClassName = 'm-2 py-2 overflow-scroll';
const Commit = ({commit}: CommitProps) => {
  return (
    <div className={commitClassName}>
      <div style={columnStyle} className={columnClassName}>
        <span className={spanClassName}> {commit.message}</span>
      </div>
      <div style={columnStyle} className={columnClassName}>
        <span className={spanClassName}> {commit.committer.name}</span>{' '}
      </div>
      <div style={columnStyle} className={columnClassName}>
        <span className={spanClassName}> {commit.committer.date}</span>{' '}
      </div>
      <div style={columnStyle} className={columnClassName}>
        <span className={spanClassName}>{`${commit.verification?.verified}`}</span>
      </div>
      <div style={columnStyle} className={columnClassName}>
        <a href={commit.htmlUrl} target='_blank' className={spanClassName}>
          Link
        </a>
      </div>
    </div>
  );
};

export default Commit;
