import { useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Dialog } from 'primereact/dialog';
import { useDispatch } from 'react-redux';

import Footer from 'components/common/Footer';
import Categories from './Categories';
import CategoryFilter from './CategoryFilter';
import StoreListing from './StoreListing';
import { useFilterStore } from 'store/hooks';

import FilterIcon from 'statics/images/icons/filter.png';

export default function Store(props: RouteComponentProps) {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isCategoryFilterVisible, setIsCategoryFilterVisible] = useState(false);
  const storesFilter = useFilterStore();
  const dispatch = useDispatch();

  const onHideCategoryFilter = () => {
    setIsCategoryFilterVisible(false);
  };

  const onShowCategoryFilter = () => {
    setIsCategoryFilterVisible(true);
  };

  const handleSelectedProductChange = (category: any) => {
    setSelectedCategory(category);
  };

  const handleFilterChange = (value: any) => {
    const filterValue = {
      ...storesFilter,
      ...value,
    };

    dispatch({
      type: 'filter_store',
      filter: filterValue,
    });
  };

  const handleFilterSubmit = (value: any) => {
    setIsCategoryFilterVisible(false);
    const filterValue = {
      ...storesFilter,
      ...value,
    };

    dispatch({
      type: 'filter_store',
      filter: filterValue,
    });
  };

  return (
    <>
      <div className="section pt-5">
        <div className="pb-4 mb-md-4">
          <Categories onSelectedChange={handleSelectedProductChange} />
          <hr className="clr-gray-light" />
        </div>
        <div className="d-inline-block d-lg-flex gap-4">
          <div className="d-inline-flex d-lg-none mb-4 justify-content-end w-100 px-4 pb-4">
            <div className="filter-icon" onClick={onShowCategoryFilter}>
              <img src={FilterIcon} alt="filter-icon" />
            </div>
            <Dialog header="Store Filter" visible={isCategoryFilterVisible} onHide={onHideCategoryFilter}>
              <CategoryFilter onFilter={handleFilterSubmit} />
            </Dialog>
          </div>
          <div className="col-12 d-none d-lg-inline-block col-lg-3">
            <CategoryFilter onChange={handleFilterChange} />
          </div>
          <div className="col-12 col-lg-9">
            <StoreListing selectedCategory={selectedCategory} />
          </div>
        </div>
      </div>
      <div className="footer-store-listing">
        <Footer />
      </div>
    </>
  );
}
