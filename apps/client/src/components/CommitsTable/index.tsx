import useFetch from '@/src/hooks/useFetch';
import {ICommit, IResource} from 'monorepo-globals';
import {useState} from 'react';
import ReactPaginate from 'react-paginate';
import {FaChevronCircleLeft, FaChevronCircleRight, FaEllipsisH} from 'react-icons/fa';
import {BiLoaderCircle} from 'react-icons/bi';
import Commit from './Commit';
import Header from './Header';
import {queryStringifier} from '@/src/helpers/query';

const commitsContainer =
  'flex flex-col justify-center gap-2 min-h-[500px] p-4 rounded-b-lg bg-[#cccccc22]';
const commitsContainerLoading =
  'flex flex-col justify-center gap-2 min-h-[500px] p-4 pointer-events-none blur-sm rounded-b-lg bg-[#cccccc22]';

const CommitsTable = () => {
  const [page, setPage] = useState(0);

  const {data, loading, error} = useFetch<IResource<ICommit>>({
    endpoint: 'FulltimeForce-test' + queryStringifier({page: page + 1}),
    isControlled: false,
  });

  const changePageIndex = ({selected: i}: {selected: number}) => {
    setPage(i);
  };

  const pageBuilder = (n: number) => {
    const className =
      n === page + 1
        ? 'center w-[2em] h-[2em] p-2 bg-[#ffffff1a] rounded-full transition ease duration-300 hover:bg-[#fff2]'
        : 'center w-[2em] h-[2em] p-2 rounded-full transition ease duration-300 hover:bg-[#fff2]';
    return <div className={className}>{n}</div>;
  };

  return (
    <section className='flex flex-col gap-4 relative w-[80vw] m-auto'>
      <div>
        <Header />
        <div
          style={{transition: 'all 0.5s ease'}}
          className={loading ? commitsContainerLoading : commitsContainer}
        >
          {error ? (
            <div>No se ha podido obtener los commits.. Intente más tarde</div>
          ) : (
            data?.resource?.map(c => <Commit commit={c} key={c.id} />)
          )}
        </div>
        {loading && (
          <BiLoaderCircle className='rotate w-10 h-10 absolute top-1/2 right-1/2 translate-x-1/2' />
        )}
      </div>
      <ReactPaginate
        className='flex items-center gap-2 m-auto'
        breakClassName='self-end'
        breakLabel={<FaEllipsisH style={{height: 12}} />}
        pageLabelBuilder={pageBuilder}
        nextLabel={<FaChevronCircleRight />}
        onPageChange={changePageIndex}
        pageRangeDisplayed={5}
        pageCount={data?.pageCount ?? 0}
        previousLabel={<FaChevronCircleLeft />}
        renderOnZeroPageCount={null}
      />
    </section>
  );
};

export default CommitsTable;
