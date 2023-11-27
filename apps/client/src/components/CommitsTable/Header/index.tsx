const commitsContainerHeader = 'grid items-center grid-cols-5 gap-2 p-2 shadow-bottom rounded-t-lg';

const Header = () => {
  return (
    <div className={commitsContainerHeader}>
      <span>Title</span>
      <span>Author</span>
      <span>Date</span>
      <span>Verified</span>
      <span>Url</span>
    </div>
  );
};

export default Header;
