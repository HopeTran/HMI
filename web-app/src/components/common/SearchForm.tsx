import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';

function SearchForm(props: any) {
  const [show, setShow] = useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');

  const dispatch = useDispatch();
  const location = useLocation();
  const history = useHistory();

  const handleClickSearch = () => {
    if (searchTerm !== '') {
      dispatch({
        type: 'search', 
        search: searchTerm, 
        status: true,
      });

      if (location.pathname !== '/news') {
        history.push('/news')
      }
    } else {
      setShow(!show);
    }
  };

  const handleSearchChange = (event: any) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchKeyup = (e: any) => {
    if (e.keyCode === 13) {
      dispatch({type: 'search', search: searchTerm, status: true})
      if (location.pathname !== '/news') {
        history.push('/news')
      }
    }
  };

  return (
    <div className="search-form tw-mb-6">
      <input 
        placeholder="Search Token" 
        className={`form-control pl-4 ${show ? 'show' : 'hide'}`} 
        value={searchTerm} 
        onKeyUp={handleSearchKeyup}
        onChange={handleSearchChange}/>
      <i className="sm-icon search cursor-pointer flex items-center " onClick={handleClickSearch}></i>
    </div>
  )
}

export default SearchForm;